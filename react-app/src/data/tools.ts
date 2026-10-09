import type { PageSection } from "./types";

// Tools & Setup page content. Kept here rather than inline in the component
// so the search index can read it from the same source the page renders.
//
// Inside prose, [[resource-id]] expands to a link to that entry in
// data/resources.ts — see components/RichText.tsx and resolveRefs().

export interface ToolNeed {
  name: string;
  examples: string;
  why: string;
}

export const TOOLS: ToolNeed[] = [
  {
    name: ".NET SDK",
    examples: ".NET 10 (LTS)",
    why: "Builds and runs the API, its tests, and the EF Core tools. Free for Windows, macOS, and Linux.",
  },
  {
    name: "Node.js and the Angular CLI",
    examples: "Node.js LTS, npm, @angular/cli (current release)",
    why: "Builds, serves, and tests the Angular client from Lab 7 on.",
  },
  {
    name: "Editor",
    examples: "Visual Studio 2022 or later (Community), or VS Code with the C# Dev Kit; REST Client extension",
    why: "Either works. Visual Studio is the smoother debugger for the API; VS Code is lighter and handles both halves.",
  },
  {
    name: "Git and GitHub",
    examples: "Git, a GitHub account, GitHub Desktop (optional)",
    why: "Every lab is a commit; Module 12's tests run in GitHub Actions.",
  },
  {
    name: "Database",
    examples: "SQLite (labs); SQL Server Express or LocalDB, or PostgreSQL (Module 13)",
    why: "SQLite needs no server, so the labs work everywhere. The same EF Core code moves to a server database for deployment.",
  },
  {
    name: "Docker Desktop",
    examples: "Docker Desktop with docker compose",
    why: "Runs Redis (Modules 9 and 11) and the containerized app (Module 13) without installing them.",
  },
  {
    name: "Stripe test account",
    examples: "A free Stripe account in test mode, and the Stripe CLI",
    why: "Module 11's payment and webhook lab. Test mode moves no real money.",
  },
  {
    name: "Cloud hosting",
    examples: "Azure for Students credit, or GitHub Pages plus any container host",
    why: "Module 13's deployment and the final project demos.",
  },
];

export const TOOLS_LEDE =
  "What students install for the labs, what each piece is for, and how the reference app, WeShopAlot, runs on a student machine.";

/** Id of the section whose body is the TOOLS table rather than prose. */
export const TOOLS_TABLE_SECTION = "what-the-course-uses";

export const TOOLS_SECTIONS: PageSection[] = [
  {
    id: TOOLS_TABLE_SECTION,
    heading: "What the course uses",
  },
  {
    id: "versions",
    heading: "Versions",
    paras: [
      "The course targets the current long-term-support release of .NET and the current Angular release, and says so in every lab that depends on a version. .NET LTS releases arrive every other November and are supported for three years; Angular ships a major version about every six months. Module 13 teaches the upgrade path, using WeShopAlot's move from .NET 8 and Angular 15 as the worked example. See [[dotnet-download]] and [[angular-update]].",
    ],
  },
  {
    id: "first-day-check",
    heading: "First-day check",
    items: [
      "`dotnet --list-sdks` shows a 10.0 SDK",
      "`node --version` shows an LTS release, and `npm --version` runs",
      "`ng version` runs after `npm install -g @angular/cli`",
      "`git --version` runs, and you can push to a GitHub repository",
      "VS Code (or Visual Studio) opens a .http file and can send a request",
    ],
  },
  {
    id: "running-weshopalot",
    heading: "Running WeShopAlot locally",
    items: [
      "Clone [[weshopalot-repo]] and open Solution/WeShopAlot.sln",
      "Start Redis with `docker compose up -d` in the Solution folder",
      "Set the database type and connection string with `dotnet user-secrets` in the WebAPI project (Settings:DbServerType and ConnectionStrings:WeShopAlotSQLConnection)",
      "Run the WebAPI project; Swagger UI opens in the browser",
      "Run the Angular client from Solution/Client with `npm install` and `ng serve`, then browse to https://localhost:4200 (Angular 22 needs Node 22.22.3 or later, or 24.15 or later)",
      "Run the tests: `dotnet test` in the Solution folder (no database or Redis needed) and `ng test` in the Client folder"
    ],
  },
  {
    id: "secrets",
    heading: "Secrets rule",
    paras: [
      "No key, password, or connection string is ever committed, in any lab. Development secrets go in `dotnet user-secrets`; production secrets go in the host's settings or Azure Key Vault. A committed secret is treated as leaked: rotate it, then remove it. WeShopAlot's history shows why this rule exists, and Module 10 reviews it. See [[aspnet-user-secrets]].",
    ],
  },
];
