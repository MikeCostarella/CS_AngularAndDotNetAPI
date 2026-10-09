// Example final projects: full-stack apps a team of three or four can build,
// test, secure, and deploy in the last weeks of the course.

import type { PageSection } from "./types";

export interface ProjectIdea {
  title: string;
  track: "Civic" | "Campus" | "Business" | "Open";
  summary: string;
  requirements: string[];
}

/** Anchor id for an example project card, e.g. "project-campus-event-board". */
export function projectSlug(title: string): string {
  return "project-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const PROJECTS: ProjectIdea[] = [
  {
    title: "Community service request tracker",
    track: "Civic",
    summary:
      "Residents report potholes, broken streetlights, and similar problems with a location and a photo; staff triage, assign, and close requests; everyone can see status on a map and a list.",
    requirements: [
      "Public read endpoints with filtering by type, status, and area, plus paging",
      "Signed-in reporting; a Staff role for triage and status changes",
      "File upload for photos, with size and type validation",
      "An audit trail of every status change",
    ],
  },
  {
    title: "Campus event board",
    track: "Campus",
    summary:
      "Student organizations post events; students browse by date and category, RSVP, and get a capacity-limited waitlist.",
    requirements: [
      "Organizer and Student roles with different permissions",
      "RSVP with a capacity limit enforced on the server (409 when full)",
      "Calendar and list views driven by the same query endpoint",
      "HTTP caching on the public event list",
    ],
  },
  {
    title: "Small-business ordering",
    track: "Business",
    summary:
      "A local bakery or food truck publishes a menu; customers order ahead and pay with Stripe in test mode; staff see a live order queue.",
    requirements: [
      "Menu, cart, order, and payment flow modeled on WeShopAlot, with its REST problems fixed",
      "Stripe PaymentIntents and a verified webhook that marks orders paid",
      "Idempotency keys on order creation",
      "A staff queue page that refreshes without a full reload",
    ],
  },
  {
    title: "Equipment lending library",
    track: "Campus",
    summary:
      "A department lends laptops, cameras, and lab kits: members reserve items, staff check them out and in, and overdue items are flagged.",
    requirements: [
      "Reservations that cannot overlap, enforced in the API",
      "Check-out and check-in as explicit, audited actions",
      "A daily overdue report endpoint and page",
      "Integration tests for every reservation rule",
    ],
  },
  {
    title: "Volunteer shift scheduler",
    track: "Civic",
    summary:
      "A food bank or shelter posts volunteer shifts; volunteers sign up and cancel; coordinators see coverage gaps.",
    requirements: [
      "Shift sign-up and cancellation with concurrency handled (two people, one slot)",
      "Coordinator dashboard with coverage by day",
      "Email or calendar export for a volunteer's shifts",
      "Accessible forms that work with a keyboard and a screen reader",
    ],
  },
  {
    title: "Team-proposed project",
    track: "Open",
    summary:
      "Any app with a real user, an Angular client, and an ASP.NET Core API, approved by week 11. Projects built for a campus office or a community partner are encouraged.",
    requirements: [
      "A one-page proposal: users, resources, and the riskiest part",
      "The same baseline requirements as every other project",
    ],
  },
];

export const PROJECT_REQUIREMENTS = [
  "An Angular client and an ASP.NET Core Web API in one repository, with an API design document kept in step with the code",
  "A relational database through EF Core, with migrations and seed data",
  "At least one list endpoint with filtering, sorting, and paging, and consistent Problem Details errors",
  "Sign-in with token authentication and at least two roles, with authorization enforced in the API",
  "Automated tests on both halves (API integration tests and Angular tests) running in GitHub Actions",
  "A deployed, publicly reachable app with no secrets in the repository",
  "A 10-minute demo, a short written report, and an AI-assistance log",
];

// Closing prose sections of the Projects page, kept as data so they are
// searchable and anchor-linkable.
export const PROJECT_NOTES: PageSection[] = [
  {
    id: "midterm",
    heading: "Midterm checkpoint (week 8)",
    paras: [
      "The ShelfShare API from Unit II and the Angular catalog working end to end, demonstrated live, with the API design document updated to match the code. Most teams reuse the ShelfShare structure as the skeleton of their final project.",
    ],
  },
  {
    id: "teams",
    heading: "Teams and workflow",
    paras: [
      "Teams of three or four work in one GitHub repository with branches, pull requests, and required reviews. Each pull request that changes the API also updates the design document and the tests, so the contract never drifts from the code.",
    ],
  },
  {
    id: "partners",
    heading: "Community and campus partners",
    paras: [
      "Campus offices, local governments, and nonprofits are welcome to suggest projects, provide realistic (non-sensitive) data, and join final demos as reviewers.",
    ],
  },
];
