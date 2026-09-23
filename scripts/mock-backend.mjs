/**
 * Local stand-in for the Google Apps Script backend, for developing without Google.
 * Implements the same actions as google-apps-script/Code.gs, keeping data in
 * ./.mock-backend (JSON + uploaded files).
 *
 *   node scripts/mock-backend.mjs          # listens on http://localhost:4545
 *   APPS_SCRIPT_URL=http://localhost:4545  APPS_SCRIPT_SECRET=mock-secret  (in .env.local)
 */
import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const PORT = Number(process.env.PORT || 4545);
const SECRET = process.env.APPS_SCRIPT_SECRET || "mock-secret";
const OWNER = (process.env.OWNER_EMAIL || "rubayathdrjb@gmail.com").toLowerCase();
const DIR = join(process.cwd(), ".mock-backend");
const FILES = join(DIR, "files");
const DB = join(DIR, "db.json");
mkdirSync(FILES, { recursive: true });

const empty = {
  settings: { heroMode: "pinboard", heroAutoCycle: "false", introStyle: "curtain", cursorStyle: "ring" },
  images: [],
  admins: [],
  talent: [],
  brands: [],
  files: {}, // id -> { mimeType, folder }
};
const load = () => (existsSync(DB) ? JSON.parse(readFileSync(DB, "utf8")) : structuredClone(empty));
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
  getSite: (db) => ({ settings: db.settings, images: db.images }),
  getInfo: () => ({
    spreadsheetUrl: "https://docs.google.com/spreadsheets/d/mock",
    folderUrl: "https://drive.google.com/drive/folders/mock",
    imagesFolderUrl: "https://drive.google.com/drive/folders/mock-images",
    talentFolderUrl: "https://drive.google.com/drive/folders/mock-talent",
  }),
  getAdmins: (db) => ({ owner: OWNER, admins: db.admins }),
  addAdmin: (db, p) => {
    const e = String(p.email).toLowerCase();
    if (!db.admins.includes(e) && e !== OWNER) db.admins.push(e);
    return { owner: OWNER, admins: db.admins };
  },
  removeAdmin: (db, p) => {
    if (p.email === OWNER) throw new Error("The owner account cannot be removed");
    db.admins = db.admins.filter((a) => a !== p.email);
    return { owner: OWNER, admins: db.admins };
  },
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
    const meta = db.files[p.fileId];
    if (!meta || meta.folder !== "images") throw new Error("not found");
    return { mimeType: meta.mimeType, data: readFileSync(join(FILES, p.fileId)).toString("base64") };
  },
  uploadIncoming: (db, p) => ({ fileId: storeFile(db, p.data, p.mimeType, "incoming") }),
  submitTalent: (db, p) => {
    const reference = ref("T");
    const claim = (ids = []) => ids.filter((i) => db.files[i]?.folder === "incoming").map((i) => ((db.files[i].folder = "talent"), i));
    db.talent.push({ at: new Date().toISOString(), reference, ...p.fields, work: claim(p.workFiles), analytics: claim(p.analyticsFiles) });
    return { reference };
  },
  submitBrand: (db, p) => {
    const reference = ref("B");
    db.brands.push({ at: new Date().toISOString(), reference, ...p.fields });
    return { reference };
  },
};

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
