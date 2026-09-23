# Mode Society — website

The website for [Mode Society](https://www.modesociety.com.au), an Australian boutique talent & creator agency.
It's an animated, playable site with a simple admin panel. All content and form submissions live in **Google Drive + Google Sheets**, so there's no database to run.

```
Visitor ──► Next.js site (Vercel) ──► Google Apps Script web app ──► Google Drive folder
                    ▲                  (runs as the Drive owner)       ├─ Mode Society — Website Data (Sheet)
Admin ─ Google sign-in ─┘                                              ├─ Website Images/<slot>/…
                                                                       ├─ Talent Applications/<date — name>/…
                                                                       └─ _Incoming Uploads (auto-cleaned)
```

---

## Feature walkthrough

### The public site

| Where | What it does |
| --- | --- |
| **Intro** | A black curtain lifts off the "MODE SOCIETY" wordmark (or a polaroid-style "develop" fade). It plays once per visit. |
| **Home: The Wall** | The hero is a moodboard of pinned polaroids with four interactive modes. Visitors can switch modes with the dock in the bottom-right corner, and ⟲ shuffles the wall. <br>• **Pinboard**: cards hang from their pins and swing in the cursor's "breeze". Drag to rearrange; double-click to unpin and drop a card; drag it back up to re-pin it. <br>• **Scatter**: cards float in layered depth, drift with parallax, and push away from the cursor. <br>• **Orbit**: a 3D carousel. Drag to spin; click a card to bring it forward. <br>• **Gravity**: cards tumble in and pile up (matter-js physics). Grab and throw them, or flick the cursor fast to gust them. |
| **Home: marquee** | "UGC 〰 INFLUENCERS 〰 MODELS…" ticker. It speeds up with scroll velocity and reverses when you scroll back up. |
| **Home: the agency** | The paragraph "inks in" word by word as you scroll. |
| **Home: services** | Five cards are dealt out of a stacked hand as you scroll. Hover (or tap) a card to flip it for details and an enquiry link. |
| **Home: The Casting Call** | A memory-match game with talent photos, a timer, a move counter and a personal best. Finishing it offers **"Book your cast"**, which opens the brand form with a *Casting Call champion* badge, and the score is saved on the enquiry. |
| **Home: niches & brands** | A giant niche marquee, plus a client-logo strip that only shows once logos are uploaded. |
| **For brands / For talent** | Two image panels that widen on hover. |
| **About** | Founder story with a parallax portrait. The industry frustrations get struck through in red as you scroll. A pinned horizontal polaroid gallery follows. |
| **Work with us** (`/work-with-us`) | The brand enquiry form as three **levels** with a progress bar. It uses the same questions as the original site. |
| **Apply** (`/apply-to-be-a-creator`) | The talent application as four levels. Photos "develop" like polaroids while they upload, and the success screen pins the applicant's own photo to the board. |
| **Everywhere** | Smooth scrolling, a custom cursor that labels things (*drag, flip, spin, throw, copy*), a paper-grain finish, magnetic-fill buttons, and click-to-copy email in the footer. Visitors with *reduced motion* switched on get a calm, static version. |

### The admin panel: `/admin`

Sign in with Google. Only approved accounts get in.

- **Images:** every image on the site is listed by page. You can upload, replace, reorder (← →), remove, edit the description (**Aa**, used for accessibility and SEO), or **revert to default**. Uploads are compressed in the browser, then saved into `Website Images/<slot>` in Drive. Changes show on the live site within seconds.
- **Animations:** choose which hero mode visitors see first, or tick *rotate* so each visit starts on the next mode. You can also pick the page intro (Curtain / Polaroid develop / None) and the cursor (Ring / Spotlight / System).
- **Access:** add or remove Google accounts. The **owner** (`OWNER_EMAIL`, `rubayathdrjb@gmail.com` by default) is permanent, so you can never lock yourself out.
- Shortcut buttons open the **Google Sheet**, the **website folder** and the **talent applications folder**.

### Where the data lives (Google Sheet: *Mode Society — Website Data*)

| Tab | Contents |
| --- | --- |
| **Talent Applications** | One row per application: contact details, niches, links, a link to the applicant's Drive folder, and links to each file. It has a **Status** dropdown (New / Reviewing / Contacted / Signed / Declined). |
| **Brand Enquiries** | One row per enquiry, with Status, services, budget and any Casting Call score. |
| **Images** | Which Drive file is shown in which slot, in order. The admin panel writes this tab. |
| **Settings** | Animation choices. |
| **Admins** | Emails allowed into the admin panel, besides the owner. |

Talent uploads are renamed on the way in, e.g. `Talent Applications/2026-09-23 — Jess Smith (T-260923-8F2A)/Jess Smith — Previous Work 01.jpg`.

---

## Setup

You'll need **four values**. The steps below say where to get each one.

| Env var | What it is | Where it comes from |
| --- | --- | --- |
| `APPS_SCRIPT_URL` | Backend URL, ending in `/exec` | Step 2 |
| `APPS_SCRIPT_SECRET` | Shared password between the site and the backend | You make it up (step 2) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Lets "Sign in with Google" work | Step 3 |
| `SESSION_SECRET` | Signs admin login cookies | You make it up (step 4) |

Optional: `OWNER_EMAIL` (defaults to `rubayathdrjb@gmail.com`) and `NEXT_PUBLIC_SITE_URL`. See `.env.example`.

### 1. Make the website folder in Google Drive

1. In the Google Drive you want to use, create a folder, e.g. **Mode Society Website**.
2. Open it and copy the **folder ID** from the URL: `https://drive.google.com/drive/folders/`**`1AbCdEf…`**

### 2. Deploy the backend (Google Apps Script)

Do this **signed in as the owner of that Drive**.

1. Go to <https://script.google.com> → **New project**. Name it *Mode Society Backend*.
2. Replace the contents of `Code.gs` with [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. Open **Project Settings** (⚙) → tick **Show "appsscript.json" manifest file**. Then replace that file's contents with [`google-apps-script/appsscript.json`](google-apps-script/appsscript.json).
4. Still in **Project Settings → Script properties**, add:
   - `ROOT_FOLDER_ID`: the folder ID from step 1
   - `SHARED_SECRET`: a long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. This same value becomes `APPS_SCRIPT_SECRET`.
   - `OWNER_EMAIL`: `rubayathdrjb@gmail.com`
5. Back in the editor, select the **`setup`** function and click **Run**. Approve the permissions prompt. On a personal Gmail you'll see "Google hasn't verified this app": click **Advanced → Go to Mode Society Backend**. This is your own script, so that's expected. `setup` creates the Sheet, the sub-folders and a nightly clean-up job. Running it again is safe.
6. **Deploy → New deployment →** type **Web app**. Set *Execute as* to **Me** and *Who has access* to **Anyone**. Click **Deploy** and copy the **Web app URL**. That's `APPS_SCRIPT_URL`.

> "Anyone" is safe here. Every request must carry `SHARED_SECRET`, which only the website knows, so the web app refuses anything else.
> When you change `Code.gs` later, use **Deploy → Manage deployments → ✎ → Version: New version**. That keeps the same URL.

### 3. Create the Google sign-in Client ID

1. Go to <https://console.cloud.google.com/> and create a project (e.g. *Mode Society Website*).
2. Open **APIs & Services → OAuth consent screen**. Choose **External** and fill in the app name and support email. No extra scopes are needed. Then click **Publish app**. The app only asks for basic email/profile, so Google doesn't require a review.
3. Open **APIs & Services → Credentials → Create credentials → OAuth client ID**. Choose **Web application**.
4. Under **Authorised JavaScript origins**, add every address the admin panel will be opened from:
   - `http://localhost:3000`
   - your Vercel URL, e.g. `https://mode-society.vercel.app`
   - the real domain, e.g. `https://www.modesociety.com.au`

   Redirect URIs aren't needed.
5. Copy the **Client ID** (`…apps.googleusercontent.com`). That's `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

### 4. Session secret

Generate `SESSION_SECRET` with `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`.

### 5. Run locally

```bash
npm install
cp .env.example .env.local   # fill in the four values
npm run dev                  # http://localhost:3000 and http://localhost:3000/admin
```

**No Google yet?** You can run everything against a local fake backend:

```bash
npm run mock-backend         # terminal 1 (stores data in ./.mock-backend)
# .env.local:
#   APPS_SCRIPT_URL=http://localhost:4545
#   APPS_SCRIPT_SECRET=mock-secret
#   SESSION_SECRET=<anything 32+ chars>
#   ADMIN_DEV_BYPASS=true    # adds a "Dev sign-in" button on /admin (dev server only)
npm run dev                  # terminal 2
```

With no backend configured at all, the site still runs on its built-in placeholder images.

### 6. Deploy (Vercel)

1. Push this repo to GitHub, then **Import** it at <https://vercel.com/new>.
2. Add the environment variables from the table above (leave `ADMIN_DEV_BYPASS` out), then deploy.
3. Add the deployed URL to the OAuth client's **Authorised JavaScript origins** (step 3.4).
4. When you're ready, point the `modesociety.com.au` domain at Vercel (**Project → Settings → Domains**).

> Vercel's free Hobby plan is for non-commercial use. For the agency's live site, use Vercel Pro, or deploy the same repo to Netlify.

---

## Moving from your Drive to Mode Society's Drive

Nothing in the code changes. You redo steps 1–2 in their account and swap two env vars.

1. In **their** Google account, create the website folder (step 1).
2. In **their** account, create the Apps Script project, set its script properties, run `setup`, and deploy (step 2). Use a **new** `SHARED_SECRET`.
3. In Vercel, update `APPS_SCRIPT_URL` and `APPS_SCRIPT_SECRET`, then **Redeploy**.
4. Sign in to `/admin`, re-add any admins under **Access**, and re-upload the site images. Drive file IDs change when files are copied between accounts, so re-uploading through the panel is the clean way to move them. Old applications can stay in your Drive or be copied across as files.

Your Google sign-in Client ID keeps working. It only controls *who* can sign in, and that list lives in their new Sheet.

---

## Project map

```
google-apps-script/     Backend: paste into script.google.com
scripts/mock-backend.mjs  Local stand-in for the backend
src/lib/slots.ts        Every image slot + animation option. Add a slot here and it appears in the admin panel.
src/lib/backend.ts      Calls Apps Script; caches site content (refreshed instantly on admin save)
src/lib/auth.ts         Google ID-token verification, allowlist, session cookie
src/components/home/wall/engines.ts   The four hero modes
src/app/(site)/…        Public pages
src/app/admin/          Admin panel
src/app/media/[id]      Serves Drive images through the site (nothing in Drive is made public)
```

## Notes & limits

- Uploaded images are resized in the browser (max 2400 px) to keep uploads fast and under the host's 4.5 MB request limit. Transparent PNGs, such as logos, stay transparent.
- Site content is cached for 10 minutes and refreshed immediately whenever an admin saves.
- Placeholder images come from the original moodboard and are low resolution. Replace them with full-size photos in **/admin → Images**.
- Forms have a hidden honeypot field and basic rate limiting against spam.
