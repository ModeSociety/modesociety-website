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
 *   NOTIFY_EMAIL    – where Mode Society creator applications are emailed (optional; default
 *                     pr@modesociety.com.au, comma-separate several, or "off" to stop all form emails).
 *                     Tech forms never use it: they go to NOTIFY_DEFAULTS below.
 * Everything else (SPREADSHEET_ID, sub-folder IDs) is created by setup().
 */

var TABS = {
  settings: { name: 'Settings', headers: ['Key', 'Value', 'Updated At', 'Updated By'] },
  // the website's wording, one row per section edited in the admin panel (Pages & text); Value is JSON
  content: { name: 'Content', headers: ['Section', 'Value', 'Updated At', 'Updated By'] },
  images: { name: 'Images', headers: ['Slot', 'Order', 'File ID', 'Alt Text', 'File Link', 'Updated At', 'Updated By'] },
  // Side: 'talent' or 'tech' limits an admin to that business; blank = both (16 Nov 2026)
  admins: { name: 'Admins', headers: ['Email', 'Added By', 'Added At', 'Side'] },
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
  visits: {
    name: 'Visits',
    headers: ['Time', 'Date', 'Path', 'Source', 'Referrer', 'Campaign', 'Session', 'Visitor', 'New Visitor', 'Device', 'Country'],
  },
  // ---- ModeSociety Tech (gaming & tech side, /tech) ----
  techBrands: {
    name: 'Tech Brand Enquiries',
    headers: ['Submitted At', 'Status', 'Brand Name', 'Website', 'Your Name', 'Email', 'Category', 'Formats',
      'About The Campaign', 'Budget', 'Timeline', 'Reference'],
  },
  techCreators: {
    name: 'Tech Creator Applications',
    headers: ['Submitted At', 'Status', 'Full Name', 'Handle', 'Email', 'Applying As', 'Channels (platform · handle · followers)',
      'Games / Niche', 'Region', '18+', 'Anything Else', 'Reference'],
  },
  roster: {
    name: 'Tech Roster',
    headers: ['ID', 'Order', 'Name', 'Handle', 'Type', 'Niche', 'Region', 'Quote', 'Featured', 'Visible', 'Photo File ID']
      .concat(['Twitch', 'YouTube', 'TikTok', 'Instagram', 'X', 'Kick'].reduce(function (a, n) { return a.concat([n + ' URL', n + ' Followers']); }, []))
      .concat(['Updated At', 'Updated By']),
  },
  // ---- Service bookings (Services page → Book now), one tab per business ----
  serviceBookings: {
    name: 'Service Bookings',
    headers: ['Submitted At', 'Status', 'Name', 'Email', 'Booking As', 'Service', 'Tier', 'Price', 'Socials / Website', 'Goals', 'Reference'],
  },
  techServiceBookings: {
    name: 'Tech Service Bookings',
    headers: ['Submitted At', 'Status', 'Name', 'Email', 'Booking As', 'Service', 'Tier', 'Price', 'Socials / Website', 'Goals', 'Reference'],
  },
  // ---- Signed Talent (admin panel → Signed Talent): one row per signed creator, both businesses ----
  // Only the application's Reference and the contract: everything else is read from the application row.
  signed: {
    name: 'Signed Talent',
    headers: ['Reference', 'Side', 'Contract', 'Commission', 'Signed At', 'PandaDoc ID', 'Contract Link', 'Mode Email In Bio',
      'Dedicated Email', 'Renewal Reminders', 'Updated At', 'Updated By'],
  },
  // ---- Featured in (admin panel → Featured in) ----
  press: {
    name: 'Featured In',
    headers: ['ID', 'Order', 'Slug', 'Outlet', 'Title', 'Date', 'Excerpt', 'Article', 'Link', 'Photos', 'Visible', 'Updated At', 'Updated By'],
  },
};

/** Roster platforms, in Sheet column order (keep in sync with src/lib/tech.ts). */
var ROSTER_PLATFORMS = ['twitch', 'youtube', 'tiktok', 'instagram', 'x', 'kick'];
var ROSTER_FIELDS = ['id', 'order', 'name', 'handle', 'type', 'niche', 'region', 'quote', 'featured', 'visible', 'photo'];

/** Featured in columns, in Sheet order. Photos are Drive file IDs, comma-separated; the first is the cover. */
var PRESS_FIELDS = ['id', 'order', 'slug', 'outlet', 'title', 'date', 'excerpt', 'body', 'href', 'photos', 'visible'];

var VISITS_KEEP_DAYS = 400;

var FOLDERS = {
  images: 'Website Images',
  talent: 'Talent Applications',
  incoming: '_Incoming Uploads',
  // the four contract templates (Google Docs, made from Asha's Word files) and the signed PDFs; private
  contracts: 'Contracts',
  signed: 'Signed Contracts',
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
  'Services',
  'Our Work',
  'Featured In',
  'Tech Brands',
  'Tech Video',
  'Intro Video',
];

/**
 * Where each form's new submissions are emailed (comma-separated). Mode Society and ModeSociety Tech
 * are separate businesses: a Tech form never goes to a Mode Society inbox (Asha, 16 Nov 2026).
 */
var NOTIFY_DEFAULTS = {
  talent: 'pr@modesociety.com.au',
  bookings: 'brands@modesociety.com.au', // brand leads (Asha's brief, section 2); creator leads stay on pr@
  techBrands: 'techadmin@modesociety.com.au, patrick@modesociety.com.au',
  techCreators: 'techadmin@modesociety.com.au, patrick@modesociety.com.au',
};
var TECH_FORMS = { techBrands: true, techCreators: true, techServiceBookings: true };
var CREATOR_FORMS = { talent: true, techCreators: true };

/**
 * The addresses a form's emails go to; '' when emails are off. Addresses saved in the admin panel
 * (Settings tab: email.<talent|tech>.<creators|brands>) come first, then the old NOTIFY_EMAIL script
 * property (Mode Society creators only), then NOTIFY_DEFAULTS.
 */
function notifyTo_(form) {
  var prop = String(PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL') || '').trim();
  if (/^off$/i.test(prop)) return '';
  var saved = String(readSettings_()['email.' + (TECH_FORMS[form] ? 'tech' : 'talent') + '.' + (CREATOR_FORMS[form] ? 'creators' : 'brands')] || '').trim();
  if (saved) return saved;
  if (form === 'talent' && prop) return prop; // the old single-address setting, kept for Mode Society creators
  return NOTIFY_DEFAULTS[form] || '';
}
var SITE_URL = 'https://www.modesociety.com.au';
/** Gmail takes 25 MB of attachments per email; files past this are linked to in the application folder instead. */
var MAX_ATTACH_BYTES = 20 * 1024 * 1024;

/** A creator lead's path to signing, and a brand lead's path to a deal (16 Nov 2026; keep in sync with src/lib/enquiries.ts). */
var CREATOR_STATUSES = ['New', 'Reviewing', 'Contract sent', 'Signed', 'Declined'];
var BRAND_STATUSES = ['New', 'Contacted', 'Proposal sent', 'Won', 'Lost'];
var CREATOR_KINDS = { talent: true, techCreators: true };
/** a service booking's path: the team confirms it and invoices by hand (no online payment) */
var BOOKING_STATUSES = ['New', 'Confirmed', 'Invoiced', 'Paid', 'Cancelled'];
var BOOKING_KINDS = { services: true, techServices: true };
/** the end of the road: only these leads can be deleted */
var CLOSED_STATUSES = ['Declined', 'Lost', 'Cancelled'];
function statusesFor_(kind) { return CREATOR_KINDS[kind] ? CREATOR_STATUSES : BOOKING_KINDS[kind] ? BOOKING_STATUSES : BRAND_STATUSES; }

/** The form tabs the admin panel reads back (panel name → TABS key). */
var ENQUIRY_TABS = { talent: 'talent', brands: 'bookings', techBrands: 'techBrands', techCreators: 'techCreators',
  services: 'serviceBookings', techServices: 'techServiceBookings' };

var DEFAULT_SETTINGS = {
  heroMode: 'gravity',
  heroAutoCycle: 'false',
  techLaunched: 'false',
  introStyle: 'curtain',
  ctaStyle: 'reveal',
  footerStyle: 'magnetic',
};

// ---------------------------------------------------------------------------
// One-off setup. Run this from the editor after setting SHARED_SECRET (and OWNER_EMAIL).
// Safe to run again — it only creates what is missing. Without ROOT_FOLDER_ID it makes a
// "Mode Society Website" folder in My Drive and remembers it.
// ---------------------------------------------------------------------------
function setup() {
  var props = PropertiesService.getScriptProperties();
  if (!rootFolderId_()) props.setProperty('ROOT_FOLDER_ID', DriveApp.createFolder('Mode Society Website').getId());
  if (!props.getProperty('SHARED_SECRET')) throw new Error('Set the SHARED_SECRET script property first.');
  var root = DriveApp.getFolderById(rootFolderId_());

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
    var tech = /^Tech /.test(def.name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      sheet.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground(tech ? '#1d3278' : '#7f090d').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      if (tech) sheet.setTabColor('#3e5ef1');
    } else if (sheet.getLastColumn() < def.headers.length) {
      // a newer version added columns at the end: add their headers
      var have = sheet.getLastColumn();
      sheet.getRange(1, have + 1, 1, def.headers.length - have).setValues([def.headers.slice(have)])
        .setFontWeight('bold').setBackground(tech ? '#1d3278' : '#7f090d').setFontColor('#ffffff');
    }
    var kindOfTab = Object.keys(ENQUIRY_TABS).filter(function (k) { return ENQUIRY_TABS[k] === key; })[0];
    if (kindOfTab) {
      var rule = SpreadsheetApp.newDataValidation().requireValueInList(statusesFor_(kindOfTab), true).build();
      sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
    }
    // keep dates and times as plain text so Sheets doesn't turn them into date values
    if (key === 'visits') sheet.getRange('B:B').setNumberFormat('@');
  });
  retirePartnerships_();
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
  // the exclusive contracts' renewal reminders, checked each morning
  var hasRenewals = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'renewalReminders';
  });
  if (!hasRenewals) ScriptApp.newTrigger('renewalReminders').timeBased().everyDays(1).atHour(8).create();

  publishUploads();
  siteCacheClear_();
  Logger.log('Setup complete. Folder: ' + root.getUrl() + ' · Spreadsheet: ' + ss.getUrl());
}

/**
 * Makes every website image uploaded in the admin panel ("Website Images" and its slot folders)
 * viewable by link, as they're shown on the public site anyway, so the site can load them from
 * Google's image servers instead of through the backend. Talent applications are never touched.
 * Run by setup(); safe to run again.
 */
function publishUploads() {
  var ok = true;
  var walk = function (folder) {
    var files = folder.getFiles();
    while (files.hasNext()) {
      var f = files.next();
      try {
        if (f.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {
        ok = false;
      }
    }
    var subs = folder.getFolders();
    while (subs.hasNext()) walk(subs.next());
  };
  walk(folder_('images'));
  var props = PropertiesService.getScriptProperties();
  if (ok) props.setProperty('UPLOADS_PUBLIC', '1');
  else props.deleteProperty('UPLOADS_PUBLIC');
  Logger.log(ok ? 'Website uploads are viewable by link.' : 'Some uploads could not be shared by link (organisation policy?); the site keeps serving them itself.');
}

/** Daily: bins uploads from forms that were started but never submitted, and prunes old visit rows. */
// ---- renewal reminders (SP-124) ---------------------------------------------

/** The exclusive agreements' wording (clauses 3.3 and 3.4): where an opt-out notice goes, per business. */
var RENEWAL = {
  talent: { name: 'Mode Society', notice: 'admin@modesociety.com.au', kind: 'talent' },
  tech: { name: 'Mode Society Tech', notice: 'admin@modesocietytech.com', kind: 'techCreators' },
};
var RENEWAL_TZ = 'Australia/Melbourne';
var REMIND_DAYS = 30;

/** 'yyyy-MM-dd' plus n days (calendar dates, no time zone involved). */
function addDays_(ymd, n) {
  var d = new Date(ymd + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * An exclusive contract's next renewal on or after `today` (Melbourne dates, 'yyyy-MM-dd'): each
 * anniversary of the signed date. Same rule as nextRenewal in src/lib/signed.ts.
 */
function nextRenewal_(signedAt, today) {
  var signed = Utilities.formatDate(new Date(signedAt), RENEWAL_TZ, 'yyyy-MM-dd');
  var y = Number(signed.slice(0, 4)), m = Number(signed.slice(5, 7)), d = Number(signed.slice(8, 10));
  for (var n = 1; n < 100; n++) {
    var last = new Date(Date.UTC(y + n, m, 0)).getUTCDate(); // 29 Feb signings renew on 28 Feb
    var at = new Date(Date.UTC(y + n, m - 1, Math.min(d, last))).toISOString().slice(0, 10);
    if (at >= today) return at;
  }
  return '';
}

/** "1 December 2026" for an email. */
function longDate_(ymd) {
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return Number(ymd.slice(8, 10)) + ' ' + months[Number(ymd.slice(5, 7)) - 1] + ' ' + ymd.slice(0, 4);
}

/**
 * Runs each morning (setup adds the trigger). Each exclusive creator whose renewal is 30 days away
 * (or closer, if a run was missed) gets one reminder of the Renewal Date and the Opt-Out Window, as
 * their agreement promises (clause 3.4), and that business's admins get one email. Each reminder is
 * logged in the creator's Renewal Reminders cell, so it's never sent twice for the same renewal.
 */
function renewalReminders(now) {
  var today = Utilities.formatDate(now || new Date(), RENEWAL_TZ, 'yyyy-MM-dd');
  var sheet = sheet_('signed');
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return { sent: 0 };
  var head = values[0].map(String);
  var col = function (name) { return head.indexOf(name); };
  // the creators' names and emails, read from their applications by reference
  var people = {};
  ['talent', 'techCreators'].forEach(function (kind) {
    var t = readTable_(kind);
    var at = function (row, name) { var i = t.headers.indexOf(name); return i < 0 ? '' : String(row[i] || '').trim(); };
    t.rows.forEach(function (row) {
      people[at(row, 'Reference')] = { email: at(row, 'Email'), name: at(row, 'Creator Name') || at(row, 'Full Name') };
    });
  });
  var sent = 0;
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (String(row[col('Contract')]) !== 'Exclusive' || !row[col('Signed At')]) continue;
    var renewal = nextRenewal_(row[col('Signed At')], today);
    if (!renewal || addDays_(today, REMIND_DAYS) < renewal) continue; // not due yet
    var log = String(row[col('Renewal Reminders')] || '');
    var tag = 'renewal ' + renewal;
    if (log.indexOf(tag) >= 0) continue; // already reminded for this renewal
    var side = String(row[col('Side')]) === 'tech' ? 'tech' : 'talent';
    var biz = RENEWAL[side];
    var ref = String(row[col('Reference')]);
    var person = people[ref] || {};
    var email = normaliseEmail_(person.email);
    var first = String(person.name || '').split(/\s+/)[0] || 'there';
    var from = addDays_(renewal, -14), to = addDays_(renewal, -1);
    var note;
    if (email) {
      var text = 'Hi ' + first + ',\n\n' +
        'This is your reminder that your exclusive agreement with ' + biz.name + ' renews automatically on ' + longDate_(renewal) +
        ' for a further 12 months.\n\n' +
        'If you don\'t wish to renew, email ' + biz.notice + ' during your opt-out window: ' + longDate_(from) + ' to ' + longDate_(to) +
        ' (until 11:59 pm Melbourne time). If you\'re happy to continue, you don\'t need to do anything.\n\n' +
        'The ' + biz.name + ' Team';
      try {
        MailApp.sendEmail({ to: email, subject: 'Your ' + biz.name + ' agreement renews on ' + longDate_(renewal), body: text, name: biz.name, replyTo: biz.notice });
        note = 'creator emailed';
      } catch (err) {
        console.error('Could not send the renewal reminder to ' + email + ': ' + err);
        continue; // not logged: tomorrow's run tries again
      }
    } else {
      note = 'no email on file, creator NOT emailed';
    }
    var admins = notifyTo_(biz.kind);
    if (admins) {
      try {
        MailApp.sendEmail({
          to: admins, name: biz.name + ' website',
          subject: 'Renewal on ' + longDate_(renewal) + ': ' + (person.name || ref),
          body: (person.name || ref) + "'s exclusive agreement renews on " + longDate_(renewal) + '. Opt-out window: ' + longDate_(from) + ' to ' +
            longDate_(to) + '.\n' + (email ? 'They were emailed a reminder today (' + email + ').' : 'There is no email on file, so they were NOT emailed: please remind them yourself.') +
            '\n\nReference ' + ref + ': admin panel, Signed Talent.',
        });
      } catch (err) { console.error('Could not send the admins\' renewal email: ' + err); }
    }
    sheet.getRange(i + 1, col('Renewal Reminders') + 1).setValue((log ? log + '\n' : '') + today + ': ' + tag + ' reminder, ' + note);
    sent++;
  }
  return { sent: sent };
}

function cleanupIncoming() {
  var cutoff = Date.now() - 2 * 24 * 3600 * 1000;
  var files = folder_('incoming').getFiles();
  while (files.hasNext()) {
    var f = files.next();
    if (f.getDateCreated().getTime() < cutoff) f.setTrashed(true);
  }
  pruneVisits_();
}

function pruneVisits_() {
  var sheet = sheet_('visits');
  if (!sheet || sheet.getLastRow() < 2) return;
  var oldest = dayString_(new Date(Date.now() - VISITS_KEEP_DAYS * 24 * 3600 * 1000));
  var dates = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
  var drop = 0;
  while (drop < dates.length && asDay_(dates[drop][0]) < oldest) drop++; // rows are appended in time order
  if (drop) sheet.deleteRows(2, drop);
}

// ---------------------------------------------------------------------------
// HTTP entry points
// ---------------------------------------------------------------------------
function doGet() {
  return json_({ ok: true, service: 'mode-society-backend' });
}

/** Actions that change what getSite returns: each one clears its cache. */
var SITE_WRITES = ['setSettings', 'setSlot', 'saveRosterMember', 'deleteRosterMember', 'setRosterOrder', 'savePressItem',
  'deletePressItem', 'setPressOrder', 'setContent', 'resetContent'];

/**
 * Partnerships were retired on 6 Nov 2026 (Asha's request). The partnership offers already received
 * live in the "Partnerships" tab: it is deleted once, on the first request after this version is
 * deployed (or when setup() runs), and a script property records that it's done. The copies of those
 * enquiries in the pr@ inbox are kept.
 */
function retirePartnerships_() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('PARTNERSHIPS_RETIRED')) return;
  withLock_(function () {
    if (props.getProperty('PARTNERSHIPS_RETIRED')) return;
    var ss = spreadsheet_();
    var tab = ss.getSheetByName('Partnerships');
    if (tab) ss.deleteSheet(tab);
    props.setProperty('PARTNERSHIPS_RETIRED', new Date().toISOString());
  });
  siteCacheClear_();
}

function doPost(e) {
  try {
    retirePartnerships_();
    var body = JSON.parse(e.postData.contents || '{}');
    var secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || body.secret !== secret) return json_({ ok: false, error: 'unauthorised' });
    var handler = ACTIONS[body.action];
    if (!handler) return json_({ ok: false, error: 'unknown action: ' + body.action });
    if (body.action === 'getSite') {
      // building the site's content reads every tab and media folder (several seconds), so it's kept for a few minutes
      var cached = siteCacheGet_();
      if (cached) return ContentService.createTextOutput('{"ok":true,"data":' + cached + '}').setMimeType(ContentService.MimeType.JSON);
      var site = ACTIONS.getSite();
      siteCachePut_(JSON.stringify(site));
      return json_({ ok: true, data: site });
    }
    var data = handler(body.payload || {});
    if (SITE_WRITES.indexOf(body.action) >= 0) siteCacheClear_();
    return json_({ ok: true, data: data });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

// getSite's cache: CacheService holds 100 KB per value, so the JSON is stored in pieces.
var SITE_CACHE_SECONDS = 300; // files dropped into the Drive media folders show within 5 minutes
var SITE_CACHE_PIECE = 45000;

function siteCacheGet_() {
  try {
    var cache = CacheService.getScriptCache();
    var n = Number(cache.get('site:n'));
    if (!n) return '';
    var keys = [];
    for (var i = 0; i < n; i++) keys.push('site:' + i);
    var parts = cache.getAll(keys);
    var out = '';
    for (var j = 0; j < n; j++) {
      if (parts['site:' + j] == null) return '';
      out += parts['site:' + j];
    }
    return out;
  } catch (e) {
    return '';
  }
}

function siteCachePut_(json) {
  try {
    var values = {};
    var n = Math.ceil(json.length / SITE_CACHE_PIECE);
    if (n > 20) return; // too big to keep; it's simply rebuilt each time
    for (var i = 0; i < n; i++) values['site:' + i] = json.slice(i * SITE_CACHE_PIECE, (i + 1) * SITE_CACHE_PIECE);
    values['site:n'] = String(n);
    CacheService.getScriptCache().putAll(values, SITE_CACHE_SECONDS);
  } catch (e) { /* the cache is only a speed-up */ }
}

function siteCacheClear_() {
  try { CacheService.getScriptCache().remove('site:n'); } catch (e) { /* ignore */ }
}

var ACTIONS = {
  getSite: function () {
    var folders = {};
    MEDIA_FOLDERS.forEach(function (path) { folders[path] = listMedia_(path); });
    var images = readImages_();
    // An SVG uploaded to the logo slot in the admin panel wins over the one in "Home Page 1".
    var uploadedLogo = images.filter(function (r) { return r.slot === 'brand.logo'; })[0];
    var logoSvg = uploadedLogo ? svgText_(uploadedLogo.fileId) : '';
    return {
      settings: readSettings_(), images: images, folders: folders, logoSvg: logoSvg || findLogoSvg_(folders['Home Page 1']),
      roster: readRoster_().filter(function (m) { return m.visible; }),
      press: readPress_().filter(function (a) { return a.visible; }),
      content: readContent_(),
      // every admin upload is link-viewable, so the site can load them straight from Google
      uploadsPublic: PropertiesService.getScriptProperties().getProperty('UPLOADS_PUBLIC') === '1',
    };
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
    return { owner: ownerEmail_(), admins: readAdmins_(), sides: readAdminSides_() };
  },

  /** Adds an admin; side 'talent' or 'tech' limits them to that business (blank: both). */
  addAdmin: function (p) {
    var email = normaliseEmail_(p.email);
    if (!email) throw new Error('Invalid email');
    var side = adminSide_(p.side);
    return withLock_(function () {
      if (readAdmins_().indexOf(email) === -1 && email !== ownerEmail_()) {
        sheet_('admins').appendRow([email, p.by || '', new Date(), side]);
      }
      return { owner: ownerEmail_(), admins: readAdmins_(), sides: readAdminSides_() };
    });
  },

  /** Changes which business an admin can open: 'talent', 'tech' or '' (both). */
  setAdminSide: function (p) {
    var email = normaliseEmail_(p.email);
    if (email === ownerEmail_()) throw new Error('The owner account always has both');
    var side = adminSide_(p.side);
    return withLock_(function () {
      var sheet = sheet_('admins');
      var values = sheet.getDataRange().getValues();
      var col = values[0].indexOf('Side');
      if (col < 0) throw new Error('Run setup first: the Admins tab has no Side column');
      var found = false;
      for (var i = 1; i < values.length; i++) {
        if (normaliseEmail_(values[i][0]) === email) {
          sheet.getRange(i + 1, col + 1).setValue(side);
          found = true;
        }
      }
      if (!found) throw new Error('That account is not an admin');
      return { owner: ownerEmail_(), admins: readAdmins_(), sides: readAdminSides_() };
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

  /** Every row of the Settings tab (the admin panel reads the email addresses from it). */
  getSettings: function () {
    return { settings: readSettings_() };
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
    // it's going on the public website: link-viewable lets the site load it straight from Google's image servers
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
      PropertiesService.getScriptProperties().deleteProperty('UPLOADS_PUBLIC'); // org policy forbids it: keep serving through the site
    }
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
  /** Website media only (admin uploads and the media folders) — never applications or the Sheet. */
  getFile: function (p) {
    var file = DriveApp.getFileById(p.fileId);
    var allowed = [folder_('images')].concat(MEDIA_FOLDERS.map(function (path) { return folderByPath_(path, false); }));
    var ok = allowed.some(function (f) { return f && isInside_(file, f.getId()); });
    if (!ok) throw new Error('not found');
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
    var files = [];
    var channels = (f.channels || []).map(function (c) {
      var links = claimFiles_(c.files, folder, person + ' — ' + safeName_(c.platform) + ' insights', files);
      shots = shots.concat(links);
      return c.platform + ': ' + c.handle + ' · ' + c.followers;
    });
    withLock_(function () {
      sheet_('talent').appendRow([new Date(), 'New', f.name, f.email, (f.roles || []).join(', '), channels.join('\n'),
        (f.niches || []).join(', '), f.wants, f.signed, f.consent ? 'Yes' : 'No', folder.getUrl(), shots.join('\n'), ref]);
    });
    notify_('talent', 'New talent application: ' + (f.name || 'Unnamed'), ref, f.email, [
      ['Name', f.name], ['Email', f.email], ['What they do', (f.roles || []).join(', ')], ['Channels', channels.join('\n')],
      ['Niche', (f.niches || []).join(', ')], ['Wants from an agency', f.wants], ['Signed elsewhere', f.signed],
      ['18+ / consent', f.consent ? 'Yes' : 'No'], ['Application folder', folder.getUrl()],
    ], files);
    return { reference: ref };
  },

  submitBooking: function (p) {
    var f = p.fields || {};
    var ref = reference_('B');
    withLock_(function () {
      sheet_('bookings').appendRow([new Date(), 'New', f.brand, f.website, f.name, f.email, (f.services || []).join(', '),
        f.project, f.budget, f.timeline, f.notes, ref]);
    });
    sendOrQueue_(p, ref, { notify: { form: 'bookings', subject: 'New brand enquiry: ' + (f.brand || f.name || 'Unnamed'), replyTo: f.email, rows: [
      ['Brand', f.brand], ['Website / Instagram', f.website], ['Name', f.name], ['Email', f.email],
      ['Services', (f.services || []).join(', ')], ['About the project', f.project], ['Budget', f.budget],
      ['Timeline', f.timeline], ['Notes', f.notes],
    ] } });
    return { reference: ref };
  },

  /**
   * Sends the emails a form left queued (deferEmails): the website asks right after it has thanked the
   * visitor, so nobody waits for Gmail and the attachments. Each queue is sent once.
   */
  sendQueuedEmails: function (p) {
    var cache = CacheService.getScriptCache();
    var key = 'mail:' + String(p.reference || '');
    var raw = cache.get(key);
    if (!raw) return { sent: false };
    cache.remove(key);
    runMailJob_(JSON.parse(raw));
    return { sent: true };
  },

  /**
   * A Tech brand enquiry (Asha's spec, 16 Nov 2026): the site sends the row as [column, value] pairs
   * and the brand's one auto-reply. An uploaded brief or deck moves to ModeSociety Tech/Brand Briefs
   * (so admins can download it from the lead) and is attached to the email.
   */
  submitTechBrand: function (p) {
    var ref = reference_('TB');
    var company = safeName_(p.company || 'Unnamed');
    var files = [];
    var brief = p.brief
      ? claimFiles_([p.brief], childFolder_(childFolder_(folder_('talent'), 'ModeSociety Tech'), 'Brand Briefs'), company + ' — brief (' + ref + ')', files)
      : [];
    var cols = [['Submitted At', new Date()], ['Status', 'New']]
      .concat(p.columns || [])
      .concat([['Brief', brief[0] || p.briefLink || ''], ['Reference', ref]]);
    withLock_(function () { appendByColumn_(sheet_('techBrands'), cols); });
    sendOrQueue_(p, ref, {
      notify: { form: 'techBrands', subject: 'New Tech brand enquiry: ' + (p.company || 'Unnamed'), replyTo: p.email,
        rows: (p.columns || []).concat([['Brief', brief[0] || p.briefLink || '']]), fileIds: files.map(function (f) { return f.getId(); }) },
      reply: { to: p.email, m: p.autoReply },
    });
    return { reference: ref };
  },

  /**
   * A Book now booking from a Services page (SP-127): the site checks the service and tier against its
   * own list and sends the price with them. Creator bookings go to the creators' inbox and brand bookings
   * to the brands' (Mode Society: pr@ and brands@; Tech: techadmin@ and patrick@), as set in Emails.
   */
  submitServiceBooking: function (p) {
    var tech = p.side === 'tech';
    var key = tech ? 'techServiceBookings' : 'serviceBookings';
    var ref = reference_(tech ? 'TS' : 'S');
    var b = p.booking || {};
    var brand = b.as === 'Brand';
    withLock_(function () {
      appendByColumn_(sheet_(key), [['Submitted At', new Date()], ['Status', 'New'], ['Name', b.name], ['Email', b.email], ['Booking As', b.as],
        ['Service', b.service], ['Tier', b.tier], ['Price', b.price], ['Socials / Website', b.link], ['Goals', b.goals], ['Reference', ref]]);
    });
    // the inbox: the side's creators' or brands' address (the Emails settings decide, then the defaults)
    var route = tech ? (brand ? 'techBrands' : 'techCreators') : (brand ? 'bookings' : 'talent');
    sendOrQueue_(p, ref, { notify: { form: route, subject: 'New booking: ' + b.service + ' · ' + b.tier + ' (' + (b.name || 'Unnamed') + ')', replyTo: b.email, rows: [
      ['Service', b.service], ['Tier', b.tier], ['Price', b.price], ['Name', b.name], ['Email', b.email], ['Booking as', b.as],
      ['Socials / website', b.link], ['Goals', b.goals], ['Next', 'Confirm the booking and send an invoice (no payment was taken).'],
    ] } });
    return { reference: ref };
  },

  submitTechCreator: function (p) {
    var f = p.fields || {};
    var ref = reference_('TC');
    var channels = (f.channels || []).map(function (c) { return c.platform + ': ' + c.handle + ' · ' + c.followers; });
    withLock_(function () {
      sheet_('techCreators').appendRow([new Date(), 'New', f.name, f.handle, f.email, f.as, channels.join('\n'), f.niche,
        f.region, f.adult ? 'Yes' : 'No', f.notes, ref]);
    });
    notify_('techCreators', 'New Tech creator application: ' + (f.name || f.handle || 'Unnamed'), ref, f.email, [
      ['Name', f.name], ['Handle', f.handle], ['Email', f.email], ['Applying as', f.as], ['Channels', channels.join('\n')],
      ['Games / niche', f.niche], ['Region', f.region], ['18+', f.adult ? 'Yes' : 'No'], ['Anything else', f.notes],
    ]);
    return { reference: ref };
  },

  /**
   * A creator application (also the onboarding form, 16 Nov 2026) for Mode Society (Talent tab) or
   * ModeSociety Tech (Tech Creator Applications tab). The site has already checked every answer and
   * sends the row as [column, value] pairs; columns the tab doesn't have yet are added at its end, so
   * older rows keep their own columns. Photos, the round profile crop and the media kit move from the
   * incoming folder into the creator's private application folder.
   */
  submitCreator: function (p) {
    var tech = p.side === 'tech';
    var key = tech ? 'techCreators' : 'talent';
    var ref = reference_(tech ? 'TC' : 'T');
    var date = Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd');
    var person = safeName_(p.name || 'Unnamed');
    var parent = folder_('talent');
    if (tech) parent = childFolder_(parent, 'ModeSociety Tech');
    var folder = parent.createFolder(date + ' — ' + person + ' (' + ref + ')');
    var files = [];
    var f = p.files || {};
    var photos = claimFiles_(f.photos, folder, person + ' — photo', files);
    var thumb = f.thumb ? claimFiles_([f.thumb], folder, person + ' — profile photo (round crop)') : [];
    var kit = f.mediaKit ? claimFiles_([f.mediaKit], folder, person + ' — media kit') : [];
    var cols = [['Submitted At', new Date()], ['Status', 'New']]
      .concat(p.columns || [])
      .concat([
        ['Profile Photo', photos[0] || ''],
        ['Profile Photo (Round)', thumb[0] || ''],
        ['Photos', photos.join('\n')],
        ['Media Kit', kit[0] || p.mediaKitLink || ''],
        ['Application Folder', folder.getUrl()],
        ['Reference', ref],
      ]);
    withLock_(function () { appendByColumn_(sheet_(key), cols); });
    sendOrQueue_(p, ref, {
      notify: { form: key, subject: 'New ' + (tech ? 'Tech creator' : 'creator') + ' application: ' + (p.name || 'Unnamed'), replyTo: p.email,
        rows: (p.columns || []).concat([['Application folder', folder.getUrl()]]), fileIds: files.map(function (f) { return f.getId(); }) },
      reply: { to: p.email, m: p.autoReply },
    });
    return { reference: ref };
  },

  /**
   * A creator's contract as a PDF (SP-113): a copy of the template Doc in Drive → Contracts (so Asha's
   * latest wording is used), with Schedule 2 cut down to the creator's part (A: Australia, B:
   * international). The site uploads it to PandaDoc, whose field tags in it become the signing fields.
   * The copy is deleted straight after.
   */
  buildContract: function (p) {
    var name = String(p.template || '');
    var found = folder_('contracts').getFilesByName(name);
    var tpl = null;
    while (found.hasNext()) {
      var f = found.next();
      if (f.getMimeType() === 'application/vnd.google-apps.document' && !f.isTrashed()) { tpl = f; break; }
    }
    if (!tpl) throw new Error('There is no Google Doc called "' + name + '" in Drive → Contracts (see README → Contracts)');
    var copy = tpl.makeCopy(name + ' (' + (p.reference || 'draft') + ')', folder_('incoming'));
    try {
      var doc = DocumentApp.openById(copy.getId());
      var body = doc.getBody();
      body.replaceText('\\{\\{BASED\\}\\}', p.part === 'A' ? 'Australia: Domestic Talent (complete Part A)' : 'International: International Talent (complete Part B)');
      removePart_(body, p.part === 'A' ? 'B' : 'A');
      fitFieldTags_(body);
      roomForSignature_(body);
      trimEnd_(body);
      doc.saveAndClose();
      return { name: name + '.pdf', data: Utilities.base64Encode(copy.getAs('application/pdf').getBytes()) };
    } finally {
      copy.setTrashed(true);
    }
  },

  // ---- Tech roster (admin panel → Roster; also editable in the Sheet) ----

  listRoster: function () {
    return { items: readRoster_() };
  },

  /** Creates (no id) or updates a roster member. */
  saveRosterMember: function (p) {
    var m = p.item || {};
    return withLock_(function () {
      var sheet = sheet_('roster');
      var values = sheet.getDataRange().getValues();
      var row = -1;
      if (m.id) for (var i = 1; i < values.length; i++) if (String(values[i][0]) === m.id) row = i + 1;
      if (!m.id || row < 0) {
        m.id = Utilities.getUuid().slice(0, 8);
        if (!m.order) m.order = values.length; // new members go to the end
      }
      var cells = ROSTER_FIELDS.map(function (k) {
        var v = m[k];
        return k === 'featured' || k === 'visible' ? (v ? 'Yes' : 'No') : v == null ? '' : v;
      });
      ROSTER_PLATFORMS.forEach(function (k) {
        var pl = (m.platforms || {})[k] || {};
        cells.push(pl.url || '', pl.followers || '');
      });
      cells.push(new Date(), p.by || '');
      if (row > 0) sheet.getRange(row, 1, 1, cells.length).setValues([cells]);
      else sheet.appendRow(cells);
      return { item: m };
    });
  },

  deleteRosterMember: function (p) {
    return withLock_(function () {
      var sheet = sheet_('roster');
      var values = sheet.getDataRange().getValues();
      for (var i = values.length - 1; i >= 1; i--) if (String(values[i][0]) === String(p.id)) sheet.deleteRow(i + 1);
      return { ok: true };
    });
  },

  /** Saves the display order: `ids` top to bottom. */
  setRosterOrder: function (p) {
    return withLock_(function () {
      var sheet = sheet_('roster');
      var values = sheet.getDataRange().getValues();
      var pos = {};
      (p.ids || []).forEach(function (id, i) { pos[id] = i + 1; });
      for (var i = 1; i < values.length; i++) {
        var id = String(values[i][0]);
        if (pos[id]) sheet.getRange(i + 1, 2).setValue(pos[id]);
      }
      return { ok: true };
    });
  },

  // ---- website wording (admin panel → Pages & text) ----

  /** Saves one section's text (`value` is the section as an object). */
  setContent: function (p) {
    var key = String(p.key || '');
    if (!/^[A-Za-z]+\.[A-Za-z]+$/.test(key)) throw new Error('Unknown section');
    var json = JSON.stringify(p.value || {});
    if (json.length > 45000) throw new Error('That section is too long to save. Shorten it a little.');
    return withLock_(function () {
      var sheet = sheet_('content');
      var values = sheet.getDataRange().getValues();
      var row = -1;
      for (var i = 1; i < values.length; i++) if (values[i][0] === key) row = i + 1;
      var cells = [key, json, new Date(), p.by || ''];
      if (row > 0) sheet.getRange(row, 1, 1, cells.length).setValues([cells]);
      else sheet.appendRow(cells);
      return { content: readContent_() };
    });
  },

  /** Puts a section back to the website's original wording. */
  resetContent: function (p) {
    return withLock_(function () {
      var sheet = sheet_('content');
      var values = sheet.getDataRange().getValues();
      for (var i = values.length - 1; i >= 1; i--) if (values[i][0] === p.key) sheet.deleteRow(i + 1);
      return { content: readContent_() };
    });
  },

  // ---- Featured in (admin panel → Featured in; also editable in the Sheet) ----

  listPress: function () {
    return { items: readPress_() };
  },

  /** Creates (no id) or updates a feature. New ones go to the top of the list. */
  savePressItem: function (p) {
    var a = p.item || {};
    return withLock_(function () {
      var sheet = sheet_('press');
      var values = sheet.getDataRange().getValues();
      var row = -1;
      if (a.id) for (var i = 1; i < values.length; i++) if (String(values[i][0]) === a.id) row = i + 1;
      if (!a.id || row < 0) {
        a.id = Utilities.getUuid().slice(0, 8);
        a.order = 1;
        for (var j = 1; j < values.length; j++) sheet.getRange(j + 1, 2).setValue((Number(values[j][1]) || j) + 1);
      }
      var cells = PRESS_FIELDS.map(function (k) {
        var v = a[k];
        if (k === 'visible') return v === false ? 'No' : 'Yes';
        if (k === 'photos') return (v || []).join(', ');
        return k === 'order' ? Number(v) || 1 : sheetText_(v);
      });
      cells.push(new Date(), p.by || '');
      if (row > 0) sheet.getRange(row, 1, 1, cells.length).setValues([cells]);
      else sheet.appendRow(cells);
      return { item: a };
    });
  },

  deletePressItem: function (p) {
    return withLock_(function () {
      var sheet = sheet_('press');
      var values = sheet.getDataRange().getValues();
      for (var i = values.length - 1; i >= 1; i--) if (String(values[i][0]) === String(p.id)) sheet.deleteRow(i + 1);
      return { ok: true };
    });
  },

  /** Saves the display order: `ids` top to bottom. */
  setPressOrder: function (p) {
    return withLock_(function () {
      var sheet = sheet_('press');
      var values = sheet.getDataRange().getValues();
      var pos = {};
      (p.ids || []).forEach(function (id, i) { pos[id] = i + 1; });
      for (var i = 1; i < values.length; i++) {
        var id = String(values[i][0]);
        if (pos[id]) sheet.getRange(i + 1, 2).setValue(pos[id]);
      }
      return { ok: true };
    });
  },

  // ---- enquiries: the form tabs, read back for the admin panel -------------

  /** Every row of the three form tabs, newest first, as header + text cells. */
  listEnquiries: function () {
    var out = {};
    Object.keys(ENQUIRY_TABS).forEach(function (kind) {
      var values = sheet_(ENQUIRY_TABS[kind]).getDataRange().getValues();
      var rows = values.slice(1).filter(function (r) { return r.join('') !== ''; }).map(function (r) {
        return r.map(function (v) { return v instanceof Date ? v.toISOString() : String(v); });
      });
      out[kind] = { headers: (values[0] || []).map(String), rows: rows.reverse() };
    });
    return { enquiries: out, signed: readTable_('signed') };
  },

  /** Sets the Status cell of the row with this Reference (rows can be sorted or deleted in the Sheet). */
  setEnquiryStatus: function (p) {
    var key = ENQUIRY_TABS[p.kind];
    if (!key) throw new Error('Unknown enquiry type');
    if (statusesFor_(p.kind).indexOf(p.status) < 0) throw new Error('Unknown status');
    return withLock_(function () {
      var sheet = sheet_(key);
      var values = sheet.getDataRange().getValues();
      var refCol = values[0].indexOf('Reference');
      var statusCol = values[0].indexOf('Status');
      for (var i = 1; i < values.length; i++) {
        if (p.reference && String(values[i][refCol]) === String(p.reference)) {
          sheet.getRange(i + 1, statusCol + 1).setValue(p.status);
          // a creator marked Signed joins Signed Talent (once), with the representation they chose
          if (p.status === 'Signed' && CREATOR_KINDS[p.kind]) {
            ensureSigned_(p.reference, TECH_FORMS[key] ? 'tech' : 'talent', String(values[i][values[0].indexOf('Representation')] || ''), p.by);
          }
          return { ok: true };
        }
      }
      throw new Error('That enquiry is no longer in the Sheet');
    });
  },

  /**
   * A contract signed in PandaDoc (SP-117, SP-120, SP-123; the website checks PandaDoc's signature first).
   * Once only per lead: a second call for the same contract changes nothing. The lead moves to Signed
   * and joins Signed Talent with its contract; the signed PDF is saved to Signed Contracts/<business>
   * and linked from both; the creator gets one welcome email with the Creator Growth Guide.
   */
  contractCompleted: function (p) {
    var key = ENQUIRY_TABS[p.kind];
    if (!key || !CREATOR_KINDS[p.kind]) throw new Error('Only creator leads have contracts');
    var side = TECH_FORMS[key] ? 'tech' : 'talent';
    var done = withLock_(function () {
      var sheet = sheet_(key);
      var values = sheet.getDataRange().getValues();
      var head = values[0].map(String);
      var at = function (row, h) { var i = head.indexOf(h); return i < 0 ? '' : String(row[i] || ''); };
      for (var i = 1; i < values.length; i++) {
        var row = values[i];
        if (!p.reference || at(row, 'Reference') !== String(p.reference)) continue;
        if (at(row, 'Contract State') === 'completed') return { already: true };
        if (p.docId && at(row, 'Contract Doc ID') && at(row, 'Contract Doc ID') !== p.docId) return { stale: true }; // an older, voided contract
        var name = at(row, 'Creator Name') || at(row, 'Full Name') || 'Unnamed';
        var folder = childFolder_(folder_('signed'), side === 'tech' ? 'ModeSociety Tech' : 'Mode Society');
        var date = Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd');
        var file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(p.pdf), 'application/pdf',
          date + ' — ' + safeName_(name) + ' — ' + p.type + ' agreement (' + p.reference + ').pdf'));
        updateByColumn_(sheet, i + 1, [['Status', 'Signed'], ['Contract State', 'completed'], ['Signed Contract', file.getUrl()]]);
        ensureSigned_(p.reference, side, at(row, 'Representation'), 'PandaDoc');
        // the contract the creator actually signed is the one on record
        var signed = sheet_('signed');
        var refs = signed.getRange(1, 1, signed.getLastRow(), 1).getValues().map(function (r) { return String(r[0]); });
        var s = refs.indexOf(String(p.reference));
        if (s > 0) updateByColumn_(signed, s + 1, [['Contract', p.type], ['Commission', p.type === 'Exclusive' ? '20%' : '30%'],
          ['Signed At', new Date()], ['PandaDoc ID', p.docId || ''], ['Contract Link', file.getUrl()], ['Updated At', new Date()], ['Updated By', 'PandaDoc']]);
        return { link: file.getUrl(), email: at(row, 'Email'), name: at(row, 'Full Name') || name };
      }
      throw new Error('That enquiry is no longer in the Sheet');
    });
    if (done.already || done.stale) return done;
    autoReply_(done.email, p.welcome); // the welcome email, once (a repeat call stops above)
    // and one email to the business's admins
    notify_(key, done.name + ' signed', p.reference, done.email, [['Contract', p.type], ['Signed contract', done.link],
      ['Next', 'They have the welcome email. Set up their details in the admin panel → Signed Talent.']]);
    return { link: done.link };
  },

  /**
   * Records a creator lead's contract (SP-32, SP-115, SP-116) in its own columns, added the first time:
   * Contract Type, Contract Doc ID, Contract Link, Contract Sent At, Contract State, Contract Reminded At,
   * NSW Sheet Sent; and, when given, a new Status. Only these columns can be written here.
   */
  setLeadContract: function (p) {
    var key = ENQUIRY_TABS[p.kind];
    if (!key || !CREATOR_KINDS[p.kind]) throw new Error('Only creator leads have contracts');
    if (p.status && statusesFor_(p.kind).indexOf(p.status) < 0) throw new Error('Unknown status');
    var allowed = ['Contract Type', 'Contract Doc ID', 'Contract Link', 'Contract Sent At', 'Contract State', 'Contract Reminded At', 'NSW Sheet Sent'];
    var pairs = (p.columns || []).filter(function (c) { return allowed.indexOf(c[0]) >= 0; });
    if (p.status) pairs.push(['Status', p.status]);
    return withLock_(function () {
      var sheet = sheet_(key);
      var values = sheet.getDataRange().getValues();
      var refCol = values[0].indexOf('Reference');
      for (var i = 1; i < values.length; i++) {
        if (!p.reference || String(values[i][refCol]) !== String(p.reference)) continue;
        updateByColumn_(sheet, i + 1, pairs);
        return { ok: true };
      }
      throw new Error('That enquiry is no longer in the Sheet');
    });
  },

  /**
   * A creator signed outside the website, added in the admin panel (Signed Talent → Add). They get a
   * short row in their business's creator tab (Status Signed, Source "Added in admin") so the profile,
   * filters and reminders work as for everyone else, and their Signed Talent row with the contract.
   */
  addSignedTalent: function (p) {
    var tech = p.side === 'tech';
    var key = tech ? 'techCreators' : 'talent';
    var ref = reference_(tech ? 'TC' : 'T');
    var person = safeName_(p.name || 'Unnamed');
    var photo = [];
    var folderUrl = '';
    if (p.photo) {
      var parent = folder_('talent');
      if (tech) parent = childFolder_(parent, 'ModeSociety Tech');
      var folder = parent.createFolder(Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd') + ' — ' + person + ' (' + ref + ', added in admin)');
      photo = claimFiles_([p.photo], folder, person + ' — profile photo');
      folderUrl = folder.getUrl();
    }
    var k = p.contract || {};
    var rep = k.type === 'Exclusive' ? 'Exclusive (20% commission)' : 'Non-exclusive (30% commission)';
    return withLock_(function () {
      appendByColumn_(sheet_(key), [['Submitted At', new Date()], ['Status', 'Signed']].concat(p.columns || []).concat([
        ['Representation', rep], ['Source', 'Added in admin by ' + (p.by || 'an admin') + ' (signed outside the website)'],
        ['Profile Photo', photo[0] || ''], ['Photos', photo[0] || ''], ['Application Folder', folderUrl], ['Reference', ref]]));
      ensureSigned_(ref, tech ? 'tech' : 'talent', rep, p.by);
      var signed = sheet_('signed');
      var refs = signed.getRange(1, 1, signed.getLastRow(), 1).getValues().map(function (r) { return String(r[0]); });
      var row = refs.indexOf(ref);
      if (row > 0) updateByColumn_(signed, row + 1, [['Signed At', k.signedAt || new Date()], ['Contract Link', k.link || '']]);
      return { reference: ref };
    });
  },

  /** Logs that an admin revealed a creator's payment details (SP-122): who and when, never the details. */
  logPaymentReveal: function (p) {
    return withLock_(function () {
      var sheet = sheet_('signed');
      var values = sheet.getDataRange().getValues();
      var head = values[0].map(String);
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][0]) !== String(p.reference) || String(values[i][head.indexOf('Side')]) !== p.side) continue;
        var col = head.indexOf('Payment Reveals');
        var log = col < 0 ? '' : String(values[i][col] || '');
        updateByColumn_(sheet, i + 1, [['Payment Reveals', (log ? log + '\n' : '') + p.by + ' · ' + new Date().toISOString()]]);
        return { ok: true };
      }
      throw new Error('That creator is not in Signed Talent');
    });
  },

  /**
   * Changes a signed creator's own details in Signed Talent: the contract (type, commission, signed date),
   * the "Mode email in bio" tick and their dedicated email. Only these columns can be written here.
   */
  updateSigned: function (p) {
    var allowed = { contract: 'Contract', commission: 'Commission', signedAt: 'Signed At', modeEmailInBio: 'Mode Email In Bio', dedicatedEmail: 'Dedicated Email' };
    return withLock_(function () {
      var sheet = sheet_('signed');
      var values = sheet.getDataRange().getValues();
      var head = values[0].map(String);
      for (var i = 1; i < values.length; i++) {
        if (!p.reference || String(values[i][0]) !== String(p.reference)) continue;
        if (String(values[i][head.indexOf('Side')]) !== p.side) break; // another business's creator
        Object.keys(allowed).forEach(function (k) {
          if (p.patch && p.patch[k] !== undefined) sheet.getRange(i + 1, head.indexOf(allowed[k]) + 1).setValue(p.patch[k]);
        });
        sheet.getRange(i + 1, head.indexOf('Updated At') + 1, 1, 2).setValues([[new Date(), p.by || '']]);
        return { ok: true };
      }
      throw new Error('That creator is not in Signed Talent');
    });
  },

  /**
   * Deletes a declined or lost lead: its Sheet row, and for a talent application its folder of screenshots
   * (moved to the Drive bin, which keeps it for 30 days). Only rows whose Status is Declined or Lost can go.
   */
  deleteEnquiry: function (p) {
    var key = ENQUIRY_TABS[p.kind];
    if (!key) throw new Error('Unknown enquiry type');
    return withLock_(function () {
      var sheet = sheet_(key);
      var values = sheet.getDataRange().getValues();
      var refCol = values[0].indexOf('Reference');
      var statusCol = values[0].indexOf('Status');
      var folderCol = values[0].indexOf('Application Folder');
      for (var i = values.length - 1; i >= 1; i--) {
        if (!p.reference || String(values[i][refCol]) !== String(p.reference)) continue;
        if (CLOSED_STATUSES.indexOf(String(values[i][statusCol])) < 0) throw new Error('Only declined, lost or cancelled leads can be deleted');
        var folderId = folderCol < 0 ? '' : (String(values[i][folderCol]).match(/folders\/([-\w]+)/) || [])[1];
        sheet.deleteRow(i + 1);
        if (folderId) {
          try {
            var folder = DriveApp.getFolderById(folderId);
            if (isInside_(folder, folder_('talent').getId())) folder.setTrashed(true);
          } catch (e) { /* already gone */ }
        }
        return { ok: true };
      }
      throw new Error('That enquiry is no longer in the Sheet');
    });
  },

  /** A talent application's screenshot, for signed-in admins only (the site checks the session). */
  /**
   * A creator's photo or file, for signed-in admins only (the site checks the session and the side).
   * side 'tech': only from Talent Applications/ModeSociety Tech; otherwise only from Talent
   * Applications outside that folder, so an admin of one business can't open the other's files.
   */
  getEnquiryFile: function (p) {
    var file = DriveApp.getFileById(p.fileId);
    var techFolder = folder_('talent').getFoldersByName('ModeSociety Tech');
    var techId = techFolder.hasNext() ? techFolder.next().getId() : '';
    var inTech = Boolean(techId) && isInside_(file, techId);
    var ok = p.side === 'tech' ? inTech : isInside_(file, folder_('talent').getId()) && !inTech;
    if (!ok) throw new Error('not found');
    var blob = file.getBlob();
    return { mimeType: blob.getContentType(), name: file.getName(), data: Utilities.base64Encode(blob.getBytes()) };
  },

  // ---- insights ----------------------------------------------------------

  /** One row per page view (the site has already classified the source and stripped anything personal). */
  track: function (p) {
    var now = new Date();
    sheet_('visits').appendRow([now, dayString_(now), p.path, p.source, p.referrer, p.campaign, p.session, p.visitor,
      p.newVisitor ? 'Yes' : '', p.device, p.country]);
    return { ok: true };
  },

  /** Traffic and business numbers for the last `days` days, plus the period before for comparison. */
  getStats: function (p) {
    var days = Math.min(Math.max(Number(p.days) || 30, 1), 365);
    var side = p.side === 'tech' || p.side === 'talent' ? p.side : 'all';
    var onSide = function (path) {
      if (side === 'all') return true;
      var tech = /^\/tech(\/|$)/.test(String(path));
      return side === 'tech' ? tech : !tech;
    };
    var today = new Date();
    var from = dayString_(new Date(today.getTime() - (days - 1) * 864e5));
    var prevFrom = dayString_(new Date(today.getTime() - (2 * days - 1) * 864e5));
    var to = dayString_(today);

    var cur = emptyTraffic_();
    var prev = emptyTraffic_();
    var daily = {};
    for (var d = 0; d < days; d++) {
      daily[dayString_(new Date(today.getTime() - (days - 1 - d) * 864e5))] = { organic: 0, social: 0, direct: 0, referral: 0, campaign: 0, pageviews: 0 };
    }
    var vs = sheet_('visits');
    var rows = vs && vs.getLastRow() > 1 ? vs.getRange(2, 1, vs.getLastRow() - 1, 11).getValues() : [];
    for (var i = rows.length - 1; i >= 0; i--) {
      var r = rows[i];
      var day = asDay_(r[1]);
      if (day < prevFrom) break; // rows are in time order
      if (!onSide(r[2])) continue;
      var inCur = day >= from;
      var t = inCur ? cur : prev;
      var session = String(r[6]);
      t.pageviews++;
      t.visitors[String(r[7])] = true;
      if (r[8] === 'Yes') t.newVisitors++;
      if (!inCur) {
        if (!t.sessions[session]) t.sessions[session] = String(r[3]);
        continue;
      }
      daily[day] && daily[day].pageviews++;
      t.pages[r[2]] = (t.pages[r[2]] || 0) + 1;
      // walking backwards, the last row seen for a session is its landing page view
      t.sessions[session] = { source: String(r[3]), referrer: String(r[4]), device: String(r[9]), country: String(r[10]), day: day };
    }
    Object.keys(cur.sessions).forEach(function (k) {
      var s = cur.sessions[k];
      cur.sources[s.source] = (cur.sources[s.source] || 0) + 1;
      if (daily[s.day] && s.source in daily[s.day]) daily[s.day][s.source]++;
      if (s.referrer) cur.referrers[s.referrer] = (cur.referrers[s.referrer] || 0) + 1;
      cur.devices[s.device || 'desktop'] = (cur.devices[s.device || 'desktop'] || 0) + 1;
      if (s.country) cur.countries[s.country] = (cur.countries[s.country] || 0) + 1;
    });
    var prevOrganic = 0;
    Object.keys(prev.sessions).forEach(function (k) { if (prev.sessions[k] === 'organic') prevOrganic++; });

    return {
      range: { from: from, to: to, days: days },
      totals: summary_(cur, cur.sources.organic || 0),
      previous: summary_(prev, prevOrganic),
      daily: Object.keys(daily).sort().map(function (k) { var o = daily[k]; o.date = k; return o; }),
      sources: cur.sources,
      pages: top_(cur.pages, 8),
      referrers: top_(cur.referrers, 8),
      devices: cur.devices,
      countries: top_(cur.countries, 8),
      side: side,
      forms: {
        talent: countSince_('talent', from, to), bookings: countSince_('bookings', from, to),
        techBrands: countSince_('techBrands', from, to), techCreators: countSince_('techCreators', from, to),
        previous: {
          talent: countSince_('talent', prevFrom, from, true), bookings: countSince_('bookings', prevFrom, from, true),
          techBrands: countSince_('techBrands', prevFrom, from, true), techCreators: countSince_('techCreators', prevFrom, from, true),
        },
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Enquiry emails
// ---------------------------------------------------------------------------

/**
 * Emails a new submission to that form's inbox (notifyTo_); replying goes straight to the person who
 * filled in the form. A mail failure (quota, bad address) is logged and never loses the submission:
 * it is already in the Sheet.
 */
function notify_(form, subject, ref, replyTo, rows, files) {
  var to = notifyTo_(form);
  if (!to) return;
  // what the person uploaded (talent screenshots) goes in as attachments, up to Gmail's size limit
  var attachments = [];
  var size = 0;
  (files || []).forEach(function (file) {
    try {
      var bytes = file.getSize();
      if (size + bytes > MAX_ATTACH_BYTES) return;
      attachments.push(file.getBlob().setName(file.getName()));
      size += bytes;
    } catch (e) { /* unreadable file: it's still linked from the folder */ }
  });
  var left = (files || []).length - attachments.length;
  if (files && files.length) {
    rows = rows.concat([['Uploads', attachments.length + ' attached' + (left ? ', ' + left + ' more in the application folder (too large to attach)' : '')]]);
  }
  var filled = rows.filter(function (r) { return String(r[1] == null ? '' : r[1]).trim() !== ''; });
  var esc = function (v) {
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var cell = function (v) {
    var raw = String(v).trim();
    return /^https?:\/\/\S+$/.test(raw) ? '<a href="' + esc(raw) + '">' + esc(raw) + '</a>' : esc(raw).replace(/\n/g, '<br>');
  };
  var html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a">' +
    '<p style="margin:0 0 14px"><b>' + esc(subject) + '</b> <span style="color:#888">· ' + esc(ref) + '</span></p>' +
    '<table cellpadding="8" style="border-collapse:collapse;max-width:640px">' +
    filled.map(function (r) {
      return '<tr><td style="vertical-align:top;color:#666;white-space:nowrap;border-bottom:1px solid #eee">' + esc(r[0]) +
        '</td><td style="border-bottom:1px solid #eee">' + cell(r[1]) + '</td></tr>';
    }).join('') +
    '</table><p style="margin:18px 0 0;color:#666">Reply to this email to answer them directly. ' +
    'Set its status under Leads in the <a href="' + SITE_URL + '/admin">admin panel</a>.</p></div>';
  var body = subject + ' (' + ref + ')\n\n' +
    filled.map(function (r) { return r[0] + ': ' + String(r[1]); }).join('\n') +
    '\n\nReply to this email to answer them directly. Admin panel: ' + SITE_URL + '/admin';
  try {
    var mail = { to: to, subject: subject + ' (' + ref + ')', body: body, htmlBody: html,
      name: TECH_FORMS[form] ? 'ModeSociety Tech website' : 'Mode Society website' };
    if (attachments.length) mail.attachments = attachments;
    var reply = normaliseEmail_(replyTo);
    if (reply) mail.replyTo = reply;
    MailApp.sendEmail(mail);
  } catch (err) {
    console.error('Could not email ' + ref + ': ' + err);
    // e.g. the attachments were refused: still send the enquiry itself
    if (attachments.length) {
      try {
        delete mail.attachments;
        MailApp.sendEmail(mail);
      } catch (err2) {
        console.error('Could not email ' + ref + ' without attachments either: ' + err2);
      }
    }
  }
}

function readRoster_() {
  var sheet = sheet_('roster');
  if (!sheet || sheet.getLastRow() < 2) return [];
  var width = ROSTER_FIELDS.length + ROSTER_PLATFORMS.length * 2;
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
  return values
    .filter(function (r) { return r[0] && r[2]; })
    .map(function (r) {
      var o = {};
      ROSTER_FIELDS.forEach(function (k, i) { o[k] = String(r[i]); });
      o.order = Number(r[1]) || 999;
      o.featured = /^(yes|true|1)$/i.test(String(r[8]));
      o.visible = !/^(no|false|0)$/i.test(String(r[9]));
      o.platforms = {};
      ROSTER_PLATFORMS.forEach(function (k, j) {
        var url = String(r[ROSTER_FIELDS.length + j * 2] || '').trim();
        var followers = String(r[ROSTER_FIELDS.length + j * 2 + 1] || '').trim();
        if (url || followers) o.platforms[k] = { url: url, followers: followers };
      });
      return o;
    })
    .sort(function (a, b) { return a.order - b.order; });
}

/** Section → its saved text. A cell that isn't valid JSON (e.g. edited by hand) is skipped. */
function readContent_() {
  var sheet = sheet_('content');
  var out = {};
  if (!sheet || sheet.getLastRow() < 2) return out;
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (!r[0]) return;
    try { out[r[0]] = JSON.parse(String(r[1])); } catch (e) { /* ignore */ }
  });
  return out;
}

function readPress_() {
  var sheet = sheet_('press');
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, PRESS_FIELDS.length).getValues();
  return values
    .filter(function (r) { return r[0] && (r[3] || r[4]); })
    .map(function (r, i) {
      var o = {};
      PRESS_FIELDS.forEach(function (k, j) { o[k] = r[j] instanceof Date ? dayString_(r[j]) : String(r[j]); });
      o.order = Number(r[1]) || 999 + i;
      o.photos = String(r[9]).split(/[\s,]+/).filter(function (id) { return /^[-\w]{10,}$/.test(id); });
      o.visible = !/^(no|false|0)$/i.test(String(r[10]));
      return o;
    })
    .sort(function (a, b) { return a.order - b.order; });
}

function emptyTraffic_() {
  return { pageviews: 0, newVisitors: 0, visitors: {}, sessions: {}, sources: {}, pages: {}, referrers: {}, devices: {}, countries: {} };
}

function summary_(t, organic) {
  var sessions = Object.keys(t.sessions).length;
  return {
    pageviews: t.pageviews, sessions: sessions, visitors: Object.keys(t.visitors).length, newVisitors: t.newVisitors,
    organic: organic, pagesPerSession: sessions ? Math.round((t.pageviews / sessions) * 10) / 10 : 0,
  };
}

function top_(map, n) {
  return Object.keys(map)
    .map(function (k) { return { key: k, value: map[k] }; })
    .sort(function (a, b) { return b.value - a.value; })
    .slice(0, n);
}

/** Form submissions dated within [from, to] (or [from, to) when `exclusive`). */
function countSince_(key, from, to, exclusive) {
  var sheet = sheet_(key);
  if (!sheet || sheet.getLastRow() < 2) return 0;
  var stamps = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  return stamps.filter(function (r) {
    var d = asDay_(r[0]);
    return d >= from && (exclusive ? d < to : d <= to);
  }).length;
}

function dayString_(date) {
  return Utilities.formatDate(date, tz_(), 'yyyy-MM-dd');
}

function timeString_(date) {
  return Utilities.formatDate(date, tz_(), 'HH:mm');
}

function asDay_(v) {
  return v instanceof Date ? dayString_(v) : String(v).slice(0, 10);
}

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

var SPREADSHEET_ = null;
function spreadsheet_() {
  if (SPREADSHEET_) return SPREADSHEET_;
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Backend not set up — run setup() in the Apps Script editor.');
  SPREADSHEET_ = SpreadsheetApp.openById(id);
  return SPREADSHEET_;
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

/**
 * A form's emails: the team's notification (with uploads attached) and the sender's auto-reply. When the
 * website asks (p.deferEmails), they wait in the script cache (6 hours) for sendQueuedEmails, which the
 * website calls just after replying; otherwise they go now.
 */
function sendOrQueue_(p, ref, job) {
  job.ref = ref;
  if (p.deferEmails) {
    try {
      CacheService.getScriptCache().put('mail:' + ref, JSON.stringify(job), 21600);
      return;
    } catch (err) {
      console.error('Could not queue the emails for ' + ref + ', sending them now: ' + err);
    }
  }
  runMailJob_(job);
}

function runMailJob_(job) {
  if (job.notify) {
    var files = (job.notify.fileIds || []).map(function (id) {
      try { return DriveApp.getFileById(id); } catch (e) { return null; }
    }).filter(Boolean);
    notify_(job.notify.form, job.notify.subject, job.ref, job.notify.replyTo, job.notify.rows, files);
  }
  if (job.reply) autoReply_(job.reply.to, job.reply.m);
}

/**
 * The applicant's one auto-reply (Asha's wording, built by the site): sent from the account that runs
 * the backend under the business's name, replies going to that business's address. A mail failure is
 * logged and never loses the application, which is already saved.
 */
function autoReply_(to, m) {
  var email = normaliseEmail_(to);
  if (!email || !m || !m.subject) return;
  try {
    var mail = { to: email, subject: String(m.subject), body: String(m.text || ''), htmlBody: String(m.html || ''), name: String(m.fromName || 'Mode Society') };
    // files sent with it (the Creator Growth Guide with the welcome email)
    if (m.attachments && m.attachments.length) {
      mail.attachments = m.attachments.map(function (a) { return Utilities.newBlob(Utilities.base64Decode(a.data), a.mimeType, a.name); });
    }
    var reply = normaliseEmail_(m.replyTo);
    if (reply) mail.replyTo = reply;
    MailApp.sendEmail(mail);
  } catch (err) {
    console.error('Could not send the auto-reply to ' + email + ': ' + err);
  }
}

/**
 * Appends one row to a tab by column name: [column, value] pairs. Columns the tab doesn't have yet are
 * added at the end of its header row (same style as setup), so rows written earlier keep their columns.
 */
function appendByColumn_(sheet, pairs) {
  var headers = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String) : [];
  var missing = pairs.map(function (p) { return p[0]; }).filter(function (h) { return headers.indexOf(h) < 0; });
  if (missing.length) {
    var tech = /^Tech /.test(sheet.getName());
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing])
      .setFontWeight('bold').setBackground(tech ? '#1d3278' : '#7f090d').setFontColor('#ffffff');
    headers = headers.concat(missing);
  }
  var row = headers.map(function () { return ''; });
  pairs.forEach(function (p) { row[headers.indexOf(p[0])] = p[1] == null ? '' : p[1]; });
  sheet.appendRow(row);
}

/** Writes [column, value] pairs into one row; columns the tab doesn't have yet are added (as appendByColumn_). */
function updateByColumn_(sheet, row, pairs) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  var missing = pairs.map(function (p) { return p[0]; }).filter(function (h) { return headers.indexOf(h) < 0; });
  if (missing.length) {
    var tech = /^Tech /.test(sheet.getName());
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing])
      .setFontWeight('bold').setBackground(tech ? '#1d3278' : '#7f090d').setFontColor('#ffffff');
    headers = headers.concat(missing);
  }
  pairs.forEach(function (p) { sheet.getRange(row, headers.indexOf(p[0]) + 1).setValue(p[1] == null ? '' : p[1]); });
}

/** Moves staged uploads into the application folder with readable names; returns their links (and adds the files to `out`). */
function claimFiles_(ids, folder, baseName, out) {
  var incomingId = folder_('incoming').getId();
  var links = [];
  (ids || []).slice(0, 10).forEach(function (id, idx) {
    var file = DriveApp.getFileById(id);
    if (!isInside_(file, incomingId)) return;
    var ext = (file.getName().match(/\.[a-z0-9]+$/i) || [''])[0];
    file.setName(baseName + ' ' + ('0' + (idx + 1)).slice(-2) + ext);
    file.moveTo(folder);
    links.push(file.getUrl());
    if (out) out.push(file);
  });
  return links;
}

/** A tab as header + text cells (dates as ISO strings), in Sheet order. */
function readTable_(key) {
  var values = sheet_(key).getDataRange().getValues();
  return {
    headers: (values[0] || []).map(String),
    rows: values.slice(1).filter(function (r) { return r.join('') !== ''; }).map(function (r) {
      return r.map(function (v) { return v instanceof Date ? v.toISOString() : String(v); });
    }),
  };
}

/**
 * Adds a creator to Signed Talent unless they're already there (called inside the lock). The contract
 * type and commission come from the representation they chose in the application ("Exclusive (20%
 * commission)"); an older application without one leaves them blank for an admin to fill in.
 */
function ensureSigned_(reference, side, representation, by) {
  var sheet = sheet_('signed');
  var refs = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
  if (refs.indexOf(String(reference)) >= 0) return;
  var m = String(representation).match(/^(Exclusive|Non-exclusive) \((\d+%) commission\)/);
  appendByColumn_(sheet, [['Reference', reference], ['Side', side], ['Contract', m ? m[1] : ''], ['Commission', m ? m[2] : ''],
    ['Signed At', new Date()], ['Mode Email In Bio', 'No'], ['Updated At', new Date()], ['Updated By', by || '']]);
}

/**
 * Removes one part of Schedule 2 from a contract: from its "Part A: …" or "Part B: …" heading up to
 * the next part's heading (or the closing confirmation for Part B).
 */
function removePart_(body, drop) {
  var n = body.getNumChildren();
  // paragraphs, list items and tables all have getText (a table's is all its cells)
  var text = function (i) { var c = body.getChild(i); return c.getText ? String(c.getText()).trim() : ''; };
  var start = -1, end = n;
  for (var i = 0; i < n; i++) {
    var t = text(i);
    if (start < 0 && t.indexOf('Part ' + drop + ':') === 0) start = i;
    else if (start >= 0 && (t.indexOf('Part B:') === 0 || t.indexOf('I confirm that these Payment Details') === 0)) { end = i; break; }
  }
  if (start < 0) throw new Error('The contract template has no "Part ' + drop + ':" heading in Schedule 2');
  for (var k = end - 1; k >= start; k--) body.removeChild(body.getChild(k));
}

/**
 * PandaDoc draws each field the size of its tag, so a tag must sit on one line of its table cell:
 * a long one (a long optId with many underscores) wraps, and PandaDoc then draws a thin, tall field.
 * Every tag with a run of underscores is made about 46 characters long in all: first each run is
 * marked with "~" (so a tag is fitted once), then each marked tag gets its underscores back.
 */
function fitFieldTags_(body) {
  body.replaceText('_{4,}\\}', '~}');
  var MARKED = '\\{[^{}~]*~\\}';
  for (var guard = 0, found; guard < 200 && (found = body.findText(MARKED)); guard++) {
    var text = found.getElement().asText();
    var start = found.getStartOffset(), end = found.getEndOffsetInclusive();
    var tag = text.getText().substring(start, end + 1);
    var core = tag.replace(/~\}$/, '');
    var fitted = core + new Array(Math.max(8, 46 - core.length - 1) + 1).join('_') + '}';
    var attrs = text.getAttributes(start);
    text.deleteText(start, end);
    text.insertText(start, fitted);
    text.setAttributes(start, start + fitted.length - 1, attrs);
  }
}

/**
 * The creator's signature field is taller than one line, and PandaDoc grows it up from its tag: the
 * tag's line gets space above it, so the field sits inside its table row instead of over the text above.
 */
function roomForSignature_(body) {
  var found = body.findText('\\{s\\*?:Talent');
  if (!found) return;
  var el = found.getElement();
  while (el && el.getType() !== DocumentApp.ElementType.PARAGRAPH) el = el.getParent();
  if (el) el.asParagraph().setSpacingBefore(34).setSpacingAfter(4);
}

/**
 * The end of a contract: empty paragraphs after the last words are removed (a Google Doc keeps one,
 * which is made as small as possible), so no blank page is printed after Schedule 2.
 */
function trimEnd_(body) {
  while (body.getNumChildren() > 1) {
    var last = body.getChild(body.getNumChildren() - 1);
    var prev = body.getChild(body.getNumChildren() - 2);
    var empty = function (el) { return el.getType() === DocumentApp.ElementType.PARAGRAPH && !String(el.asParagraph().getText()).trim(); };
    if (!empty(last) || !empty(prev)) break;
    body.removeChild(prev);
  }
  var tail = body.getChild(body.getNumChildren() - 1);
  if (tail.getType() === DocumentApp.ElementType.PARAGRAPH && !String(tail.asParagraph().getText()).trim()) {
    tail.asParagraph().setSpacingBefore(0).setSpacingAfter(0).setLineSpacing(0.5).editAsText().setFontSize(1);
  }
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

function adminSide_(v) {
  return v === 'talent' || v === 'tech' ? v : '';
}

/** Admins limited to one business: { email: 'talent' | 'tech' } (everyone else sees both). */
function readAdminSides_() {
  var values = sheet_('admins').getDataRange().getValues();
  var col = (values[0] || []).indexOf('Side');
  var out = {};
  if (col < 0) return out;
  for (var i = 1; i < values.length; i++) {
    var email = normaliseEmail_(values[i][0]);
    var side = adminSide_(String(values[i][col]).trim().toLowerCase());
    if (email && side) out[email] = side;
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

/** Text for a Sheet cell: a leading = + - @ would make Sheets treat it as a formula. */
function sheetText_(v) {
  var s = v == null ? '' : String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function safeName_(s) {
  return String(s || '').replace(/[\\/:*?"<>|#%]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Untitled';
}

function extensionFor_(mime, filename) {
  var fromName = String(filename || '').match(/\.[a-z0-9]{2,5}$/i);
  if (fromName) return fromName[0].toLowerCase();
  var map = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx' };
  return map[mime] || '';
}

function reference_(prefix) {
  return prefix + '-' + Utilities.formatDate(new Date(), tz_(), 'yyMMdd') + '-' +
    Utilities.getUuid().slice(0, 4).toUpperCase();
}

function tz_() {
  return Session.getScriptTimeZone() || 'Australia/Sydney';
}
