/**
 * The priced services (Asha's pack, 16 Nov 2026: Mode_Society_Services_Website_Copy and
 * Mode_Society_Tech_Services_Website_Copy), as each site shows them until an admin edits them in
 * Pages & text. All prices are in AUD and exclude GST. Generated from the two documents; edit the
 * wording in the admin panel, not here.
 */
export type ServiceTier = { name: string; price: string; includes: string };
export type PricedService = {
  title: string;
  body: string;
  /** "Yes": shows the "Free for exclusive creators" badge (the two strategy services) */
  free: string;
  tiers: ServiceTier[];
  /** the line under the tiers (revisions, turnaround…) */
  note: string;
};
export type ServicesCopy = { intro: string; footer: string; items: PricedService[] };

export const TALENT_SERVICES: ServicesCopy = {
  "intro": "Grow with intention. Whether you're a creator building your platform or a brand looking to sell more online, our team brings real industry experience in fashion, beauty and e-commerce to help you grow with a clear strategy.",
  "footer": "All prices are in Australian dollars and exclude GST. Strategy services are free for Mode Society exclusive creators. To book, choose a service and complete the booking form, and our team will confirm your booking and send an invoice. Results depend on many factors, and we can't guarantee specific follower, view or sales outcomes.",
  "items": [
    {
      "title": "Social Media Strategy Session",
      "body": "A one-on-one session where we dive deep into your socials and build a strategy around your goals. Before the call we analyse your content, analytics, audience and competitors. Then we walk you through exactly what to post, when, and why. For creators and brands.",
      "free": "Yes",
      "tiers": [
        {
          "name": "Strategy Session",
          "price": "$500 + GST",
          "includes": "Pre-call audit of up to 2 platforms, 60-minute strategy call, tailored written action plan, and 7 days of follow-up questions by email."
        },
        {
          "name": "Crash Course Intensive",
          "price": "$850 + GST",
          "includes": "Everything in Strategy Session, plus a second 60-minute session two weeks later, a 30-day content plan with hooks and ideas, and profile optimisation recommendations."
        }
      ],
      "note": ""
    },
    {
      "title": "Ongoing Strategy Support",
      "body": "Ongoing support to keep your growth on track. Each month we review your performance, report on what's working, and meet with you to plan the month ahead.",
      "free": "Yes",
      "tiers": [
        {
          "name": "Monthly Support",
          "price": "$500 + GST / month",
          "includes": "Monthly performance report, one 45-minute strategy call per month, content feedback, and email support during business hours. Cancel anytime with 30 days' notice."
        }
      ],
      "note": "Exclusive creators get 24/7 access to our team at no cost. Non-exclusive and non-represented creators can subscribe at the standard rate."
    },
    {
      "title": "Social Media Audit",
      "body": "A clear-eyed review of your social presence, covering profile, content, engagement, audience and competitors, delivered as a prioritised report you can act on straight away.",
      "free": "No",
      "tiers": [
        {
          "name": "Essentials",
          "price": "$250 + GST",
          "includes": "1 platform, written audit report with your top 10 recommended changes."
        },
        {
          "name": "Complete",
          "price": "$450 + GST",
          "includes": "Up to 3 platforms, competitor comparison (3 accounts), and a full report with a 30-day action plan."
        },
        {
          "name": "Audit + Walkthrough",
          "price": "$650 + GST",
          "includes": "Everything in Complete, plus a 45-minute video call walking you through the findings."
        }
      ],
      "note": ""
    },
    {
      "title": "Batch Content Editing",
      "body": "Film in bulk and send us your raw footage. We'll edit it into polished, ready-to-post short-form videos with captions, trending-style pacing, text overlays and music suggestions.",
      "free": "No",
      "tiers": [
        {
          "name": "Starter",
          "price": "$350 + GST",
          "includes": "10 short-form videos per batch."
        },
        {
          "name": "Growth",
          "price": "$650 + GST",
          "includes": "20 short-form videos per batch, plus cover images."
        },
        {
          "name": "Scale",
          "price": "$1,200 + GST",
          "includes": "40 short-form videos per batch, plus a posting schedule."
        }
      ],
      "note": "Includes one round of revisions per video. Turnaround: 5 to 7 business days."
    },
    {
      "title": "YouTube Video Editing",
      "body": "Professional editing for vlogs, hauls, tutorials and brand content, built for retention with tight pacing, captions, music and graphics.",
      "free": "No",
      "tiers": [
        {
          "name": "Standard",
          "price": "$250 + GST / video",
          "includes": "Up to 10 minutes final length. Cuts, colour, music, captions."
        },
        {
          "name": "Pro",
          "price": "$450 + GST / video",
          "includes": "Up to 20 minutes. Everything in Standard plus motion graphics, sound design and B-roll."
        },
        {
          "name": "Premium",
          "price": "$750 + GST / video",
          "includes": "Up to 30 minutes. Everything in Pro plus a thumbnail and 3 Shorts cut from the video."
        }
      ],
      "note": "Includes two rounds of revisions. Monthly bundles available on request."
    },
    {
      "title": "Email & SMS Marketing",
      "body": "Turn followers into customers. We set up and run email and SMS marketing for fashion, beauty and e-commerce brands, from welcome flows to sale campaigns that drive revenue.",
      "free": "No",
      "tiers": [
        {
          "name": "Setup",
          "price": "$750 + GST once-off",
          "includes": "Platform setup (e.g. Klaviyo), sign-up form, branded email template, and a 3-email welcome flow."
        },
        {
          "name": "Essentials",
          "price": "$600 + GST / month",
          "includes": "4 email campaigns per month, copy and design, plus monthly results report."
        },
        {
          "name": "Growth",
          "price": "$1,100 + GST / month",
          "includes": "8 email campaigns and 4 SMS campaigns per month, abandoned cart and post-purchase flows, plus monthly report and call."
        }
      ],
      "note": ""
    },
    {
      "title": "Content Calendar & Captions",
      "body": "A month of content planned for you: post ideas, hooks, captions and hashtags, mapped to a calendar so you always know what to post next.",
      "free": "No",
      "tiers": [
        {
          "name": "Plan",
          "price": "$300 + GST / month",
          "includes": "12 post ideas with hooks, captions and hashtags in a monthly calendar."
        },
        {
          "name": "Plan Plus",
          "price": "$550 + GST / month",
          "includes": "20 post ideas with hooks, captions, hashtags and filming notes, plus a Stories plan."
        }
      ],
      "note": ""
    },
    {
      "title": "Media Kit & Rate Card Design",
      "body": "A polished media kit and rate card that presents your stats, audience and past work the way brands want to see it.",
      "free": "No",
      "tiers": [
        {
          "name": "Media Kit",
          "price": "$250 + GST",
          "includes": "2 to 3 page designed media kit (PDF) with your stats and best work."
        },
        {
          "name": "Media Kit + Rate Card",
          "price": "$400 + GST",
          "includes": "Media kit plus a rate card with recommended pricing for your deliverables."
        }
      ],
      "note": ""
    },
    {
      "title": "UGC Scripts & Concepts",
      "body": "Ready-to-film scripts and concepts for UGC ads and brand content, written to convert without feeling like an ad.",
      "free": "No",
      "tiers": [
        {
          "name": "Starter Pack",
          "price": "$150 + GST",
          "includes": "3 scripts with hooks, talking points and shot lists."
        },
        {
          "name": "Creator Pack",
          "price": "$400 + GST",
          "includes": "10 scripts with hooks, talking points and shot lists."
        }
      ],
      "note": ""
    },
    {
      "title": "Long-Form to Short-Form Repurposing",
      "body": "Already filming long videos or podcasts? We'll cut them into short-form clips ready for TikTok, Reels and Shorts.",
      "free": "No",
      "tiers": [
        {
          "name": "Repurpose Pack",
          "price": "$300 + GST",
          "includes": "Up to 10 short clips from one long video (up to 60 minutes), with captions."
        }
      ],
      "note": ""
    }
  ]
};

export const TECH_SERVICES: ServicesCopy = {
  "intro": "Level up your channel. Whether you're a streamer building a community or a brand trying to reach gamers, our team brings hands-on experience across gaming, esports and tech to help you grow with a clear strategy.",
  "footer": "All prices are in Australian dollars and exclude GST. Strategy services are free for Mode Society Tech exclusive creators. To book, choose a service and complete the booking form, and our team will confirm your booking and send an invoice. Results depend on many factors, and we can't guarantee specific follower, view or sales outcomes.",
  "items": [
    {
      "title": "Social Media Strategy Session",
      "body": "A one-on-one session where we dive deep into your socials and build a strategy around your goals. Before the call we analyse your content, analytics, audience and competitors. Then we walk you through exactly what to post, when, and why. For creators and brands.",
      "free": "Yes",
      "tiers": [
        {
          "name": "Strategy Session",
          "price": "$500 + GST",
          "includes": "Pre-call audit of up to 2 platforms, 60-minute strategy call, tailored written action plan, and 7 days of follow-up questions by email."
        },
        {
          "name": "Crash Course Intensive",
          "price": "$850 + GST",
          "includes": "Everything in Strategy Session, plus a second 60-minute session two weeks later, a 30-day content plan with hooks and ideas, and profile optimisation recommendations."
        }
      ],
      "note": ""
    },
    {
      "title": "Ongoing Strategy Support",
      "body": "Ongoing support to keep your growth on track. Each month we review your performance, report on what's working, and meet with you to plan the month ahead.",
      "free": "Yes",
      "tiers": [
        {
          "name": "Monthly Support",
          "price": "$500 + GST / month",
          "includes": "Monthly performance report, one 45-minute strategy call per month, content feedback, and email support during business hours. Cancel anytime with 30 days' notice."
        }
      ],
      "note": "Exclusive creators get 24/7 access to our team at no cost. Non-exclusive and non-represented creators can subscribe at the standard rate."
    },
    {
      "title": "Channel Audit",
      "body": "A detailed review of your Twitch, YouTube or TikTok channel, covering branding, schedule, titles, thumbnails, stream setup, clips and analytics, with clear, prioritised fixes.",
      "free": "No",
      "tiers": [
        {
          "name": "Essentials",
          "price": "$250 + GST",
          "includes": "1 platform, written audit report with your top 10 recommended changes."
        },
        {
          "name": "Complete",
          "price": "$450 + GST",
          "includes": "Up to 3 platforms, competitor comparison (3 accounts), and a full report with a 30-day action plan."
        },
        {
          "name": "Audit + Walkthrough",
          "price": "$650 + GST",
          "includes": "Everything in Complete, plus a 45-minute video call walking you through the findings."
        }
      ],
      "note": ""
    },
    {
      "title": "Stream Highlights & Clips",
      "body": "Send us your VODs and we'll turn your best moments into scroll-stopping vertical clips for TikTok, YouTube Shorts and Reels, with captions, hooks and on-screen titles.",
      "free": "No",
      "tiers": [
        {
          "name": "Starter",
          "price": "$350 + GST",
          "includes": "10 clips per month from your VODs."
        },
        {
          "name": "Growth",
          "price": "$650 + GST",
          "includes": "20 clips per month, plus 3 thumbnail-style cover images."
        },
        {
          "name": "Scale",
          "price": "$1,200 + GST",
          "includes": "40 clips per month, plus a posting schedule."
        }
      ],
      "note": "Includes one round of revisions per video. Turnaround: 5 to 7 business days."
    },
    {
      "title": "YouTube Video Editing",
      "body": "Professional editing for gaming videos, highlight compilations, guides and reviews, built for retention with tight pacing, captions, sound design and graphics.",
      "free": "No",
      "tiers": [
        {
          "name": "Standard",
          "price": "$250 + GST / video",
          "includes": "Up to 10 minutes final length. Cuts, colour, music, captions."
        },
        {
          "name": "Pro",
          "price": "$450 + GST / video",
          "includes": "Up to 20 minutes. Everything in Standard plus motion graphics, sound design and B-roll."
        },
        {
          "name": "Premium",
          "price": "$750 + GST / video",
          "includes": "Up to 30 minutes. Everything in Pro plus a thumbnail and 3 Shorts cut from the video."
        }
      ],
      "note": "Includes two rounds of revisions. Monthly bundles available on request."
    },
    {
      "title": "Email & SMS Marketing",
      "body": "Turn your audience into customers. We set up and run email and SMS campaigns for gaming, tech and telco brands, from launch announcements to sales and community updates.",
      "free": "No",
      "tiers": [
        {
          "name": "Setup",
          "price": "$750 + GST once-off",
          "includes": "Platform setup (e.g. Klaviyo), sign-up form, branded email template, and a 3-email welcome flow."
        },
        {
          "name": "Essentials",
          "price": "$600 + GST / month",
          "includes": "4 email campaigns per month, copy and design, plus monthly results report."
        },
        {
          "name": "Growth",
          "price": "$1,100 + GST / month",
          "includes": "8 email campaigns and 4 SMS campaigns per month, abandoned cart and post-purchase flows, plus monthly report and call."
        }
      ],
      "note": ""
    },
    {
      "title": "Content Calendar & Captions",
      "body": "A month of content planned for you: post ideas, hooks, captions and hashtags, mapped to a calendar so you always know what to post next.",
      "free": "No",
      "tiers": [
        {
          "name": "Plan",
          "price": "$300 + GST / month",
          "includes": "12 post ideas with hooks, captions and hashtags in a monthly calendar."
        },
        {
          "name": "Plan Plus",
          "price": "$550 + GST / month",
          "includes": "20 post ideas with hooks, captions, hashtags and filming notes, plus a Stories plan."
        }
      ],
      "note": ""
    },
    {
      "title": "Media Kit & Sponsorship Deck",
      "body": "A professional media kit and sponsorship deck that shows brands your channel stats, audience and value, so you can pitch with confidence.",
      "free": "No",
      "tiers": [
        {
          "name": "Media Kit",
          "price": "$250 + GST",
          "includes": "2 to 3 page designed media kit (PDF) with your stats and best work."
        },
        {
          "name": "Media Kit + Rate Card",
          "price": "$400 + GST",
          "includes": "Media kit plus a rate card with recommended pricing for your deliverables."
        }
      ],
      "note": ""
    },
    {
      "title": "UGC Scripts & Concepts",
      "body": "Ready-to-film scripts and concepts for sponsored integrations, game launches and product reviews, written to feel natural to your audience.",
      "free": "No",
      "tiers": [
        {
          "name": "Starter Pack",
          "price": "$150 + GST",
          "includes": "3 scripts with hooks, talking points and shot lists."
        },
        {
          "name": "Creator Pack",
          "price": "$400 + GST",
          "includes": "10 scripts with hooks, talking points and shot lists."
        }
      ],
      "note": ""
    },
    {
      "title": "Long-Form to Short-Form Repurposing",
      "body": "Already have long videos or podcasts? We'll cut them into vertical clips ready for every short-form platform.",
      "free": "No",
      "tiers": [
        {
          "name": "Repurpose Pack",
          "price": "$300 + GST",
          "includes": "Up to 10 short clips from one long video (up to 60 minutes), with captions."
        }
      ],
      "note": ""
    }
  ]
};
