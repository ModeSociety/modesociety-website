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
    name: 'Talent Applications',
    headers: ['Submitted At', 'Status', 'Name', 'Email', 'Phone', 'Why Mode Society', 'Niches', 'Instagram', 'TikTok',
      'Portfolio / Other', 'Heard About Us', 'Application Folder', 'Previous Work', 'Analytics', 'Reference'],
  },
  brands: {
    name: 'Brand Enquiries',
    headers: ['Submitted At', 'Status', 'Full Name', 'Position', 'Company', 'Email', 'Phone', 'Website / Socials',
      'About The Business', 'Target Market', 'Goals', 'Services', 'Budget', 'Moodboard Picks', 'Reference'],
  },
};

var FOLDERS = {
  images: 'Website Images',
  talent: 'Talent Applications',
  incoming: '_Incoming Uploads',
};

var STATUSES = ['New', 'Reviewing', 'Contacted', 'Signed / Booked', 'Declined'];

var DEFAULT_SETTINGS = {
  heroMode: 'pinboard',
  heroAutoCycle: 'false',
  introStyle: 'curtain',
  cursorStyle: 'ring',
  gameMode: 'memory',
  ctaStyle: 'split',
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
      sheet.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground('#111111').setFontColor('#f4f1ea');
      sheet.setFrozenRows(1);
    }
    if (key === 'talent' || key === 'brands') {
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
    return { settings: readSettings_(), images: readImages_() };
  },

  getInfo: function () {
    var props = PropertiesService.getScriptProperties();
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

  /** Returns a website image's bytes. Only files inside "Website Images" are served. */
  getFile: function (p) {
    var file = DriveApp.getFileById(p.fileId);
    if (!isInside_(file, folder_('images').getId())) throw new Error('not found');
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
    var work = claimFiles_(p.workFiles, folder, person + ' — Previous Work');
    var analytics = claimFiles_(p.analyticsFiles, folder, person + ' — Analytics');
    withLock_(function () {
      sheet_('talent').appendRow([new Date(), 'New', f.name, f.email, f.phone, f.why, (f.niches || []).join(', '),
        f.instagram, f.tiktok, f.portfolio, f.heard, folder.getUrl(), work.join('\n'), analytics.join('\n'), ref]);
    });
    return { reference: ref };
  },

  submitBrand: function (p) {
    var f = p.fields || {};
    var ref = reference_('B');
    withLock_(function () {
      sheet_('brands').appendRow([new Date(), 'New', f.name, f.position, f.company, f.email, f.phone, f.website,
        f.business, f.target, f.goals, (f.services || []).join(', '), f.budget, (f.moodboard || []).join(', '), ref]);
    });
    return { reference: ref };
  },
};

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
  for (var depth = 0; depth < 5 && queue.length; depth++) {
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
  var map = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'application/pdf': '.pdf' };
  return map[mime] || '';
}

function reference_(prefix) {
  return prefix + '-' + Utilities.formatDate(new Date(), tz_(), 'yyMMdd') + '-' +
    Utilities.getUuid().slice(0, 4).toUpperCase();
}

function tz_() {
  return Session.getScriptTimeZone() || 'Australia/Sydney';
}
