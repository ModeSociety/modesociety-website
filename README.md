# Mode Society — website

The website for [Mode Society](https://www.modesociety.com.au), an Australian boutique talent & creator agency.
It's an animated, playable site with a simple admin panel. All content and form submissions live in **Google Drive + Google Sheets**, so there's no database to run.

```
Visitor ──► Next.js site (Vercel) ──► Google Apps Script web app ──► Google Drive folder
                    ▲                  (runs as the Drive owner)       ├─ Mode Society — Website Data (Sheet)
Admin ─ Google sign-in ─┘                                              ├─ Home Page 1 / 2 / 3, About Us 1, Instagram, Services, Our Work, Featured In/…
                                                                       ├─ Website Images/<slot>/…   (admin uploads)
                                                                       ├─ Talent Applications/<date — name>/…
                                                                       └─ _Incoming Uploads (auto-cleaned)
```

---

## Feature walkthrough

Style: editorial, like a fashion magazine. A white `#FFFFFF` page with burgundy `#7F090D` type; some sections are solid burgundy ("What we bring to the table", "What you can expect from us", the footer, which rises out of a band of halftone dots). Headlines are tall condensed capitals (**Anton**) with an italic serif accent (**Instrument Serif**), small labels and buttons are monospace (**IBM Plex Mono**), and body text is **Inter Tight**. Sections open with a numbered rule, e.g. *(01) The agency ——— Boutique · female-led · Melbourne*. A red `#AA1F1F` marker circles *fit* in the hero, underlines a phrase or two in body text and strikes through the creators' frustrations on For talent, and photos carry a light film grain. The look comes from the client's Pinterest moodboard (*Mode Society → Website*).

### The public site

| Where | What it does |
| --- | --- |
| **Header** | The logo on the left; text links (About us · For brands · For talent · Services · Our work · Featured in · Partner with us · For Tech companies) and a **Contact us** button on the right. Smaller screens get a menu button that opens a full-screen burgundy index of every page. |
| **Home: hero** | A magazine-cover masthead: *MODE SOCIETY* set edge to edge across the top (stacked on phones, with the tagline and buttons straight underneath and the photos landing below them) with small cover lines above it. Over it is the interactive wall, defaulting to **Gravity**: polaroids tumble in from above and pile up, then visitors can grab and throw them. The drop waits until the intro curtain has lifted and the first photos have loaded, so it's always seen (on phones it used to finish behind the curtain). Pinboard, Scatter and Orbit can be chosen in the admin panel instead; in Pinboard, double-click a card to unpin it and carry it back up the board to pin it again. Visitors can't switch modes. |
| **Home: the agency** | A 3D orbit of creator videos (from the Drive folder *Home Page 2*) beside the "external PR team" intro and a **Get to know us** button. |
| **Home: services** | Four white cards on burgundy (Influencer campaigns, UGC content, Event guest lists, Funding), each with its name at the top and a small number at the foot, dealt out as you scroll. Hover (or tap) a card to flip it and read more. Funding links to Grant Help. |
| **Home: selected work** | Four pieces from the *Our work* gallery under "Selected work.", linking to the Our work page. |
| **Brands** | "Brands", with "our creators have worked with" underneath, then a two-row slideshow of logos sliding in opposite directions. Add as many logos as you like in the admin panel (or the Drive folder *Home Page 3*). |
| **Featured in (home)** | Publication logos under "As seen in.". Hidden until there's at least one press logo or article. |
| **Let's work together** | For brands / For talent as big type rows (the default **Type reveal** style); Split, Tilt and Blinds are alternatives in the admin panel. |
| **Results infographic** | An animated sales line, bar comparisons and spend rings comparing returns with Mode Society against an in-house marketer, plus a table view. *The figures are illustrative until real ones are added in `src/lib/content.ts`.* |
| **Footer** | Solid burgundy, with a band of halftone dots above it that grows out of the page into the footer. It has "We'll bring it to life.", an enquiry button (no public email), Instagram, TikTok and LinkedIn icons, **Mode Society Pty Ltd**, and the logo in white animating letter by letter (Magnetic / Swing / Static). |
| **About us** (`/about`) | The quote; *Our story* and *What we are* drop-downs; the team photo (Drive folder *About Us 1*); "Creators your customers actually trust." with the services as drop-downs beside the video orbit; then the infographic and the swipe cards. |
| **For brands** (`/work-with-us`) | "Let's work together." with the PR-team intro and an Instagram grid (Drive folder *Instagram*). Then the four services, the quote, *What you can expect from us* swipe cards, the infographic and the brand logos. The **Book a call** form sits at the bottom. |
| **For talent** (`/apply-to-be-a-creator`) | "Thinking of signing?", the struck-through frustrations (now quicker), what to expect from signing to getting paid, what we do for you, flexible representation and the brand logos. The **Apply now** form sits at the bottom. |
| **Services** (`/services`) | A rotating pinwheel of photos and videos stays on the left (admin slot *Services — pinwheel* / Drive folder *Services*). On the right, one service at a time plays its "How it works" animation: each step appears and takes the highlight, then the button. The arrow on the right (or a swipe, the arrow keys or the service names underneath) moves between Influencer campaigns, UGC content, Event guest lists and Funding. No prices. |
| **Our work** (`/our-work`) | "Work/ archive": a contents-style index of the brands our creators have worked with (from the brand logos) beside a gallery of campaign photos and videos, each captioned *001 — …* from its file name. Admin slot *Our work — gallery* / Drive folder *Our Work*. Ends with "Want to be next?". |
| **Featured in** (`/featured-in`) | "Featured in." over a blurred red *Press*, then the publication logos (admin slot *Featured in — press logos* / Drive folder *Featured In*) and the articles listed in `PRESS` in `src/lib/content.ts` (outlet, headline, date, link). **Nothing is listed yet:** until it is, the page says the press page is on its way and shows the brands our creators have worked with. |
| **Contact us** (`/get-in-touch`) | Three cards: For talent, For brands and Partner with us. Picking one opens its form. `/contact` redirects here. |
| **Partner with us** (`/partner-with-us`) | Just the partnership form under a bold *Partner with us* heading. "For Tech companies" opens the same page. |
| **Forms** | **Talent**: what you do; each channel with its follower count and engagement screenshots; niche; what you want from an agency; whether you're signed elsewhere; 18+ consent. **Book a call**: brand, website/Instagram, services, project, budget, timeline. **Partnerships**: business, type, partnership type, idea. All three end with "Thanks! We'll be in touch." |
| **Everywhere** | Smooth scrolling and the normal system cursor. Visitors with *reduced motion* switched on get a calm, static version. |

### The admin panel: `/admin`

Sign in with Google. Only approved accounts get in.

- **Schedule:** the team calendar for calls, meetings, shoots, events and deadlines, stored in the *Schedule* tab of the Google Sheet. It has a month view with appointments colour-coded by type, and a *Coming up* list for the next 30 days (or a chosen day). Add an appointment with **+ New appointment**, or double-click a day. Each one can hold a time (or all day), client/brand, talent, location or meeting link, notes, status (Scheduled / Done / Cancelled) and who it's assigned to. **All / Mine** filters to your own, and **Add to Google Calendar** copies an appointment into anyone's calendar.
- **Insights:** site traffic for the last 7, 30 or 90 days, each compared with the period before:
  - **Organic search visits** (visits from Google, Bing and other search engines without ads), visitors, visits, page views and enquiries as a share of visits.
  - A daily chart of visits by source (organic search, social, direct, referral, campaign/ads), with a hover breakdown and a table view.
  - Top pages, top referring sites, devices and countries.
  - **Business:** talent applications, brand call bookings, partnership enquiries and appointments.

- **Images:** every image slot is listed with the Drive folder it reads from. Files dropped into that folder appear automatically (marked *from Drive*), and anything uploaded in the panel takes priority. You can upload, reorder, describe (**Aa**) or clear images. Brand logos have their white backgrounds removed on upload. Videos go straight into the Drive folders, because they're too large to upload through the site.
- **Animations:** the hero mode (or *rotate*), the Let's work together style, the footer logo and the page intro.
- **Access:** add or remove Google accounts. The site owner and the Drive owner are permanent.

### Drive folders (inside the website folder; `setup` creates them)

| Folder | Used for |
| --- | --- |
| **Home Page 1** | The logo (the first `.svg` in the folder) and the hero polaroids (photos). |
| **Home Page 2** | Videos (MP4) and photos for the orbit on Home and About. |
| **Home Page 3** | Brand logos for "Brands our creators have worked with". PNGs with transparent backgrounds look best. |
| **About Us 1** | The team photo. |
| **Instagram** | Posts for the For brands hero grid. |
| **Services** | Photos and videos for the pinwheel on the Services page. |
| **Our Work** | Campaign photos and videos for the Our work page. The file name becomes the caption, e.g. `03-Teddi Lab — UGC.jpg` shows as *003 — Teddi Lab — UGC* (the `03-` only sets the order). |
| **Featured In** | Logos of publications Mode Society has been featured in. |

Files show in name order, so prefix them `01-`, `02-` and so on to control the order. Media in these folders is set to "anyone with the link can view" so the site can display it.

### Where the data lives (Google Sheet: *Mode Society — Website Data*)

| Tab | Contents |
| --- | --- |
| **Talent** | One row per application: each channel's handle and follower count, links to the screenshots, and a **Status** dropdown. |
| **Book a Call** | Brand bookings: services, project, budget and timeline. |
| **Partnerships** | B2B partnership enquiries. |
| **Schedule** | The team calendar (admin panel → Schedule). It can be edited in the Sheet too: keep the *ID* column. |
| **Visits** | One row per page view (time, page, source, referring site, campaign, anonymous session/visitor ids, device, country). Rows older than ~13 months are removed automatically. |
| **Images**, **Settings**, **Admins** | Written by the admin panel. |

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

### 1. The website folder in Google Drive (optional)

`setup` (step 2) creates a **Mode Society Website** folder in the account's My Drive by itself. Only if you want to use an existing folder instead: open it and copy the **folder ID** from the URL (`https://drive.google.com/drive/folders/`**`1AbCdEf…`**) for `ROOT_FOLDER_ID` below.

### 2. Deploy the backend (Google Apps Script)

> **Updating an existing backend?** Paste the new `Code.gs`, run `setup` again (it adds any missing tabs and folders, such as *Schedule*, *Visits*, *Our Work* and *Featured In*, without touching existing data), then use **Deploy → Manage deployments → ✎ → Version: New version** so the URL stays the same.

Do this **signed in as the owner of that Drive**.

1. Go to <https://script.google.com> → **New project**. Name it *Mode Society Backend*.
2. Replace the contents of `Code.gs` with [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. Open **Project Settings** (⚙) → tick **Show "appsscript.json" manifest file**. Then replace that file's contents with [`google-apps-script/appsscript.json`](google-apps-script/appsscript.json).
4. Still in **Project Settings → Script properties**, add:
   - `SHARED_SECRET`: a long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. This same value becomes `APPS_SCRIPT_SECRET`.
   - `OWNER_EMAIL`: the address of the account that owns the Drive (a permanent admin, alongside Vercel's `OWNER_EMAIL`)
   - `ROOT_FOLDER_ID` (optional): an existing folder's ID from step 1. Leave it out and `setup` makes the folder.
5. Back in the editor, select the **`setup`** function and click **Run**. Approve the permissions prompt. On a personal Gmail you'll see "Google hasn't verified this app": click **Advanced → Go to Mode Society Backend**. This is your own script, so that's expected. `setup` creates the folder (if needed), the Sheet, the sub-folders and a nightly clean-up job, and logs their links. Running it again is safe.
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

## Moving the backend to Mode Society's Google account

Nothing in the code changes. Do all of this **signed in as the Mode Society Google account**.

1. **Backend:** follow *2. Deploy the backend* with a **new** `SHARED_SECRET`, and set the script property `OWNER_EMAIL` to the Mode Society account's own address. After deploying, open the Web app URL in a browser: it should show `{"ok":true,"service":"mode-society-backend"}`.
2. **Sign-in:** the old Client ID was disabled, so follow *3. Create the Google sign-in Client ID* in this account. Add `https://modeweb-eight.vercel.app` (and the real domain, if it's live) to *Authorised JavaScript origins*.
3. **Vercel** (Project → Settings → Environment Variables, Production): set `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to the new values (`SESSION_SECRET` and `OWNER_EMAIL` can stay), then **Deployments → ⋯ → Redeploy**. `NEXT_PUBLIC_…` values are built into the site, so the redeploy is required.
4. **Check:** sign in at `/admin` with either owner address (Vercel's `OWNER_EMAIL` and the script's `OWNER_EMAIL` are both permanent admins), re-add the team under **Access**, then send one test enquiry and confirm it lands in the Sheet.
5. **Content:** the new Drive folders start empty, so the site shows its built-in images until media is added. Drop files into the folders (see *Drive folders*) or upload in the admin panel. Nothing carries over from the old account's Drive.

## Visit tracking & privacy

The site counts visits itself; there's no Google Analytics, cookie banner or third-party tracker. Each page view sends the page, where the visit came from (the referring site's domain and any `utm_` campaign tags) and two random ids kept in the visitor's own browser: one per browser, to count unique visitors, and one per tab session, to count visits. No names, emails, IP addresses or cookies are stored. The country comes from Vercel's edge network. The tracker ignores bots and browsers with *Do Not Track* switched on, and skips anyone signed in to the admin panel, so the team's own browsing isn't counted. Counting starts from the day this version goes live.

## Troubleshooting

**Forms and uploads fail with "You can't access this item because it is in violation of our Terms of Service".**
Google has blocked the Apps Script web app itself. This happens most often to brand-new Google accounts that publish a web app open to "Anyone". The site can't work around it.
1. Sign in to the account that owns the script, open <https://script.google.com> and look for a warning on the project. Google usually emails the account too; follow its **request a review** link.
2. While the review is pending, or if it's refused, set the backend up again under an established Google account (ideally Mode Society's Google Workspace) by following *Backend setup*. Then update `APPS_SCRIPT_URL` and `APPS_SCRIPT_SECRET` in Vercel.

**Admin sign-in shows "Access blocked: The OAuth client was disabled" (`disabled_client`).**
Google has disabled the sign-in Client ID, usually as part of the same account review. Open <https://console.cloud.google.com/apis/credentials> as the owning account; the project or client will show the reason. Appeal there, or create a new project and OAuth Client ID under an established account. Then update `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in Vercel and redeploy.

**`origin_mismatch`.** Add the exact site address (e.g. `https://modeweb-eight.vercel.app`) to the OAuth client's *Authorised JavaScript origins*.

## Project map

```
google-apps-script/     Backend: paste into script.google.com
scripts/mock-backend.mjs  Local stand-in for the backend
src/lib/content.ts      All the wording (services, about, talent, form intros, infographic figures)
src/lib/slots.ts        Every image slot (and its Drive folder) and animation option. Add a slot here and it appears in the admin panel.
src/lib/backend.ts      Calls Apps Script; caches site content (refreshed instantly on admin save)
src/lib/auth.ts         Google ID-token verification, allowlist, session cookie
src/components/home/wall/engines.ts   The four hero modes
src/components/services/              The Services page showcase (pinwheel + animated steps)
src/components/work/, press/          Our work gallery/teaser and Featured in (press logos + articles)
src/components/site/Editorial.tsx     Editorial pieces: section rules, red marker strokes, fit-to-width type
src/components/admin/                 Admin panel (Schedule, Insights, Images, Animations, Access)
src/components/site/Tracker.tsx       Anonymous page-view tracking (→ /api/track → Visits tab)
src/app/(site)/…        Public pages
src/app/admin/          Admin panel
src/app/media/[id]      Serves Drive images through the site (nothing in Drive is made public)
```

## Notes & limits

- Uploaded images are resized in the browser (max 2400 px) to keep uploads fast and under the host's 4.5 MB request limit. Transparent PNGs, such as logos, stay transparent.
- Site content is cached for 10 minutes and refreshed immediately whenever an admin saves.
- Built-in images come from *MS Edits/Website Assets* (optimised into `public/assets`), and the logo is vectorised from `Logo.PNG` (`public/brand/logo.svg`). Anything put in the Drive folders replaces them. Videos over ~7 MB weren't bundled; add them to Drive *Home Page 2* instead.
- Still to supply (marked `TODO` in `src/lib/content.ts` and `src/lib/forms.ts`): the LinkedIn URL (the icon stays hidden until it's set), real infographic figures, the final budget and timeline options, the full AI "Where we draw the line" text, and the talent-agreement wording for *Flexible representation*. "For Tech companies" currently opens the partnership form.
- Forms have a hidden honeypot field and basic rate limiting against spam.
