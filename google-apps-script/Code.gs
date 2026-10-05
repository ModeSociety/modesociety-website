/**
 * Mode Society — Google Drive + Sheets backend.
 *
 * Runs inside the Google account that owns the website folder. It is the only
 * thing that touches Drive/Sheets; the Next.js site talks to it over HTTPS with
 * a shared secret. See README.md → "Backend setup" for deployment steps.
 *
 * Script properties (Project Settings → Script properties):
 *   ROOT_FOLDER_ID  – the Drive folder the website lives in: its ID or its full URL (required)
 *   SHARED_SECRET   – long random string, must match APPS_SCRIPT_SECRET on the site (required)
 *   OWNER_EMAIL     – permanent admin that can never be removed (optional, recommended)
 * Everything else (SPREADSHEET_ID, sub-folder IDs) is created by setup().
 */

var TABS = {
  settings: { name: 'Settings', headers: ['Key', 'Value', 'Updated At', 'Updated By'] },
  images: { name: 'Images', headers: ['Slot', 'Order', 'File ID', 'Alt Text', 'File Link', 'Updated At', 'Updated By'] },
  admins: { name: 'Admins', headers: ['Email', 'Added By', 'Added At'] },
  talent: {
    name: 'Talent',
    headers: ['Submitted At', 'Status', 'Full Name', 'Email', 'What They Do', 'Channels (handle · followers)', 'Niche',
      'Wants From An Agency', 'Signed Elsewhere', '18+ / Consent', 'Application Folder', 'Screenshots', 'Reference'],
  },
  bookings: {
    name: 'Book a Call',
    headers: ['Submitted At', 'Status', 'Brand Name', 'Website / Instagram', 'Your Name', 'Email', 'Services',
      'About The Project', 'Budget', 'Timeline', 'Notes', 'Reference'],
  },
  partners: {
    name: 'Partnerships',
    headers: ['Submitted At', 'Status', 'Business Name', 'Type Of Business', 'Website / Instagram', 'Your Name', 'Email',
      'Type Of Partnership', 'Partnership Idea', 'Reference'],
  },
};

var FOLDERS = {
  images: 'Website Images',
  talent: 'Talent Applications',
  incoming: '_Incoming Uploads',
};

/**
 * Drive folders the client drops media into. Whatever is inside appears on the site.
 * Keep in sync with `folder` in src/lib/slots.ts.
 */
var MEDIA_FOLDERS = [
  'Home Page 1',
  'Home Page 2',
  'Home Page 3',
  'About Us 1',
  'Instagram',
  'Services/01 Influencer Campaigns',
  'Services/02 UGC Content',
  'Services/03 Event Guest Lists',
  'Services/04 Funding',
  'Services/05 AI Campaigns',
];

var STATUSES = ['New', 'Reviewing', 'Contacted', 'Signed / Booked', 'Declined'];

var DEFAULT_SETTINGS = {
  heroMode: 'gravity',
  heroAutoCycle: 'false',
  introStyle: 'curtain',
  cursorStyle: 'ring',
  gameMode: 'memory',
  ctaStyle: 'reveal',
  footerStyle: 'magnetic',
};

// ---------------------------------------------------------------------------
// One-off setup. Run this from the editor after setting ROOT_FOLDER_ID.
// Safe to run again — it only creates what is missing.
// ---------------------------------------------------------------------------
function setup() {
  var props = PropertiesService.getScriptProperties();
  var rootId = rootFolderId_();
  if (!rootId) throw new Error('Set the ROOT_FOLDER_ID script property first.');
  if (!props.getProperty('SHARED_SECRET')) throw new Error('Set the SHARED_SECRET script property first.');
  var root = DriveApp.getFolderById(rootId);

  Object.keys(FOLDERS).forEach(function (key) {
    var propName = 'FOLDER_' + key.toUpperCase();
    if (!existsFolder_(props.getProperty(propName))) {
      props.setProperty(propName, childFolder_(root, FOLDERS[key]).getId());
    }
  });
  MEDIA_FOLDERS.forEach(function (path) { folderByPath_(path, true); });

  var ssId = props.getProperty('SPREADSHEET_ID');
  var ss;
  if (ssId && existsFile_(ssId)) {
    ss = SpreadsheetApp.openById(ssId);
  } else {
    ss = SpreadsheetApp.create('Mode Society — Website Data');
    DriveApp.getFileById(ss.getId()).moveTo(root);
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }

  Object.keys(TABS).forEach(function (key) {
    var def = TABS[key];
    var sheet = ss.getSheetByName(def.name) || ss.insertSheet(def.name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      sheet.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground('#7f090d').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
    if (key === 'talent' || key === 'bookings' || key === 'partners') {
      var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build();
      sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
    }
  });
  var stray = ss.getSheetByName('Sheet1');
  if (stray && ss.getSheets().length > 1) ss.deleteSheet(stray);

  var settings = ss.getSheetByName(TABS.settings.name);
  var existing = readSettings_();
  Object.keys(DEFAULT_SETTINGS).forEach(function (k) {
    if (!(k in existing)) settings.appendRow([k, DEFAULT_SETTINGS[k], new Date(), 'setup']);
  });

  var hasCleanup = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'cleanupIncoming';
  });
  if (!hasCleanup) ScriptApp.newTrigger('cleanupIncoming').timeBased().everyDays(1).atHour(3).create();

  Logger.log('Setup complete. Spreadsheet: ' + ss.getUrl());
}

/** Daily: bins uploads from forms that were started but never submitted. */
function cleanupIncoming() {
  var cutoff = Date.now() - 2 * 24 * 3600 * 1000;
  var files = folder_('incoming').getFiles();
  while (files.hasNext()) {
    var f = files.next();
    if (f.getDateCreated().getTime() < cutoff) f.setTrashed(true);
  }
}

// ---------------------------------------------------------------------------
// HTTP entry points
// ---------------------------------------------------------------------------
function doGet() {
  return json_({ ok: true, service: 'mode-society-backend' });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || body.secret !== secret) return json_({ ok: false, error: 'unauthorised' });
    var handler = ACTIONS[body.action];
    if (!handler) return json_({ ok: false, error: 'unknown action: ' + body.action });
    return json_({ ok: true, data: handler(body.payload || {}) });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

var ACTIONS = {
  getSite: function () {
    var folders = {};
    MEDIA_FOLDERS.forEach(function (path) { folders[path] = listMedia_(path); });
    var images = readImages_();
    // An SVG uploaded to the logo slot in the admin panel wins over the one in "Home Page 1".
    var uploadedLogo = images.filter(function (r) { return r.slot === 'brand.logo'; })[0];
    var logoSvg = uploadedLogo ? svgText_(uploadedLogo.fileId) : '';
    return { settings: readSettings_(), images: images, folders: folders, logoSvg: logoSvg || findLogoSvg_(folders['Home Page 1']) };
  },

  getInfo: function () {
    return {
      spreadsheetUrl: spreadsheet_().getUrl(),
      folderUrl: DriveApp.getFolderById(rootFolderId_()).getUrl(),
      imagesFolderUrl: folder_('images').getUrl(),
      talentFolderUrl: folder_('talent').getUrl(),
    };
  },

  getAdmins: function () {
    return { owner: ownerEmail_(), admins: readAdmins_() };
  },

  addAdmin: function (p) {
    var email = normaliseEmail_(p.email);
    if (!email) throw new Error('Invalid email');
    return withLock_(function () {
      if (readAdmins_().indexOf(email) === -1 && email !== ownerEmail_()) {
        sheet_('admins').appendRow([email, p.by || '', new Date()]);
      }
      return { owner: ownerEmail_(), admins: readAdmins_() };
    });
  },

  removeAdmin: function (p) {
    var email = normaliseEmail_(p.email);
    if (email === ownerEmail_()) throw new Error('The owner account cannot be removed');
    return withLock_(function () {
      var sheet = sheet_('admins');
      var values = sheet.getDataRange().getValues();
      for (var i = values.length - 1; i >= 1; i--) {
        if (normaliseEmail_(values[i][0]) === email) sheet.deleteRow(i + 1);
      }
      return { owner: ownerEmail_(), admins: readAdmins_() };
    });
  },

  setSettings: function (p) {
    return withLock_(function () {
      var sheet = sheet_('settings');
      var values = sheet.getDataRange().getValues();
      Object.keys(p.values || {}).forEach(function (key) {
        var value = String(p.values[key]);
        var row = -1;
        for (var i = 1; i < values.length; i++) if (values[i][0] === key) row = i + 1;
        if (row > 0) sheet.getRange(row, 2, 1, 3).setValues([[value, new Date(), p.by || '']]);
        else sheet.appendRow([key, value, new Date(), p.by || '']);
      });
      return { settings: readSettings_() };
    });
  },

  /** Stores a website image in "Website Images/<slot>" and returns its file ID. */
  uploadImage: function (p) {
    var slotName = safeName_(p.slot);
    var folder = childFolder_(folder_('images'), slotName);
    var ext = extensionFor_(p.mimeType, p.filename);
    var name = slotName + ' — ' + Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd HHmmss') + ext;
    var blob = Utilities.newBlob(Utilities.base64Decode(p.data), p.mimeType, name);
    var file = folder.createFile(blob);
    file.setDescription('Uploaded via Mode Society admin by ' + (p.by || 'unknown'));
    return { fileId: file.getId() };
  },

  /** Replaces every image row for a slot with `items` (keeps order). */
  setSlot: function (p) {
    var slot = String(p.slot || '');
    if (!slot) throw new Error('Missing slot');
    return withLock_(function () {
      var sheet = sheet_('images');
      var values = sheet.getDataRange().getValues();
      for (var i = values.length - 1; i >= 1; i--) if (values[i][0] === slot) sheet.deleteRow(i + 1);
      (p.items || []).forEach(function (item, idx) {
        sheet.appendRow([slot, idx + 1, item.fileId, item.alt || '',
          'https://drive.google.com/file/d/' + item.fileId + '/view', new Date(), p.by || '']);
      });
      return { images: readImages_() };
    });
  },

  /** Returns a file's bytes. Only files inside the website folder are served. */
  getFile: function (p) {
    var file = DriveApp.getFileById(p.fileId);
    if (!isInside_(file, rootFolderId_())) throw new Error('not found');
    var blob = file.getBlob();
    return { mimeType: blob.getContentType(), data: Utilities.base64Encode(blob.getBytes()) };
  },

  /** Public form uploads land in a staging folder until the form is submitted. */
  uploadIncoming: function (p) {
    var ext = extensionFor_(p.mimeType, p.filename);
    var blob = Utilities.newBlob(Utilities.base64Decode(p.data), p.mimeType, 'pending-' + Utilities.getUuid() + ext);
    return { fileId: folder_('incoming').createFile(blob).getId() };
  },

  submitTalent: function (p) {
    var f = p.fields || {};
    var ref = reference_('T');
    var date = Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd');
    var person = safeName_(f.name || 'Unnamed');
    var folder = folder_('talent').createFolder(date + ' — ' + person + ' (' + ref + ')');
    var shots = [];
    var channels = (f.channels || []).map(function (c) {
      var links = claimFiles_(c.files, folder, person + ' — ' + safeName_(c.platform) + ' insights');
      shots = shots.concat(links);
      return c.platform + ': ' + c.handle + ' · ' + c.followers;
    });
    withLock_(function () {
      sheet_('talent').appendRow([new Date(), 'New', f.name, f.email, (f.roles || []).join(', '), channels.join('\n'),
        (f.niches || []).join(', '), f.wants, f.signed, f.consent ? 'Yes' : 'No', folder.getUrl(), shots.join('\n'), ref]);
    });
    return { reference: ref };
  },

  submitBooking: function (p) {
    var f = p.fields || {};
    var ref = reference_('B');
    withLock_(function () {
      sheet_('bookings').appendRow([new Date(), 'New', f.brand, f.website, f.name, f.email, (f.services || []).join(', '),
        f.project, f.budget, f.timeline, f.notes, ref]);
    });
    return { reference: ref };
  },

  submitPartner: function (p) {
    var f = p.fields || {};
    var ref = reference_('P');
    withLock_(function () {
      sheet_('partners').appendRow([new Date(), 'New', f.business, f.type, f.website, f.name, f.email,
        (f.partnership || []).join(', '), f.idea, ref]);
    });
    return { reference: ref };
  },
};

// ---------------------------------------------------------------------------
// Media folders
// ---------------------------------------------------------------------------

/** Lists images/videos/SVGs in a media folder, sorted by name, and makes them link-viewable. */
function listMedia_(path) {
  var folder = folderByPath_(path, false);
  if (!folder) return [];
  var out = [];
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    var mime = f.getMimeType();
    var isVideo = mime.indexOf('video/') === 0;
    var isImage = mime.indexOf('image/') === 0;
    if (!isVideo && !isImage) continue;
    // Media on a public website has to be viewable by anyone with the link.
    if (f.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) {
      try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* org policy may forbid */ }
    }
    var id = f.getId();
    out.push({
      id: id,
      name: f.getName(),
      mimeType: mime,
      src: isVideo
        ? 'https://drive.google.com/uc?export=download&id=' + id
        : mime === 'image/svg+xml' ? '' : 'https://lh3.googleusercontent.com/d/' + id + '=w2000',
    });
  }
  out.sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { numeric: true }); });
  return out;
}

/** The first SVG in "Home Page 1" is the logo; its markup is sent so the site can recolour and animate it. */
function findLogoSvg_(files) {
  for (var i = 0; i < (files || []).length; i++) {
    if (files[i].mimeType === 'image/svg+xml') return svgText_(files[i].id);
  }
  return '';
}

function svgText_(id) {
  try {
    var blob = DriveApp.getFileById(id).getBlob();
    if (blob.getContentType() !== 'image/svg+xml') return '';
    var text = blob.getDataAsString();
    return text.length < 400000 ? text : '';
  } catch (e) {
    return '';
  }
}

function folderByPath_(path, create) {
  var current = DriveApp.getFolderById(rootFolderId_());
  var parts = String(path).split('/');
  for (var i = 0; i < parts.length; i++) {
    var it = current.getFoldersByName(parts[i]);
    if (it.hasNext()) current = it.next();
    else if (create) current = current.createFolder(parts[i]);
    else return null;
  }
  return current;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function spreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Backend not set up — run setup() in the Apps Script editor.');
  return SpreadsheetApp.openById(id);
}

function sheet_(key) {
  return spreadsheet_().getSheetByName(TABS[key].name);
}

function folder_(key) {
  return DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('FOLDER_' + key.toUpperCase()));
}

function childFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function existsFolder_(id) {
  if (!id) return false;
  try { return !DriveApp.getFolderById(id).isTrashed(); } catch (e) { return false; }
}

function existsFile_(id) {
  try { return !DriveApp.getFileById(id).isTrashed(); } catch (e) { return false; }
}

function isInside_(file, folderId) {
  var queue = [];
  var parents = file.getParents();
  while (parents.hasNext()) queue.push(parents.next());
  for (var depth = 0; depth < 6 && queue.length; depth++) {
    var next = [];
    for (var i = 0; i < queue.length; i++) {
      if (queue[i].getId() === folderId) return true;
      var up = queue[i].getParents();
      while (up.hasNext()) next.push(up.next());
    }
    queue = next;
  }
  return false;
}

/** Moves staged uploads into the application folder with readable names; returns their links. */
function claimFiles_(ids, folder, baseName) {
  var incomingId = folder_('incoming').getId();
  var links = [];
  (ids || []).slice(0, 10).forEach(function (id, idx) {
    var file = DriveApp.getFileById(id);
    if (!isInside_(file, incomingId)) return;
    var ext = (file.getName().match(/\.[a-z0-9]+$/i) || [''])[0];
    file.setName(baseName + ' ' + ('0' + (idx + 1)).slice(-2) + ext);
    file.moveTo(folder);
    links.push(file.getUrl());
  });
  return links;
}

function readSettings_() {
  var out = {};
  var values = sheet_('settings').getDataRange().getValues();
  for (var i = 1; i < values.length; i++) if (values[i][0]) out[values[i][0]] = String(values[i][1]);
  return out;
}

function readImages_() {
  var values = sheet_('images').getDataRange().getValues();
  var out = [];
  for (var i = 1; i < values.length; i++) {
    if (!values[i][0] || !values[i][2]) continue;
    out.push({ slot: values[i][0], order: Number(values[i][1]) || i, fileId: values[i][2], alt: values[i][3] || '' });
  }
  return out;
}

function readAdmins_() {
  var values = sheet_('admins').getDataRange().getValues();
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var email = normaliseEmail_(values[i][0]);
    if (email && out.indexOf(email) === -1) out.push(email);
  }
  return out;
}

/** Accepts either a bare folder ID or a pasted https://drive.google.com/drive/folders/<id> URL. */
function rootFolderId_() {
  var raw = String(PropertiesService.getScriptProperties().getProperty('ROOT_FOLDER_ID') || '').trim();
  var fromUrl = raw.match(/folders\/([-\w]+)/) || raw.match(/[?&]id=([-\w]+)/);
  return fromUrl ? fromUrl[1] : raw;
}

function ownerEmail_() {
  return normaliseEmail_(PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL') || '');
}

function normaliseEmail_(v) {
  var s = String(v || '').trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) ? s : '';
}

function safeName_(s) {
  return String(s || '').replace(/[\\/:*?"<>|#%]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Untitled';
}

function extensionFor_(mime, filename) {
  var fromName = String(filename || '').match(/\.[a-z0-9]{2,5}$/i);
  if (fromName) return fromName[0].toLowerCase();
  var map = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'application/pdf': '.pdf' };
  return map[mime] || '';
}

function reference_(prefix) {
  return prefix + '-' + Utilities.formatDate(new Date(), tz_(), 'yyMMdd') + '-' +
    Utilities.getUuid().slice(0, 4).toUpperCase();
}

function tz_() {
  return Session.getScriptTimeZone() || 'Australia/Sydney';
}
