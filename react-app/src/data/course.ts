// Course-level metadata: thesis, outcomes, format, grading.
// Rendered on the home page and the syllabus page.

export const COURSE = {
  repo: "CS_AngularAndDotNetAPI",
  heading: "Angular and .NET Web APIs",
  siteTitle: "Angular and .NET Web APIs",
  tagline:
    "Upper-level undergraduate · 3 s.h. · An Angular client and an ASP.NET Core REST API, built, secured, tested, and deployed together",
  audience: "Course design · CS and IT juniors and seniors",
  status:
    "Draft course design for discussion. Not an official catalog listing — titles, numbering, schedule, and weights are proposals.",
  prerequisites:
    "Data Structures, an object-oriented programming course (C# or Java), and an introductory web course (HTML, CSS, JavaScript). No prior Angular or ASP.NET experience is assumed.",
  /** The courses that lead here, in order. Empty: this course stands on its own. */
  coursePath: [] as { title: string; url: string }[],
  levels: "Offered at the 4xxx (upper-level undergraduate) level",
  schedule: "15 weeks · roughly half lecture, half lab · team final project",
  author: "Mike Costarella",
  contactEmail: "Mike.Costarella@gmail.com",
  thesis:
    "Most business software is a browser front end talking to a web API over HTTP. This course teaches both halves of that conversation and the contract between them: an Angular single-page app on one side, an ASP.NET Core REST API on the other, and HTTP, JSON, and OpenAPI in the middle. The running example is WeShopAlot, a complete e-commerce system with a product catalog, a basket, accounts, orders, and card payments, which students read, run, critique, and improve. In the labs they build their own app, ShelfShare, from an empty folder to a tested, deployed, secured full-stack system. The stance is professional, not tutorial: every endpoint has a status-code story, every secret stays out of git, every feature ships with a test, and AI coding assistants are allowed but must be disclosed and understood.",
  outcomes: [
    "Explain how a browser client and a web API communicate over HTTP — methods, URIs, headers, status codes, and JSON — and inspect real traffic with browser DevTools, .http files, and Swagger.",
    "Design REST resources and URIs, choosing methods and status codes for safety and idempotency, and document the contract with OpenAPI.",
    "Build an ASP.NET Core Web API with dependency injection, routing, model binding, DTOs, configuration, and middleware.",
    "Persist and query data with Entity Framework Core — migrations, seeding, relationships, and filtering, sorting, searching, and pagination on the server.",
    "Return consistent errors and validation results, and map every failure to the right HTTP status code.",
    "Build an Angular client with standalone components, routing, signals, and typed services that call the API with HttpClient.",
    "Handle cross-origin requests, environment configuration, and the development proxy so the client and API work together locally and in production.",
    "Secure the API and client with token-based authentication (JWT), authorization rules, an HTTP interceptor, and route guards — and keep secrets out of source control.",
    "Improve performance with server-side and HTTP caching, and integrate a third-party service (payments) through its API and webhooks.",
    "Test both halves — API integration tests with WebApplicationFactory and Angular tests with mocked HTTP — and run them in continuous integration.",
    "Containerize, configure, and deploy the API and client to the cloud, and deliver a working, documented full-stack application as a team.",
  ],
  format:
    "Thirteen modules in five units across a 15-week semester. Each module pairs lecture with a hands-on lab, and the labs build one application: ShelfShare starts in Lab 2 as an empty Web API and grows a database, query features, error handling, an Angular client, sign-in, caching, a payment integration, tests, and a cloud deployment. Every module also has a WeShopAlot reading: the same idea in a larger, finished system, including the places where that system gets it wrong. WeShopAlot has two clients on one API, an Angular web app and a WPF desktop app with the same features and the same design, so students can compare a browser client and a desktop client calling the same endpoints. Week 8 is a midterm checkpoint; weeks 14–15 are final team projects with demos.",
  grading: [
    { component: "Labs (ShelfShare, Labs 1–13)", weight: "35%" },
    { component: "Midterm checkpoint (week 8)", weight: "15%" },
    { component: "Final team project, demo, and report", weight: "30%" },
    { component: "WeShopAlot code reviews (API review, security review)", weight: "10%" },
    { component: "Participation and reflections", weight: "10%" },
  ],
  gradGrading:
    "Students who take the course for graduate credit add a design study to the final project: a measured comparison of two approaches (for example controllers vs. minimal APIs, Redis vs. HTTP caching, or JWT in memory vs. cookies), with numbers and a recommendation.",
  integrity:
    "AI coding assistants are allowed, and the policy is about disclosure and understanding, not prohibition. Each lab submission includes a short AI-assistance log: which tools were used, for what, and what the student checked or changed. Students must be able to explain any code they submit, and oral walkthroughs may be requested at any time. Generated code that fails its tests or leaks a secret is graded as the student's code.",
} as const;
