import type { ImageMetadata } from "astro";

const screenshots = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/projects/*.{png,jpg,jpeg,webp}",
  { eager: true },
);

export const screenshot = (file?: string) =>
  file ? screenshots[`../assets/projects/${file}`]?.default : undefined;

/** Animated SVG illustrations for projects without a screenshot. */
export type CoverKind = "mail" | "link" | "traffic" | "blog" | "api";

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  description: string[];
  highlights: string[];
  stack: string[];
  /** What Shivam did on the project. */
  role: string;
  year?: string;
  /** Card / cover accent colour. */
  accent: string;
  /** A screenshot in src/assets/projects, or an animated SVG cover. */
  image?: string;
  cover?: CoverKind;
  /** Fake URL shown in the cover's window bar. */
  path?: string;
  links: { label: string; href: string }[];
  /** Featured projects get the big sticky stacking cards. */
  featured?: boolean;
};

const BACKEND = "Backend developer";

export const projects: Project[] = [
  /* ---------------- Featured ---------------- */
  {
    slug: "myastalife",
    title: "MyAstaLife",
    kicker: "Live · Play Store · App Store · Web",
    summary:
      "The API behind a wellness commerce app that ships to Android, iOS and the web from one codebase.",
    description: [
      "MyAstaLife is the consumer app for Nature4Ever's wellness range. Customers browse products, place orders, pay online and track their deliveries, on Android, iOS and the web.",
      "On the backend: the typed Bun + Elysia API, the PostgreSQL schema with Drizzle, the payment flow and the push notification pipeline the native apps depend on.",
    ],
    highlights: [
      "One typed API serving Android, iOS and web",
      "Online payments and order tracking",
      "Push notifications for the native apps",
      "PostgreSQL schema managed with Drizzle",
    ],
    stack: [
      "Bun",
      "Elysia",
      "PostgreSQL",
      "Drizzle",
      "Capacitor 8",
      "React 19",
    ],
    role: BACKEND,
    year: "2025",
    accent: "#22c55e",
    image: "myastalife.png",
    path: "api.myastalife.com/v1/orders",
    links: [
      { label: "Website", href: "https://myastalife.com/" },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.myastalife.app",
      },
    ],
    featured: true,
  },
  {
    slug: "finance-tracker",
    title: "Finance Tracker",
    kicker: "Installable PWA",
    summary:
      "Record income and expenses date-wise, then see day, week, month and year reports with charts, budgets and savings goals.",
    description: [
      "A personal finance tracker that feels like a native app on phones. Credits and debits are logged by date, reports roll up by day, week, month and year, and recurring entries are added automatically.",
      "It's a typed monorepo: Elysia + Drizzle on the server, with an end-to-end type-safe Eden client so the React frontend and the API can never drift apart.",
    ],
    highlights: [
      "Report aggregation by day, week, month and year",
      "Budgets, recurring entries and savings goals",
      "Passkey (WebAuthn) and OTP sign-in",
      "End-to-end types through Eden",
    ],
    stack: [
      "Bun",
      "Elysia",
      "Drizzle",
      "PostgreSQL",
      "React 19",
      "TanStack",
      "PWA",
    ],
    role: BACKEND,
    year: "2026",
    accent: "#38bdf8",
    image: "finance-tracker.png",
    path: "api/reports?range=month",
    links: [{ label: "Live app", href: "https://tracker.com.u4.lol/" }],
    featured: true,
  },
  {
    slug: "khata-connect",
    title: "Khata Connect",
    kicker: "Lena-dena ledger · PWA",
    summary:
      "A ledger for the people you trust: money given and received, loans with interest, and cash kept with others, calculated to the rupee.",
    description: [
      "Khata Connect digitises the family Excel khata. It tracks money you gave and got, loans lent or borrowed with interest (₹1 per hundred per month, or any yearly rate), and cash kept with someone else that is partly lent out.",
      "Interest is worked out to the rupee on the server, the same way a hand-kept khata does it, with a running balance for each person.",
    ],
    highlights: [
      "Interest on loans lent and borrowed, monthly or yearly",
      "A running balance for each person",
      "Installable PWA with light and dark themes",
    ],
    stack: ["Bun", "Elysia", "Drizzle", "PostgreSQL", "React 19", "TanStack"],
    role: BACKEND,
    year: "2026",
    accent: "#f59e0b",
    image: "khata-connect.png",
    path: "api/ledger/:person/balance",
    links: [{ label: "Live app", href: "https://khata.com.u4.lol/" }],
    featured: true,
  },
  {
    slug: "tubeforge",
    title: "Tubeforge",
    kicker: "AI agent · YouTube · Live",
    summary:
      "An AI research agent that turns one keyword into weekly and monthly YouTube content plans.",
    description: [
      "A creator enters a keyword. The agent expands it, pulls search demand and trend signals, samples what's performing on YouTube, and drafts content plans the creator can accept, reject or re-run.",
      "Every agent step runs through a Postgres-backed job queue and is logged with before and after records.",
    ],
    highlights: [
      "Keyword expansion and trend signals",
      "A Postgres-backed job queue",
      "An audit log of agent actions",
    ],
    stack: ["Bun", "Elysia", "Drizzle", "PostgreSQL", "AI agents"],
    role: BACKEND,
    year: "2026",
    accent: "#ef4444",
    image: "content-engine.png",
    path: "agent/jobs?status=running",
    links: [{ label: "Live app", href: "https://yt-agent.u4.lol" }],
    featured: true,
  },
  {
    slug: "one-alias",
    title: "One Alias Service",
    kicker: "REST API · Email · Backend",
    summary:
      "A REST API for email routing: a privacy-first alias service that forwards mail without exposing your real inbox.",
    description: [
      "One Alias lets people create disposable email aliases that route to their real inbox. Each alias can be paused, renamed or deleted, so a leaked address never becomes a permanent problem.",
      "The backend exposes a clean REST API for alias management and routing rules, with a separate frontend that consumes it.",
    ],
    highlights: [
      "Privacy-first email aliases and forwarding",
      "REST API for alias and routing management",
      "Separate frontend and backend deployments",
      "Secure authentication",
    ],
    stack: ["Node.js", "Express", "REST API", "MongoDB", "Docker"],
    role: "Solo build",
    accent: "var(--accent)",
    cover: "mail",
    path: "api.1as.in/v1/aliases",
    links: [
      { label: "Frontend", href: "https://n3y.in/oas" },
      { label: "Backend", href: "https://n3y.in/oas-api" },
    ],
    featured: true,
  },

  /* ---------------- More work ---------------- */
  {
    slug: "chatbot-platform",
    title: "Chatbot Platform",
    kicker: "AI · Multi-tenant",
    summary:
      "One deployment hosts a separate AI chatbot for each product, each with its own knowledge base and an embeddable widget.",
    description: [
      "Each bot (myastalife, bioskyz and others) has its own knowledge base built from uploaded Markdown files and its own system prompt, and can be started or stopped independently.",
      "A small script tag drops the chat widget onto any landing page.",
    ],
    highlights: [
      "A knowledge base for each bot",
      "An embeddable widget script",
      "Start and stop control for each bot",
    ],
    stack: ["Bun", "Elysia", "LLM APIs", "RAG", "React"],
    role: BACKEND,
    year: "2026",
    accent: "#22d3ee",
    cover: "api",
    path: "bots/:id/chat",
    links: [],
  },
  {
    slug: "wellvibe",
    title: "Wellvibe",
    kicker: "Live · Nature4Ever brand",
    summary:
      "The storefront for Wellvibe's wellness range (AlphaWell and more), with online payments and customer accounts.",
    description: [
      "Wellvibe is a Nature4Ever wellness brand. The API covers the product catalogue, customer sign-up and sign-in, and online payments, on the same typed stack as MyAstaLife.",
    ],
    highlights: [
      "Product catalogue API",
      "Payment gateway integration",
      "Customer accounts",
    ],
    stack: ["Bun", "Elysia", "PostgreSQL", "Drizzle", "React"],
    role: BACKEND,
    year: "2025",
    accent: "#3b82f6",
    image: "wellvibe.png",
    path: "api/products",
    links: [{ label: "Website", href: "https://wellvibeindia.com/" }],
  },
  {
    slug: "nature4ever",
    title: "Nature4Ever",
    kicker: "Live · Company website",
    summary:
      "The main website for Nature4Ever Life Sciences' premium natural wellness products.",
    description: [
      "The company's main web platform for its stem-cell and natural wellness products: product showcase, brand story and storefront, backed by the shared API, payment and storage pipelines.",
    ],
    highlights: [
      "Product showcase and storefront",
      "Payments and asset storage",
      "Shared typed API patterns",
    ],
    stack: ["Bun", "Elysia", "PostgreSQL", "React"],
    role: BACKEND,
    year: "2025",
    accent: "#10b981",
    image: "nature4ever.png",
    path: "nature4ever.com",
    links: [{ label: "Website", href: "https://www.nature4ever.com/" }],
  },
  {
    slug: "task-uncle",
    title: "Task Uncle",
    kicker: "Productivity · PWA",
    summary:
      "Uncle won't stop reminding you until it's done: repeat notifications for every pending task.",
    description: [
      "Add professional and personal work by event and category. Each pending task sends repeat browser notifications (hourly, every 5 hours, every 12 hours or daily) until you mark it done, and the completion time is recorded.",
    ],
    highlights: [
      "Repeat push reminders",
      "Organised by event and category",
      "Completion history",
    ],
    stack: ["Bun", "Elysia", "Web Push", "React 19"],
    role: BACKEND,
    year: "2026",
    accent: "#4ade80",
    cover: "api",
    path: "push/reminders",
    links: [],
  },
  {
    slug: "url-shortener",
    title: "URL Shortener",
    kicker: "Web App · Utility",
    summary:
      "Create short, memorable links for any URL, with analytics and custom domains.",
    description: [
      "A link shortener that turns long, ugly URLs into short, memorable ones. It powers the n3y.in links used across this very site.",
      "Every redirect is tracked, so link owners can see how their links perform, and custom domains are supported out of the box.",
    ],
    highlights: [
      "Short, memorable links",
      "Click analytics",
      "Custom domain support",
      "Fast redirects",
    ],
    stack: ["Node.js", "Express", "PostgreSQL", "JavaScript"],
    role: "Solo build",
    accent: "var(--cyan)",
    cover: "link",
    path: "n3y.in/dashboard",
    links: [{ label: "View project", href: "https://n3y.in/" }],
  },
  {
    slug: "dtlcs",
    title: "Dynamic Traffic Control Light System",
    kicker: "IoT · Simulation",
    summary:
      "An intelligent traffic management solution that adapts signal timings using real-time data.",
    description: [
      "DTLCS replaces fixed traffic-light timers with timings that react to real-time traffic density, cutting waiting time at busy junctions.",
      "The project includes a simulation that models vehicles arriving at a junction and compares adaptive timing against a fixed cycle.",
    ],
    highlights: [
      "Adaptive signal timing from live data",
      "Junction traffic simulation",
      "IoT-ready control logic",
    ],
    stack: ["JavaScript", "IoT", "Simulation"],
    role: "Solo build",
    accent: "#ff9f43",
    cover: "traffic",
    path: "dtlcs/junction-04",
    links: [{ label: "View project", href: "https://n3y.in/dtlcs" }],
  },
  {
    slug: "simple-blog",
    title: "Simple Blog Website",
    kicker: "CMS · Blog",
    summary: "A clean and efficient blogging platform with markdown support.",
    description: [
      "A lightweight blogging platform where posts are written in Markdown and rendered into clean, readable pages.",
      "It focuses on speed and readability: no clutter, just content.",
    ],
    highlights: [
      "Markdown authoring",
      "Clean, readable layouts",
      "Fast page loads",
    ],
    stack: ["Node.js", "Express", "MongoDB", "HTML/CSS"],
    role: "Solo build",
    accent: "#b18cff",
    cover: "blog",
    path: "blog/new-post.md",
    links: [{ label: "View blog", href: "https://n3y.in/blog" }],
  },
];

export const featured = projects.filter((p) => p.featured);
export const moreWork = projects.filter((p) => !p.featured);
