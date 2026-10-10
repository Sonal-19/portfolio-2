export type SkillGroup = { title: string; cmd: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    title: "Backend",
    cmd: "api",
    items: ["Node.js", "Express", "Bun", "Elysia", "REST API"],
  },
  { title: "Data", cmd: "db", items: ["PostgreSQL", "Drizzle ORM", "MongoDB"] },
  { title: "DevOps", cmd: "ops", items: ["Docker", "Git", "Linux"] },
  { title: "Web", cmd: "web", items: ["JavaScript", "HTML/CSS"] },
];

export const allSkills = skillGroups.flatMap((g) => g.items);
