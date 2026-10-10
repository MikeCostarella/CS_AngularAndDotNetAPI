import type { PageSection } from "./types";

// The WeShopAlot page: a guided map of the course's reference system.
// Kept as data so the page and the search index render from one source.
// Inside prose, [[resource-id]] links a reading and `code` renders as code.

export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  route: string;
  auth: "—" | "Signed in" | "Stripe signature";
  does: string;
  /** What the endpoint teaches, good or bad. */
  note: string;
  /** Module number where it is studied. */
  module: number;
}

export const REFERENCE_LEDE =
  "WeShopAlot is a complete e-commerce system: an ASP.NET Core Web API with a product catalog, a basket, accounts, orders, and card payments, and an Angular client that uses it. Every module reads part of it. Most of it shows how to do things well, and a few parts show what to avoid, which is just as useful.";

export const ENDPOINTS_SECTION = "endpoints";

export const ENDPOINTS: Endpoint[] = [
  { method: "GET", route: "/api/product?brandId&typeId&search&sort&pageIndex&pageSize", auth: "—", does: "Paged, filtered, sorted product list", note: "Typed query parameters, page size capped at 50, a { pageIndex, pageSize, count, data } envelope, and a 10-minute Redis cache.", module: 5 },
  { method: "GET", route: "/api/product/{id}", auth: "—", does: "One product", note: "Clean 404 with an ApiResponse body. Singular resource name (/product, not /products).", module: 2 },
  { method: "GET", route: "/api/product/brands", auth: "—", does: "Brand lookup list", note: "Lookup data for filter drop-downs; cached.", module: 5 },
  { method: "GET", route: "/api/product/types", auth: "—", does: "Type lookup list", note: "Its return type is declared as brands, a copy-paste slip that the OpenAPI document repeats.", module: 2 },
  { method: "GET", route: "/api/basket?id={basketId}", auth: "—", does: "Get a basket (or a new empty one)", note: "The id belongs in the path: /api/baskets/{id}.", module: 2 },
  { method: "POST", route: "/api/basket", auth: "—", does: "Create or replace a basket", note: "An update sent as POST is not idempotent; PUT /api/baskets/{id} is the honest method.", module: 9 },
  { method: "DELETE", route: "/api/basket?id={basketId}", auth: "—", does: "Delete a basket", note: "Should return 204 No Content, with the id in the path.", module: 2 },
  { method: "POST", route: "/api/account/register", auth: "—", does: "Create an account and return a token", note: "BCrypt password hashing; 400 with a message when the email is taken.", module: 10 },
  { method: "POST", route: "/api/account/login", auth: "—", does: "Sign in and return a JWT", note: "401 for a wrong email or password, with no hint about which one was wrong.", module: 10 },
  { method: "GET", route: "/api/account", auth: "—", does: "Current user and a fresh token", note: "[Authorize] is commented out, and it returns null when nobody is signed in.", module: 10 },
  { method: "GET", route: "/api/account/emailexists?email=", auth: "—", does: "Check whether an email is registered", note: "Useful for a sign-up form, and also an account-enumeration risk worth discussing.", module: 10 },
  { method: "GET", route: "/api/account/address", auth: "Signed in", does: "The user's saved address", note: "Used to read the user from ClaimsPrincipal.Current, which ASP.NET Core never sets, and had no AutoMapper map for Address; both fixed in the October 2026 upgrade.", module: 10 },
  { method: "PUT", route: "/api/account/address", auth: "Signed in", does: "Replace the saved address", note: "Correct method. Fixed in the upgrade along with GET.", module: 10 },
  { method: "POST", route: "/api/order", auth: "Signed in", does: "Create an order from a basket", note: "Returns 200 and the database entity; REST expects 201 Created, a Location header, and a DTO.", module: 2 },
  { method: "GET", route: "/api/order", auth: "Signed in", does: "The signed-in user's orders", note: "Scoped to the user from the token: the right defense against reading someone else's orders.", module: 10 },
  { method: "GET", route: "/api/order/{id}", auth: "Signed in", does: "One of the user's orders", note: "404 for an order that belongs to someone else, which hides that it exists.", module: 10 },
  { method: "GET", route: "/api/order/deliveryMethods", auth: "Signed in", does: "Delivery method lookup", note: "Lookup data behind [Authorize] for no clear reason.", module: 2 },
  { method: "POST", route: "/api/payment/{basketId}", auth: "Signed in", does: "Create or update a Stripe PaymentIntent", note: "The server creates the intent; the client confirms it with Stripe.", module: 11 },
  { method: "POST", route: "/api/payment/webhook", auth: "Stripe signature", does: "Stripe calls back with payment results", note: "Verifies the Stripe-Signature header before trusting the event.", module: 11 },
  { method: "GET", route: "/api/buggy/notfound · /badrequest · /servererror · /testauth", auth: "—", does: "Endpoints that fail on purpose", note: "A ready-made status-code test bench for the client's error handling.", module: 6 },
];

export const REFERENCE_SECTIONS: PageSection[] = [
  {
    id: "projects",
    heading: "What is in the solution",
    items: [
      "`WeShopAlot.WebAPI`: controllers, middleware, error types, the [Cached] attribute, Swagger, and Program.cs",
      "`WeShopAlot.Data`: the EF Core context, entities, migrations, repositories, and the specification classes behind every query",
      "`WeShopAlot.Infrastructure.Services`: orders, payments (Stripe), JWT tokens, the Redis response cache, and the unit of work",
      "`WeShopAlot.Shared`: DTOs shared by the API and its .NET clients, and a typed API client",
      "`WeShopAlot.Data.ConsoleApp`: loads the JSON seed files (products, brands, types, delivery methods)",
      "`Client`: the Angular client (written for Angular 15) with shop, basket, checkout, account, and orders features",
      "`WeShopAlot.UI.ClientWPF`: a desktop client with the same features as the Angular app, the clearest proof that the API is the product",
      "`WeShopAlot.Testing.*`: repository, service, and Web API test projects with shared base classes",
      "`Deployment`: ARM templates for App Service, Function App, Key Vault, and Storage; `docker-compose.yml` runs Redis",
      "`Confluence`: architecture and data-model diagrams, and step-by-step screenshots of creating each Azure resource",
    ],
  },
  {
    id: "request-path",
    heading: "One request, end to end",
    paras: [
      "Follow `GET /api/product?typeId=2&sort=priceAsc&pageIndex=1` through the system. The exception middleware wraps the whole request. The [Cached] attribute builds a key from the path and the sorted query string and returns the Redis copy if one exists. Otherwise the controller binds the query string into `ProductSpecParams`, builds a query specification and a count specification, and asks the repository for both. EF Core turns the specification into SQL. AutoMapper maps the entities to `ProductToReturnDto`, including a full picture URL, and the controller wraps the page in a `Pagination<T>` envelope. On the way out, the attribute stores the response in Redis for ten minutes.",
    ],
  },
  {
    id: ENDPOINTS_SECTION,
    heading: "Endpoints",
    paras: [
      "Every route the API exposes, what it does, and what it teaches. The Module column says where it is studied.",
    ],
  },
  {
    id: "review-findings",
    heading: "Known issues the course uses",
    items: [
      "Secrets in git: the Stripe test keys and the JWT signing key are in committed appsettings files. They need to be rotated and moved to user secrets (Module 10).",
      "REST conventions: basket IDs in the query string, POST used for updates, 200 instead of 201 on create, and singular resource names (Modules 2 and 9).",
      "A commented-out [Authorize] on the current-user endpoint (Module 10).",
      "Caching only on the server: no ETag or Cache-Control headers, so browsers download unchanged products again (Module 11).",
      "CORS is hard-coded to https://localhost:4200, so a deployed client needs a configuration change (Modules 8 and 13).",
      "A custom error type (ApiResponse) instead of the standard Problem Details format (Module 6).",
    ],
  },
  {
    id: "versions",
    heading: "Versions and the upgrade",
    paras: [
      "WeShopAlot was written on .NET 8 with an Angular 15 client. In October 2026 it was upgraded to .NET 10 (the current LTS) and Angular 22: Angular one major version at a time with its migrations, the client moved to the esbuild application builder and Vitest, and every NuGet and npm package moved to its current release. Module 13 uses that upgrade as its worked example. See [[angular-update]] and [[dotnet-download]].",
      "The upgrade added tests first and let them find the bugs: 15 API integration tests (WebApplicationFactory, an in-memory database, and in-memory stand-ins for Redis) and 10 Angular unit tests (HttpTestingController). Those tests turned up real defects that had been hiding in the 2024 code, listed below.",
    ],
  },
  {
    id: "upgrade-bugs",
    heading: "Bugs the upgrade's tests found",
    items: [
      "Contract drift: the Angular client called `/api/orders`, `/api/orders/deliveryMethods`, and `/api/payments/{id}`, but the API serves `/api/order`, `/api/order/deliveryMethods`, and `/api/payment/{id}`, so checkout could never complete (Modules 2, 8, and 12).",
      "Tokens without an issuer: the API validates the `iss` claim, but the token service never set it, so every signed-in request to a protected endpoint was refused with 401 (Module 10).",
      "`ClaimsPrincipal.Current` in the address endpoints, which ASP.NET Core never sets, plus a missing AutoMapper map between `Address` and `AddressDto` (Modules 3 and 10).",
      "Money: the shipping charge was cast to whole dollars before converting to cents, so $5.99 shipping was charged as $5.00 (Module 11).",
      "Logging: the payment webhook's log messages dropped the payment and order ids because the message templates had no placeholders (Module 6).",
      "Package changes the upgrade had to absorb: Stripe's API removed `payment_method_types` (now `AllowedPaymentMethodTypes`), Swashbuckle 10 moved to Microsoft.OpenApi 2, and AutoMapper 15+ needs a license key (Modules 11 and 13).",
    ],
  },
  {
    id: "run-it",
    heading: "Running it",
    paras: [
      "The Tools & Setup page has the steps. In short: Docker for Redis, user secrets for the database choice and connection string, run the WebAPI project (Swagger opens), then `ng serve` in the Client folder. See [[weshopalot-repo]].",
    ],
  },
];
