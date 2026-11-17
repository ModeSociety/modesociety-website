/**
 * Local stand-in for the Google Apps Script backend, for developing without Google.
 * Implements the same actions as google-apps-script/Code.gs, keeping data in
 * ./.mock-backend (JSON + uploaded files).
 *
 *   node scripts/mock-backend.mjs          # listens on http://localhost:4545
 *   APPS_SCRIPT_URL=http://localhost:4545  APPS_SCRIPT_SECRET=mock-secret  (in .env.local)
 */
import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";

const PORT = Number(process.env.PORT || 4545);
const SECRET = process.env.APPS_SCRIPT_SECRET || "mock-secret";
const OWNER = (process.env.OWNER_EMAIL || "rubayathdrjb@gmail.com").toLowerCase();
const DIR = join(process.cwd(), ".mock-backend");
const FILES = join(DIR, "files");
const DB = join(DIR, "db.json");
/** Stand-in for the Drive media folders: put files in .mock-backend/folders/<Folder Name>/ */
const MEDIA = join(DIR, "folders");
const MEDIA_FOLDERS = [
  "Home Page 1", "Home Page 2", "Home Page 3", "About Us 1", "Instagram",
  "Services", "Our Work", "Featured In", "Tech Brands", "Tech Video", "Intro Video",
];
const CREATOR_STATUSES = ["New", "Reviewing", "Contract sent", "Signed", "Declined"];
const BRAND_STATUSES = ["New", "Contacted", "Proposal sent", "Won", "Lost"];
const BOOKING_STATUSES = ["New", "Confirmed", "Invoiced", "Paid", "Cancelled"];
const statusesFor = (kind) =>
  kind === "talent" || kind === "techCreators" ? CREATOR_STATUSES : kind === "services" || kind === "techServices" ? BOOKING_STATUSES : BRAND_STATUSES;
const BOOKING_HEADERS = ["Submitted At", "Status", "Name", "Email", "Booking As", "Service", "Tier", "Price", "Socials / Website", "Goals", "Reference"];
/** Same columns as the Sheet tabs in Code.gs, so the admin panel parses both the same way. */
const SIGNED_HEADERS = ["Reference", "Side", "Contract", "Commission", "Signed At", "PandaDoc ID", "Contract Link", "Mode Email In Bio",
  "Dedicated Email", "Renewal Reminders", "Updated At", "Updated By"];
const ENQUIRY_COLUMNS = {
  services: { store: "serviceBookings", headers: BOOKING_HEADERS, row: () => [] },
  techServices: { store: "techServiceBookings", headers: BOOKING_HEADERS, row: () => [] },
  talent: {
    store: "talent",
    headers: ["Submitted At", "Status", "Full Name", "Email", "What They Do", "Channels (handle · followers)", "Niche",
      "Wants From An Agency", "Signed Elsewhere", "18+ / Consent", "Application Folder", "Screenshots", "Reference"],
    row: (r) => [r.at, r.status || "New", r.name, r.email, (r.roles || []).join(", "),
      (r.channels || []).map((c) => `${c.platform}: ${c.handle} · ${c.followers}`).join("\n"), (r.niches || []).join(", "),
      r.wants, r.signed, r.consent ? "Yes" : "No", "https://drive.google.com/drive/folders/mock-talent",
      (r.channels || []).flatMap((c) => c.files || []).map((f) => `https://drive.google.com/file/d/${f}/view`).join("\n"), r.reference],
  },
  brands: {
    store: "bookings",
    headers: ["Submitted At", "Status", "Brand Name", "Website / Instagram", "Your Name", "Email", "Services",
      "About The Project", "Budget", "Timeline", "Notes", "Reference"],
    row: (r) => [r.at, r.status || "New", r.brand, r.website, r.name, r.email, (r.services || []).join(", "), r.project, r.budget, r.timeline, r.notes, r.reference],
  },
  techBrands: {
    store: "techBrands",
    headers: ["Submitted At", "Status", "Brand Name", "Website", "Your Name", "Email", "Category", "Formats",
      "About The Campaign", "Budget", "Timeline", "Reference"],
    row: (r) => [r.at, r.status || "New", r.brand, r.website, r.name, r.email, (r.categories || []).join(", "), (r.formats || []).join(", "), r.about, r.budget, r.timeline, r.reference],
  },
  techCreators: {
    store: "techCreators",
    headers: ["Submitted At", "Status", "Full Name", "Handle", "Email", "Applying As", "Channels (platform · handle · followers)",
      "Games / Niche", "Region", "18+", "Anything Else", "Reference"],
    row: (r) => [r.at, r.status || "New", r.name, r.handle, r.email, r.as,
      (r.channels || []).map((c) => `${c.platform}: ${c.handle} · ${c.followers}`).join("\n"), r.niche, r.region, r.adult ? "Yes" : "No", r.notes, r.reference],
  },
};
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime" };
mkdirSync(FILES, { recursive: true });
MEDIA_FOLDERS.forEach((f) => mkdirSync(join(MEDIA, f), { recursive: true }));

function listMedia(path) {
  return readdirSync(join(MEDIA, path), { withFileTypes: true })
    .filter((d) => d.isFile() && MIME[extname(d.name).toLowerCase()])
    .map((d) => {
      const fileId = "folder_" + Buffer.from(`${path}/${d.name}`).toString("base64url");
      return { id: fileId, name: d.name, mimeType: MIME[extname(d.name).toLowerCase()], src: `/media/${fileId}` };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

const empty = {
  settings: { heroMode: "gravity", heroAutoCycle: "false", introStyle: "curtain", ctaStyle: "reveal", footerStyle: "magnetic" },
  images: [],
  admins: [],
  talent: [],
  bookings: [],
  visits: [],
  files: {}, // id -> { mimeType, folder }
};
const load = () => {
  const db = existsSync(DB) ? JSON.parse(readFileSync(DB, "utf8")) : structuredClone(empty);
  // partnerships were retired on 6 Nov 2026: like Code.gs, the old partnership enquiries are dropped
  delete db.partners;
  return db;
};
const save = (db) => writeFileSync(DB, JSON.stringify(db, null, 2));
const id = () => randomUUID().replace(/-/g, "") + "mock";
const ref = (p) => `${p}-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${randomUUID().slice(0, 4).toUpperCase()}`;

function storeFile(db, data, mimeType, folder) {
  const fileId = id();
  writeFileSync(join(FILES, fileId), Buffer.from(data, "base64"));
  db.files[fileId] = { mimeType, folder };
  return fileId;
}

const actions = {
  getSite: (db) => {
    const folders = Object.fromEntries(MEDIA_FOLDERS.map((f) => [f, listMedia(f)]));
    const svg = folders["Home Page 1"].find((f) => f.mimeType === "image/svg+xml");
    const up = db.images.find((r) => r.slot === "brand.logo" && db.files[r.fileId]?.mimeType === "image/svg+xml");
    const logoSvg = up
      ? readFileSync(join(FILES, up.fileId), "utf8")
      : svg
        ? readFileSync(join(MEDIA, "Home Page 1", svg.name), "utf8")
        : "";
    const roster = [...(db.roster || [])].filter((m) => m.visible).sort((a, b) => a.order - b.order);
    const press = [...(db.press || [])].filter((a) => a.visible !== false).sort((a, b) => a.order - b.order);
    return { settings: db.settings, images: db.images, folders, logoSvg, roster, press, content: db.content || {} };
  },
  getInfo: () => ({
    spreadsheetUrl: "https://docs.google.com/spreadsheets/d/mock",
    folderUrl: "https://drive.google.com/drive/folders/mock",
    imagesFolderUrl: "https://drive.google.com/drive/folders/mock-images",
    talentFolderUrl: "https://drive.google.com/drive/folders/mock-talent",
  }),
  getAdmins: (db) => ({ owner: OWNER, admins: db.admins, sides: { ...(db.adminSides || {}) } }),
  addAdmin: (db, p) => {
    const e = String(p.email).toLowerCase();
    if (!db.admins.includes(e) && e !== OWNER) {
      db.admins.push(e);
      if (p.side === "talent" || p.side === "tech") (db.adminSides ||= {})[e] = p.side;
    }
    return { owner: OWNER, admins: db.admins, sides: { ...(db.adminSides || {}) } };
  },
  setAdminSide: (db, p) => {
    const e = String(p.email).toLowerCase();
    if (e === OWNER) throw new Error("The owner account always has both");
    if (!db.admins.includes(e)) throw new Error("That account is not an admin");
    db.adminSides ||= {};
    if (p.side === "talent" || p.side === "tech") db.adminSides[e] = p.side;
    else delete db.adminSides[e];
    return { owner: OWNER, admins: db.admins, sides: { ...db.adminSides } };
  },
  removeAdmin: (db, p) => {
    if (p.email === OWNER) throw new Error("The owner account cannot be removed");
    db.admins = db.admins.filter((a) => a !== p.email);
    if (db.adminSides) delete db.adminSides[p.email];
    return { owner: OWNER, admins: db.admins };
  },
  getSettings: (db) => ({ settings: { ...(db.settings || {}) } }),
  setSettings: (db, p) => {
    Object.assign(db.settings, p.values);
    return { settings: db.settings };
  },
  uploadImage: (db, p) => ({ fileId: storeFile(db, p.data, p.mimeType, "images") }),
  setSlot: (db, p) => {
    db.images = db.images.filter((r) => r.slot !== p.slot);
    (p.items || []).forEach((it, i) => db.images.push({ slot: p.slot, order: i + 1, fileId: it.fileId, alt: it.alt || "" }));
    return { images: db.images };
  },
  getFile: (db, p) => {
    if (String(p.fileId).startsWith("folder_")) {
      const rel = Buffer.from(p.fileId.slice(7), "base64url").toString();
      if (rel.includes("..")) throw new Error("not found");
      return { mimeType: MIME[extname(rel).toLowerCase()], data: readFileSync(join(MEDIA, rel)).toString("base64") };
    }
    const meta = db.files[p.fileId];
    if (!meta || meta.folder !== "images") throw new Error("not found");
    return { mimeType: meta.mimeType, data: readFileSync(join(FILES, p.fileId)).toString("base64") };
  },
  uploadIncoming: (db, p) => ({ fileId: storeFile(db, p.data, p.mimeType, "incoming") }),
  submitTalent: (db, p) => {
    const reference = ref("T");
    const claim = (ids = []) => ids.filter((i) => db.files[i]?.folder === "incoming").map((i) => ((db.files[i].folder = "talent"), i));
    const channels = (p.fields.channels || []).map((c) => ({ ...c, files: claim(c.files) }));
    db.talent.push({ at: new Date().toISOString(), reference, ...p.fields, channels });
    return { reference };
  },
  submitBooking: (db, p) => {
    const reference = ref("B");
    (db.bookings ||= []).push({ at: new Date().toISOString(), reference, ...p.fields });
    return { reference };
  },

  listEnquiries: (db) => ({
    enquiries: Object.fromEntries(
      Object.entries(ENQUIRY_COLUMNS).map(([kind, c]) => {
        // rows written by column name (the new creator application) add their columns at the end, as in Code.gs
        const recs = db[c.store] || [];
        const headers = [...c.headers];
        for (const r of recs) for (const [h] of [...(r.columns || []), ...(r.extra || [])]) if (!headers.includes(h)) headers.push(h);
        const rowOf = (r) => {
          // a row from the old forms (fields) or by column name; columns set later (the contract) on top
          const vals = r.columns ? Object.fromEntries(r.columns) : Object.fromEntries(c.headers.map((h, i) => [h, c.row(r)[i]]));
          Object.assign(vals, Object.fromEntries(r.extra || []));
          vals.Status = r.status || "New";
          return headers.map((h) => vals[h]);
        };
        return [kind, { headers, rows: [...recs].reverse().map((r) => rowOf(r).map((v) => (v == null ? "" : String(v)))) }];
      }),
    ),
    signed: { headers: SIGNED_HEADERS, rows: (db.signed || []).map((r) => SIGNED_HEADERS.map((h) => String(r[h] ?? ""))) },
  }),
  setEnquiryStatus: (db, p) => {
    const c = ENQUIRY_COLUMNS[p.kind];
    if (!c) throw new Error("Unknown enquiry type");
    if (!statusesFor(p.kind).includes(p.status)) throw new Error("Unknown status");
    const rec = (db[c.store] || []).find((r) => r.reference === p.reference);
    if (!rec) throw new Error("That enquiry is no longer in the Sheet");
    rec.status = p.status;
    // as Code.gs: a creator marked Signed joins Signed Talent once
    if (p.status === "Signed" && (p.kind === "talent" || p.kind === "techCreators") && !(db.signed ||= []).some((r) => r.Reference === p.reference)) {
      const m = String(Object.fromEntries(rec.columns || []).Representation || "").match(/^(Exclusive|Non-exclusive) \((\d+%) commission\)/);
      const now = new Date().toISOString();
      db.signed.push({ Reference: p.reference, Side: p.kind === "techCreators" ? "tech" : "talent", Contract: m?.[1] || "", Commission: m?.[2] || "",
        "Signed At": now, "Mode Email In Bio": "No", "Updated At": now, "Updated By": p.by || "" });
    }
    return { ok: true };
  },
  setLeadContract: (db, p) => {
    // as Code.gs: the contract's own columns on a creator lead, and optionally its status
    const c = ENQUIRY_COLUMNS[p.kind];
    if (!c || !(p.kind === "talent" || p.kind === "techCreators")) throw new Error("Only creator leads have contracts");
    if (p.status && !statusesFor(p.kind).includes(p.status)) throw new Error("Unknown status");
    const rec = (db[c.store] || []).find((r) => r.reference === p.reference);
    if (!rec) throw new Error("That enquiry is no longer in the Sheet");
    const allowed = ["Contract Type", "Contract Doc ID", "Contract Link", "Contract Sent At", "Contract State", "Contract Reminded At", "NSW Sheet Sent"];
    rec.extra ||= [];
    for (const [h, v] of (p.columns || []).filter(([h]) => allowed.includes(h))) {
      const i = rec.extra.findIndex(([k]) => k === h);
      if (i >= 0) rec.extra[i] = [h, v];
      else rec.extra.push([h, v]);
    }
    if (p.status) rec.status = p.status;
    return { ok: true };
  },
  updateSigned: (db, p) => {
    const row = (db.signed || []).find((r) => r.Reference === p.reference && r.Side === p.side);
    if (!row) throw new Error("That creator is not in Signed Talent");
    const cols = { contract: "Contract", commission: "Commission", signedAt: "Signed At", modeEmailInBio: "Mode Email In Bio", dedicatedEmail: "Dedicated Email" };
    for (const [k, h] of Object.entries(cols)) if (p.patch?.[k] !== undefined) row[h] = p.patch[k];
    Object.assign(row, { "Updated At": new Date().toISOString(), "Updated By": p.by || "" });
    return { ok: true };
  },
  deleteEnquiry: (db, p) => {
    const c = ENQUIRY_COLUMNS[p.kind];
    if (!c) throw new Error("Unknown enquiry type");
    const list = db[c.store] || [];
    const rec = list.find((r) => r.reference === p.reference);
    if (!rec) throw new Error("That enquiry is no longer in the Sheet");
    if (!["Declined", "Lost", "Cancelled"].includes(rec.status)) throw new Error("Only declined, lost or cancelled leads can be deleted");
    db[c.store] = list.filter((r) => r !== rec);
    return { ok: true };
  },
  getEnquiryFile: (db, p) => {
    const meta = db.files[p.fileId];
    // as Code.gs: Tech files only for side tech, Mode Society's only otherwise
    const want = p.side === "tech" ? "talent-tech" : "talent";
    if (!meta || meta.folder !== want) throw new Error("not found");
    return { mimeType: meta.mimeType, name: p.fileId, data: readFileSync(join(FILES, p.fileId)).toString("base64") };
  },
  submitTechBrand: (db, p) => {
    // as Code.gs: the row by column name; an uploaded brief moves into ModeSociety Tech's folder
    const reference = ref("TB");
    if (p.brief && db.files[p.brief]?.folder === "incoming") db.files[p.brief].folder = "talent-tech";
    const brief = p.brief && db.files[p.brief] ? `https://drive.google.com/file/d/${p.brief}/view` : p.briefLink || "";
    const columns = [["Submitted At", new Date().toISOString()], ["Status", "New"], ...(p.columns || []), ["Brief", brief], ["Reference", reference]];
    (db.techBrands ||= []).push({ at: new Date().toISOString(), reference, columns, autoReply: p.autoReply });
    return { reference };
  },
  submitCreator: (db, p) => {
    const tech = p.side === "tech";
    const reference = ref(tech ? "TC" : "T");
    const link = (id) => (id ? `https://drive.google.com/file/d/${id}/view` : "");
    const f = p.files || {};
    for (const id of [...(f.photos || []), f.thumb, f.mediaKit].filter(Boolean)) if (db.files[id]) db.files[id].folder = tech ? "talent-tech" : "talent";
    const columns = [["Submitted At", new Date().toISOString()], ["Status", "New"], ...(p.columns || []),
      ["Profile Photo", link((f.photos || [])[0])], ["Profile Photo (Round)", link(f.thumb)], ["Photos", (f.photos || []).map(link).join(String.fromCharCode(10))],
      ["Media Kit", link(f.mediaKit) || p.mediaKitLink || ""], ["Application Folder", "https://drive.google.com/drive/folders/mock-talent"], ["Reference", reference]];
    (db[tech ? "techCreators" : "talent"] ||= []).push({ at: new Date().toISOString(), reference, columns });
    return { reference };
  },
  submitServiceBooking: (db, p) => {
    const tech = p.side === "tech";
    const reference = ref(tech ? "TS" : "S");
    const b = p.booking || {};
    const columns = [["Submitted At", new Date().toISOString()], ["Status", "New"], ["Name", b.name], ["Email", b.email], ["Booking As", b.as],
      ["Service", b.service], ["Tier", b.tier], ["Price", b.price], ["Socials / Website", b.link], ["Goals", b.goals], ["Reference", reference]];
    (db[tech ? "techServiceBookings" : "serviceBookings"] ||= []).push({ at: new Date().toISOString(), reference, columns });
    return { reference };
  },
  submitTechCreator: (db, p) => {
    const reference = ref("TC");
    (db.techCreators ||= []).push({ at: new Date().toISOString(), reference, ...p.fields });
    return { reference };
  },
  listRoster: (db) => ({ items: [...(db.roster || [])].sort((a, b) => a.order - b.order) }),
  saveRosterMember: (db, p) => {
    const list = (db.roster ||= []);
    const item = { ...p.item };
    const i = item.id ? list.findIndex((m) => m.id === item.id) : -1;
    if (i >= 0) list[i] = { ...list[i], ...item };
    else list.push({ ...item, id: randomUUID().slice(0, 8), order: item.order || list.length + 1 });
    return { item: i >= 0 ? list[i] : list.at(-1) };
  },
  deleteRosterMember: (db, p) => {
    db.roster = (db.roster || []).filter((m) => m.id !== p.id);
    return { ok: true };
  },
  setRosterOrder: (db, p) => {
    (p.ids || []).forEach((id, i) => {
      const m = (db.roster || []).find((x) => x.id === id);
      if (m) m.order = i + 1;
    });
    return { ok: true };
  },
  setContent: (db, p) => {
    if (!/^[A-Za-z]+\.[A-Za-z]+$/.test(String(p.key))) throw new Error("Unknown section");
    (db.content ||= {})[p.key] = p.value || {};
    return { content: db.content };
  },
  resetContent: (db, p) => {
    delete (db.content ||= {})[p.key];
    return { content: db.content };
  },
  listPress: (db) => ({ items: [...(db.press || [])].sort((a, b) => a.order - b.order) }),
  savePressItem: (db, p) => {
    const list = (db.press ||= []);
    const item = { ...p.item };
    const i = item.id ? list.findIndex((a) => a.id === item.id) : -1;
    if (i >= 0) list[i] = { ...list[i], ...item };
    else {
      list.forEach((a) => (a.order = (a.order || 0) + 1));
      list.push({ ...item, id: randomUUID().slice(0, 8), order: 1 });
    }
    return { item: i >= 0 ? list[i] : list.at(-1) };
  },
  deletePressItem: (db, p) => {
    db.press = (db.press || []).filter((a) => a.id !== p.id);
    return { ok: true };
  },
  setPressOrder: (db, p) => {
    (p.ids || []).forEach((id, i) => {
      const a = (db.press || []).find((x) => x.id === id);
      if (a) a.order = i + 1;
    });
    return { ok: true };
  },
  track: (db, p) => {
    (db.visits ||= []).push({ ...p, date: day(new Date()) });
    return { ok: true };
  },
  getStats: (db, p) => stats(db, Number(p.days) || 30, p.side === "tech" || p.side === "talent" ? p.side : "all"),
};

const day = (d) => d.toISOString().slice(0, 10);

/** Same shape as getStats in google-apps-script/Code.gs. */
function stats(db, days, side = "all") {
  const now = Date.now();
  const from = day(new Date(now - (days - 1) * 864e5));
  const prevFrom = day(new Date(now - (2 * days - 1) * 864e5));
  const to = day(new Date(now));
  const isTech = (path) => /^\/tech(\/|$)/.test(String(path));
  const visits = (db.visits || []).filter((v) => side === "all" || (side === "tech") === isTech(v.path));
  const summarise = (rows) => {
    const sessions = new Map();
    for (const v of rows) if (!sessions.has(v.session)) sessions.set(v.session, v);
    const n = sessions.size;
    return {
      rows, sessions,
      totals: {
        pageviews: rows.length, sessions: n, visitors: new Set(rows.map((v) => v.visitor)).size,
        newVisitors: rows.filter((v) => v.newVisitor).length,
        organic: [...sessions.values()].filter((v) => v.source === "organic").length,
        pagesPerSession: n ? Math.round((rows.length / n) * 10) / 10 : 0,
      },
    };
  };
  const cur = summarise(visits.filter((v) => v.date >= from));
  const prev = summarise(visits.filter((v) => v.date >= prevFrom && v.date < from));
  const count = (list, key) => list.reduce((m, x) => ((m[key(x)] = (m[key(x)] || 0) + 1), m), {});
  const top = (m, n) => Object.entries(m).map(([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value).slice(0, n);
  const ss = [...cur.sessions.values()];
  const daily = Array.from({ length: days }, (_, i) => {
    const d = day(new Date(now - (days - 1 - i) * 864e5));
    const o = { date: d, organic: 0, social: 0, direct: 0, referral: 0, campaign: 0, pageviews: cur.rows.filter((v) => v.date === d).length };
    for (const s of ss) if (s.date === d && s.source in o) o[s.source]++;
    return o;
  });
  const forms = (k, a, b, excl) => (db[k] || []).filter((x) => x.at.slice(0, 10) >= a && (excl ? x.at.slice(0, 10) < b : x.at.slice(0, 10) <= b)).length;
  return {
    range: { from, to, days },
    totals: cur.totals,
    previous: prev.totals,
    daily,
    sources: count(ss, (s) => s.source),
    pages: top(count(cur.rows, (v) => v.path), 8),
    referrers: top(count(ss.filter((s) => s.referrer), (s) => s.referrer), 8),
    devices: count(ss, (s) => s.device || "desktop"),
    countries: top(count(ss.filter((s) => s.country), (s) => s.country), 8),
    side,
    forms: {
      talent: forms("talent", from, to), bookings: forms("bookings", from, to),
      techBrands: forms("techBrands", from, to), techCreators: forms("techCreators", from, to),
      previous: { talent: forms("talent", prevFrom, from, true), bookings: forms("bookings", prevFrom, from, true), techBrands: forms("techBrands", prevFrom, from, true), techCreators: forms("techCreators", prevFrom, from, true) },
    },
  };
}

createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const send = (o) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(o));
    };
    if (req.method !== "POST") return send({ ok: true, service: "mode-society-mock-backend" });
    try {
      const { secret, action, payload } = JSON.parse(body || "{}");
      if (secret !== SECRET) return send({ ok: false, error: "unauthorised" });
      const fn = actions[action];
      if (!fn) return send({ ok: false, error: `unknown action: ${action}` });
      const db = load();
      const data = fn(db, payload || {});
      save(db);
      console.log(`[mock] ${action}`);
      send({ ok: true, data });
    } catch (err) {
      send({ ok: false, error: String(err.message || err) });
    }
  });
}).listen(PORT, () => console.log(`Mock backend on http://localhost:${PORT} (secret: ${SECRET})`));
