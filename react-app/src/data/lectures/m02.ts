import type { LectureNotesDef } from "../types";

// Module 2 — Designing the API contract: lecture notes, one section per lecture topic.
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]], [words](url).

export const M02_NOTES: LectureNotesDef = {
  moduleId: "m02",
  intro:
    "These notes go with the Module 2 lecture and Lab 2. Module 1 showed that the HTTP messages are the contract between a client and an API. This module designs that contract on purpose, before any endpoint code exists: which resources there are, what their URIs look like, which method does what, and which status code answers each outcome. WeShopAlot's real endpoints are the case study, and ShelfShare's design table is the result.",
  sections: [
    // ------------------------------------------------------------------ 1
    {
      topic: "resource-modeling",
      blocks: [
        "Design starts with nouns. Read the requirements and underline the things a client needs to see, create, change, or remove; each one is a candidate {{resource|resource}}. For ShelfShare, a campus book-lending library, the list writes itself: books, authors, genres, members, and loans. For WeShopAlot it is products, brands, types, baskets, orders, and delivery methods.",
        "Each noun then becomes one of a few shapes. A **collection** holds many items (`/api/books`). An **item** is one member of it (`/api/books/42`). A **sub-resource** only makes sense inside a parent (`/api/members/7/loans`, the loans of member 7). And a **singleton** is a resource there is exactly one of for the caller, like WeShopAlot's `/api/account/address`, the signed-in user's address.",
        {
          table: {
            head: ["Shape", "ShelfShare example", "WeShopAlot example", "Typical methods"],
            rows: [
              ["Collection", "`/api/books`", "`/api/product`", "GET (list), POST (create)"],
              ["Item", "`/api/books/42`", "`/api/product/12`", "GET, PUT, PATCH, DELETE"],
              ["Sub-resource", "`/api/members/7/loans`", "(none; orders are found through the token instead)", "GET, POST"],
              ["Singleton", "`/api/members/me`", "`/api/account/address`", "GET, PUT"],
              ["Lookup list", "`/api/genres`", "`/api/product/brands`, `/api/product/types`", "GET only"],
            ],
            caption: "The shapes a resource can take",
          },
        },
        "A resource is not a database table. Some resources map one-to-one to a table (books), some combine several (a book's JSON can include its author's name and its genre), and some have no table at all (WeShopAlot's basket lives in Redis, and a search result exists only for the moment it is computed). Design the resources around what clients do, then let Module 4 decide how to store them.",
        "Relationships are the hard part. A loan connects a member to a copy of a book, so where does it live: under the member, under the book, or on its own? The useful rule is to give it its own collection when it has its own life (a loan has dates, a status, and can be returned), and to offer the nested URI as a convenient view of the same thing. `GET /api/loans?memberId=7` and `GET /api/members/7/loans` can return the same data; `POST /api/loans` creates one.",
        {
          callout:
            "Nest at most one level deep. `/api/members/7/loans` reads well; `/api/libraries/2/members/7/loans/31/renewals` makes every client build long URIs and breaks the moment a loan moves between members. Once an item has its own id, give it a short address of its own: `/api/loans/31`.",
          title: "Keep URIs shallow",
          tone: "tip",
        },
      ],
      takeaway:
        "Find the nouns, decide whether each is a collection, an item, a sub-resource, or a singleton, and give anything with a life of its own its own collection, whatever the database looks like.",
      check: [
        {
          q: "Borrowing a book could be modeled as `POST /api/books/42/borrow` or as `POST /api/loans` with the book and member in the body. Which fits REST better, and why?",
          a: "`POST /api/loans`. Borrowing creates a loan, a real resource with dates and a status that clients will later GET, list, and return. The action URI hides that resource.",
        },
        {
          q: "WeShopAlot's basket is stored in Redis, not SQL Server. Does that change its URI or methods?",
          a: "No. Storage is the server's private business. The client sees a basket resource with an id either way, which is why the API could move it to another store without breaking clients.",
        },
      ],
      readings: ["fielding", "owasp-rest"],
    },

    // ------------------------------------------------------------------ 2
    {
      topic: "uri-design",
      blocks: [
        "A {{uri}} should be predictable enough that a developer who has seen three of your endpoints can guess the fourth. A handful of conventions do most of the work.",
        {
          table: {
            head: ["Convention", "Good", "Avoid"],
            rows: [
              ["Plural nouns for collections", "`/api/books`", "`/api/book`, `/api/getBooks`"],
              ["The id goes in the path", "`/api/books/42`", "`/api/books?id=42`"],
              ["Filters, sorting, and paging go in the query string", "`/api/books?genreId=3&sort=title&page=2`", "`/api/books/genre/3/sorted/title/page/2`"],
              ["Lowercase, with hyphens between words", "`/api/delivery-methods`", "`/api/DeliveryMethods`, `/api/delivery_methods`"],
              ["No verbs; the method is the verb", "`DELETE /api/books/42`", "`POST /api/books/42/delete`"],
              ["No file extensions or trailing slashes", "`/api/books/42`", "`/api/books/42.json`, `/api/books/42/`"],
              ["A stable prefix for the API", "`/api/...`", "API routes mixed in with page routes"],
            ],
            caption: "URI conventions for a REST API",
          },
        },
        "The reasoning behind *id in the path, filters in the {{query-string|query string}}* is worth knowing, because it settles most arguments. The path identifies **which resource**; the query string **refines a request** for it. `/api/books/42` is a different resource from `/api/books/43`, so the id belongs in the path. `/api/books?genreId=3` is the same collection, filtered, so the filter belongs in the query. A missing filter means \"no filter\"; a missing id means \"the collection\", which is a different resource entirely.",
        "WeShopAlot follows the conventions for products and bends them elsewhere. Its routes come from `[Route(\"api/[controller]\")]`, so the controller's class name decides the URI: `ProductController` gives `/api/product` (singular) and `BasketController` gives `/api/basket`. The basket id travels in the query string (`/api/basket?id=abc`), so the URI never names one particular basket. And `order/deliveryMethods` is camelCase. ASP.NET Core matches routes without regard to case, so `/api/Product` and `/api/product` both work, but the documented form should be one consistent style.",
        {
          code:
            "// WeShopAlot today: the class name becomes the URI\n[Route(\"api/[controller]\")]           // BasketController -> /api/basket\npublic class BasketController : BaseApiController\n{\n    [HttpGet]                          // GET /api/basket?id=abc\n    public async Task<ActionResult<CustomerBasket>> GetBasketById(string id) { ... }\n}\n\n// The design this module recommends: say the route explicitly\n[Route(\"api/baskets\")]\npublic class BasketsController : ControllerBase\n{\n    [HttpGet(\"{id}\")]                  // GET /api/baskets/abc\n    public async Task<ActionResult<BasketDto>> GetById(string id) { ... }\n}",
          title: "Token routes vs. explicit routes",
          note: "The [controller] token is convenient, but it ties your public contract to a C# class name. Renaming the class would silently change every URI. An explicit route is part of the design, written where you can see it.",
        },
      ],
      takeaway:
        "Plural nouns, ids in the path, filters in the query string, lowercase with hyphens, and no verbs: predictable URIs are the cheapest documentation an API can have.",
      check: [
        {
          q: "Rewrite WeShopAlot's `DELETE /api/basket?id=abc` to follow the conventions.",
          a: "`DELETE /api/baskets/abc`: a plural collection name, and the id in the path, because it identifies which basket.",
        },
        {
          q: "Is `GET /api/books?author=Martin` or `GET /api/authors/Martin/books` better for \"books by this author\"?",
          a: "Either can be right. If authors are first-class resources with ids, `/api/authors/{id}/books` is a clean sub-resource view. If it is just a search filter on books (especially by name, not id), the query string is better. Many APIs offer both.",
        },
      ],
      readings: ["owasp-rest", "mdn-http"],
    },

    // ------------------------------------------------------------------ 3
    {
      topic: "method-mapping",
      blocks: [
        "With the resources and URIs decided, each operation gets an {{http-method|HTTP method}}. Module 1 gave the methods' promises ({{safe-method|safe}} and {{idempotent|idempotent}}); design is about choosing the method whose promise matches what the operation really does.",
        {
          table: {
            head: ["Operation", "Method and URI", "Success answer"],
            rows: [
              ["List or search books", "`GET /api/books?…`", "200 with the page of results"],
              ["Read one book", "`GET /api/books/42`", "200 with the book"],
              ["Add a book (the server picks the id)", "`POST /api/books`", "201 with a `Location` header"],
              ["Replace a book's details", "`PUT /api/books/42`", "200 with the book, or 204"],
              ["Change one field, such as the shelf location", "`PATCH /api/books/42`", "200 with the book, or 204"],
              ["Remove a book", "`DELETE /api/books/42`", "204"],
              ["Create or replace a resource at an id the client chose", "`PUT /api/baskets/abc`", "201 the first time, then 200 or 204"],
            ],
            caption: "Mapping ShelfShare's operations to methods",
          },
        },
        "**PUT or PATCH?** PUT sends the whole resource and replaces what is there, so anything left out is cleared. PATCH sends only the changes. PUT is simpler to implement and naturally idempotent, which is why most course labs use it. PATCH is kinder to clients editing one field of a large resource, but it needs a format for \"what changed\": either JSON Merge Patch (send the changed properties) or JSON Patch (a list of operations such as `replace /shelf`).",
        "**Who picks the id?** If the server assigns ids (a database identity column), create with POST to the collection. If the client already knows the id, PUT to it. WeShopAlot's basket is the second case: the Angular and WPF clients generate the basket id themselves, so `PUT /api/baskets/{id}` would both create and update it. That is exactly the idempotent operation its `POST /api/basket` currently hides.",
        "Some operations really are actions, and pretending otherwise makes the design worse. Signing in, checking out, sending a password reset, or recalculating shipping don't create a resource a client will later read. The honest design is a POST to a clearly named action URI: `POST /api/account/login`, `POST /api/loans/31/return`. Keep these few, name them with a verb so they stand out, and make sure the operation couldn't be modeled as creating or changing a resource first. Returning a book, for instance, could equally be `PATCH /api/loans/31` with `{ \"returnedAt\": \"…\" }`.",
        {
          callout:
            "If you find yourself writing `POST /api/books/42/update` or `GET /api/books/42/delete`, stop: those are the standard methods wearing a disguise, and the disguise throws away their guarantees.",
          title: "An action endpoint is a last resort",
          tone: "warning",
        },
      ],
      takeaway:
        "Pick the method whose promise matches the operation: POST to create when the server picks the id, PUT to create or replace at a known id, PATCH for partial changes, DELETE to remove, and a POST action only when nothing else is honest.",
      check: [
        {
          q: "A member renews a loan, which pushes its due date out two weeks. Model it two ways, and say which you would choose.",
          a: "`PATCH /api/loans/31` with a new due date, or an action `POST /api/loans/31/renew`. The action is defensible because the server computes the new date and enforces renewal limits, but the PATCH keeps the uniform interface. Either is fine if it is documented and consistent.",
        },
        {
          q: "Why can a client safely retry `PUT /api/baskets/abc` after a timeout but not `POST /api/orders`?",
          a: "PUT replaces the basket with the same contents however many times it runs. Each POST to orders creates a new order, so a retry could create a second order (and a second charge).",
        },
      ],
      readings: ["mdn-methods", "rfc9110"],
    },

    // ------------------------------------------------------------------ 4
    {
      topic: "status-design",
      blocks: [
        "Module 1 listed the {{status-code|status codes}}; this section is about choosing between the neighbors. Every row of your design table needs a success code and the failure codes a client must handle, decided now, so the client and the tests can be written against them.",
        {
          table: {
            head: ["Choice", "Use the first when…", "Use the second when…"],
            rows: [
              ["200 vs. 201", "The request read or changed an existing resource", "A new resource now exists. Add a `Location` header with its URI and usually return it"],
              ["200 vs. 204", "There is something useful to send back (the updated resource)", "There is nothing to say: a DELETE, or a PUT whose result the client already has"],
              ["400 vs. 404", "The request itself is malformed: bad JSON, a missing field, a value of the wrong type", "The resource the **URI** names doesn't exist"],
              ["400 vs. 422", "The request is malformed", "It is well-formed but breaks a rule: a due date in the past, a quantity of zero. ASP.NET Core's default is 400 for both; pick one and be consistent"],
              ["404 vs. 409", "The target doesn't exist", "It exists, but the request clashes with its current state: borrowing a book that is already on loan, adding a duplicate ISBN"],
            ],
            caption: "Choosing between neighboring status codes",
          },
        },
        "One subtle rule prevents a lot of muddled APIs: **404 is about the URI, not the body.** If a client sends `POST /api/loans` with `{ \"bookId\": 999 }` and book 999 doesn't exist, the loans collection was found just fine; the request is what's wrong. Answer 400 or 422 with a message that names the field, not 404, which a client would read as \"the loans endpoint doesn't exist\".",
        "ASP.NET Core makes some of these choices for you. With `[ApiController]` on a controller, a request body that fails validation is answered with **400** and a {{problem-details|Problem Details}} body before your code runs. A {{route-constraint|route constraint}} like `{id:int}` turns `/api/books/abc` into **404**, because no route matches, which surprised many students in Lab 2. Know these defaults so your design table matches what the framework will really do, or override them on purpose.",
        "WeShopAlot gives a few to review. `GET /api/basket?id=abc` for a basket that doesn't exist answers **200** with a new empty basket, a deliberate convenience that saves the client a 404 branch, but it means a mistyped id is never reported. `DELETE /api/basket` returns nothing, which ASP.NET Core sends as **200** with an empty body where 204 is the clearer answer. `POST /api/order` answers **200** with the full database entity, where **201** with a `Location` of `/api/order/{id}` and a DTO is the REST answer. And `GET /api/order/{id}` answers **404** for an order that belongs to someone else, which is exactly right.",
        {
          code:
            "[HttpPost]\npublic async Task<ActionResult<LoanDto>> Create(CreateLoanDto dto)\n{\n    if (!await books.ExistsAsync(dto.BookId))\n        return ValidationProblem(detail: $\"Book {dto.BookId} does not exist.\");   // 400\n    if (await loans.IsOnLoanAsync(dto.BookId))\n        return Conflict(\"That book is already on loan.\");                         // 409\n\n    var loan = await loans.CreateAsync(dto);\n    return CreatedAtAction(nameof(GetById), new { id = loan.Id }, loan);         // 201 + Location\n}",
          title: "Status codes as a decision, in code",
          note: "CreatedAtAction builds the Location header from another action's route, so the URI in the header is always one that really works.",
        },
      ],
      takeaway:
        "Decide each endpoint's success and failure codes in the design: 201 with a Location for creates, 204 when there's nothing to say, 404 only for the URI's own resource, and 409 for a clash with current state.",
      check: [
        {
          q: "`PUT /api/books/42` arrives with a valid body, but the ISBN in it already belongs to book 17. Which status code?",
          a: "409 Conflict. The request is well-formed and book 42 exists; the change clashes with the current state of the data (ISBNs must be unique).",
        },
        {
          q: "Why should a successful POST that creates a book return the `Location` header?",
          a: "It tells the client the new resource's URI, so the client (and anything following the response, like a test) can GET it without guessing how ids map to URIs.",
        },
        {
          q: "WeShopAlot's GET basket returns 200 with an empty basket for an unknown id. Name one benefit and one cost.",
          a: "Benefit: a new visitor's client can always load \"a basket\" with no special case. Cost: a mistyped or expired id looks like an empty basket, so a client bug or a lost basket is never reported.",
        },
      ],
      readings: ["mdn-status", "rfc9110", "rfc9457"],
    },

    // ------------------------------------------------------------------ 5
    {
      topic: "api-review",
      blocks: [
        "Reviewing an API is a skill on its own, and it is mostly about clients. For each finding, ask three questions: **what is wrong**, **why it matters to a client**, and **what the fix costs**, including who has to change. WeShopAlot makes the cost concrete, because every endpoint has two clients: the Angular site and the WPF desktop app.",
        {
          table: {
            head: ["Endpoint today", "What a reviewer notices", "Why a client cares", "The fix"],
            rows: [
              ["`GET /api/product/{id}`", "Clean: noun URI, 404 with a body, a DTO", "Predictable, and documented in the OpenAPI file", "Keep it (plural `products` is the only nit)"],
              ["`GET /api/product/types`", "Declared to return `ProductBrand` items", "The OpenAPI document and generated clients say types are brands", "Return a `ProductType` list"],
              ["`GET /api/basket?id=abc`", "The id is in the query string", "The URI doesn't identify one basket, so caches and logs can't either", "`GET /api/baskets/abc`"],
              ["`POST /api/basket`", "An update sent as POST", "Not idempotent, so a timed-out save can't be safely retried", "`PUT /api/baskets/{id}`"],
              ["`DELETE /api/basket?id=abc`", "200 with an empty body; id in the query", "204 is the standard \"done, nothing to return\", and logs can't tell which basket a URI deleted", "`DELETE /api/baskets/{id}` with 204"],
              ["`POST /api/order`", "200 with the database entity", "No `Location`; the client sees internal fields it shouldn't depend on", "201, a `Location` header, and an order DTO"],
              ["`GET /api/order/deliveryMethods`", "Public lookup data behind sign-in; camelCase segment", "A signed-out visitor can't see shipping options before checkout", "`GET /api/delivery-methods`, no sign-in needed"],
            ],
            caption: "Reviewing WeShopAlot's endpoints",
          },
        },
        "Notice what the fixes have in common: almost every one **changes the contract**. Changing `POST /api/basket` to `PUT /api/baskets/{id}` means the Angular `BasketService` and the WPF `ApiClient` must both change, in step with the API. For the Angular site that is one deployment, because it ships from the same server. For a desktop app installed on people's machines, you can't make everyone update at once, so the old route has to keep working for a while. That is why these fixes are spread across the semester (Module 9 changes the basket), and why Topic 7 is about evolving an API safely.",
        "A review is also about what's right. WeShopAlot's product catalog is a model to copy: typed query parameters, a page-size cap, a consistent paging envelope, and orders scoped to the signed-in user so no one can read anyone else's. Say so in the review. Good reviews keep the good parts from being \"fixed\" later.",
        {
          callout:
            "Write each finding as *what, why it matters, fix, cost*. \"POST /api/basket should be PUT\" is an opinion. \"POST /api/basket replaces the whole basket but isn't idempotent, so the client can't retry a save after a timeout; PUT /api/baskets/{id} fixes it; both clients' basket services change\" is a finding someone can act on.",
          title: "How to write a review finding",
          tone: "tip",
        },
      ],
      takeaway:
        "Review an API from the client's side: what is wrong, why it matters to a client, the fix, and its cost. With more than one client, most fixes are contract changes that need a migration plan.",
      check: [
        {
          q: "Why is a breaking change to WeShopAlot's API harder for the WPF client than for the Angular client?",
          a: "The Angular app is served by the same server, so it updates when the API deploys. A desktop app is installed on users' machines and updates on their schedule, so old versions keep calling the old routes.",
        },
        {
          q: "Write one review finding for `GET /api/order/deliveryMethods` in the what / why / fix / cost form.",
          a: "What: public lookup data requires sign-in. Why: a signed-out shopper can't see shipping costs before deciding to buy. Fix: move it to `GET /api/delivery-methods` without [Authorize]. Cost: both clients' checkout code changes the URL; keep the old route during a transition.",
        },
      ],
      readings: ["weshopalot-repo", "owasp-rest"],
    },

    // ------------------------------------------------------------------ 6
    {
      topic: "openapi",
      blocks: [
        "{{openapi|OpenAPI}} is a standard format, in JSON or YAML, for describing an HTTP API: every path, the methods it accepts, its parameters, the shape of each request and response body, the status codes, and how to authenticate. It is the design table from Lab 2, made precise enough for a machine to read.",
        "Machines are the point. From one OpenAPI document, {{swagger-ui|Swagger UI}} and similar tools draw a page where you can read and try every endpoint; code generators write typed clients for TypeScript, C#, and other languages; test tools check that the API really behaves as documented; and gateways can validate requests before they reach your code. Module 8 generates the Angular models from ShelfShare's document so the TypeScript can't drift from the C#.",
        {
          table: {
            head: ["", "Code-first", "Design-first"],
            rows: [
              ["Source of truth", "The controllers; the document is generated from them", "A hand-written OpenAPI file; code is written (or generated) to match it"],
              ["Strength", "The document can't fall behind the code", "Clients and server can be built in parallel from an agreed contract"],
              ["Weakness", "The document is only as good as your method signatures", "Someone must keep the code and the file in step"],
              ["Used here", "ShelfShare and WeShopAlot", "Large teams and public APIs often start here"],
            ],
            caption: "Two ways to get an OpenAPI document",
          },
        },
        "ASP.NET Core can produce the document two ways. New projects use Microsoft's built-in package: `builder.Services.AddOpenApi()` and `app.MapOpenApi()` serve it at `/openapi/v1.json`, which is the document you opened in Lab 2. WeShopAlot uses the older, popular **Swashbuckle** library, which serves the document at `/swagger/v1/swagger.json` and the Swagger UI page at `/swagger`, with a *Bearer* security scheme so the page has an **Authorize** button for pasting a token.",
        "A generated document is only as honest as the code it reads. If an action returns `ActionResult<BookDto>` and nothing else, the document says it returns a book with 200 and nothing about the 404. Declare the other outcomes with `[ProducesResponseType]`, as WeShopAlot does on `GET /api/product/{id}`. And typos travel: WeShopAlot's `GetProductTypes` declares a list of `ProductBrand`, so its document tells every client that types are brands.",
        {
          code:
            "/// <summary>Get one book by id.</summary>\n[HttpGet(\"{id:int}\")]\n[ProducesResponseType<BookDto>(StatusCodes.Status200OK)]\n[ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]\npublic async Task<ActionResult<BookDto>> GetById(int id) { ... }",
          title: "Telling the document about every outcome",
          note: "The generic form of ProducesResponseType<T> is the newer style; WeShopAlot uses the older typeof(...) form, which does the same thing.",
        },
        {
          callout:
            "WeShopAlot serves Swagger UI in every environment, including production. A public map of every endpoint helps attackers as much as developers. ShelfShare's template only maps the document in Development; keep it that way unless the API is meant to be public.",
          title: "Who should see the document?",
          tone: "warning",
        },
      ],
      takeaway:
        "OpenAPI is the contract in a form machines can read. Generate it from the code, declare every status code an action can return, and treat a wrong document as a bug.",
      check: [
        {
          q: "Your action can return 200, 400, and 404, but the OpenAPI document only lists 200. What is missing, and who is hurt?",
          a: "`[ProducesResponseType]` attributes for 400 and 404. Anyone reading the docs or using a generated client, who won't know to handle those failures.",
        },
        {
          q: "Where do you find WeShopAlot's OpenAPI document and ShelfShare's, and why do the URLs differ?",
          a: "WeShopAlot: `/swagger/v1/swagger.json` (Swashbuckle, with the UI at `/swagger`). ShelfShare: `/openapi/v1.json` (the built-in Microsoft.AspNetCore.OpenApi package that new .NET templates use).",
        },
      ],
      readings: ["openapi-spec", "aspnet-openapi"],
    },

    // ------------------------------------------------------------------ 7
    {
      topic: "versioning",
      blocks: [
        "Once a client depends on an endpoint, changing it has a cost, and the cost depends on the kind of change. The key distinction is between changes an existing client won't notice and changes that break it.",
        {
          table: {
            head: ["Change", "Safe for existing clients?", "Why"],
            rows: [
              ["Add a new endpoint", "Yes", "Old clients don't call it"],
              ["Add an optional query parameter", "Yes", "Old clients don't send it, so they get the default"],
              ["Add a property to a response", "Yes, if clients ignore unknown fields", "Most JSON readers do; check yours"],
              ["Add a **required** request field", "**No**", "Old clients don't send it and start getting 400s"],
              ["Rename or remove a property, route, or parameter", "**No**", "Old clients look for the old name"],
              ["Change a property's type or meaning", "**No**", "A price in cents read as dollars is worse than an error"],
              ["Change a status code", "**No**", "Clients branch on it"],
            ],
            caption: "Additive changes vs. breaking changes",
          },
        },
        "So the first strategy is to **only add**. New fields, new optional parameters, and new endpoints let the API grow while every client keeps working. It relies on clients being *tolerant readers*: they read the fields they need and ignore the rest. Both of WeShopAlot's clients are; System.Text.Json and Angular's HttpClient ignore unknown properties by default.",
        "When a breaking change is truly needed, **run old and new side by side**. Add the new route, move the clients you control, announce a date for the old one (the `Deprecation` and `Sunset` response headers exist for exactly this), watch the logs until nobody calls it, then remove it. WeShopAlot's basket fix would go exactly this way: add `PUT /api/baskets/{id}`, ship the Angular change, release a WPF update, and only then retire `POST /api/basket`.",
        {
          table: {
            head: ["Style", "Example", "Notes"],
            rows: [
              ["URI segment", "`/api/v2/books`", "The most common and the most visible; easy to test in a browser and to route"],
              ["Query string", "`/api/books?api-version=2.0`", "Keeps URIs stable; Microsoft's own Azure APIs use it"],
              ["Header", "`Api-Version: 2`", "Clean URIs, but invisible in a link and easy to forget"],
              ["Media type", "`Accept: application/vnd.shelfshare.v2+json`", "The most \"RESTful\", and the least convenient"],
            ],
            caption: "Ways to version an API when you must",
          },
        },
        "For ASP.NET Core, the `Asp.Versioning.Mvc` package implements all four and adds each version to the OpenAPI document. But version numbers are a last resort, not a starting point: every version you publish is one more you have to keep running. ShelfShare won't need one this semester, which is the goal.",
      ],
      takeaway:
        "Grow an API by adding, keep clients tolerant of extra fields, run old and new routes side by side for any breaking change, and reach for version numbers only when nothing else works.",
      check: [
        {
          q: "You need ShelfShare's book JSON to include the publisher. Is adding `publisher` to the response a breaking change?",
          a: "No, it is additive: tolerant clients ignore it until they are updated to show it. Making `publisher` a required field in POST requests, however, would break existing clients.",
        },
        {
          q: "Outline the steps to rename `GET /api/order/deliveryMethods` to `GET /api/delivery-methods` without breaking anyone.",
          a: "Add the new route alongside the old; update and ship both clients; mark the old route deprecated (headers and docs) with a date; check the logs until no calls arrive; then remove it.",
        },
      ],
      readings: ["openapi-spec", "aspnet-webapi"],
    },

    // ------------------------------------------------------------------ 8
    {
      topic: "dotnet-toolchain",
      blocks: [
        "Lab 2 is the first one that builds .NET code, so it helps to know the pieces. The **.NET SDK** is what you install: the compiler, the `dotnet` command-line tool, the project templates, and the runtime. This course uses **.NET 10**, the current {{lts|long-term-support}} release. Check what you have with `dotnet --list-sdks`.",
        {
          table: {
            head: ["Command", "What it does"],
            rows: [
              ["`dotnet new webapi -n ShelfShare.Api -o api --use-controllers`", "Create a project from a template (here, a controller-based Web API)"],
              ["`dotnet new sln -n ShelfShare` / `dotnet sln add api`", "Create a solution and add a project to it"],
              ["`dotnet build`", "Compile; errors and warnings appear here first"],
              ["`dotnet run --project api`", "Build and start the app"],
              ["`dotnet watch --project api`", "Run, and rebuild automatically as you save files"],
              ["`dotnet add api package <Name>`", "Add a NuGet package reference (Module 4 adds EF Core this way)"],
              ["`dotnet test`", "Run every test project in the solution (Module 12)"],
            ],
            caption: "The dotnet commands you will use most",
          },
        },
        "A **project** (`.csproj`) is one unit that builds into one output, such as the API or a test library. It lists the target framework (`net10.0`) and the NuGet packages it uses. A **solution** groups projects so you can build and open them together. New .NET 10 solutions use the simpler `.slnx` format; WeShopAlot, which is older, still has a classic `.sln` file. Both open in Visual Studio and VS Code. WeShopAlot shows why you split code into projects: the WebAPI, Data, and Infrastructure projects can be tested on their own, and the WPF client reuses the Shared project's DTOs.",
        {
          table: {
            head: ["Editor", "Good at", "In this course"],
            rows: [
              ["Visual Studio 2026 (Windows)", "Full .NET IDE: debugger, test explorer, running several projects at once", "Running WeShopAlot's API, Angular client, and WPF client together"],
              ["VS Code with the C# Dev Kit", "Light and cross-platform; the same editor for C# and TypeScript", "ShelfShare's API and Angular client, side by side"],
            ],
            caption: "Two editors, one toolchain",
          },
        },
        "Two files decide how the API starts. `Program.cs` builds the app: it registers services and lays out the request pipeline (Module 3 reads WeShopAlot's line by line). `Properties/launchSettings.json` holds local run profiles: the URLs and ports, and the `ASPNETCORE_ENVIRONMENT` value, which is `Development` locally. That environment value is why the OpenAPI document appears on your machine but not in production.",
        {
          callout:
            "A `global.json` file in the repository root can pin the SDK version, so every teammate and the build server compile with the same .NET. Create one with `dotnet new globaljson --sdk-version 10.0.100 --roll-forward latestFeature`, which allows newer 10.0 updates but nothing older.",
          title: "Pin the SDK for a team",
          tone: "tip",
        },
      ],
      takeaway:
        "The SDK's `dotnet` command creates, builds, runs, and tests everything; projects build one thing, solutions group them, and launchSettings.json decides how the app runs on your machine.",
      check: [
        {
          q: "You cloned a teammate's repository and `dotnet build` says the SDK version isn't installed. What file caused that, and what are your two options?",
          a: "Their `global.json` pins an SDK you don't have. Install that SDK version, or (if the team agrees) relax the version or roll-forward setting in global.json.",
        },
        {
          q: "Why does Lab 2's OpenAPI document open at http://localhost:PORT/openapi/v1.json on your machine but wouldn't in production?",
          a: "Program.cs only calls `MapOpenApi()` when the environment is Development, and launchSettings.json sets `ASPNETCORE_ENVIRONMENT=Development` for local runs.",
        },
      ],
      readings: ["dotnet-download", "aspnet-webapi"],
    },
  ],
};
