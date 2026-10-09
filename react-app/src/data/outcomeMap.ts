// The curriculum map: for each course outcome (same order as COURSE.outcomes),
// where in the course it is taught, practiced, and assessed.
//
// Lecture topics are named by their permanent id (ModuleDef.topics[].id). Lab
// tasks and project requirements are named by a short piece of their own text,
// so reordering them does not silently re-point a reference. resolveRef()
// turns references into links; any that no longer match are reported by
// outcomeMapProblems() (shown in dev builds).

import { COURSE } from "./course";
import { MODULE_BY_ID } from "./modules";
import { notesHref } from "./lectures";
import { PROJECT_REQUIREMENTS, PROJECTS, projectSlug } from "./projects";
import type { ModuleDef } from "./types";

export type OutcomeRef =
  /** A lecture topic, by its permanent id. */
  | { m: string; topic: string }
  /** A module's whole lab. */
  | { m: string; lab: true }
  /** One task within a module's lab, matched by a phrase it contains. */
  | { m: string; task: string }
  /** A module's graded checkpoint. */
  | { m: string; checkpoint: true }
  /** A final-project requirement on the Projects page. */
  | { requirement: string }
  /** An example project on the Projects page, by title. */
  | { project: string };

const t = (m: string, ...topics: string[]): OutcomeRef[] => topics.map((topic) => ({ m, topic }));
const lab = (m: string): OutcomeRef => ({ m, lab: true });
const task = (m: string, phrase: string): OutcomeRef => ({ m, task: phrase });
const checkpoint = (m: string): OutcomeRef => ({ m, checkpoint: true });
const req = (phrase: string): OutcomeRef => ({ requirement: phrase });
const project = (title: string): OutcomeRef => ({ project: title });

export const OUTCOME_REFS: OutcomeRef[][] = [
  // 1. How a client and an API communicate over HTTP
  [
    ...t("m01", "client-server", "http-anatomy", "status-codes", "json", "traffic-tools"),
    lab("m01"),
    task("m01", "curl and with browser DevTools"),
    ...t("m08", "http-client"),
  ],
  // 2. REST design and the OpenAPI contract
  [
    ...t("m01", "methods-safety", "rest-resources"),
    ...t("m02", "resource-modeling", "uri-design", "method-mapping", "status-design", "api-review", "openapi", "versioning"),
    task("m02", "Write the ShelfShare API design"),
    ...t("m09", "idempotent-updates"),
    ...t("m12", "contract-tests"),
  ],
  // 3. ASP.NET Core Web API fundamentals
  [
    ...t("m02", "dotnet-toolchain"),
    task("m02", "Create the ShelfShare repository"),
    ...t("m03", "program-cs", "dependency-injection", "controllers-vs-minimal", "routing-binding", "dtos", "configuration", "middleware", "weshopalot-startup"),
    lab("m03"),
  ],
  // 4. EF Core persistence and server-side querying
  [
    ...t("m04", "dbcontext", "relationships", "migrations", "seeding", "providers", "repositories", "async-queries"),
    lab("m04"),
    ...t("m05", "query-params", "filtering-search", "sorting", "pagination", "specification-pattern", "projection", "query-performance"),
    lab("m05"),
  ],
  // 5. Consistent errors and status codes
  [
    ...t("m02", "status-design"),
    ...t("m06", "exception-handling", "problem-details", "validation", "not-found-conflict", "buggy-controller", "logging", "dev-vs-prod-errors"),
    lab("m06"),
    ...t("m08", "loading-errors"),
  ],
  // 6. The Angular client
  [
    ...t("m07", "angular-cli", "standalone-components", "control-flow", "signals", "routing", "angular-services", "weshopalot-client"),
    lab("m07"),
    ...t("m08", "http-client", "typed-models", "rxjs-and-signals", "url-state"),
    task("m08", "Replace the hard-coded BookService"),
    ...t("m09", "reactive-forms", "form-validation", "client-state", "optimistic-ui"),
    lab("m09"),
  ],
  // 7. CORS, environments, and the dev proxy
  [
    ...t("m08", "cors", "dev-proxy"),
    task("m08", "read the CORS error"),
    task("m08", "Add proxy.conf.json"),
    checkpoint("m08"),
    ...t("m13", "hosting-options"),
    task("m13", "update the API's CORS policy"),
  ],
  // 8. Authentication, authorization, and secrets
  [
    ...t("m03", "configuration"),
    ...t("m10", "authn-authz", "password-hashing", "jwt", "aspnet-jwt-bearer", "angular-interceptors", "route-guards", "token-storage", "secrets-review"),
    lab("m10"),
    ...t("m13", "production-config"),
    req("Sign-in with token authentication"),
  ],
  // 9. Caching and third-party integration
  [
    ...t("m09", "server-state"),
    ...t("m11", "server-caching", "http-caching", "cache-invalidation", "payments", "webhooks", "idempotency-keys"),
    lab("m11"),
    project("Small-business ordering"),
  ],
  // 10. Testing both halves, in CI
  [
    ...t("m12", "test-pyramid", "api-unit-tests", "integration-tests", "angular-tests", "e2e-tests", "contract-tests", "ci"),
    lab("m12"),
    req("Automated tests on both halves"),
  ],
  // 11. Deployment and team delivery
  [
    ...t("m13", "production-config", "containers", "hosting-options", "infrastructure-as-code", "cicd", "observability", "keeping-current"),
    lab("m13"),
    checkpoint("m13"),
    req("A deployed, publicly reachable app"),
    req("A 10-minute demo"),
  ],
];

/** A reference resolved into something the page can render and link to. */
export interface ResolvedRef {
  /** Grouping key and heading, e.g. "Module 3 · Tool calling and the agent loop". */
  group: string;
  /** Week label for module groups, e.g. "Week 3". */
  when?: string;
  kind: "Topic" | "Lab" | "Lab task" | "Checkpoint" | "Project requirement" | "Example project";
  text: string;
  href: string;
}

const lc = (s: string) => s.toLowerCase();
const taskText = (x: string | { text: string }) => (typeof x === "string" ? x : x.text);

function moduleGroup(mod: ModuleDef): Pick<ResolvedRef, "group" | "when"> {
  return { group: `Module ${mod.number} · ${mod.title}`, when: `Week ${mod.weeks}` };
}

/** Resolves one reference, or returns null when it no longer matches anything. */
export function resolveRef(r: OutcomeRef): ResolvedRef | null {
  if ("requirement" in r) {
    const i = PROJECT_REQUIREMENTS.findIndex((x) => lc(x).includes(lc(r.requirement)));
    if (i < 0) return null;
    return { group: "Final project", kind: "Project requirement", text: PROJECT_REQUIREMENTS[i], href: `#/projects?s=req-${i + 1}` };
  }
  if ("project" in r) {
    const p = PROJECTS.find((x) => x.title === r.project);
    if (!p) return null;
    return { group: "Final project", kind: "Example project", text: p.title, href: `#/projects?s=${projectSlug(p.title)}` };
  }
  const mod = MODULE_BY_ID[r.m];
  if (!mod) return null;
  const g = moduleGroup(mod);
  if ("topic" in r) {
    const topic = mod.topics.find((x) => x.id === r.topic);
    if (!topic) return null;
    // Straight to the lecture notes when they exist, otherwise to the bullet on the module page.
    const href = notesHref(mod.id, topic.id) ?? `#/m/${mod.id}?s=topic-${topic.id}`;
    return { ...g, kind: "Topic", text: topic.text, href };
  }
  if ("lab" in r) {
    if (!mod.lab) return null;
    return { ...g, kind: "Lab", text: mod.lab.title, href: `#/m/${mod.id}?s=lab` };
  }
  if ("task" in r) {
    const tasks = mod.lab?.tasks ?? [];
    const i = tasks.findIndex((x) => lc(taskText(x)).includes(lc(r.task)));
    if (i < 0) return null;
    return { ...g, kind: "Lab task", text: taskText(tasks[i]), href: `#/m/${mod.id}?s=lab-task-${i + 1}` };
  }
  if (!mod.checkpoint) return null;
  return { ...g, kind: "Checkpoint", text: mod.checkpoint, href: `#/m/${mod.id}?s=checkpoint` };
}

/** Every outcome's references, resolved and grouped in course order. */
export const OUTCOME_MAP: { group: string; when?: string; refs: ResolvedRef[] }[][] = OUTCOME_REFS.map((refs) => {
  const groups: { group: string; when?: string; refs: ResolvedRef[] }[] = [];
  for (const r of refs) {
    const x = resolveRef(r);
    if (!x) continue;
    let g = groups.find((y) => y.group === x.group);
    if (!g) groups.push((g = { group: x.group, when: x.when, refs: [] }));
    if (!g.refs.some((y) => y.href === x.href)) g.refs.push(x);
  }
  return groups;
});

/** Module numbers an outcome touches, for the collapsed summary. */
export function outcomeModules(i: number): number[] {
  const nums = new Set<number>();
  for (const r of OUTCOME_REFS[i] ?? []) if ("m" in r && MODULE_BY_ID[r.m]) nums.add(MODULE_BY_ID[r.m].number);
  return [...nums].sort((a, b) => a - b);
}

/** Map integrity: references that no longer match, and outcomes left unmapped. */
export function outcomeMapProblems(): string[] {
  const problems: string[] = [];
  if (OUTCOME_REFS.length !== COURSE.outcomes.length)
    problems.push(`Outcome map has ${OUTCOME_REFS.length} entries but the course has ${COURSE.outcomes.length} outcomes`);
  OUTCOME_REFS.forEach((refs, i) => {
    if (refs.length === 0) problems.push(`Outcome ${i + 1} has no references`);
    refs.forEach((r) => {
      if (!resolveRef(r)) problems.push(`Outcome ${i + 1}: reference does not match anything: ${JSON.stringify(r)}`);
    });
  });
  return problems;
}
