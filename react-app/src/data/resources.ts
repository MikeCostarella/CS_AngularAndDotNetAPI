import type { Link } from "./types";

// Readings and references. Modules cite these by id.

export interface Resource extends Link {
  id: string;
  group:
    | "Reference app"
    | "HTTP and REST"
    | "ASP.NET Core and EF Core"
    | "Angular"
    | "Services and deployment"
    | "Security";
}

export const RESOURCES: Resource[] = [
  // Reference app
  { id: "weshopalot-repo", group: "Reference app", label: "WeShopAlot source (GitHub: MikeCostarella/WeShopAlot)", url: "https://github.com/MikeCostarella/WeShopAlot", note: "The course's reference system: ASP.NET Core Web API, EF Core, Redis, JWT, Stripe, and an Angular client. See the WeShopAlot page for a guided map." },

  // HTTP and REST
  { id: "mdn-http", group: "HTTP and REST", label: "An overview of HTTP (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", note: "Clients and servers, requests and responses, and what a message is made of." },
  { id: "mdn-methods", group: "HTTP and REST", label: "HTTP request methods (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods", note: "Every method, with whether it is safe, idempotent, and cacheable." },
  { id: "mdn-status", group: "HTTP and REST", label: "HTTP response status codes (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status", note: "Every status code in one place, with plain-English descriptions." },
  { id: "mdn-cors", group: "HTTP and REST", label: "Cross-Origin Resource Sharing (CORS) (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS", note: "Why the browser blocks cross-origin reads, and the headers that allow them." },
  { id: "mdn-caching", group: "HTTP and REST", label: "HTTP caching (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching", note: "Cache-Control, freshness, validation with ETag, and 304 Not Modified." },
  { id: "rfc9110", group: "HTTP and REST", label: "RFC 9110: HTTP Semantics", url: "https://www.rfc-editor.org/rfc/rfc9110", note: "The standard itself: methods, status codes, and headers. Sections 9 and 15 are the ones to read." },
  { id: "rfc9457", group: "HTTP and REST", label: "RFC 9457: Problem Details for HTTP APIs", url: "https://www.rfc-editor.org/rfc/rfc9457", note: "The standard JSON shape for API errors that ASP.NET Core produces." },
  { id: "fielding", group: "HTTP and REST", label: "Representational State Transfer (REST), Chapter 5 of Roy Fielding's dissertation (2000)", url: "https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm", note: "Where the term REST comes from, and the constraints it actually names." },
  { id: "richardson", group: "HTTP and REST", label: "Richardson Maturity Model (Martin Fowler)", url: "https://martinfowler.com/articles/richardsonMaturityModel.html", note: "A four-level way to describe how RESTful an API is." },
  { id: "openapi-spec", group: "HTTP and REST", label: "OpenAPI Specification", url: "https://spec.openapis.org/oas/latest.html", note: "The format of the machine-readable API contract that ASP.NET Core generates." },
  { id: "github-rest-api", group: "HTTP and REST", label: "GitHub REST API documentation", url: "https://docs.github.com/en/rest", note: "A large, well-documented public API used in Lab 1: pagination with Link headers, conditional requests, and rate limits." },
  { id: "vscode-rest-client", group: "HTTP and REST", label: "REST Client extension for VS Code", url: "https://marketplace.visualstudio.com/items?itemName=humao.rest-client", note: "Send requests from .http files in VS Code. Visual Studio reads the same files without an extension." },

  // ASP.NET Core and EF Core
  { id: "dotnet-download", group: "ASP.NET Core and EF Core", label: "Download .NET", url: "https://dotnet.microsoft.com/download", note: "The SDK installers, and which release is the current long-term-support (LTS) version." },
  { id: "aspnet-webapi", group: "ASP.NET Core and EF Core", label: "Create web APIs with ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/web-api/", note: "Controllers, [ApiController], return types, and model binding." },
  { id: "aspnet-minimal", group: "ASP.NET Core and EF Core", label: "Minimal APIs overview", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis", note: "The lambda-based alternative to controllers, compared in Module 3." },
  { id: "aspnet-di", group: "ASP.NET Core and EF Core", label: "Dependency injection in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection", note: "Registering services and choosing lifetimes." },
  { id: "aspnet-config", group: "ASP.NET Core and EF Core", label: "Configuration in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/", note: "appsettings files, environments, environment variables, and the order they override each other." },
  { id: "aspnet-user-secrets", group: "ASP.NET Core and EF Core", label: "Safe storage of app secrets in development", url: "https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets", note: "dotnet user-secrets: keeping keys and connection strings out of the repository." },
  { id: "aspnet-middleware", group: "ASP.NET Core and EF Core", label: "ASP.NET Core middleware", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/", note: "The request pipeline, and why the order of Use… calls matters." },
  { id: "aspnet-openapi", group: "ASP.NET Core and EF Core", label: "OpenAPI support in ASP.NET Core API apps", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/overview", note: "Generating the OpenAPI document with Microsoft.AspNetCore.OpenApi." },
  { id: "aspnet-errors", group: "ASP.NET Core and EF Core", label: "Handle errors in ASP.NET Core APIs", url: "https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors", note: "Problem Details, exception handlers, and validation responses." },
  { id: "aspnet-cors", group: "ASP.NET Core and EF Core", label: "Enable Cross-Origin Requests (CORS) in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/security/cors", note: "Named policies, allowed origins, and where UseCors goes in the pipeline." },
  { id: "aspnet-caching", group: "ASP.NET Core and EF Core", label: "Overview of caching in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/performance/caching/overview", note: "In-memory, distributed, response, and output caching compared." },
  { id: "aspnet-hybridcache", group: "ASP.NET Core and EF Core", label: "HybridCache library in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid", note: "A two-level cache (memory plus Redis) with stampede protection and tag-based eviction." },
  { id: "aspnet-integration-tests", group: "ASP.NET Core and EF Core", label: "Integration tests in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests", note: "WebApplicationFactory: running the whole API in memory under test." },
  { id: "efcore", group: "ASP.NET Core and EF Core", label: "Entity Framework Core documentation", url: "https://learn.microsoft.com/en-us/ef/core/", note: "DbContext, modeling, providers, and performance." },
  { id: "efcore-migrations", group: "ASP.NET Core and EF Core", label: "EF Core migrations overview", url: "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/", note: "Creating, applying, and reviewing schema changes as code." },
  { id: "efcore-querying", group: "ASP.NET Core and EF Core", label: "Querying data with EF Core", url: "https://learn.microsoft.com/en-us/ef/core/querying/", note: "LINQ to SQL translation, loading related data, and tracking." },
  { id: "efcore-pagination", group: "ASP.NET Core and EF Core", label: "Pagination in EF Core", url: "https://learn.microsoft.com/en-us/ef/core/querying/pagination", note: "Offset paging vs. keyset (cursor) paging, and why large offsets get slow." },
  { id: "xunit", group: "ASP.NET Core and EF Core", label: "xUnit.net", url: "https://xunit.net/", note: "The test framework used for ShelfShare's and WeShopAlot's .NET tests." },

  // Angular
  { id: "angular-docs", group: "Angular", label: "Angular documentation (angular.dev)", url: "https://angular.dev/", note: "The official guides and API reference for current Angular." },
  { id: "angular-tutorial", group: "Angular", label: "Angular tutorials", url: "https://angular.dev/tutorials", note: "Official step-by-step introductions, useful before Lab 7." },
  { id: "angular-components", group: "Angular", label: "Angular components guide", url: "https://angular.dev/guide/components", note: "Standalone components, inputs, outputs, and templates." },
  { id: "angular-signals", group: "Angular", label: "Angular signals guide", url: "https://angular.dev/guide/signals", note: "signal, computed, effect, and how they drive change detection." },
  { id: "angular-routing", group: "Angular", label: "Angular routing guide", url: "https://angular.dev/guide/routing", note: "Routes, parameters, lazy loading, and guards." },
  { id: "angular-http", group: "Angular", label: "Angular HTTP client guide", url: "https://angular.dev/guide/http", note: "provideHttpClient, making requests, and handling errors." },
  { id: "angular-interceptors", group: "Angular", label: "Angular HTTP interceptors", url: "https://angular.dev/guide/http/interceptors", note: "Functional interceptors for tokens, logging, and error handling." },
  { id: "angular-http-testing", group: "Angular", label: "Testing requests with HttpTestingController", url: "https://angular.dev/guide/http/testing", note: "Asserting exactly which requests a service sends, without a server." },
  { id: "angular-forms", group: "Angular", label: "Angular reactive forms", url: "https://angular.dev/guide/forms/reactive-forms", note: "FormGroup, FormControl, typed forms, and validators." },
  { id: "angular-testing", group: "Angular", label: "Angular testing guide", url: "https://angular.dev/guide/testing", note: "Component and service tests with the CLI's test runner." },
  { id: "angular-proxy", group: "Angular", label: "Proxying to a backend server (ng serve)", url: "https://angular.dev/tools/cli/serve#proxying-to-a-backend-server", note: "proxy.conf.json: forwarding /api to the API during development." },
  { id: "angular-update", group: "Angular", label: "Angular update guide", url: "https://angular.dev/update-guide", note: "Version-by-version upgrade steps, used for the WeShopAlot upgrade in Module 13." },
  { id: "rxjs", group: "Angular", label: "RxJS documentation", url: "https://rxjs.dev/", note: "Observables and operators, which HttpClient returns and older Angular code uses everywhere." },

  // Services and deployment
  { id: "redis", group: "Services and deployment", label: "Redis documentation", url: "https://redis.io/docs/latest/", note: "The in-memory store behind WeShopAlot's basket and response cache." },
  { id: "stripe-paymentintents", group: "Services and deployment", label: "The Payment Intents API (Stripe)", url: "https://docs.stripe.com/payments/payment-intents", note: "The payment flow WeShopAlot uses: create on the server, confirm on the client." },
  { id: "stripe-webhooks", group: "Services and deployment", label: "Receive Stripe events in your webhook endpoint", url: "https://docs.stripe.com/webhooks", note: "Signature verification, retries, and the Stripe CLI for local testing." },
  { id: "stripe-testing", group: "Services and deployment", label: "Testing (Stripe)", url: "https://docs.stripe.com/testing", note: "Test-mode keys and test card numbers: no real money in the labs." },
  { id: "stripe-idempotency", group: "Services and deployment", label: "Idempotent requests (Stripe API)", url: "https://docs.stripe.com/api/idempotent_requests", note: "How an Idempotency-Key header makes a retried POST safe." },
  { id: "docker-docs", group: "Services and deployment", label: "Docker: Get started", url: "https://docs.docker.com/get-started/", note: "Images, containers, Dockerfiles, and docker compose." },
  { id: "azure-app-service", group: "Services and deployment", label: "Azure App Service documentation", url: "https://learn.microsoft.com/en-us/azure/app-service/", note: "Hosting the API, with app settings for configuration." },
  { id: "azure-static-web-apps", group: "Services and deployment", label: "Azure Static Web Apps documentation", url: "https://learn.microsoft.com/en-us/azure/static-web-apps/", note: "Hosting the Angular client, with GitHub Actions deployment built in." },
  { id: "azure-key-vault", group: "Services and deployment", label: "Azure Key Vault overview", url: "https://learn.microsoft.com/en-us/azure/key-vault/general/overview", note: "Keeping production secrets out of code, images, and app settings." },
  { id: "github-actions-dotnet", group: "Services and deployment", label: "Building and testing .NET with GitHub Actions", url: "https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-net", note: "A starting workflow for the CI and CD labs." },
  { id: "playwright", group: "Services and deployment", label: "Playwright documentation", url: "https://playwright.dev/", note: "Browser end-to-end tests for the main user flows." },

  // Security
  { id: "rfc7519", group: "Security", label: "RFC 7519: JSON Web Token (JWT)", url: "https://www.rfc-editor.org/rfc/rfc7519", note: "The token format: header, claims, and signature." },
  { id: "aspnet-jwt", group: "Security", label: "Configure JWT bearer authentication in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication", note: "Validating tokens: issuer, audience, lifetime, and signing key." },
  { id: "aspnet-authz", group: "Security", label: "Introduction to authorization in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction", note: "[Authorize], roles, claims, and policies." },
  { id: "angular-security", group: "Security", label: "Angular security guide", url: "https://angular.dev/best-practices/security", note: "Cross-site scripting protection, sanitization, and what Angular does and does not do for you." },
  { id: "owasp-api-top10", group: "Security", label: "OWASP API Security Top 10 (2023)", url: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/", note: "The most common API vulnerabilities, starting with broken object-level authorization." },
  { id: "owasp-rest", group: "Security", label: "OWASP REST Security Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html", note: "HTTPS, access control, input validation, and error handling for REST APIs." },
];

export const RESOURCE_BY_ID: Record<string, Resource> = Object.fromEntries(
  RESOURCES.map((r) => [r.id, r]),
);

export const RESOURCE_GROUPS = [
  "Reference app",
  "HTTP and REST",
  "ASP.NET Core and EF Core",
  "Angular",
  "Services and deployment",
  "Security",
] as const;

/** Matches a [[resource-id]] reference inside page prose. */
export const REF_PATTERN = /\[\[([a-z0-9-]+)\]\]/g;

/**
 * Replace [[resource-id]] references with the resource's plain label.
 * Used by the search index; the UI uses components/RichText.tsx instead so
 * the reference renders as a real link.
 */
export function resolveRefs(text: string): string {
  return text
    .replace(REF_PATTERN, (whole, id: string) => RESOURCE_BY_ID[id]?.label ?? whole)
    .replace(/`([^`]+)`/g, "$1");
}
