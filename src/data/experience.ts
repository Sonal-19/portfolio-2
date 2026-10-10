export type Role = {
  company: string;
  role: string;
  place: string;
  period: string;
  current?: boolean;
  points: string[];
  tags: string[];
};

export const experience: Role[] = [
  {
    company: "Nature4Ever Life Sciences (OPC) Pvt Ltd",
    role: "Software Developer & AI Engineer",
    place: "Mohali, Punjab",
    period: "2025 — Present",
    current: true,
    points: [
      "Design and build the typed Bun + Elysia APIs behind MyAstaLife, live on the Play Store, App Store and web.",
      "Own the backend end to end: PostgreSQL with Drizzle, auth, payments and push notifications.",
      "Build AI features, including per-product chatbots with their own knowledge bases.",
    ],
    tags: ["Bun", "Elysia", "PostgreSQL", "Drizzle", "LLM APIs"],
  },
  {
    company: "Freelance",
    role: "Software & AI Engineer",
    place: "Remote",
    period: "2025 — Present",
    current: true,
    points: [
      "Build AI products: a multi-tenant chatbot platform with RAG and a YouTube content-research agent.",
      "Deliver client websites backed by custom CRMs: leads, bookings, invoices and WhatsApp outreach.",
    ],
    tags: ["LLM APIs", "RAG", "Bun", "Elysia", "React 19"],
  },
  {
    company: "JayaChetna Software Solution Pvt. Ltd",
    role: "Backend Developer",
    place: "Chandigarh",
    period: "2024 — 2025",
    points: [
      "Built and maintained REST APIs, database schemas and backend services for production products.",
      "Worked with the frontend team in a product team shipping on a regular release cycle.",
    ],
    tags: ["Node.js", "REST APIs", "JavaScript", "SQL"],
  },
  {
    company: "Excellence Technology",
    role: "Machine Learning Trainee",
    place: "Mohali, Punjab",
    period: "2023 — 2024",
    points: [
      "Completed training in machine learning: data preparation, model training and evaluation.",
      "Built practice ML projects end to end in Python.",
    ],
    tags: ["Python", "NumPy", "Pandas", "scikit-learn"],
  },
];
