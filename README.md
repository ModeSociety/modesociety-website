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
| **Header** | The logo on the left; text links (About us · For brands · For talent · Services · Our work · Featured in · Partner with us), the **Talent | Tech** switch and a **Contact us** button on the right. Smaller screens get a menu button that opens a full-screen burgundy index of every page. |
| **Home: hero** | A magazine-cover masthead: *MODE SOCIETY* set edge to edge across the top (stacked on phones, with the tagline and buttons straight underneath and the photos landing below them) with small cover lines above it. Over it is the interactive wall, defaulting to **Gravity**: polaroids tumble in from above and pile up, then visitors can grab and throw them. The drop waits until the intro curtain has lifted and the first photos have loaded, so it's always seen (on phones it used to finish behind the curtain). Pinboard, Scatter and Orbit can be chosen in the admin panel instead; in Pinboard, double-click a card to unpin it and carry it back up the board to pin it again. Visitors can't switch modes. |
| **Home: the agency** | A 3D orbit of creator videos (from the Drive folder *Home Page 2*) beside the "external PR team" intro and a **Get to know us** button. |
| **Home: services** | Four white cards on burgundy (Influencer campaigns, UGC content, Event guest lists, Funding), each with its name at the top and a small number at the foot, dealt out as you scroll. Hover (or tap) a card to flip it and read more. Funding links to Grant Help. |
| **Home: selected work** | Four pieces from the *Our work* gallery under "Selected work.", linking to the Our work page. |
| **Brands** | "Brands", with "our creators have worked with" underneath, then a two-row slideshow of logos sliding in opposite directions. Add as many logos as you like in the admin panel (or the Drive folder *Home Page 3*). |
| **Featured in (home)** | "As seen in.": the publication logos and the three latest features (cover photo, publication, headline, a short teaser and **Read more**). Hidden until there's at least one press logo or feature. |
| **Let's work together** | For brands / For talent as big type rows (the default **Type reveal** style); Split, Tilt and Blinds are alternatives in the admin panel. |
| **Results infographic** | An animated sales line, bar comparisons and spend rings comparing returns with Mode Society against an in-house marketer, plus a table view. *The figures are illustrative until real ones are added in `src/lib/content.ts`.* |
| **Footer** | Solid burgundy, with a band of halftone dots above it that grows out of the page into the footer. It has "We'll bring it to life.", an enquiry button (no public email), Instagram, TikTok and LinkedIn icons, **Mode Society Pty Ltd**, and the logo in white animating letter by letter (Magnetic / Swing / Static). |
| **About us** (`/about`) | The quote; *Our story* and *What we are* drop-downs; the team photo (Drive folder *About Us 1*); "Creators your customers actually trust." with the services as drop-downs beside the video orbit; then the infographic and the swipe cards. |
| **For brands** (`/work-with-us`) | "Let's work together." with the PR-team intro and an Instagram grid (Drive folder *Instagram*). Then the four services, the quote, *What you can expect from us* swipe cards, the infographic and the brand logos. The **Book a call** form sits at the bottom. |
| **For talent** (`/apply-to-be-a-creator`) | "Thinking of signing?", the struck-through frustrations (now quicker), what to expect from signing to getting paid, what we do for you, flexible representation and the brand logos. The **Apply now** form sits at the bottom. |
| **Services** (`/services`) | A rotating pinwheel of photos and videos stays on the left (admin slot *Services — pinwheel* / Drive folder *Services*). On the right, one service at a time plays its "How it works" animation: each step appears and takes the highlight, then the button. The arrow on the right (or a swipe, the arrow keys or the service names underneath) moves between Influencer campaigns, UGC content, Event guest lists and Funding. No prices. |
| **Our work** (`/our-work`) | "Work/ archive": a contents-style index of the brands our creators have worked with (from the brand logos) beside a gallery of campaign photos and videos, each captioned *001 — …* from its file name. Admin slot *Our work — gallery* / Drive folder *Our Work*. Ends with "Want to be next?". |
| **Featured in** (`/featured-in`) | "Featured in." over a blurred red *Press*, then the publication logos (admin slot *Featured in — press logos* / Drive folder *Featured In*) and every feature, the newest one large. Each feature opens its own page (`/featured-in/<name>`) with the headline, cover photo, the full article, more photos, a link to the original and *More features*. Features are written in the admin panel's **Featured in** tab. Until there's one, the page says the press page is on its way and shows the brands our creators have worked with. |
| **Contact us** (`/get-in-touch`) | Three cards: For talent, For brands and Partner with us. Picking one opens its form. `/contact` redirects here. |
| **Partner with us** (`/partner-with-us`) | Just the partnership form under a bold *Partner with us* heading. "For Tech companies" opens the same page. |
| **Forms** | **Talent**: what you do; each channel with its follower count and engagement screenshots; niche; what you want from an agency; whether you're signed elsewhere; 18+ consent. **Book a call**: brand, website/Instagram, services, project, budget, timeline. **Partnerships**: business, type, partnership type, idea. All three end with "Thanks! We'll be in touch." |
| **Everywhere** | Smooth scrolling and the normal system cursor. Visitors with *reduced motion* switched on get a calm, static version. |

### ModeSociety Tech: `/tech`

The gaming & tech side of Mode Society, for a different team and audience: streamers, content creators and esports athletes, and the gaming, tech and telco brands that work with them. The wording comes from *Website copy.pdf*; the look is **white with blue gradients** (after Asha's *Mode society Tech* Pinterest board): a cool white ground, navy type, soft blue-to-lilac light behind sections, white glass panels, and Asha's pill **m** in glossy blue. Type is **Anybody** (condensed and wide caps), **Instrument Sans** and **Martian Mono**.

A **Talent | Tech** switch in the nav, phone menu and footer of both sides moves between them.

| Page | What it does |
| --- | --- |
| **Home** (`/tech`) | "Not just gaming." with the two front doors (*Run a campaign* / *Get signed*) beside a 3D glass m that stands on a pale-blue horizon and tilts toward the cursor (or the phone's tilt). Then *Who are we?* (words light up as it scrolls in), who we run campaigns for, the brand logos (or *This space is open* until there are any), the featured roster, the formats bento (each with a small animation), the 18+ policy band and the FAQ. Every Tech page ends with *Two ways in.* (except Contact). |
| **For brands** (`/tech/brands`) | *Why brands call us*: key numbers (combined followers from the roster, plus total views and campaigns delivered set in the admin panel; each shows only once it's real), the intro video (Drive folder *Tech Video*), *Our process* (four steps along a beam that fills), formats, categories and brand FAQs. |
| **For creators** (`/tech/creators`) | What we do for you, creator quotes and examples from the roster, the 18+ policy, a *Get on the roster* call and creator FAQs. |
| **Our talent** (`/tech/talent`) | The whole roster, with a type filter, search and sort. Each card shows the photo, @, type, niche and region, total followers and every channel (linked). Cards tilt toward the cursor. |
| **Contact** (`/tech/contact`) | *I'm a brand* / *I'm a creator*, each opening its form (`?as=brand` or `?as=creator` preselects). Creators must confirm they're 18+. |

**Placeholders:** until the first creator is added in the admin panel, the roster shows four clearly marked **Sample** cards. Before launch, Asha should confirm the 18+ policy wording (`TECH_POLICY` in `src/lib/tech.ts`) and supply Tech's own social handles, if it has any (`TECH_SOCIALS`; until then the Mode Society ones are used).

### The admin panel: `/admin`

Sign in with Google. Only approved accounts get in.

The panel is shared, so everyone can see everything, but **All · Talent · Tech** at the top narrows it to one side, and each browser remembers its choice. On *Tech*, Enquiries shows only Tech brands and Tech creators, Schedule only Tech appointments, Insights only `/tech` traffic and Tech enquiries, and Images only the Tech slots. The Roster tab is Tech-only; Animations is talent-only.

- **Schedule:** the team calendar for calls, meetings, shoots, events and deadlines, stored in the *Schedule* tab of the Google Sheet. It has a month view with appointments colour-coded by type, and a *Coming up* list for the next 30 days (or a chosen day). Add an appointment with **+ New appointment**, or double-click a day. Each one can hold a time (or all day), client/brand, talent, location or meeting link, notes, status (Scheduled / Done / Cancelled), who it's assigned to, and which side it belongs to (Mode Society or ModeSociety Tech). **All / Mine** filters to your own, and **Add to Google Calendar** copies an appointment into anyone's calendar.
- **Pages & text:** the wording of every section on the site, page by page (*Shared sections* holds the ones that appear on several pages: the services cards, the pull quote, the footer, the form introductions…). Open a section, change it and **Save**; it's live within a few seconds. In headings, each line is a line of the heading and words in `*stars*` get the accent style (the italic serif). Lists (FAQs, cards, steps, services) can be added to, reordered and deleted; most sections can be switched off with *Show this section on the site*; **Reset to original** brings back the first wording. Saved in the *Content* tab of the Sheet; everything not edited keeps the wording in `src/lib/copy.ts`.
- **Featured in (Talent):** add, edit, reorder or hide press features. Each has the publication, headline, date, a short teaser (for the home page and the list), the full article, a link to the original and photos (the first is the cover). The article is plain text: a blank line starts a new paragraph, `## ` a subheading, `> ` a pull quote, `- ` a bullet, plus `**bold**`, `*italic*` and `[link](https://…)`; **Preview** shows it as it will look. The top three show on the home page. Stored in the *Featured In* tab of the Sheet; photos go into *Website Images/press.photos* in Drive.
- **Roster (Tech):** add, edit, reorder, feature or hide the creators on ModeSociety Tech, with a photo, @, type, niche, region, each channel's link and follower count (e.g. `84K`) and an optional quote. Below the list are the *For brands* key numbers (combined total views, campaigns delivered). Stored in the *Tech Roster* tab, which can be edited in the Sheet too.
- **Enquiries:** every talent application, brand call booking, partnership enquiry and Tech brand/creator enquiry, read straight from the Google Sheet, newest first, with search, a status filter and a *new* count for each type. Open one to read every answer, see a talent's engagement screenshots (shown only to signed-in admins; the files stay private in Drive), email them, or change its status (New / Reviewing / Contacted / Signed / Booked / Declined), which is saved back to the Sheet.
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
| **Tech Brands** | ModeSociety Tech: logos of brands Tech creators have worked with. |
| **Tech Video** | ModeSociety Tech: the brand intro video (MP4) on *For brands*. |

Files show in name order, so prefix them `01-`, `02-` and so on to control the order. Media in these folders is set to "anyone with the link can view" so the site can display it.

### Where the data lives (Google Sheet: *Mode Society — Website Data*)

| Tab | Contents |
| --- | --- |
| **Talent** | One row per application: each channel's handle and follower count, links to the screenshots, and a **Status** dropdown. |
| **Book a Call** | Brand bookings: services, project, budget and timeline. |
| **Partnerships** | B2B partnership enquiries. |
| **Schedule** | The team calendar (admin panel → Schedule). It can be edited in the Sheet too: keep the *ID* column. |
| **Visits** | One row per page view (time, page, source, referring site, campaign, anonymous session/visitor ids, device, country). Rows older than ~13 months are removed automatically. |
| **Tech Brand Enquiries** | ModeSociety Tech brand enquiries: category, formats, the campaign, budget and timeline, with a **Status** dropdown. Blue header and tab. |
| **Tech Creator Applications** | ModeSociety Tech creator applications: handle, what they're applying as, channels with follower counts, niche, region and the 18+ confirmation. |
| **Content** | The wording edited in the admin panel (Pages & text): one row per edited section, its text as JSON. Delete a row to put that section back to the original wording. |
| **Featured In** | The press features (admin panel → Featured in): publication, headline, date, teaser, article, link, photo file IDs and whether it's shown. Keep the *ID* column. |
| **Tech Roster** | The ModeSociety Tech roster (admin panel → Roster). One row per creator, with a link and follower column pair per platform. Keep the *ID* column. |
| **Images**, **Settings**, **Admins** | Written by the admin panel. |

Every new form submission is also **emailed to `pr@modesociety.com.au`** (from the account that runs the backend), with the answers laid out and *Reply-To* set to the sender, so replying answers them directly. Change the address with the `NOTIFY_EMAIL` script property. The Sheet row is written first, so a mail failure never loses an enquiry.

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

> **Updating an existing backend?** Paste the new `Code.gs` (and `appsscript.json` if it changed: it lists the permissions, e.g. sending the enquiry emails), run `setup` again and approve any new permission (it adds any missing tabs, folders and columns, such as the *Tech* tabs, the *Tech Brands* and *Tech Video* folders and the Schedule's *Side* column, without touching existing data), then use **Deploy → Manage deployments → ✎ → Version: New version** so the URL stays the same.

Do this **signed in as the owner of that Drive**.

1. Go to <https://script.google.com> → **New project**. Name it *Mode Society Backend*.
2. Replace the contents of `Code.gs` with [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. Open **Project Settings** (⚙) → tick **Show "appsscript.json" manifest file**. Then replace that file's contents with [`google-apps-script/appsscript.json`](google-apps-script/appsscript.json).
4. Still in **Project Settings → Script properties**, add:
   - `SHARED_SECRET`: a long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. This same value becomes `APPS_SCRIPT_SECRET`.
   - `OWNER_EMAIL`: the address of the account that owns the Drive (a permanent admin, alongside Vercel's `OWNER_EMAIL`)
   - `ROOT_FOLDER_ID` (optional): an existing folder's ID from step 1. Leave it out and `setup` makes the folder.
   - `NOTIFY_EMAIL` (optional): where every new enquiry is emailed. Defaults to `pr@modesociety.com.au`; comma-separate several addresses, or set `off` to stop the emails.
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
2. **Sign-in:** the old Client ID was disabled, so follow *3. Create the Google sign-in Client ID* in this account. Add the site's Vercel address (e.g. `https://modesociety-website.vercel.app`) and the real domain, if it's live, to *Authorised JavaScript origins*.
3. **Vercel** (Project → Settings → Environment Variables, Production): set `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to the new values (`SESSION_SECRET` and `OWNER_EMAIL` can stay), then **Deployments → ⋯ → Redeploy**. `NEXT_PUBLIC_…` values are built into the site, so the redeploy is required.
4. **Check:** sign in at `/admin` with either owner address (Vercel's `OWNER_EMAIL` and the script's `OWNER_EMAIL` are both permanent admins), re-add the team under **Access**, then send one test enquiry and confirm it lands in the Sheet.
5. **Content:** the new Drive folders start empty, so the site shows its built-in images until media is added. Drop files into the folders (see *Drive folders*) or upload in the admin panel. Nothing carries over from the old account's Drive.

## Domain: modesociety.com.au

The domain is registered at **Squarespace**, which also runs its DNS. **Keep it there.** Only the two website records change. Everything else, especially the **MX record (`smtp.google.com`)** and the **TXT records** (SPF, `google-site-verification`), must stay or Google Workspace email stops.

1. **Vercel** → the project → **Settings → Domains**: add `www.modesociety.com.au`, then `modesociety.com.au` and choose **Redirect to www.modesociety.com.au**. Vercel lists the DNS records it wants.
2. **Squarespace** → **Domains → modesociety.com.au → DNS**:
   - Delete the **Squarespace Defaults** website records (four `A` records on `@`: 198.185.159.144/145 and 198.49.23.144/145, and the `www` `CNAME` to `ext-sq.squarespace.com`).
   - Add the records Vercel shows. Usually `A` `@` → `76.76.21.21` and `CNAME` `www` → `cname.vercel-dns.com`. If Vercel gives different values, use Vercel's.
   - Leave MX and TXT records alone.
3. Wait until Vercel shows **Valid Configuration** (minutes, occasionally a few hours). The SSL certificate is automatic.
4. **Vercel → Settings → Environment Variables:** `NEXT_PUBLIC_SITE_URL` = `https://www.modesociety.com.au`, then **Redeploy**.
5. **Google Cloud → Google Auth Platform → Clients:** add `https://www.modesociety.com.au` to *Authorised JavaScript origins*, so admin sign-in works on the new address.
6. Only then cancel the Squarespace **website** plan, making sure the **domain** stays registered and on auto-renew.

> Vercel's free Hobby plan is for non-commercial use. For the agency's live site, upgrade the project to **Vercel Pro**.

## Search (SEO)

**Built into the site** (wording in `src/lib/seo.ts`; FAQ answers in `src/lib/content.ts`):

- A search title and description for every page, sized to show in full on Google; canonical URLs; `en-AU`.
- `/sitemap.xml` and `/robots.txt`. Search engines and AI assistants (ChatGPT, Perplexity, Claude, Gemini…) may crawl everything except `/admin` and `/api`. *Featured in* stays out of search until it has press; each feature then gets its own page in the sitemap, with article data for Google.
- Structured data (schema.org): Mode Society as an organisation and professional service in Melbourne, with its socials, services and team; the website; breadcrumbs; and the FAQs on *For brands* and *For talent*.
- A branded share image for every page (`/og?title=…`), used by Google, iMessage, WhatsApp, LinkedIn and so on. An image uploaded to the admin slot *Social share image* replaces it on the home page.
- The old Squarespace addresses (`/home`, `/contact`, …) redirect permanently, so existing Google results keep working.
- Speed and accessibility, which Google also ranks on: compressed photos (AVIF/WebP at the size shown), videos that load only when on screen, and labelled forms. Lighthouse (mobile, Oct 2026): SEO 100, accessibility 100, best practices 100; performance 86–93 on most pages, 72–87 on the home page (its animated hero varies between runs).

**To do after the domain moves** (only an account owner can do these):

1. **Google Search Console** (search.google.com/search-console): the domain already has a `google-site-verification` record, so it may already be verified under one of your Google accounts. If not, add a *Domain* property and verify it with the TXT record it gives you, in Squarespace DNS. Then **Sitemaps** → submit `https://www.modesociety.com.au/sitemap.xml`, and use **URL inspection → Request indexing** on the home, For brands, For talent and Services pages.
2. **Bing Webmaster Tools**: *Import from Google Search Console*. This also covers DuckDuckGo, Yahoo and ChatGPT search, which use Bing's index.
3. **Google Business Profile** (business.google.com): the single biggest lever for "talent agency Melbourne"-type searches and Maps. Set it up as a service-area business in Melbourne, with a primary category such as *Talent agency* or *Marketing agency*, the website link, photos and services. Then ask happy brands and talent for Google reviews.
4. **Links in**: point the Instagram, TikTok and LinkedIn bios at `https://www.modesociety.com.au`; add a link from Grant Help's site; list Mode Society on Australian business and creator/influencer-agency directories.
5. **Keep it fresh**: name the brand in each *Our work* file (`03-Teddi Lab — UGC.jpg`), add press to *Featured in* when it happens, and watch **Organic search visits** in the admin panel's Insights.

## Visit tracking & privacy

The site counts visits itself; there's no Google Analytics, cookie banner or third-party tracker. Each page view sends the page, where the visit came from (the referring site's domain and any `utm_` campaign tags) and two random ids kept in the visitor's own browser: one per browser, to count unique visitors, and one per tab session, to count visits. No names, emails, IP addresses or cookies are stored. The country comes from Vercel's edge network. The tracker ignores bots and browsers with *Do Not Track* switched on, and skips anyone signed in to the admin panel, so the team's own browsing isn't counted. Counting starts from the day this version goes live.

## Troubleshooting

**Forms and uploads fail with "You can't access this item because it is in violation of our Terms of Service".**
Google has blocked the Apps Script web app itself. This happens most often to brand-new Google accounts that publish a web app open to "Anyone". The site can't work around it.
1. Sign in to the account that owns the script, open <https://script.google.com> and look for a warning on the project. Google usually emails the account too; follow its **request a review** link.
2. While the review is pending, or if it's refused, set the backend up again under an established Google account (ideally Mode Society's Google Workspace) by following *Backend setup*. Then update `APPS_SCRIPT_URL` and `APPS_SCRIPT_SECRET` in Vercel.

**Admin sign-in shows "Access blocked: The OAuth client was disabled" (`disabled_client`).**
Google has disabled the sign-in Client ID, usually as part of the same account review. Open <https://console.cloud.google.com/apis/credentials> as the owning account; the project or client will show the reason. Appeal there, or create a new project and OAuth Client ID under an established account. Then update `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in Vercel and redeploy.

**`origin_mismatch`.** Add the exact site address (e.g. `https://modesociety-website.vercel.app`) to the OAuth client's *Authorised JavaScript origins*.

## Project map

```
google-apps-script/     Backend: paste into script.google.com
scripts/mock-backend.mjs  Local stand-in for the backend
src/lib/copy.ts         Every editable section (fields, labels, original wording). Add a section here and it appears under Pages & text.
src/lib/content.ts      The original wording copy.ts starts from (services, about, talent, FAQs, form intros, infographic)
src/lib/slots.ts        Every image slot (and its Drive folder) and animation option. Add a slot here and it appears in the admin panel.
src/lib/backend.ts      Calls Apps Script; caches site content (refreshed instantly on admin save)
src/lib/auth.ts         Google ID-token verification, allowlist, session cookie
src/components/home/wall/engines.ts   The four hero modes
src/components/services/              The Services page showcase (pinwheel + animated steps)
src/components/work/, press/          Our work gallery/teaser and Featured in (press logos, feature cards)
src/components/site/Editorial.tsx     Editorial pieces: section rules, red marker strokes, fit-to-width type
src/components/admin/                 Admin panel (Schedule, Enquiries, Insights, Pages & text, Featured in, Images, Roster, Animations, Access)
src/app/tech/, src/components/tech/   ModeSociety Tech (/tech): pages, theme pieces, the 3D m, roster, forms
src/lib/tech.ts         All the ModeSociety Tech wording, roster types and form options
src/components/site/Tracker.tsx       Anonymous page-view tracking (→ /api/track → Visits tab)
src/app/(site)/…        Public pages
src/app/admin/          Admin panel
src/app/media/[id]      Serves Drive images through the site (nothing in Drive is made public)
```

## Notes & limits

- Uploaded images are resized in the browser (max 2400 px) to keep uploads fast and under the host's 4.5 MB request limit. Transparent PNGs, such as logos, stay transparent.
- Site content is cached for 10 minutes and refreshed immediately whenever an admin saves.
- Built-in images come from *MS Edits/Website Assets* (optimised into `public/assets`), and the logo is vectorised from `Logo.PNG` (`public/brand/logo.svg`). Anything put in the Drive folders replaces them. Videos over ~7 MB weren't bundled; add them to Drive *Home Page 2* instead.
- Still to supply (marked `TODO` in `src/lib/content.ts` and `src/lib/forms.ts`): the LinkedIn URL (the icon stays hidden until it's set), real infographic figures, the final budget and timeline options, the full AI "Where we draw the line" text, and the talent-agreement wording for *Flexible representation*. For ModeSociety Tech, see the placeholders note under *ModeSociety Tech*.
- Forms have a hidden honeypot field and basic rate limiting against spam.
