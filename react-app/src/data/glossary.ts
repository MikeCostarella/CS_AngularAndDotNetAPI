// The course glossary: one plain-English definition per term.
//
// Lecture notes mark a term with {{term-id}} (shows the term's name) or
// {{term-id|the words to show}}. The marked words get a dotted underline; hover,
// focus, or tap shows the definition, with links to the Glossary page and to
// the term's reading. Mark the first use of a term in each notes section, not
// every use.
//
// Definitions may use `code` and **bold**. Keep them to two or three sentences.

export interface GlossaryTerm {
  /** Stable id used in {{id}} markup and in #/glossary?s=term-<id>. */
  id: string;
  /** The term as it is listed and shown by default. */
  term: string;
  /** Other names people use for the same thing. */
  aka?: string[];
  def: string;
  /** A resource id (data/resources.ts) for "Learn more". */
  more?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "api",
    term: "API",
    aka: ["web API", "application programming interface"],
    def: "A defined way for one program to ask another for data or actions. In this course it means a **web API**: a server program that answers HTTP requests with JSON.",
    more: "mdn-http",
  },
  {
    id: "client",
    term: "Client",
    def: "The program that sends a request and uses the response. Here it is usually the Angular app in the browser, but a test, a mobile app, curl, or another server can be a client too.",
  },
  {
    id: "server",
    term: "Server",
    def: "The program that receives requests, applies the rules, talks to the database, and sends responses. In this course it is an ASP.NET Core Web API.",
  },
  {
    id: "spa",
    term: "Single-page application (SPA)",
    aka: ["SPA"],
    def: "A web app that loads one HTML page and then redraws the screen with JavaScript, fetching data from an API instead of loading new pages. Angular builds SPAs.",
  },
  {
    id: "http",
    term: "HTTP",
    aka: ["HTTPS"],
    def: "The request-and-response protocol of the web. The client sends a method, a URI, headers, and sometimes a body; the server answers with a status code, headers, and usually a body. HTTPS is the same protocol over an encrypted connection.",
    more: "mdn-http",
  },
  {
    id: "http-method",
    term: "HTTP method",
    aka: ["verb", "GET", "POST", "PUT", "PATCH", "DELETE"],
    def: "The first word of a request, saying what the client wants done: `GET` to read, `POST` to create or to run an action, `PUT` to replace, `PATCH` to change part of something, and `DELETE` to remove.",
    more: "mdn-methods",
  },
  {
    id: "safe-method",
    term: "Safe method",
    def: "A method that only reads and never changes anything on the server, such as `GET` and `HEAD`. Browsers, caches, and crawlers assume safe methods can be sent freely.",
    more: "mdn-methods",
  },
  {
    id: "idempotent",
    term: "Idempotent",
    def: "Having the same effect whether a request is sent once or many times. `GET`, `PUT`, and `DELETE` are idempotent; `POST` is not, which is why retrying a `POST` can create duplicates.",
    more: "mdn-methods",
  },
  {
    id: "uri",
    term: "URI",
    aka: ["URL", "endpoint address"],
    def: "The address of a resource, such as `/api/books/42`. The path names the resource; the query string after `?` refines the request with filters, sorting, or paging.",
  },
  {
    id: "query-string",
    term: "Query string",
    def: "The part of a URI after the `?`, made of `name=value` pairs joined by `&`. APIs use it for optional refinements of a GET, such as `?genreId=3&page=2`.",
  },
  {
    id: "header",
    term: "Header",
    aka: ["HTTP header"],
    def: "A `Name: value` line of metadata on a request or response, such as `Content-Type`, `Authorization`, or `ETag`. Headers describe the message; the body carries the data.",
  },
  {
    id: "status-code",
    term: "Status code",
    def: "The three-digit number at the start of every response. 2xx means success, 3xx redirection or not modified, 4xx a problem with the request, and 5xx a problem on the server.",
    more: "mdn-status",
  },
  {
    id: "json",
    term: "JSON",
    def: "JavaScript Object Notation: the text format most web APIs use for request and response bodies. It has objects, arrays, strings, numbers, true, false, and null, and no dates, so dates travel as ISO 8601 strings.",
  },
  {
    id: "content-type",
    term: "Content-Type",
    def: "The header that says what format a body is in, such as `application/json`. A server uses it to decide how to read a request body, and a client to decide how to read a response.",
  },
  {
    id: "rest",
    term: "REST",
    aka: ["RESTful"],
    def: "Representational State Transfer: a style of API design built on resources with URIs, standard HTTP methods, stateless requests, and representations such as JSON. Most \"REST APIs\" follow some of its rules, not all of them.",
    more: "fielding",
  },
  {
    id: "resource",
    term: "Resource",
    def: "A thing an API exposes, named by a noun and a URI: a book (`/api/books/42`), a collection (`/api/books`), or a sub-resource (`/api/members/7/loans`).",
  },
  {
    id: "representation",
    term: "Representation",
    def: "The form a resource takes in a message, usually a JSON document. The same book can have a short representation in a list and a longer one on its own.",
  },
  {
    id: "stateless",
    term: "Stateless",
    def: "Each request carries everything the server needs to handle it, such as the token and the IDs, so the server keeps no memory of the conversation between requests. Statelessness is what lets an API run on many servers at once.",
  },
  {
    id: "richardson-maturity",
    term: "Richardson maturity model",
    def: "A four-level scale of how RESTful an API is: one endpoint for everything (level 0), resources (1), proper HTTP methods and status codes (2), and hypermedia links (3). Most good APIs sit at level 2.",
    more: "richardson",
  },
  {
    id: "hypermedia",
    term: "Hypermedia (HATEOAS)",
    aka: ["HATEOAS"],
    def: "Responses that include links to related resources and allowed next actions, so a client can navigate the API without hard-coding URIs. Rare in practice, though paging links are a common partial use.",
  },
  {
    id: "pagination",
    term: "Pagination",
    aka: ["paging"],
    def: "Returning a long list one page at a time. APIs signal pages with an envelope (`pageIndex`, `pageSize`, `count`), with `Link` headers, or with a cursor that marks where the next page starts.",
    more: "efcore-pagination",
  },
  {
    id: "rate-limit",
    term: "Rate limit",
    def: "A cap on how many requests a client may send in a period. APIs report it in headers (GitHub uses `x-ratelimit-remaining`) and answer 429 Too Many Requests when it is exceeded.",
  },
  {
    id: "etag",
    term: "ETag",
    def: "A response header that fingerprints one version of a resource. A client sends it back in `If-None-Match`; if nothing changed, the server answers 304 Not Modified with no body.",
    more: "mdn-caching",
  },
  {
    id: "conditional-request",
    term: "Conditional request",
    def: "A request that asks the server to act only if a condition holds, such as `If-None-Match` (send it only if it changed) or `If-Match` (update it only if nobody else did first).",
    more: "mdn-caching",
  },
  {
    id: "cache-control",
    term: "Cache-Control",
    def: "The response header that tells browsers and proxies whether and for how long they may reuse a response, for example `Cache-Control: public, max-age=60`.",
    more: "mdn-caching",
  },
  {
    id: "cors",
    term: "CORS",
    aka: ["cross-origin resource sharing"],
    def: "The browser rule that a page from one origin may not read responses from another origin unless that server allows it with `Access-Control-Allow-*` headers. It protects users, not servers: curl and other servers ignore it.",
    more: "mdn-cors",
  },
  {
    id: "origin",
    term: "Origin",
    def: "The scheme, host, and port of a page, such as `http://localhost:4200`. Two URLs have the same origin only if all three match, so the Angular dev server and the API are different origins.",
    more: "mdn-cors",
  },
  {
    id: "openapi",
    term: "OpenAPI",
    aka: ["OpenAPI document", "Swagger document"],
    def: "A standard JSON or YAML description of an API: its paths, methods, parameters, request and response shapes, and status codes. ASP.NET Core can generate it from code, and tools use it to build docs, clients, and tests.",
    more: "openapi-spec",
  },
  {
    id: "swagger-ui",
    term: "Swagger UI",
    aka: ["Swagger"],
    def: "A web page that reads an OpenAPI document and lets you browse and call every endpoint. WeShopAlot opens it on startup.",
  },
  {
    id: "http-file",
    term: ".http file",
    def: "A plain-text file of HTTP requests that Visual Studio, and VS Code with the REST Client extension, can send with one click. It can be committed and reviewed like code.",
    more: "vscode-rest-client",
  },
  {
    id: "curl",
    term: "curl",
    def: "A command-line program that sends HTTP requests and prints the response; `-i` includes the headers. In Windows PowerShell, type `curl.exe`, because `curl` may be an alias for a different command.",
  },
  {
    id: "devtools",
    term: "Browser DevTools",
    aka: ["Network tab"],
    def: "The developer tools built into Chrome, Edge, and Firefox (F12). The Network tab lists every request a page makes, with its headers, body, status, and timing.",
  },
  {
    id: "dto",
    term: "DTO",
    aka: ["data transfer object"],
    def: "A class that defines exactly what crosses the wire for one purpose, such as `CreateBookDto` or `BookDto`. Keeping DTOs separate from database entities stops internal fields from leaking and lets each side change independently.",
  },
  {
    id: "dependency-injection",
    term: "Dependency injection",
    aka: ["DI"],
    def: "A design where a class receives the services it needs, usually through its constructor, instead of creating them. ASP.NET Core and Angular both have a built-in container that supplies them.",
    more: "aspnet-di",
  },
  {
    id: "middleware",
    term: "Middleware",
    def: "A step in ASP.NET Core's request pipeline that can act before and after the rest of the pipeline, such as exception handling, CORS, authentication, or logging. They run in the order they are added.",
    more: "aspnet-middleware",
  },
  {
    id: "controller",
    term: "Controller",
    def: "A class whose public methods (actions) handle requests for one resource, with routes set by attributes such as `[Route(\"api/books\")]` and `[HttpGet]`. WeShopAlot is built from controllers.",
    more: "aspnet-webapi",
  },
  {
    id: "minimal-api",
    term: "Minimal API",
    def: "ASP.NET Core's lighter way to define endpoints as lambdas in Program.cs, such as `app.MapGet(\"/api/books\", ...)`. Same pipeline and features as controllers, less ceremony.",
    more: "aspnet-minimal",
  },
  {
    id: "model-binding",
    term: "Model binding",
    def: "How ASP.NET Core fills action parameters from the request: route values, the query string, headers, and the JSON body.",
    more: "aspnet-webapi",
  },
  {
    id: "route-constraint",
    term: "Route constraint",
    def: "A rule on a route parameter, such as `{id:int}`. A request that breaks it matches no route at all, so it gets 404 rather than 400.",
  },
  {
    id: "problem-details",
    term: "Problem Details",
    def: "The standard JSON shape for API errors (RFC 9457), with `type`, `title`, `status`, `detail`, and optional extra fields such as validation `errors`. ASP.NET Core can produce it for every failure.",
    more: "rfc9457",
  },
  {
    id: "ef-core",
    term: "Entity Framework Core",
    aka: ["EF Core"],
    def: "Microsoft's object-relational mapper for .NET. It maps classes to tables, turns LINQ queries into SQL, and tracks changes to save.",
    more: "efcore",
  },
  {
    id: "migration",
    term: "Migration",
    def: "A generated C# file that changes the database schema one step, such as adding a table or a column. Migrations are committed to git, so every database can be rebuilt to the same shape.",
    more: "efcore-migrations",
  },
  {
    id: "angular-component",
    term: "Component (Angular)",
    def: "A TypeScript class with a template and styles that draws one part of the screen. Current Angular components are standalone: each declares its own imports.",
    more: "angular-components",
  },
  {
    id: "signal",
    term: "Signal",
    def: "An Angular value container that notifies whatever reads it when it changes. `signal()` holds state, `computed()` derives from other signals, and templates update automatically.",
    more: "angular-signals",
  },
  {
    id: "observable",
    term: "Observable",
    def: "An RxJS stream of values over time. Angular's HttpClient returns observables, which do nothing until something subscribes.",
    more: "rxjs",
  },
  {
    id: "interceptor",
    term: "Interceptor",
    def: "Code that sees every HTTP request or response in Angular's HttpClient, used to add tokens, show loading indicators, or handle errors in one place.",
    more: "angular-interceptors",
  },
  {
    id: "route-guard",
    term: "Route guard",
    def: "An Angular function that decides whether navigation to a page may proceed, such as sending signed-out users to sign in. It improves the experience but is not security: the API must still check.",
    more: "angular-routing",
  },
  {
    id: "dev-proxy",
    term: "Dev proxy",
    def: "A setting for `ng serve` (proxy.conf.json) that forwards `/api` requests from the Angular dev server to the API, so the browser sees one origin and CORS never comes up during development.",
    more: "angular-proxy",
  },
  {
    id: "authentication",
    term: "Authentication",
    aka: ["authn"],
    def: "Establishing who is calling, for example by checking a password once and then a signed token on every request. A failure is 401 Unauthorized.",
  },
  {
    id: "authorization",
    term: "Authorization",
    aka: ["authz"],
    def: "Deciding what an authenticated caller may do, by role, claim, or ownership of the record. A failure is 403 Forbidden, or 404 when the API should not reveal that the record exists.",
    more: "aspnet-authz",
  },
  {
    id: "jwt",
    term: "JSON Web Token (JWT)",
    aka: ["JWT", "bearer token"],
    def: "A compact, signed token holding claims about a user, sent in the `Authorization: Bearer ...` header. The signature proves the server issued it; the contents are readable by anyone, so it must not hold secrets.",
    more: "rfc7519",
  },
  {
    id: "claim",
    term: "Claim",
    def: "One statement inside a token about the user, such as their id, email, or role. ASP.NET Core exposes claims through `User` in a controller.",
  },
  {
    id: "user-secrets",
    term: "User secrets",
    def: "A .NET development feature (`dotnet user-secrets`) that stores keys and connection strings in a file in your user profile, outside the repository, where configuration still finds them.",
    more: "aspnet-user-secrets",
  },
  {
    id: "webhook",
    term: "Webhook",
    def: "An HTTP request a third-party service sends to your API when something happens, such as a payment succeeding. Your endpoint must verify the sender's signature and handle the same event arriving twice.",
    more: "stripe-webhooks",
  },
  {
    id: "idempotency-key",
    term: "Idempotency key",
    def: "A unique value a client sends with a non-idempotent request (usually in an `Idempotency-Key` header) so the server can recognize a retry and return the first result instead of acting twice.",
    more: "stripe-idempotency",
  },
  {
    id: "redis",
    term: "Redis",
    def: "A fast in-memory key-value store. WeShopAlot uses it for shopping baskets and cached API responses.",
    more: "redis",
  },
  {
    id: "lts",
    term: "LTS",
    aka: ["long-term support"],
    def: "A long-term-support release, supported with fixes for longer than the releases around it. .NET LTS releases come every other November and are supported for three years.",
    more: "dotnet-download",
  },
];

export const TERM_BY_ID: Record<string, GlossaryTerm> = Object.fromEntries(GLOSSARY.map((t) => [t.id, t]));

/** Matches {{term-id}} and {{term-id|shown words}}. */
export const TERM_PATTERN = /\{\{([a-z0-9-]+)(?:\|([^}]+))?\}\}/;

/** Glossary order: alphabetical by term. */
export const GLOSSARY_SORTED = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
