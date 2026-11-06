/**
 * ModeSociety Tech's sections, as in Asha's v3.5 design (C:\MS Edits\Edit 5\…\tech-mockup\index.html).
 * The markup and drawings follow the mockup so its CSS (src/app/tech/tx.css) applies as it is; the
 * words come from Pages & text (src/lib/copy.ts, techSite.*).
 */
import Link from "next/link";
import { Fragment } from "react";
import JsonLd from "@/components/site/JsonLd";
import type { SectionCopy } from "@/lib/copy";
import { faqJsonLd } from "@/lib/seo";
import { lines, pixel } from "./pixel";

// ------------------------------------------------------------------ hero
export function Hero({ copy: c }: { copy: SectionCopy<"techSite.hero"> }) {
  const heading = c.heading.split("\n").filter((l) => l.trim());
  return (
    <section className="hero">
      <div className="blobs" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="logo3d" id="logo3d" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tech/logom-gradient.png" alt="" />
      </div>
      <div className="wrap">
        <div className="chips mono">
          {c.chips.map((chip, i) => (
            <span key={i} className="chip">
              {i === 0 && <i className="dot" />}
              {chip}
            </span>
          ))}
        </div>
        <h1 className="h-xl">
          {heading.map((l, i) => (
            <span key={i} className="l">
              <span>{pixel(l)}</span>
            </span>
          ))}
        </h1>
        <p className="lede">{c.lede}</p>
        <div className="select">
          {(
            [
              ["brand", c.p1Tag, c.p1Badge, c.p1Title, c.p1Body, c.p1Button, ""],
              ["creator", c.p2Tag, c.p2Badge, c.p2Title, c.p2Body, c.p2Button, "dark"],
            ] as const
          ).map(([tab, tag, badge, title, body, button, tone]) => (
            <a key={tab} className="pick" href="#contact" data-tab={tab}>
              <div className="tag mono">
                <span>{tag}</span>
                {badge && <em>{badge}</em>}
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
              {button && (
                <span className={`pill sm ${tone}`}>
                  {button} <span className="ac">→</span>
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ ticker
function Set({ items, badge, hidden }: { items: string[]; badge?: string; hidden?: boolean }) {
  return (
    <div className="set" aria-hidden={hidden || undefined}>
      {badge && (
        <span className="badge">
          <i className="dot" />
          {badge}
        </span>
      )}
      {items.map((t, i) => (
        <Fragment key={i}>
          {t}
          <span className="d">/</span>
        </Fragment>
      ))}
    </div>
  );
}

export function Ticker({ copy: c }: { copy: SectionCopy<"techSite.ticker"> }) {
  // the dark strip runs its list twice per set, as in the design
  const ink = [...c.inkItems, ...c.inkItems];
  return (
    <div className="tickers" aria-label="What we cover">
      <div className="ticker b" aria-hidden="true">
        <div className="track">
          <Set items={ink} />
          <Set items={ink} />
        </div>
      </div>
      <div className="ticker a">
        <div className="track">
          <Set items={c.limeItems} badge={c.badge} />
          <Set items={c.limeItems} badge={c.badge} hidden />
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ who
export function Who({ copy: c }: { copy: SectionCopy<"techSite.who"> }) {
  return (
    <section className="sec who" id="who">
      <div className="wrap">
        <span className="mono" style={{ color: "var(--royal)", display: "block", marginBottom: 20 }}>
          {c.label}
        </span>
        <div className="cols">
          <p className="big rv">{pixel(c.lead)}</p>
          <p className="side rv">
            <b>{c.sideTitle}</b>
            {c.side}
          </p>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ campaigns: a frosted-glass object per category
const OBJECTS = [
  {
    clip: "cp-gear",
    shape: "#s-gear",
    blobs: ["#C8FF2E", "#FF2E9A", "#5CE1E6"],
    extra: (
      <>
        <path d="M62 95 C62 52 138 52 138 95" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2" />
        <path d="M58 128 C66 140 82 142 92 138" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="95" cy="137" r="4" fill="#C8FF2E" />
      </>
    ),
  },
  {
    clip: "cp-can",
    shape: "#s-can",
    blobs: ["#5CE1E6", "#C8FF2E", "#FF2E9A"],
    extra: (
      <>
        <path d="M104 52 L88 84 H102 L94 116 L114 78 H100 Z" fill="#C8FF2E" />
        <path d="M80 30 H120" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
        <rect x="92" y="12" width="16" height="6" rx="3" fill="#fff" fillOpacity=".7" />
      </>
    ),
  },
  {
    clip: "cp-phone",
    shape: "#s-phone",
    blobs: ["#FF2E9A", "#5CE1E6", "#C8FF2E"],
    extra: (
      <>
        <g fill="#C8FF2E">
          <rect x="78" y="96" width="8" height="14" rx="2" />
          <rect x="90" y="88" width="8" height="22" rx="2" />
          <rect x="102" y="78" width="8" height="32" rx="2" />
          <rect x="114" y="66" width="8" height="44" rx="2" opacity=".35" />
        </g>
        <path d="M84 50 a22 22 0 0 1 32 0 M90 57 a12 12 0 0 1 20 0" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" />
        <rect x="88" y="20" width="24" height="5" rx="2.5" fill="#fff" fillOpacity=".6" />
      </>
    ),
  },
  {
    clip: "cp-cart",
    shape: "#s-cart",
    blobs: ["#C8FF2E", "#5CE1E6", "#FF2E9A"],
    extra: (
      <>
        <rect x="70" y="34" width="60" height="52" rx="6" fill="#fff" fillOpacity=".28" stroke="#fff" strokeOpacity=".6" />
        <path d="M93 48 L111 60 L93 72 Z" fill="#C8FF2E" />
        <rect x="70" y="98" width="60" height="7" rx="3.5" fill="#fff" fillOpacity=".25" />
        <rect x="70" y="98" width="42" height="7" rx="3.5" fill="#C8FF2E">
          <animate attributeName="width" values="8;60;8" dur="4s" repeatCount="indefinite" />
        </rect>
      </>
    ),
  },
];

export function Campaigns({ copy: c }: { copy: SectionCopy<"techSite.campaigns"> }) {
  return (
    <section className="sec poster" id="campaigns">
      <div className="grain" />
      <div className="wrap">
        <div className="head">
          <h2 className="h-l rv">{lines(c.heading)}</h2>
        </div>
        {/* the frosted objects: SVG clip paths and a blur filter (CSS backdrop-filter with a mask renders as a plain box) */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <filter id="fz" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
            <linearGradient id="tint2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".42" />
              <stop offset="1" stopColor="#fff" stopOpacity=".1" />
            </linearGradient>
            <linearGradient id="rimg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".95" />
              <stop offset=".5" stopColor="#fff" stopOpacity=".3" />
              <stop offset="1" stopColor="#fff" stopOpacity=".75" />
            </linearGradient>
            <path
              id="s-gear"
              d="M48 100 C48 30 152 30 152 100 L142 100 C142 44 58 44 58 100 Z M40 92 h28 a8 8 0 0 1 8 8 v34 a8 8 0 0 1 -8 8 h-14 a14 14 0 0 1 -14 -14 v-28 a8 8 0 0 1 0 -8 Z M132 92 h28 a8 8 0 0 1 0 8 v28 a14 14 0 0 1 -14 14 h-14 a8 8 0 0 1 -8 -8 v-34 a8 8 0 0 1 8 -8 Z"
            />
            <path id="s-can" d="M76 22 Q76 16 82 16 H118 Q124 16 124 22 L128 34 V136 Q128 146 118 146 H82 Q72 146 72 136 V34 Z" />
            <rect id="s-phone" x="64" y="10" width="72" height="140" rx="16" />
            <path id="s-cart" d="M56 16 H144 Q150 16 150 22 V128 H138 V146 H62 V128 H50 V22 Q50 16 56 16 Z" />
            <clipPath id="cp-gear">
              <use href="#s-gear" />
            </clipPath>
            <clipPath id="cp-can">
              <use href="#s-can" />
            </clipPath>
            <clipPath id="cp-phone">
              <use href="#s-phone" />
            </clipPath>
            <clipPath id="cp-cart">
              <use href="#s-cart" />
            </clipPath>
          </defs>
        </svg>
        <div className="cats">
          {c.cards.slice(0, 4).map((card, i) => {
            const o = OBJECTS[i];
            return (
              <a key={i} className="cat rv" href="#contact" data-tab="brand">
                <div className="obj">
                  <svg viewBox="0 0 200 160" aria-hidden="true">
                    <g className="fl">
                      <g clipPath={`url(#${o.clip})`}>
                        <rect width="200" height="160" fill="#3E5EF0" />
                        <g filter="url(#fz)">
                          <ellipse cx="60" cy="70" rx="55" ry="50" fill={o.blobs[0]} opacity=".9" />
                          <ellipse cx="145" cy="95" rx="55" ry="50" fill={o.blobs[1]} opacity=".85" />
                          <ellipse cx="100" cy="35" rx="45" ry="35" fill={o.blobs[2]} opacity=".85" />
                        </g>
                        <rect width="200" height="160" fill="url(#tint2)" />
                      </g>
                      <use href={o.shape} fill="none" stroke="url(#rimg)" strokeWidth="2" />
                      {o.extra}
                    </g>
                  </svg>
                </div>
                <span className="mono">{card.label}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ what we run: the bento
function Net() {
  const people = [
    [60, 60],
    [200, 24],
    [340, 60],
    [60, 200],
    [200, 236],
    [340, 200],
  ];
  return (
    <svg className="net" viewBox="0 0 400 260" aria-hidden="true">
      {people.map(([x, y]) => (
        <line key={`l${x}-${y}`} className="ln" x1={x} y1={y} x2="200" y2="130" />
      ))}
      <g className="goal">
        <circle cx="200" cy="130" r="40" fill="#C8FF2E" fillOpacity=".18" stroke="#C8FF2E" strokeOpacity=".6" />
        <circle cx="200" cy="130" r="24" fill="none" stroke="#C8FF2E" strokeWidth="2" />
        <circle cx="200" cy="130" r="9" fill="#C8FF2E" />
      </g>
      {people.map(([x, y]) => (
        <g key={`c${x}-${y}`} className="cr">
          <circle cx={x} cy={y} r="22" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.6)" />
          <circle cx={x} cy={y - 6} r="6" fill="#fff" fillOpacity=".85" />
          <path d={`M${x - 10} ${y + 12} a10 9 0 0 1 20 0`} fill="#fff" fillOpacity=".85" />
        </g>
      ))}
    </svg>
  );
}

export function Run({ copy: c }: { copy: SectionCopy<"techSite.run"> }) {
  const [t1, t2, t3, t4, t5] = Array.from({ length: 5 }, (_, i) => c.tiles[i] ?? { title: "", body: "" });
  const tile = (k: string, t: { title: string; body: string }, art: React.ReactNode, titleStyle?: React.CSSProperties) =>
    t.title.trim() ? (
      <div className={`tile ${k} rv`}>
        <div className="art" />
        {art}
        <h3 style={titleStyle}>{lines(t.title)}</h3>
        <p>{t.body}</p>
      </div>
    ) : null;
  return (
    <section className="sec vivid" id="services">
      <div className="grain" />
      <div className="wrap">
        <div className="head">
          <h2 className="h-l rv">{pixel(c.heading)}</h2>
          <p className="rv">{c.intro}</p>
        </div>
        <div className="bento">
          {tile("k1", t1, <Net />)}
          {tile(
            "k2",
            t2,
            <div className="phones" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>,
          )}
          {tile(
            "k3",
            t3,
            <div className="stream" aria-hidden="true">
              <div className="scr">
                <span className="badge">
                  <i className="dot" />
                  {c.live}
                </span>
              </div>
              <div className="chat">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>,
          )}
          {tile(
            "k4",
            t4,
            <div className="ticket" aria-hidden="true">
              <span className="mono">{c.ticket}</span>
              <b>{c.ticketValue}</b>
            </div>,
          )}
          {tile(
            "k5",
            t5,
            <div className="roles">
              {c.roles.map((r, i) => (
                <span key={i}>{r}</span>
              ))}
            </div>,
            { marginTop: 20 },
          )}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ house rules
export function Rules({ copy: c }: { copy: SectionCopy<"techSite.rules"> }) {
  const viz = [
    <div key="ppl" className="viz ppl">
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
    </div>,
    <div key="doc" className="viz">
      <div className="doc">
        <i />
        <i />
        <i />
        <i />
        <b>{c.docStamp}</b>
      </div>
      <span className="mono">{c.docLabel}</span>
    </div>,
    <div key="nogo" className="viz nogo">
      {c.nogo.map((n, i) => (
        <span key={i}>{n}</span>
      ))}
    </div>,
  ];
  return (
    <section className="sec glassy">
      <div className="wrap">
        <span className="mono" style={{ color: "var(--lime)", display: "block", marginBottom: 20 }}>
          {c.label}
        </span>
        <h2 className="h-l rv">{lines(c.heading)}</h2>
        <p className="lead rv">{c.lead}</p>
        <div className="stats">
          {c.cards.slice(0, 3).map((card, i) => (
            <div key={i} className="gcard rv">
              <div className="top mono">
                <span>{card.label}</span>
                <span className="up">{card.badge}</span>
              </div>
              <b>{card.figure}</b>
              <div className="lbl">{card.caption}</div>
              {viz[i]}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ questions
export function Faq({ copy: c }: { copy: SectionCopy<"techSite.faq"> }) {
  const groups = [
    [c.brandsLabel, c.brands],
    [c.creatorsLabel, c.creators],
  ] as const;
  const all = [...c.brands, ...c.creators].filter((f) => f.q.trim() && f.a.trim());
  return (
    <section className="sec faq" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head">
          <h2 className="h-l rv">{pixel(c.heading)}</h2>
          <p className="rv" style={{ color: "var(--body)" }}>
            {c.intro}
          </p>
        </div>
        <div className="cols">
          {groups.map(([label, items]) => (
            <div key={label}>
              <h4 className="mono">{label}</h4>
              {items
                .filter((f) => f.q.trim())
                .map((f, i) => (
                  <details key={i}>
                    <summary>
                      {f.q}
                      <span className="pm">+</span>
                    </summary>
                    <p>{f.a}</p>
                  </details>
                ))}
            </div>
          ))}
        </div>
      </div>
      {all.length > 0 && <JsonLd data={faqJsonLd(all)} />}
    </section>
  );
}

// ------------------------------------------------------------------ footer
const SOCIALS = [
  ["x", "X", "M17.8 3h3.3l-7.2 8.2L22.4 21h-6.6l-5.2-6.8L4.7 21H1.4l7.7-8.8L1 3h6.8l4.7 6.2zM16.6 19h1.8L7.5 4.9H5.6z"],
  [
    "discord",
    "Discord",
    "M19.5 5.3A16.5 16.5 0 0 0 15.4 4l-.5 1a15 15 0 0 0-5.8 0l-.5-1a16.5 16.5 0 0 0-4.1 1.3C1.9 9.2 1.2 13 1.5 16.8a16.6 16.6 0 0 0 5 2.5l1.1-1.7c-.6-.2-1.2-.5-1.7-.9l.4-.3a11.8 11.8 0 0 0 11.4 0l.4.3c-.5.4-1.1.7-1.7.9l1.1 1.7a16.6 16.6 0 0 0 5-2.5c.4-4.4-.7-8.2-3-11.5zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z",
  ],
  [
    "instagram",
    "Instagram",
    "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z",
  ],
  ["tiktok", "TikTok", "M16.5 3c.4 2.3 1.9 3.9 4.2 4.1v3.1c-1.5 0-2.9-.4-4.2-1.2v6.3c0 3.4-2.7 6-6 6s-6-2.6-6-6 2.7-6 6-6c.3 0 .6 0 .9.1v3.2a2.9 2.9 0 1 0 2 2.7V3z"],
  [
    "linkedin",
    "LinkedIn",
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z",
  ],
  ["facebook", "Facebook", "M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21z"],
] as const;

export function Footer({ copy: c, nav }: { copy: SectionCopy<"techSite.footer">; nav: SectionCopy<"techSite.nav"> }) {
  const links = SOCIALS.filter(([key]) => /^https?:\/\//.test(c[key].trim()));
  return (
    <footer>
      <div className="fblobs" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="fglass" aria-hidden="true" />
      <div className="wrap">
        <div className="row">
          <p>{c.blurb}</p>
          <nav>
            <a className="pill sm" href="#contact" data-tab="brand">
              {c.brandButton} <span className="ac">→</span>
            </a>
            <a className="pill sm dark" href="#contact" data-tab="creator">
              {c.creatorButton} <span className="ac">→</span>
            </a>
          </nav>
        </div>
        <div className="lockup">
          <a className="brand" href="#top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tech/logom-white.png" alt="" />
            <span>
              {nav.brand} <b>{nav.brandAccent}</b>
            </span>
          </a>
          {links.length > 0 && (
            <nav className="socials" aria-label="Socials">
              {links.map(([key, label, d]) => (
                <a key={key} href={c[key].trim()} aria-label={label} target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24">
                    <path d={d} />
                  </svg>
                </a>
              ))}
            </nav>
          )}
        </div>
        <div className="legal mono">
          <span>{c.legal}</span>
          <span>{c.place}</span>
          <Link href="/">{c.back}</Link>
        </div>
      </div>
    </footer>
  );
}
