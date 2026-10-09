import type { UnitDef } from "./types";

// The five units and thirteen modules. Edit here; every page updates.
//
// Two threads run through every module:
//   • WeShopAlot — the finished reference system (ASP.NET Core API + Angular
//     client) that each module reads, runs, and critiques.
//   • ShelfShare — the app students build in the labs, from an empty folder
//     (Lab 2) to a tested, deployed full-stack system (Lab 13).

export const UNIT_DEFS: UnitDef[] = [
  // ------------------------------------------------------------------ Unit I
  {
    number: 1,
    title: "The HTTP Contract",
    theme:
      "Before writing either side, learn the conversation between them: HTTP requests and responses, REST conventions, status codes, and the API contract written down as OpenAPI.",
    modules: [
      {
        id: "m01",
        number: 1,
        unit: 1,
        weeks: "1",
        title: "How a client and an API talk",
        subtitle: "HTTP, REST, JSON, and reading a real API",
        overview: [
          "A modern web application is two programs. One runs in the browser and draws the screen; the other runs on a server and owns the data and the rules. They never share memory or code. Everything they do together happens through HTTP requests and responses, so the shape of those messages is the real contract of the system.",
          "This module teaches that contract from the outside, before any code is written. Students read a public API (GitHub's) with .http files, curl, and browser DevTools, and learn to predict a response from a request: which method, which URI, which headers, which status code, what JSON comes back, and why.",
          "The module ends with a tour of WeShopAlot, the course's reference system: an ASP.NET Core Web API with a product catalog, a basket, accounts, orders, and payments, and an Angular client that uses it. Every later module comes back to it.",
        ],
        topics: [
          { id: "client-server", text: "The client–server split: what runs in the browser, what runs on the server, and why the API is a contract" },
          { id: "http-anatomy", text: "Anatomy of an HTTP exchange: method, URI, headers, body, and status" },
          { id: "methods-safety", text: "HTTP methods, safety, and idempotency" },
          { id: "status-codes", text: "Status codes as the API's vocabulary: 2xx, 3xx, 4xx, 5xx, and the dozen that matter most" },
          { id: "rest-resources", text: "REST: resources, representations, statelessness, and the Richardson maturity model" },
          { id: "json", text: "JSON on the wire: shapes, casing, dates, numbers, and null" },
          { id: "traffic-tools", text: "Watching traffic: browser DevTools, .http files, curl, and Swagger UI" },
          { id: "weshopalot-tour", text: "A tour of WeShopAlot: the solution, its projects, and its endpoints" },
        ],
        resources: ["mdn-http", "mdn-methods", "mdn-status", "rfc9110", "fielding", "richardson", "github-rest-api", "vscode-rest-client", "weshopalot-repo"],
        lab: {
          title: "Lab 1 — Reading an API",
          tasks: [
            {
              text: "Set up the course folder and the Lab 1 repository.",
              script: [
                {
                  do: "Make one course folder for every lab in this course, and start in it.",
                  where: "PowerShell",
                  commands: "mkdir $HOME\\ng-dotnet -Force\ncd $HOME\\ng-dotnet\n(Get-Location).Path",
                  expect: "The prompt now ends in \\ng-dotnet, and the last line printed is the folder's full path, such as C:\\Users\\Mike\\ng-dotnet. Paste that line into the \"Your course folder\" box at the top of this lab, and the VS Code labels in every lab become links that open the right folder.",
                  point: "Lab 1 lives in its own lab01 folder. From Lab 2 on, every lab grows the same app, ShelfShare, in a sibling folder, so every lab starts with cd $HOME\\ng-dotnet.",
                },
                {
                  do: "Create the Lab 1 folder and make it a git repository.",
                  where: "PowerShell",
                  commands: "cd $HOME\\ng-dotnet\nmkdir lab01\ncd lab01\ngit init",
                  expect: "Git replies with \"Initialized empty Git repository\" and a path.",
                },
                {
                  do: "Install the REST Client extension so VS Code can send requests from a .http file.",
                  where: "PowerShell",
                  commands: "code --install-extension humao.rest-client",
                  expect: "\"Extension 'humao.rest-client' was successfully installed.\" Visual Studio 2022 and later read .http files without an extension.",
                  point: "A .http file is a request you can read, commit, diff, and review in a pull request. That makes it better course material than clicks in a GUI tool.",
                },
              ],
            },
            {
              text: "Send requests to GitHub's public REST API from a .http file and record what comes back.",
              script: [
                {
                  do: "Open the lab folder in VS Code and create requests.http with your first request: one resource.",
                  where: "VS Code",
                  commands: "@gh = https://api.github.com\n\n### 1. One resource\nGET {{gh}}/repos/dotnet/aspnetcore\nAccept: application/vnd.github+json\nUser-Agent: ng-dotnet-lab01",
                  expect: "Click \"Send Request\" above the GET line. A response panel opens: HTTP/1.1 200 OK, a block of headers, then a large JSON object describing the ASP.NET Core repository.",
                  point: "Find three headers in the response: content-type (what the body is), etag (a fingerprint of this version of the resource), and x-ratelimit-remaining (how many unauthenticated requests you have left this hour).",
                },
                {
                  do: "Add a request for a collection, one page at a time.",
                  where: "VS Code",
                  commands: "### 2. A collection, paged\nGET {{gh}}/orgs/angular/repos?per_page=5&page=2\nAccept: application/vnd.github+json\nUser-Agent: ng-dotnet-lab01",
                  expect: "200 OK with a JSON array of five repositories, and a link header that lists the URLs for the next, previous, first, and last pages.",
                  point: "Filters and paging go in the query string; the path still names the collection. This is one of the three paging styles Module 5 compares.",
                },
                {
                  do: "Ask for something that does not exist.",
                  where: "VS Code",
                  commands: "### 3. Not found\nGET {{gh}}/repos/dotnet/this-repo-does-not-exist\nAccept: application/vnd.github+json\nUser-Agent: ng-dotnet-lab01",
                  expect: "404 Not Found, with a small JSON body that has a message and a documentation_url.",
                  point: "A good API fails in JSON too, so a client can handle errors with the same code it uses for data.",
                },
                {
                  do: "Repeat request 1 as a conditional request: paste the etag value from its response into If-None-Match.",
                  where: "VS Code",
                  commands: "### 4. Conditional GET\nGET {{gh}}/repos/dotnet/aspnetcore\nAccept: application/vnd.github+json\nUser-Agent: ng-dotnet-lab01\nIf-None-Match: \"PASTE-THE-ETAG-HERE\"",
                  expect: "304 Not Modified and no body at all, as long as the repository has not changed since request 1.",
                  point: "The client said \"I already have this version\"; the server said \"you still do.\" That is HTTP caching, and Module 11 adds it to ShelfShare.",
                },
                {
                  do: "Try to create something without signing in.",
                  where: "VS Code",
                  commands: "### 5. A write without credentials\nPOST {{gh}}/repos/dotnet/aspnetcore/issues\nAccept: application/vnd.github+json\nUser-Agent: ng-dotnet-lab01\nContent-Type: application/json\n\n{ \"title\": \"Lab 1 test — please ignore\" }",
                  expect: "A 4xx status (401 or 404) and a JSON message. Nothing is created.",
                  point: "Write down which code you got. Some APIs answer 404 instead of 401 or 403 on purpose, so they don't confirm that a private resource exists. Module 2 comes back to this choice.",
                },
              ],
            },
            {
              text: "Watch the same kind of traffic with curl and with browser DevTools.",
              script: [
                {
                  do: "Send a request with curl and print the headers.",
                  where: "PowerShell",
                  commands: "curl.exe -i https://api.github.com/zen",
                  expect: "A status line, headers, a blank line, and one short sentence of text.",
                  point: "Type curl.exe, not curl. In Windows PowerShell 5.1, curl is an alias for Invoke-WebRequest, which takes different options.",
                },
                {
                  do: "Open https://angular.dev in Chrome or Edge, press F12, choose the Network tab, filter to Fetch/XHR, and reload the page.",
                  where: "Browser",
                  whereUrl: "https://angular.dev",
                  expect: "A list of requests. Click one and look at its Headers, Response, and Timing tabs.",
                  point: "This is how you will debug every Angular-to-API call in this course: the Network tab shows exactly what was sent and what came back.",
                },
              ],
            },
            {
              text: "Answer the Lab 1 questions in notes.md and commit.",
              script: [
                {
                  do: "Create notes.md in the lab folder and answer: (1) Which requests were safe, and which were idempotent? (2) What told you request 2 had more pages? (3) Why did request 4 come back without a body? (4) Which status did request 5 return, and why might an API choose it? (5) Which tool would you use to debug a broken Angular page, and why?",
                  where: "VS Code",
                },
                {
                  do: "Commit the lab.",
                  where: "PowerShell",
                  commands: "cd $HOME\\ng-dotnet\\lab01\ngit add .\ngit commit -m \"Lab 1: reading an API\"",
                  expect: "One commit with requests.http and notes.md.",
                },
              ],
            },
          ],
          deliverable: "The lab01 repository: requests.http (five or more requests, each with a comment that names the status that came back and why) and notes.md with your answers.",
        },
      },
      {
        id: "m02",
        number: 2,
        unit: 1,
        weeks: "2",
        title: "Designing the API contract",
        subtitle: "Resources, URIs, methods, status codes, and OpenAPI, before writing the code",
        overview: [
          "An API is hard to change once clients depend on it, so its design deserves the same care as a database schema. This module designs before it builds: which resources exist, what their URIs look like, which method does what, and which status code answers each outcome.",
          "WeShopAlot gives the module a real design to review. Its product endpoints follow REST conventions closely, while its basket and order endpoints bend them, with IDs in the query string, POST used for updates, and 200 where 201 belongs. Students review it the way a senior developer reviews a pull request: what is wrong, why it matters to a client, and what the fix costs.",
          "Students then design their own app, ShelfShare, a campus book-lending library, and stand up its first endpoints on .NET. The written design and the OpenAPI document the framework generates become the contract that the client and the tests are built against.",
        ],
        topics: [
          { id: "resource-modeling", text: "Modeling resources: nouns, collections, sub-resources, and relationships" },
          { id: "uri-design", text: "URI design: plural nouns, IDs in the path, filters in the query string" },
          { id: "method-mapping", text: "Mapping operations to methods — GET, POST, PUT, PATCH, DELETE — and when an action endpoint is the honest choice" },
          { id: "status-design", text: "Choosing status codes: 200 vs. 201 vs. 204, and 400 vs. 404 vs. 409 vs. 422" },
          { id: "api-review", text: "Reviewing a real API: WeShopAlot's basket and order endpoints against REST conventions" },
          { id: "openapi", text: "OpenAPI: the contract as a document, generated from code and read by tools" },
          { id: "versioning", text: "Evolving an API without breaking clients: additive change, deprecation, and versioning" },
          { id: "dotnet-toolchain", text: "The .NET toolchain: the SDK, the dotnet CLI, solutions and projects, Visual Studio and VS Code" },
        ],
        resources: ["mdn-status", "rfc9110", "openapi-spec", "aspnet-openapi", "owasp-rest", "dotnet-download", "weshopalot-repo"],
        lab: {
          title: "Lab 2 — Design ShelfShare and stand up its API",
          tasks: [
            {
              text: "Create the ShelfShare repository and a .NET solution with a Web API project.",
              script: [
                {
                  do: "Check that the .NET 10 SDK is installed.",
                  where: "PowerShell",
                  commands: "dotnet --list-sdks",
                  expect: "At least one line starting with 10.0. If there is none, install the .NET 10 SDK from https://dotnet.microsoft.com/download and open a new PowerShell window.",
                  point: ".NET 10 is the current long-term-support release. Using an LTS release means the platform under your app is supported for three years.",
                },
                {
                  do: "Create the ShelfShare folder, make it a repository, and add .NET's standard ignore file.",
                  where: "PowerShell",
                  commands: "cd $HOME\\ng-dotnet\nmkdir ShelfShare\ncd ShelfShare\ngit init\ndotnet new gitignore",
                  expect: "A new repository with a .gitignore that already ignores bin/, obj/, and user secrets.",
                },
                {
                  do: "Create a solution and a controller-based Web API project, and add the project to the solution.",
                  where: "PowerShell",
                  commands: "cd $HOME\\ng-dotnet\\ShelfShare\ndotnet new sln -n ShelfShare\ndotnet new webapi -n ShelfShare.Api -o api --use-controllers\ndotnet sln add api",
                  expect: "A ShelfShare.slnx solution file and an api folder holding ShelfShare.Api.csproj, Program.cs, a sample WeatherForecast controller, and ShelfShare.Api.http.",
                  point: "The template defaults to minimal APIs. --use-controllers gives the same style WeShopAlot uses; Module 3 compares the two.",
                },
              ],
            },
            {
              text: "Write the ShelfShare API design before writing endpoint code.",
              script: [
                {
                  do: "Create docs\\api-design.md with a resource table: one row per endpoint, with columns Method, URI, Purpose, Success status, and Failure statuses. Cover books, authors, genres, members, a member's borrow list, and loans.",
                  where: "VS Code",
                  commands: "| Method | URI | Purpose | Success | Failures |\n|---|---|---|---|---|\n| GET | /api/books | List books (filter, sort, page) | 200 | 400 |\n| GET | /api/books/{id} | One book | 200 | 404 |\n| POST | /api/books | Add a book | 201 + Location | 400, 409 |\n| ... | | | | |",
                  expect: "Fifteen to twenty rows, and a short paragraph that names one place you broke a REST convention on purpose and why.",
                  point: "This table is the contract. Lab 3 implements it, Lab 8's Angular services call it, and Lab 12's tests check it.",
                },
              ],
            },
            {
              text: "Replace the sample controller with a first BooksController and test it from the .http file.",
              script: [
                {
                  do: "Delete the template's sample controller and model.",
                  where: "PowerShell",
                  commands: "cd $HOME\\ng-dotnet\\ShelfShare\nRemove-Item api\\Controllers\\WeatherForecastController.cs, api\\WeatherForecast.cs",
                },
                {
                  do: "Create api\\Controllers\\BooksController.cs with a hard-coded list of books.",
                  where: "VS Code",
                  commands: "using Microsoft.AspNetCore.Mvc;\n\nnamespace ShelfShare.Api.Controllers;\n\npublic record BookDto(int Id, string Title, string Author, int Year);\n\n[ApiController]\n[Route(\"api/books\")]\npublic class BooksController : ControllerBase\n{\n    private static readonly List<BookDto> Books =\n    [\n        new(1, \"The Pragmatic Programmer\", \"Andrew Hunt and David Thomas\", 1999),\n        new(2, \"Clean Code\", \"Robert C. Martin\", 2008),\n        new(3, \"Designing Data-Intensive Applications\", \"Martin Kleppmann\", 2017),\n    ];\n\n    [HttpGet]\n    public ActionResult<IEnumerable<BookDto>> GetAll() => Ok(Books);\n\n    [HttpGet(\"{id:int}\")]\n    public ActionResult<BookDto> GetById(int id)\n    {\n        var book = Books.FirstOrDefault(b => b.Id == id);\n        return book is null ? NotFound() : Ok(book);\n    }\n}",
                  point: "[ApiController] turns on behavior you will lean on all semester: automatic 400s for bad input, and Problem Details bodies for errors.",
                },
                {
                  do: "Run the API.",
                  where: "PowerShell",
                  commands: "cd $HOME\\ng-dotnet\\ShelfShare\ndotnet run --project api",
                  expect: "\"Now listening on: http://localhost:5xxx\". Leave it running and note the port.",
                },
                {
                  do: "Open the generated OpenAPI document in the browser: http://localhost:PORT/openapi/v1.json (use your port).",
                  where: "Browser",
                  expect: "A JSON document listing /api/books and /api/books/{id}, with the BookDto schema.",
                  point: "You did not write this document; the framework built it from your code. In Development, MapOpenApi() in Program.cs serves it.",
                },
                {
                  do: "Replace the contents of api\\ShelfShare.Api.http with requests for your endpoints (use your port), and send each one.",
                  where: "VS Code",
                  commands: "@api = http://localhost:5000\n\n### All books\nGET {{api}}/api/books\n\n### One book\nGET {{api}}/api/books/2\n\n### Missing book\nGET {{api}}/api/books/99\n\n### Not a number\nGET {{api}}/api/books/abc",
                  expect: "200 with three books; 200 with one; 404 with a Problem Details JSON body; and 404 again for abc, because the {id:int} route constraint means no route matches at all.",
                  point: "Notice the last one. A route constraint gives 404, not 400. Decide whether that is what your design table says, and fix the table or the code.",
                },
              ],
            },
            {
              text: "Commit the design and the first endpoints.",
              script: [
                {
                  do: "Stop the API with Ctrl+C, then commit.",
                  where: "PowerShell",
                  commands: "cd $HOME\\ng-dotnet\\ShelfShare\ngit add .\ngit commit -m \"Lab 2: API design and first endpoints\"",
                },
              ],
            },
          ],
          deliverable: "The ShelfShare repository with docs/api-design.md, a running Web API with GET /api/books and GET /api/books/{id}, the .http file, and a one-page WeShopAlot API review (three conventions it follows, three it breaks, and the fix for each).",
        },
      },
    ],
  },

  // ----------------------------------------------------------------- Unit II
  {
    number: 2,
    title: "Building the API",
    theme:
      "Build the server half properly: the ASP.NET Core host and pipeline, a real database through EF Core, query features clients actually need, and errors that tell the client exactly what went wrong.",
    modules: [
      {
        id: "m03",
        number: 3,
        unit: 2,
        weeks: "3",
        title: "ASP.NET Core Web API fundamentals",
        subtitle: "The host, dependency injection, routing, model binding, DTOs, configuration, and middleware",
        overview: [
          "Program.cs is the whole application in miniature: it registers services, configures the request pipeline, and maps endpoints. This module takes it apart line by line, first in the ShelfShare template and then in WeShopAlot, where the same parts appear at production scale.",
          "The central idea is dependency injection. Controllers ask for what they need (a repository, a mapper, a logger) and the framework supplies it with the right lifetime. Once students see that, the rest of ASP.NET Core reads as a set of services and a pipeline of middleware.",
          "Students also learn why the shape on the wire (a DTO) should not be the shape in the database (an entity), and how configuration and user secrets keep connection strings and keys out of source code, a lesson WeShopAlot teaches by getting it wrong.",
        ],
        topics: [
          { id: "program-cs", text: "Program.cs: the builder, the service container, the pipeline, and the endpoints" },
          { id: "dependency-injection", text: "Dependency injection and service lifetimes: singleton, scoped, and transient" },
          { id: "controllers-vs-minimal", text: "Controllers vs. minimal APIs: two ways to define endpoints" },
          { id: "routing-binding", text: "Routing and model binding: values from the route, the query string, the body, and headers" },
          { id: "dtos", text: "DTOs: why the wire shape is not the database shape" },
          { id: "configuration", text: "Configuration: appsettings files, environments, environment variables, and user secrets" },
          { id: "middleware", text: "Middleware: the code that runs before and after every endpoint, and why order matters" },
          { id: "weshopalot-startup", text: "Reading WeShopAlot's Program.cs and ApplicationServicesExtensions" },
        ],
        resources: ["aspnet-webapi", "aspnet-minimal", "aspnet-di", "aspnet-config", "aspnet-user-secrets", "aspnet-middleware", "weshopalot-repo"],
        lab: {
          title: "Lab 3 — CRUD through dependency injection",
          tasks: [
            "Move the book list out of the controller into an IBookRepository interface with an in-memory implementation, registered in Program.cs as a singleton.",
            "Implement the full book contract from your design table: GET list, GET by id, POST (201 Created with a Location header via CreatedAtAction), PUT, and DELETE (204 No Content).",
            "Separate DTOs from the stored model: CreateBookDto and UpdateBookDto for input, BookDto for output.",
            "Add one custom middleware that writes the method, path, status code, and elapsed milliseconds of every request to the log, and explain in a comment why it is registered where it is.",
            "Run dotnet user-secrets init in the api folder and move one setting (a fake connection string) from appsettings.json into user secrets; confirm the app still reads it.",
            "Extend ShelfShare.Api.http to cover every endpoint, including at least one request that should fail with each of 400 and 404.",
          ],
          deliverable: "Commit with the repository abstraction, full book CRUD, the logging middleware, the .http file, and a short note on which service lifetime you chose for the repository and why.",
        },
      },
      {
        id: "m04",
        number: 4,
        unit: 2,
        weeks: "4",
        title: "Data with Entity Framework Core",
        subtitle: "DbContext, relationships, migrations, seeding, and database providers",
        overview: [
          "Entity Framework Core maps C# classes to database tables and LINQ queries to SQL. This module replaces ShelfShare's in-memory list with a real database and treats the schema as code: every change is a migration committed to git, and every developer can rebuild the database from scratch.",
          "WeShopAlot shows the pattern at scale: entities for products, brands, types, orders, and users; a migrations folder; JSON seed files; and a switch that runs the same code against SQL Server or PostgreSQL. It also shows a repository layer on top of EF Core, which the module weighs honestly. Sometimes it earns its place; sometimes DbContext already is the repository.",
          "ShelfShare uses SQLite in the labs because it needs no server to install. The same code runs on SQL Server in Module 13.",
        ],
        topics: [
          { id: "dbcontext", text: "DbContext, entities, keys, and conventions" },
          { id: "relationships", text: "Relationships: one-to-many, many-to-many, and navigation properties" },
          { id: "migrations", text: "Migrations: the schema as code, reviewed and versioned like any other change" },
          { id: "seeding", text: "Seeding reference and sample data from JSON files" },
          { id: "providers", text: "Database providers: SQLite, SQL Server, PostgreSQL, and InMemory — and WeShopAlot's provider switch" },
          { id: "repositories", text: "Repositories and unit of work: when the pattern helps, and when EF Core already provides it" },
          { id: "async-queries", text: "Async queries, change tracking vs. no-tracking, and the N+1 problem" },
        ],
        resources: ["efcore", "efcore-migrations", "efcore-querying", "weshopalot-repo"],
        lab: {
          title: "Lab 4 — ShelfShare gets a database",
          tasks: [
            "Add EF Core with the SQLite provider and the design-time tools, and create a ShelfShareContext with Book, Author, and Genre entities (a book has one author and one genre; an author has many books).",
            "Create and apply an initial migration with dotnet ef migrations add and dotnet ef database update, and commit the Migrations folder.",
            "Seed at least 40 books, 15 authors, and 6 genres from JSON files on startup, the way WeShopAlot seeds products.json.",
            "Replace the in-memory repository with an EF Core implementation without changing the controller.",
            "Add a second migration that adds an ISBN column with a unique index, and record what SQL it generated.",
            "Turn on EF Core's SQL logging, request GET /api/books, and find and fix one N+1 query by using Include or a projection.",
          ],
          deliverable: "Commit with the context, both migrations, seed files, and a short note showing the SQL for one query before and after your N+1 fix.",
        },
      },
      {
        id: "m05",
        number: 5,
        unit: 2,
        weeks: "5",
        title: "Querying resources",
        subtitle: "Filtering, searching, sorting, pagination, and projection",
        overview: [
          "A catalog with a few hundred rows cannot be sent to the browser all at once, and a client should not have to filter on its own what the server can filter with an index. This module builds the query features every list screen needs: filters, free-text search, sorting, and pagination, all expressed as query-string parameters.",
          "WeShopAlot's product endpoint is the worked example. One typed ProductSpecParams object binds brandId, typeId, search, sort, pageIndex, and pageSize, caps the page size at 50, and feeds a specification object that builds the query and a matching count. Students read it, then decide which parts to copy into ShelfShare and which to simplify.",
          "The module also compares the three common paging styles (an envelope with a total count, Link headers, and cursors) and shows how projection keeps queries from loading columns nobody asked for.",
        ],
        topics: [
          { id: "query-params", text: "Query-string parameters as a typed object: WeShopAlot's ProductSpecParams" },
          { id: "filtering-search", text: "Filtering and searching: exact matches, ranges, and case-insensitive text" },
          { id: "sorting", text: "Sorting with an allow-list of fields and directions" },
          { id: "pagination", text: "Pagination: page-and-size envelopes, Link headers, and cursors" },
          { id: "specification-pattern", text: "The specification pattern: WeShopAlot's query and count specifications" },
          { id: "projection", text: "Projection and mapping: Select, hand-written mappers, and AutoMapper" },
          { id: "query-performance", text: "Query performance: counting efficiently, indexes, and caps on page size" },
        ],
        resources: ["efcore-querying", "efcore-pagination", "github-rest-api", "weshopalot-repo"],
        lab: {
          title: "Lab 5 — A catalog query that scales",
          tasks: [
            "Add a BookQueryParams class bound with [FromQuery]: genreId, authorId, search, sort (title, year, or author, each ascending or descending), pageIndex, and pageSize capped at 50.",
            "Return a paging envelope { pageIndex, pageSize, count, data } from GET /api/books, with the count computed by the database rather than in memory.",
            "Reject unknown sort values with 400 and a message that lists the allowed ones.",
            "Project straight to BookDto in the query so EF Core selects only the columns the DTO needs.",
            "Add GET /api/genres and GET /api/authors for the filter drop-downs the client will need.",
            "Add .http requests that exercise every parameter, including page sizes of 0, 51, and a page past the end, and record what each returns.",
          ],
          deliverable: "Commit with the query parameters, the envelope, the lookup endpoints, and the .http file; a short note on what your API returns for a page past the end and why.",
        },
      },
      {
        id: "m06",
        number: 6,
        unit: 2,
        weeks: "6",
        title: "Errors, validation, and status codes",
        subtitle: "Problem Details, exception handling, validation, and logging",
        overview: [
          "A client can only handle errors it can recognize. This module gives ShelfShare one error format for every failure, Problem Details (RFC 9457), and makes sure each failure gets the right status code: 400 for bad input, 404 for a missing resource, 409 for a conflict, and 500 only for a real bug.",
          "WeShopAlot gets most of the way there with its own ApiResponse class, an exception middleware that hides stack traces outside Development, and a custom validation response. Its BuggyController, a set of endpoints that fail on purpose, is a ready-made test bench for every status code. Students run it, then rebuild the same guarantees in ShelfShare with the framework's built-in Problem Details support.",
          "Logging is the other half of error handling. The client gets a safe, short message; the log gets the detail an operator needs, without passwords, tokens, or personal data.",
        ],
        topics: [
          { id: "exception-handling", text: "Global exception handling: middleware and IExceptionHandler" },
          { id: "problem-details", text: "Problem Details (RFC 9457): one error shape for every failure" },
          { id: "validation", text: "Validation: data annotations, automatic 400s from [ApiController], and FluentValidation" },
          { id: "not-found-conflict", text: "404, 409, and 422 in practice: missing, conflicting, and well-formed but unacceptable" },
          { id: "buggy-controller", text: "WeShopAlot's BuggyController: a status-code test bench" },
          { id: "logging", text: "Logging with ILogger: levels, structured messages, and what never to log" },
          { id: "dev-vs-prod-errors", text: "Development vs. production error detail" },
        ],
        resources: ["rfc9457", "aspnet-errors", "mdn-status", "weshopalot-repo"],
        lab: {
          title: "Lab 6 — Every failure has a status and a shape",
          tasks: [
            "Turn on AddProblemDetails and a global exception handler so an unhandled exception returns a 500 Problem Details body with no stack trace outside Development.",
            "Add validation to CreateBookDto and UpdateBookDto (required title, year in range, ISBN format) and confirm invalid input returns 400 with a field-by-field errors object.",
            "Return 409 Conflict with a Problem Details body when a POST or PUT would duplicate an ISBN.",
            "Write a status bench in the .http file: one request for each of 200, 201, 204, 400, 404, 409, and 500 (add a development-only endpoint that throws).",
            "Log each handled error once with a structured message, and check that no request body containing a password or token would ever be logged.",
          ],
          deliverable: "Commit with the error handling, validation, and status bench; a table in docs/api-design.md that maps every endpoint's failure cases to a status code.",
        },
      },
    ],
  },

  // ---------------------------------------------------------------- Unit III
  {
    number: 3,
    title: "The Angular Client",
    theme:
      "Build the browser half: an Angular app with standalone components, signals, and routing, then connect it to the real API with typed services, CORS, and the development proxy.",
    modules: [
      {
        id: "m07",
        number: 7,
        unit: 3,
        weeks: "7",
        title: "Angular foundations",
        subtitle: "The CLI, standalone components, templates, signals, routing, and services",
        overview: [
          "Angular is a complete framework for single-page applications: components for the screen, a router for navigation, dependency injection for services, and a CLI that builds, serves, and tests the app. This module builds a working ShelfShare client with hard-coded data, so the framework is learned before the network is added.",
          "The course teaches current Angular: standalone components, built-in control flow (@if, @for), and signals for state. WeShopAlot's client was written for Angular 15 with NgModules and RxJS everywhere, so reading it alongside ShelfShare shows students what changed, and gives them the vocabulary to maintain the older style they will meet in real codebases.",
        ],
        topics: [
          { id: "angular-cli", text: "The Angular CLI and workspace: ng new, ng serve, ng build, and ng generate" },
          { id: "standalone-components", text: "Standalone components, templates, and bindings" },
          { id: "control-flow", text: "Built-in control flow: @if, @for with track, and @switch" },
          { id: "signals", text: "Signals: signal, computed, and effect" },
          { id: "routing", text: "Routing: routes, route parameters, lazy loading, and component input binding" },
          { id: "angular-services", text: "Services and dependency injection in Angular: inject() and providedIn" },
          { id: "weshopalot-client", text: "Reading WeShopAlot's Angular 15 client: NgModules, feature folders, and what has changed since" },
        ],
        resources: ["angular-docs", "angular-components", "angular-signals", "angular-routing", "angular-tutorial", "weshopalot-repo"],
        lab: {
          title: "Lab 7 — The ShelfShare client, offline",
          tasks: [
            "In the ShelfShare repository, run npm install -g @angular/cli, then ng new client with routing and SCSS, and run it with ng serve.",
            "Create a catalog page that lists books from a hard-coded array in a BookService, using @for with track and an empty-state @if.",
            "Add a book detail route (/books/:id) that reads the id with component input binding and shows one book or a not-found message.",
            "Hold the selected genre filter in a signal and the filtered list in a computed signal; filter the hard-coded list on the client.",
            "Add the fleet hamburger menu (View / Links) and a build timestamp in the footer.",
          ],
          deliverable: "Commit with the client folder: catalog and detail pages, a signal-based filter, routing, and a screenshot of each page in docs/.",
        },
      },
      {
        id: "m08",
        number: 8,
        unit: 3,
        weeks: "8",
        title: "Calling the API from Angular",
        subtitle: "HttpClient, typed models, CORS, the dev proxy, and loading and error states",
        overview: [
          "This module connects the two halves. Angular's HttpClient sends the requests; typed interfaces describe what comes back; signals hold the results the template displays. The catalog's filters, sort order, and page become query-string parameters, the same ones Lab 5 built on the server, and are kept in the page URL so a filtered view can be bookmarked and shared.",
          "The first real call usually fails, and the failure teaches CORS. The browser blocks a page on one origin from reading responses from another unless the API says it may. Students fix it two ways: a CORS policy on the API (as WeShopAlot does for localhost:4200) and Angular's development proxy, which makes the question disappear during development.",
          "Week 8 is the midterm checkpoint: the ShelfShare API from Unit II and the Angular catalog working end to end.",
        ],
        topics: [
          { id: "http-client", text: "HttpClient: provideHttpClient, typed requests, and observables" },
          { id: "typed-models", text: "Typed models that mirror the API's DTOs, and generating them from OpenAPI" },
          { id: "rxjs-and-signals", text: "RxJS where it still helps, and signals where they are simpler: toSignal and httpResource" },
          { id: "url-state", text: "Filters, sort, and paging as query parameters, and as page URL state" },
          { id: "cors", text: "CORS: what the browser blocks, why, and how the API allows an origin" },
          { id: "dev-proxy", text: "The Angular dev proxy and environment configuration" },
          { id: "loading-errors", text: "Loading, empty, and error states, driven by the API's Problem Details" },
        ],
        resources: ["angular-http", "rxjs", "mdn-cors", "aspnet-cors", "angular-proxy", "weshopalot-repo"],
        lab: {
          title: "Lab 8 — The catalog, live",
          tasks: [
            "Replace the hard-coded BookService with one that calls GET /api/books through HttpClient, using interfaces that match your BookDto and paging envelope.",
            "Call the API directly from http://localhost:4200, read the CORS error in the browser console, then add a named CORS policy on the API that allows only that origin.",
            "Add proxy.conf.json so ng serve forwards /api to the API, switch the service to relative URLs, and explain in a comment when you would use each fix.",
            "Wire genre and author drop-downs, a search box, sort, and paging to query parameters, and keep them in the page URL so reload and Back work.",
            "Show a loading indicator, an empty state, and an error message that uses the title from the API's Problem Details body.",
          ],
          deliverable: "Commit with the live catalog; a short screen recording or set of screenshots showing filtering, paging, and an error state.",
        },
        checkpoint:
          "Midterm checkpoint: the ShelfShare API (books, authors, and genres with EF Core, querying, validation, and Problem Details) and the Angular catalog working end to end, demonstrated live, with docs/api-design.md updated to match the code and a one-page reflection on what changed from the Lab 2 design and why.",
      },
    ],
  },

  // ----------------------------------------------------------------- Unit IV
  {
    number: 4,
    title: "State, Security, and Integration",
    theme:
      "Make the app usable and safe: forms and client state, sign-in with tokens, authorization on both sides, caching, and a third-party integration that calls back into your API.",
    modules: [
      {
        id: "m09",
        number: 9,
        unit: 4,
        weeks: "9",
        title: "Forms and state",
        subtitle: "Reactive forms, client state with signals, and server-side state",
        overview: [
          "Reading data is half of an app; changing it is the other half. This module adds forms with client-side validation that mirrors the server's rules, and shows how to display the server's 400 response field by field when the two disagree.",
          "It also separates the two kinds of state an app keeps. Client state (what the user has picked but not yet submitted) lives in a signal-based service. Server state lives behind the API. WeShopAlot's basket sits on the boundary: the browser keeps a basket id, and the API keeps the basket in Redis. Students trace that design, fix its POST-for-update endpoint, and build ShelfShare's borrow list the same way.",
        ],
        topics: [
          { id: "reactive-forms", text: "Reactive forms: FormGroup, FormControl, and typed forms" },
          { id: "form-validation", text: "Validation on both sides: mirroring server rules and showing the server's field errors" },
          { id: "client-state", text: "Client state with signal-based services" },
          { id: "server-state", text: "Server-side state: WeShopAlot's Redis basket and the basket id in the browser" },
          { id: "idempotent-updates", text: "Idempotent updates: replacing WeShopAlot's POST /api/basket with PUT /api/baskets/{id}" },
          { id: "optimistic-ui", text: "Optimistic updates and rolling back when the server says no" },
        ],
        resources: ["angular-forms", "angular-signals", "mdn-methods", "redis", "weshopalot-repo"],
        lab: {
          title: "Lab 9 — Adding books and building a borrow list",
          tasks: [
            "Build an add/edit book form with typed reactive forms and validators that mirror CreateBookDto, and show the API's field errors when it returns 400.",
            "Create a BorrowListService that holds the member's selected books in a signal, with computed totals and a limit of five books.",
            "Add PUT /api/borrow-lists/{id}, GET, and DELETE endpoints that store the list on the server (in the database or Redis), and persist the list id in the browser.",
            "Make adding a book to the list optimistic: update the UI first and roll back with a message if the PUT fails.",
            "In WeShopAlot, write the change you would make to BasketController to replace POST-for-update with PUT /api/baskets/{id}, and list what would break in its Angular client.",
          ],
          deliverable: "Commit with the book form, borrow list (client and API), and a short WeShopAlot basket review.",
        },
      },
      {
        id: "m10",
        number: 10,
        unit: 4,
        weeks: "10",
        title: "Authentication and authorization",
        subtitle: "Password hashing, JWTs, [Authorize], interceptors, guards, and keeping secrets out of git",
        overview: [
          "Authentication answers who is calling; authorization answers what they may do. This module adds both to ShelfShare: members register and sign in, the API issues a signed JSON Web Token, and protected endpoints require it.",
          "On the client, a functional HTTP interceptor attaches the token to every API call, and a route guard keeps signed-out users away from member pages. The module is honest about the hard part, which is where to keep the token in the browser, and compares memory, localStorage, and HttpOnly cookies, including the backend-for-frontend pattern.",
          "WeShopAlot is the security case study. It hashes passwords with BCrypt and validates tokens properly, but it also commits its token signing key and Stripe keys to git, and comments out an [Authorize] attribute. Until its 2026 upgrade it also issued tokens without the issuer its own validation required, so every protected endpoint refused signed-in users, a bug only an end-to-end test catches. Students write it up as a security review.",
        ],
        topics: [
          { id: "authn-authz", text: "Authentication vs. authorization, and where each happens" },
          { id: "password-hashing", text: "Storing passwords: hashing, salting, and work factors (BCrypt and ASP.NET Core Identity)" },
          { id: "jwt", text: "JSON Web Tokens: header, claims, signature, and expiry" },
          { id: "aspnet-jwt-bearer", text: "JWT bearer authentication, [Authorize], roles, and policies in ASP.NET Core" },
          { id: "angular-interceptors", text: "Angular functional interceptors: attaching tokens and handling 401" },
          { id: "route-guards", text: "Route guards: protecting pages in the client, and why that is not security" },
          { id: "token-storage", text: "Where the token lives: memory, localStorage, or an HttpOnly cookie, and the BFF pattern" },
          { id: "secrets-review", text: "WeShopAlot security review: committed secrets, a token without its issuer, and a missing [Authorize]" },
        ],
        resources: ["rfc7519", "aspnet-jwt", "aspnet-authz", "aspnet-user-secrets", "angular-interceptors", "angular-security", "owasp-api-top10", "owasp-rest", "weshopalot-repo"],
        lab: {
          title: "Lab 10 — Members sign in",
          tasks: [
            "Add a Member entity, POST /api/account/register and /api/account/login, with passwords hashed and the token signing key read from user secrets (never appsettings.json).",
            "Issue a JWT with the member's id, email, and role and a 60-minute expiry; protect borrow-list and loan endpoints with [Authorize] and book editing with a Librarian role.",
            "Add a functional interceptor that attaches the token and sends the user to the sign-in page on 401.",
            "Add a route guard for member pages, then show that the API still refuses the call when the guard is bypassed in DevTools.",
            "Write a one-page security review of WeShopAlot: the committed secrets and how to rotate them, the commented-out [Authorize], the missing-issuer bug and the test that caught it, and one OWASP API Top 10 risk you checked.",
          ],
          deliverable: "Commit with registration, sign-in, protected endpoints, interceptor, and guard; the WeShopAlot security review; and a git log check showing no secret was ever committed to ShelfShare.",
        },
      },
      {
        id: "m11",
        number: 11,
        unit: 4,
        weeks: "11",
        title: "Caching and integrations",
        subtitle: "Server and HTTP caching, payments, webhooks, and idempotency keys",
        overview: [
          "Most API traffic asks the same questions again and again. Caching answers them faster, in two different places: on the server, where WeShopAlot's [Cached] attribute stores whole responses in Redis, and in HTTP itself, where Cache-Control and ETag let the browser skip a download entirely. The module builds both in ShelfShare and confronts the hard part: knowing when cached data is out of date.",
          "The second half connects the app to a service it does not control. WeShopAlot takes card payments through Stripe: the API creates a PaymentIntent, the Angular client confirms it, and Stripe calls back to a webhook endpoint when the payment succeeds or fails. Students trace that flow, then add a small paid feature to ShelfShare in Stripe's test mode, with a verified webhook and idempotency keys so a retried request never charges twice.",
        ],
        topics: [
          { id: "server-caching", text: "Server-side caching: WeShopAlot's [Cached] attribute, Redis, output caching, and HybridCache" },
          { id: "http-caching", text: "HTTP caching: Cache-Control, ETag, If-None-Match, and 304" },
          { id: "cache-invalidation", text: "Invalidation: time-based expiry, tags, and evicting on write" },
          { id: "payments", text: "Payments with Stripe: PaymentIntents, client confirmation, and test mode" },
          { id: "webhooks", text: "Webhooks: verifying signatures, responding fast, and handling retries" },
          { id: "idempotency-keys", text: "Idempotency keys: making POST safe to retry" },
        ],
        resources: ["mdn-caching", "aspnet-caching", "aspnet-hybridcache", "redis", "stripe-paymentintents", "stripe-webhooks", "stripe-testing", "stripe-idempotency", "weshopalot-repo"],
        lab: {
          title: "Lab 11 — Faster, and connected",
          tasks: [
            "Add ETag and Cache-Control headers to GET /api/books/{id}, return 304 for a matching If-None-Match, and prove it from the .http file and the Network tab.",
            "Add output caching to the catalog and lookup endpoints, and evict the catalog cache when a book is added, edited, or deleted.",
            "Measure the catalog endpoint before and after caching (median of 50 requests) and record the numbers.",
            "Add a late-fee payment in Stripe test mode: an endpoint that creates a PaymentIntent with an idempotency key, and an Angular page that confirms it with a test card.",
            "Add a webhook endpoint that verifies the Stripe signature, marks the fee paid, and returns quickly; test it with the Stripe CLI's listen and trigger commands.",
          ],
          deliverable: "Commit with caching, the payment flow, and the webhook; a short results table for the caching measurements.",
        },
      },
    ],
  },

  // ------------------------------------------------------------------ Unit V
  {
    number: 5,
    title: "Ship It",
    theme:
      "Prove it works and put it where people can use it: tests on both sides, continuous integration, containers, cloud hosting, configuration, and staying current. Then deliver a team project.",
    modules: [
      {
        id: "m12",
        number: 12,
        unit: 5,
        weeks: "12",
        title: "Testing the full stack",
        subtitle: "Unit, integration, component, and end-to-end tests, and running them in CI",
        overview: [
          "A full-stack app can break in three places: inside the API, inside the client, and in the contract between them. This module tests all three. API integration tests start the whole application in memory with WebApplicationFactory and send it real HTTP requests; Angular tests check components and services with the HTTP layer mocked; and a few end-to-end tests drive a real browser through the main flows.",
          "WeShopAlot is the worked example: its Testing.WebApis project runs the whole API in memory with WebApplicationFactory, an in-memory database, and in-memory stand-ins for Redis, and its 15 tests found real bugs during the 2026 upgrade (see the WeShopAlot page). Students extend that suite before writing ShelfShare's. The module ends with every test running in GitHub Actions on every push, so a broken build is caught before anyone merges it.",
        ],
        topics: [
          { id: "test-pyramid", text: "What to test where: the test pyramid for a full-stack app" },
          { id: "api-unit-tests", text: "Unit tests with xUnit: services, validators, and mappers" },
          { id: "integration-tests", text: "API integration tests with WebApplicationFactory and a test database" },
          { id: "angular-tests", text: "Angular component and service tests, and HttpTestingController" },
          { id: "e2e-tests", text: "End-to-end tests with Playwright: the few flows that matter most" },
          { id: "contract-tests", text: "Keeping client and API in sync: the OpenAPI document as a contract" },
          { id: "ci", text: "Continuous integration: build and test both halves in GitHub Actions" },
        ],
        resources: ["xunit", "aspnet-integration-tests", "angular-testing", "angular-http-testing", "playwright", "github-actions-dotnet"],
        lab: {
          title: "Lab 12 — Prove it",
          tasks: [
            "Add an xUnit test project with unit tests for book validation and the sort allow-list.",
            "Add integration tests with WebApplicationFactory that cover the status bench from Lab 6 (200, 201, 204, 400, 401, 404, 409) against a test SQLite database.",
            "Add Angular tests for the catalog component and BookService, using HttpTestingController to check the exact query string sent.",
            "Add two Playwright end-to-end tests: browse and filter the catalog, and sign in and add a book to the borrow list.",
            "Add a GitHub Actions workflow that builds and tests the API and the client on every push and pull request.",
          ],
          deliverable: "Commit with all test projects and the workflow; a green Actions run linked in the README.",
        },
      },
      {
        id: "m13",
        number: 13,
        unit: 5,
        weeks: "13–15",
        title: "Deploying, staying current, and final projects",
        subtitle: "Containers, cloud hosting, production configuration, upgrades, and team delivery",
        overview: [
          "An app that only runs on one laptop is not finished. This module packages the API in a container, runs it with its database and Redis through docker compose, and deploys the API and the Angular client to the cloud with secrets held outside the code.",
          "WeShopAlot brings real deployment material to read: ARM templates for App Service, Function Apps, Key Vault, and storage; step-by-step screenshots of creating each Azure resource; and a fallback controller that lets the API serve the Angular app itself. Students compare that single-host design with hosting the client separately.",
          "Staying current is part of shipping. WeShopAlot was written on Angular 15 and .NET 8, so the module walks through its upgrade to current releases: ng update one major version at a time, retargeting to the current .NET LTS, updating packages, and running the tests at each step. Weeks 14 and 15 are final team projects and demos.",
        ],
        topics: [
          { id: "production-config", text: "Configuration and secrets in production: environment variables and Azure Key Vault" },
          { id: "containers", text: "Containerizing the API: a Dockerfile, and docker compose with a database and Redis" },
          { id: "hosting-options", text: "Hosting options: API on App Service or in a container; Angular on Static Web Apps or served by the API" },
          { id: "infrastructure-as-code", text: "Infrastructure as code: WeShopAlot's ARM templates, and Bicep" },
          { id: "cicd", text: "CI/CD with GitHub Actions: build, test, and deploy on merge" },
          { id: "observability", text: "Health checks, logs, and Application Insights in production" },
          { id: "keeping-current", text: "Keeping current: the .NET LTS cadence, ng update, and the WeShopAlot upgrade" },
        ],
        resources: ["docker-docs", "azure-app-service", "azure-static-web-apps", "azure-key-vault", "github-actions-dotnet", "angular-update", "dotnet-download", "weshopalot-repo"],
        lab: {
          title: "Lab 13 — ShelfShare goes live",
          tasks: [
            "Write a Dockerfile for the API and a docker-compose.yml that runs it with SQL Server (or PostgreSQL) and Redis; switch the provider with configuration only.",
            "Deploy the API to Azure App Service (or a container host) with the connection string and signing key in app settings or Key Vault, never in the image.",
            "Deploy the Angular client to Azure Static Web Apps or GitHub Pages with the production API URL, and update the API's CORS policy to allow only that origin.",
            "Extend the GitHub Actions workflow to deploy on merge to main after the tests pass.",
            "Add a /health endpoint and confirm the deployed app reports healthy.",
          ],
          deliverable: "The deployed URLs in the README, the workflow run that deployed them, and a one-page runbook: how to deploy, roll back, and rotate a secret.",
        },
        checkpoint:
          "Final team project: a full-stack application with an Angular client and an ASP.NET Core API, built by a team of three or four, deployed, tested in CI, and secured, presented in a 10-minute demo with a written report (see Projects).",
      },
    ],
  },
];
