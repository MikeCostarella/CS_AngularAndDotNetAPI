import type { LectureNotesDef } from "../types";

// Module 1 — How a client and an API talk: lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]], [words](url).

export const M01_NOTES: LectureNotesDef = {
  moduleId: "m01",
  intro:
    "These notes go with the Module 1 lecture and Lab 1. They build one idea: a web application is two programs that only ever talk through HTTP messages, so the messages are the contract. Learn to read them and you can debug either side without seeing its code. Lab 1's `requests.http` is the running example, and WeShopAlot is the system the rest of the course takes apart.",
  sections: [
    // ------------------------------------------------------------------ 1
    {
      topic: "client-server",
      blocks: [
        "Open WeShopAlot's shop page and two programs are working. The {{client|client}} is the Angular app running inside your browser: it draws the product grid, reacts to clicks, and remembers what is in your basket. The {{server|server}} is the ASP.NET Core Web API running somewhere else: it owns the product database, checks passwords, totals orders, and talks to Stripe. The two never share memory, variables, or code. All they can do is send each other HTTP messages.",
        "That separation is the point. It lets each half be written in the language that suits it (TypeScript in the browser, C# on the server), deployed on its own schedule, and replaced without touching the other. WeShopAlot proves it: the same API serves an Angular client, an ASP.NET MVC client, and a WPF desktop client.",
        {
          table: {
            head: ["Concern", "Client (Angular)", "Server (Web API)"],
            rows: [
              ["Runs on", "The user's browser, on hardware you don't control", "Your server or cloud host"],
              ["Owns", "What is on screen, and choices the user hasn't submitted yet", "The data, the business rules, and the secrets"],
              ["Can be trusted?", "**No.** Anyone can open DevTools and change it", "Yes. It is the only place to enforce a rule"],
              ["Fails by", "Showing the wrong thing", "Returning the wrong status code or data"],
              ["Talks through", "HTTP requests", "HTTP responses"],
            ],
            caption: "Who does what in a browser-plus-API application",
          },
        },
        "The row to remember is *Can be trusted?*. Validation in an Angular form is a convenience for the user; validation in the API is the real rule. A price, a discount, a user id, or a role sent from the browser is a claim the server must check, never a fact it can rely on. Module 10 comes back to this with route guards, which hide pages but protect nothing.",
        {
          callout:
            "Because the two halves only meet in HTTP messages, the message format is the real interface of the system: which URIs exist, what they accept, and what they return. Change it carelessly and every client breaks, including ones you don't know about. That is why Module 2 designs the contract before Lab 3 writes the code.",
          title: "The API is a contract",
          tone: "aside",
        },
      ],
      takeaway:
        "A web app is two programs that share nothing but HTTP messages, so the messages are the contract, and only the server can enforce a rule.",
      check: [
        {
          q: "WeShopAlot's Angular basket page computes the order total and shows it. Should the API trust that total when an order is created? What should it do instead?",
          a: "No. The client can be changed by anyone. The API should look up each product's price itself and compute the total on the server, which is what WeShopAlot's OrderService does.",
        },
        {
          q: "Name two benefits WeShopAlot gets from having three different clients (Angular, MVC, WPF) on one API.",
          a: "The business rules live in one place, so every client behaves the same; and a client can be rewritten or added without changing the server. It also proves the API doesn't depend on any one client.",
        },
      ],
      readings: ["mdn-http"],
    },

    // ------------------------------------------------------------------ 2
    {
      topic: "http-anatomy",
      blocks: [
        "Every {{http}} exchange is one request and one response, and both are plain text with the same three-part shape: a start line, {{header|headers}}, and an optional body. Here is Lab 1's first request and the start of its response, trimmed:",
        {
          code:
            "GET /repos/dotnet/aspnetcore HTTP/1.1\nHost: api.github.com\nAccept: application/vnd.github+json\nUser-Agent: ng-dotnet-lab01\n\n\nHTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nETag: W/\"5f1c…\"\nx-ratelimit-remaining: 59\n\n{\n  \"name\": \"aspnetcore\",\n  \"full_name\": \"dotnet/aspnetcore\",\n  …\n}",
          title: "One request, one response",
          note: "A blank line separates the headers from the body. The GET has no body; the response body is JSON.",
        },
        {
          table: {
            head: ["Part", "In the request", "In the response"],
            rows: [
              ["Start line", "Method, path, and HTTP version: `GET /repos/dotnet/aspnetcore HTTP/1.1`", "Version, status code, and reason: `HTTP/1.1 200 OK`"],
              ["Headers", "Who is asking and what they accept: `Accept`, `Authorization`, `If-None-Match`", "What came back and how to treat it: `Content-Type`, `ETag`, `Cache-Control`"],
              ["Body", "Data being sent, for POST, PUT, and PATCH", "The resource, a list, or an error description"],
            ],
            caption: "The three parts of every HTTP message",
          },
        },
        "The {{uri}} in the start line has two parts worth separating. The **path** (`/repos/dotnet/aspnetcore`) names *what* you are talking about. The {{query-string|query string}} (`?per_page=5&page=2` in Lab 1's second request) refines *how* you want it: which page, which filter, what order. WeShopAlot follows the same rule: `/api/product` names the catalog, and `?typeId=2&sort=priceAsc&pageIndex=1` narrows it.",
        "Headers are where most of HTTP's power lives, and most bugs hide. The handful you will meet every week:",
        {
          list: [
            "`Content-Type`: the format of *this* message's body. Send JSON without `Content-Type: application/json` and ASP.NET Core answers 415 Unsupported Media Type.",
            "`Accept`: the formats the client can read back.",
            "`Authorization`: who is calling, usually `Bearer <token>` (Module 10).",
            "`Location`: on a 201 response, the URI of the thing just created (Module 3).",
            "`ETag` and `If-None-Match`: a version fingerprint and the request to skip unchanged data (Lab 1, request 4, and Module 11).",
            "`Access-Control-Allow-Origin`: the API's permission for a page on another origin to read the response (Module 8).",
          ],
        },
        {
          callout:
            "Browsers and frameworks hide most of this, which is convenient until something breaks. When an Angular page shows nothing, the first question is always: what request did it actually send, and what came back? DevTools answers that in ten seconds (topic 7).",
          title: "Debug at the message level",
          tone: "tip",
        },
      ],
      takeaway:
        "Request and response share one shape (start line, headers, blank line, body), and reading those four parts is the first step in debugging anything that crosses the network.",
      check: [
        {
          q: "In `GET /api/product?brandId=3&pageIndex=2`, which part names the resource and which part refines the request?",
          a: "The path `/api/product` names the resource (the product collection); the query string `brandId=3&pageIndex=2` filters and pages it.",
        },
        {
          q: "An Angular service POSTs a new book, and the API answers 415. Which header is the first suspect?",
          a: "`Content-Type`. 415 means the server can't read the body's format, usually because the request didn't say it was `application/json`.",
        },
      ],
      readings: ["mdn-http", "rfc9110"],
    },

    // ------------------------------------------------------------------ 3
    {
      topic: "methods-safety",
      blocks: [
        "The {{http-method}} says what the client wants done to the resource the URI names. Two properties matter more than the names: whether a method is {{safe-method|safe}} (it changes nothing) and whether it is {{idempotent|idempotent}} (sending it twice has the same effect as sending it once).",
        {
          table: {
            head: ["Method", "Typical use", "Safe?", "Idempotent?", "Has a body?"],
            rows: [
              ["`GET`", "Read a resource or a collection", "Yes", "Yes", "No"],
              ["`POST`", "Create a resource in a collection, or run an action", "No", "**No**", "Yes"],
              ["`PUT`", "Replace a resource entirely, at a URI the client knows", "No", "Yes", "Yes"],
              ["`PATCH`", "Change part of a resource", "No", "Not necessarily", "Yes"],
              ["`DELETE`", "Remove a resource", "No", "Yes", "Usually not"],
            ],
            caption: "The five methods this course uses",
          },
        },
        "Why care? Because networks fail in the middle. A phone loses signal after sending a request but before the response arrives, and the client doesn't know whether it worked. If the request was idempotent, it simply sends it again. `PUT /api/baskets/abc` with the full basket twice leaves the same basket. `DELETE /api/books/7` twice leaves book 7 deleted (the second call may answer 404, but the *state* is the same). `POST /api/orders` twice can create **two orders and two charges**.",
        "WeShopAlot is a useful example here. Its basket endpoint saves updates with `POST /api/basket`, sending the whole basket in the body. The operation is really a replace, which is idempotent, but the method announces something that isn't, so nothing between the client and server (a retry policy, a proxy, another developer) can safely retry it. Module 9 changes it to `PUT /api/baskets/{id}`. Its order endpoint really is a `POST`, and Module 11 shows how an {{idempotency-key|idempotency key}} makes even that safe to retry.",
        {
          callout:
            "Safe methods must really be safe. A link like `GET /api/basket/clear` that empties a basket will eventually be followed by a browser's link prefetcher, a search crawler, or a chat app's link preview, and a basket will be emptied that nobody meant to empty.",
          title: "Never change data with GET",
          tone: "warning",
        },
      ],
      takeaway:
        "Choose the method by its promise: GET changes nothing, PUT and DELETE are safe to repeat, and POST is not, so treat retries of POST with care.",
      check: [
        {
          q: "Lab 1's request 5 was a POST. If it had succeeded and you clicked Send Request twice, what would you expect, and why?",
          a: "Two issues, because POST is not idempotent: each call creates a new resource.",
        },
        {
          q: "Is `DELETE /api/books/7` still idempotent if the second call returns 404 instead of 204?",
          a: "Yes. Idempotency is about the effect on the server's state (book 7 is gone either way), not about getting the same status code.",
        },
        {
          q: "WeShopAlot's basket update sends the entire basket with POST. Which method fits better, and what URI would you use?",
          a: "PUT, because it replaces the whole basket and is safe to repeat, at a URI that names the basket: `PUT /api/baskets/{id}`.",
        },
      ],
      readings: ["mdn-methods", "rfc9110"],
    },

    // ------------------------------------------------------------------ 4
    {
      topic: "status-codes",
      blocks: [
        "The {{status-code|status code}} is the API's one-word answer, and a client branches on it before it ever reads the body. The first digit gives the family: **2xx** it worked, **3xx** look elsewhere or use what you have, **4xx** the request was wrong, **5xx** the server failed. The 4xx/5xx line is the most useful one in the whole table: 4xx means *the client should change something*, 5xx means *the server has a bug or an outage*.",
        {
          table: {
            head: ["Code", "Meaning", "When an API should send it"],
            rows: [
              ["200 OK", "Success, here is the result", "A successful GET, or a PUT that returns the updated resource"],
              ["201 Created", "A new resource exists", "A successful POST that created something, with a `Location` header"],
              ["204 No Content", "Success, nothing to return", "A successful DELETE, or a PUT that returns no body"],
              ["304 Not Modified", "Your cached copy is still good", "A conditional GET whose ETag still matches"],
              ["400 Bad Request", "The request is malformed or invalid", "Missing fields, bad values, unreadable JSON"],
              ["401 Unauthorized", "Who are you?", "No token, or an expired or invalid one"],
              ["403 Forbidden", "I know who you are; no", "Signed in, but not allowed to do this"],
              ["404 Not Found", "No such resource", "Unknown id, or one the caller shouldn't know exists"],
              ["409 Conflict", "It clashes with the current state", "A duplicate ISBN, or an edit based on a stale version"],
              ["422 Unprocessable Content", "Well-formed but unacceptable", "Valid JSON that breaks a business rule (some APIs use 400 instead)"],
              ["429 Too Many Requests", "Slow down", "A rate limit was exceeded"],
              ["500 Internal Server Error", "The server failed", "An unhandled exception. Always a bug to fix, never a design choice"],
            ],
            caption: "The dozen status codes that matter most",
          },
        },
        "Two pairs cause most of the confusion. **401 vs. 403**: 401 means the server doesn't know who you are (sign in), 403 means it knows and the answer is no (signing in again won't help). The name *Unauthorized* is an old misnomer for *unauthenticated*. **404 vs. 403**: for a record that exists but belongs to someone else, many APIs answer 404 on purpose, so they don't reveal that it exists. WeShopAlot does exactly that for orders: `GET /api/order/{id}` looks up the order *for the signed-in user*, so someone else's order is simply not found. GitHub does it for private repositories, which may be what you saw in Lab 1's request 5.",
        "Status codes only help if they are honest. An API that answers `200 OK` with `{ \"success\": false }` in the body forces every client to parse the body to learn whether anything worked, and it breaks caches, retries, and monitoring, which all read the status code. Module 6 makes ShelfShare's codes honest for every failure, and WeShopAlot's BuggyController gives you a test bench with an endpoint for each one.",
      ],
      takeaway:
        "The status code is the client's first branch: 2xx worked, 4xx the client must change something, 5xx the server has a bug. Sending the right one is part of the contract.",
      check: [
        {
          q: "A signed-in member asks to delete a book, but only librarians may. 401 or 403?",
          a: "403. The API knows who the member is; they just aren't allowed. 401 would wrongly suggest that signing in again would help.",
        },
        {
          q: "Lab 1's request 4 returned 304 with no body. How does the client know what to display?",
          a: "It shows the copy it already has. 304 means \"your cached version, the one with that ETag, is still current.\"",
        },
        {
          q: "Why is `200 OK` with an error message in the body worse than a 4xx?",
          a: "Everything that reads status codes (HttpClient error handling, retries, caches, monitoring, logs) treats it as a success, so the failure goes unnoticed unless every client parses the body.",
        },
      ],
      readings: ["mdn-status", "rfc9110"],
    },

    // ------------------------------------------------------------------ 5
    {
      topic: "rest-resources",
      blocks: [
        "{{rest|REST}} is the name Roy Fielding gave in 2000 to the architectural style of the web itself. For API design, four of its ideas carry most of the weight:",
        {
          list: [
            "**Resources with addresses.** The API exposes things (a book, a member's loans, the catalog), each named by a URI. URIs are nouns: `/api/books/42`, not `/api/getBook?id=42`.",
            "**A uniform interface.** Every resource is handled with the same small set of methods and status codes, so a client that understands one endpoint mostly understands them all.",
            "**Representations.** The client never touches the resource itself, only a {{representation|representation}} of it, usually JSON. The database row and the JSON can (and should) differ: Module 3's DTOs.",
            "**Statelessness.** Each request carries everything needed to handle it, including the token, so the server keeps no conversation memory between requests. That is what lets one API run on many servers behind a load balancer. See {{stateless|stateless}}.",
          ],
        },
        "Leonard Richardson's {{richardson-maturity|maturity model}} turns this into a scale that is handy for code review:",
        {
          table: {
            head: ["Level", "What the API does", "Example"],
            rows: [
              ["0", "One URI, one method; the body says what to do", "`POST /api` with `{ \"action\": \"getBook\", \"id\": 42 }`"],
              ["1", "Separate URIs for resources", "`POST /api/books/42/get`"],
              ["2", "Resources **plus** proper methods and status codes", "`GET /api/books/42` → 200 or 404"],
              ["3", "Level 2 plus {{hypermedia|hypermedia}} links to related actions", "A book's JSON includes `\"links\": { \"borrow\": \"/api/books/42/loans\" }`"],
            ],
            caption: "The Richardson maturity model",
          },
        },
        "Most well-designed production APIs, including GitHub's and the one you will build, sit at **level 2**, with a little level 3 where it helps, such as GitHub's paging links in Lab 1's request 2. WeShopAlot is mostly level 2, with a few level-1 habits (the basket id in the query string, an update sent as POST) that Module 2 reviews.",
        {
          callout:
            "Nobody is graded on REST purity, and a few action endpoints, like `POST /api/account/login`, are the honest design because signing in isn't creating a resource the client will later GET. The goal is predictability: a developer who has seen three of your endpoints should be able to guess the fourth.",
          title: "REST is a means, not a score",
          tone: "aside",
        },
      ],
      takeaway:
        "Design around resources with noun URIs, use the standard methods and status codes, and keep requests stateless. That is level 2, and it is where good APIs live.",
      check: [
        {
          q: "Rewrite `GET /api/getBooksByGenre?genre=3` in REST style.",
          a: "`GET /api/books?genreId=3`: the path names the collection, and the filter goes in the query string. Or, if genres are a first-class parent, `GET /api/genres/3/books`.",
        },
        {
          q: "Why does statelessness make an API easier to scale?",
          a: "Any server can handle any request, because nothing about the conversation is stored on a particular server. You can add servers behind a load balancer without sticky sessions.",
        },
      ],
      readings: ["fielding", "richardson"],
    },

    // ------------------------------------------------------------------ 6
    {
      topic: "json",
      blocks: [
        "{{json|JSON}} is the format on the wire in almost every modern API: objects in braces, arrays in brackets, and strings, numbers, `true`, `false`, and `null`. The {{content-type}} header `application/json` says a body is JSON. It is simple enough to read by eye, which is why Lab 1 worked straight from the raw responses, but a few details trip up every full-stack project.",
        {
          table: {
            head: ["Issue", "What goes wrong", "The usual rule"],
            rows: [
              ["Property casing", "C# says `PageIndex`, TypeScript expects `pageIndex`", "ASP.NET Core writes camelCase by default, and Angular models use camelCase"],
              ["Dates", "JSON has no date type", "Send ISO 8601 strings in UTC (`2026-10-08T14:30:00Z`) and convert at the edges"],
              ["Money", "`0.1 + 0.2` is not `0.3` in JavaScript", "Use `decimal` in C#, and send amounts as numbers you round on display, or as integer cents"],
              ["Large integers", "JavaScript numbers lose precision above 2^53", "Send very large ids (such as 64-bit snowflake ids) as strings"],
              ["null vs. missing", "Is a missing field \"no change\" or \"clear it\"?", "Decide per endpoint; PUT replaces everything, PATCH sends only changes"],
              ["Enums", "Numbers (`2`) are unreadable; strings (`\"Shipped\"`) are clear", "Prefer strings for anything a person will read in a log"],
            ],
            caption: "JSON details that matter between C# and TypeScript",
          },
        },
        "WeShopAlot shows both sides of this. Its exception middleware sets `JsonNamingPolicy.CamelCase` explicitly so its error bodies match the rest of the API, and its paging envelope serializes to `{ \"pageIndex\": 1, \"pageSize\": 6, \"count\": 18, \"data\": [ … ] }`, which the Angular client mirrors with a TypeScript interface. Its order status starts as a C# enumeration and is stored as a lookup table, a good place to check whether a client sees a number or a name.",
        {
          code:
            "// C# (WeShopAlot.WebAPI/Helpers/Pagination.cs)\npublic class Pagination<T> where T : class\n{\n    public int PageIndex { get; set; }\n    public int PageSize { get; set; }\n    public int Count { get; set; }\n    public IReadOnlyList<T> Data { get; set; }\n}\n\n// TypeScript (the Angular side mirrors the JSON, not the C#)\nexport interface Pagination<T> {\n  pageIndex: number;\n  pageSize: number;\n  count: number;\n  data: T[];\n}",
          title: "One shape, two languages",
          note: "The JSON is the contract; each side describes it in its own language. Module 8 generates the TypeScript from the OpenAPI document so the two can't drift apart.",
        },
      ],
      takeaway:
        "JSON is the contract's data format: agree on camelCase, ISO 8601 dates in UTC, safe number handling, and what null means, and both languages describe the same shape.",
      check: [
        {
          q: "The API returns `\"createdAt\": \"2026-10-08T14:30:00Z\"`. In which time zone should the Angular page show it, and where does the conversion happen?",
          a: "In the user's local time zone, converted in the client when it is displayed. The API stores and sends UTC so every client starts from the same value.",
        },
        {
          q: "Your TypeScript interface says `pageindex` and the page always shows page 0. What happened?",
          a: "A casing mismatch: the JSON property is `pageIndex`, so `pageindex` is undefined. TypeScript can't catch this because the shape of the response is only asserted, not checked at run time.",
        },
      ],
      readings: ["mdn-http"],
    },

    // ------------------------------------------------------------------ 7
    {
      topic: "traffic-tools",
      blocks: [
        "Four tools let you see and send HTTP traffic. Each has a job it does best, and you will use all four this semester.",
        {
          table: {
            head: ["Tool", "Best for", "In this course"],
            rows: [
              ["{{http-file|.http files}}", "Repeatable, reviewable requests you keep in the repository", "Every lab: one request per endpoint and per failure case"],
              ["{{devtools|Browser DevTools}} (F12 → Network)", "Seeing exactly what a running page sent and received", "Every Angular bug from Module 7 on"],
              ["{{curl}}", "A quick request from a terminal or a script, with nothing to install", "Smoke-testing a deployed API in Module 13"],
              ["{{swagger-ui|Swagger UI}} and the {{openapi}} document", "Discovering what an API offers, and trying it", "Exploring WeShopAlot; checking ShelfShare's generated contract"],
            ],
            caption: "Four ways to watch and send HTTP traffic",
          },
        },
        "A `.http` file is plain text, so it can be committed, reviewed in a pull request, and shared with a teammate who wants to reproduce a bug. Variables keep it readable:",
        {
          code:
            "@api = http://localhost:5094\n\n### List products, second page, cheapest first\nGET {{api}}/api/product?pageIndex=2&sort=priceAsc\n\n### Sign in with an account you registered (a POST with a JSON body)\nPOST {{api}}/api/account/login\nContent-Type: application/json\n\n{ \"email\": \"you@example.com\", \"password\": \"your-password\" }",
          title: "A .http file for WeShopAlot",
          note: "Requests are separated by lines starting with ###. Visual Studio runs these files natively; VS Code needs the REST Client extension. The port comes from the API's launchSettings.json.",
        },
        "In DevTools, three habits save hours. Filter the Network list to **Fetch/XHR** so only API calls show. Tick **Preserve log** so a redirect or page reload doesn't wipe the evidence. And read the **Console** next to the Network tab: CORS failures (Module 8) appear there as errors while the Network tab shows only a vague failure.",
        {
          callout:
            "In Windows PowerShell 5.1, `curl` is an alias for `Invoke-WebRequest`, which takes different options and formats its output differently. Type `curl.exe` to get the real curl that ships with Windows. PowerShell 7 removed the alias, but `curl.exe` works in both.",
          title: "curl on Windows",
          tone: "warning",
        },
      ],
      takeaway:
        "Keep requests in .http files, watch live traffic in DevTools, use curl for quick checks, and let the OpenAPI document tell you what exists. Never debug the network by guessing.",
      check: [
        {
          q: "An Angular page shows an empty product list. What do you check first in DevTools, and what are the three likely answers?",
          a: "The Network tab, filtered to Fetch/XHR: was the request sent at all, with the URL and query string you expected? Then its status and response body. The usual answers are no request (a client bug), an error status (read the body), or 200 with data the page isn't displaying (a binding or casing bug).",
        },
        {
          q: "Why commit .http files instead of saving requests in a GUI tool?",
          a: "They are text, so they are versioned with the code, reviewed in pull requests, and runnable by anyone who clones the repository, which makes them living documentation of the API.",
        },
      ],
      readings: ["vscode-rest-client", "github-rest-api"],
    },

    // ------------------------------------------------------------------ 8
    {
      topic: "weshopalot-tour",
      blocks: [
        "WeShopAlot is the course's reference system: a complete online store with a product catalog, a basket, accounts, orders, and card payments, built as an ASP.NET Core Web API with an Angular client. The [WeShopAlot page](#/reference) maps it in detail. This tour gives the shape of it, so later modules can zoom in.",
        {
          table: {
            head: ["Project", "What it holds", "Studied in"],
            rows: [
              ["`WeShopAlot.WebAPI`", "Controllers, middleware, error types, caching attribute, Swagger, Program.cs", "Modules 2, 3, 6"],
              ["`WeShopAlot.Data`", "EF Core context, entities, migrations, repositories, query specifications", "Modules 4, 5"],
              ["`WeShopAlot.Infrastructure.Services`", "Orders, Stripe payments, JWT tokens, Redis cache", "Modules 10, 11"],
              ["`WeShopAlot.Shared`", "DTOs and a typed .NET API client", "Module 3"],
              ["`Client`", "The Angular client (written for Angular 15)", "Modules 7–9"],
              ["`WeShopAlot.UI.ClientMVC`, `…ClientWPF`", "Two more clients of the same API", "This module"],
              ["`WeShopAlot.Testing.*`", "Repository, service, and controller tests", "Module 12"],
              ["`Deployment`, `docker-compose.yml`, `Confluence`", "ARM templates, Redis, Azure walkthrough screenshots", "Module 13"],
            ],
            caption: "The WeShopAlot solution, project by project",
          },
        },
        "Its API is small enough to hold in your head: product endpoints for the catalog, basket endpoints that keep a basket in {{redis|Redis}}, account endpoints that issue a {{jwt|JSON Web Token}}, order endpoints that require it, and a payment endpoint plus a {{webhook|webhook}} for Stripe. Run it and Swagger UI opens with all of them listed. Every module will send real requests to it from a `.http` file, so you see each idea working before you build it into ShelfShare.",
        "Read it critically, too. WeShopAlot was built quickly, and it shows. It commits test API keys to git and uses POST where PUT belongs, and until its 2026 upgrade its Angular client called three routes the API did not serve, so checkout never worked. The course treats these as teaching material, not embarrassments: finding and fixing problems in a real codebase is most of what a working developer does.",
        {
          callout:
            "WeShopAlot was written on .NET 8 and Angular 15. In October 2026 it was upgraded to .NET 10 (LTS) and Angular 22, with tests added first and run after every step. Module 13 walks through that upgrade, because keeping software current is part of maintaining it.",
          title: "Versions",
          tone: "tip",
        },
      ],
      takeaway:
        "WeShopAlot is one finished system read from many angles: each module studies the part that matches its topic, copies what works, and fixes what doesn't.",
      check: [
        {
          q: "Which WeShopAlot project would you open to find out how the product list is filtered and sorted?",
          a: "`WeShopAlot.Data`, in its Specifications folder (ProductSpecParams and the product specifications), reached from ProductController in `WeShopAlot.WebAPI`.",
        },
        {
          q: "Why does it matter that WeShopAlot has three clients for a lesson on API design?",
          a: "Any change to an endpoint's shape has to work for all three, which makes the cost of a breaking change concrete and shows why the contract is designed first.",
        },
      ],
      readings: ["weshopalot-repo"],
    },
  ],
};
