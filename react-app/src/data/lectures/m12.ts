import type { LectureNotesDef } from "../types";

// Module 12 — Testing the full stack: lecture notes, one section per lecture topic.
// Written so far: test-pyramid and integration-tests (WeShopAlot's three .NET tiers, and the SQL
// Server tier built on the database seeder from Module 4). The other topics show "notes coming".
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]], [words](url).

export const M12_NOTES: LectureNotesDef = {
  moduleId: "m12",
  intro:
    "These notes go with the Module 12 lecture and Lab 12. A full-stack app can break inside the API, inside the client, and in the contract between them, and no single kind of test sees all three. WeShopAlot is the worked example on the API side: a unit project of pure functions, an in-memory API suite that runs the whole application without a database, and a SQL Server suite that rebuilds a real database for every run with the seeder from Module 4. Students run and extend those before writing ShelfShare's.",
  sections: [
    // ------------------------------------------------------------------ test-pyramid
    {
      topic: "test-pyramid",
      blocks: [
        "The pyramid is a budget. Fast, narrow tests at the bottom in large numbers; slower, wider tests above them in smaller numbers; a handful of end-to-end flows at the top. The point is not the shape but the question each layer is allowed to answer, because a test that answers a question it cannot really see is worse than no test: it goes green and you believe it.",
        {
          table: {
            head: ["Tier", "WeShopAlot project", "Runs", "Needs", "Can prove", "Cannot prove"],
            rows: [
              ["Unit", "`WeShopAlot.Testing.Unit`", "One class or function; no I/O", "Nothing", "A price rule, a `Skip` calculation, a default value, the shape of the seed JSON", "That the pieces fit together"],
              ["API, in memory", "`WeShopAlot.Testing.WebApis` → `ApiTests`", "The whole API via `WebApplicationFactory`, in-memory provider, in-memory Redis stand-ins", "Nothing", "Routes, status codes, DTO shapes, auth, service logic, AutoMapper", "Anything about the real database"],
              ["API, SQL Server", "`WeShopAlot.Testing.WebApis` → `SqlApiTests`", "The whole API against a database built for the run", "SQL Server LocalDB (or any SQL Server)", "Migrations match the model, foreign keys hold, column sizes, SQL ordering, the shipped catalog", "The client"],
              ["Client", "`Client` (Vitest, `HttpTestingController`)", "Components and services with HTTP mocked", "Node", "Exactly which request a service sends", "That the API agrees"],
              ["End to end", "Playwright (Lab 12)", "A browser against the running stack", "Everything running", "A whole flow works", "Why it broke"],
            ],
            caption: "The tiers, and the question each one may answer",
          },
        },
        "The two API tiers are the heart of this module because they are the same tests in two different worlds. Both start the real application, so a route typo or a wrong status code fails in both. The difference is the database. In the fast tier, the in-memory provider accepts an `Order` whose `StatusId` points nowhere, a 600-character string in a 500-character column, and a negative `Skip`. In the SQL Server tier those are failures, as they are in production. Module 4's providers topic lists what the in-memory provider does not enforce; this module turns that list into the reasons a second tier exists.",
        {
          callout:
            "WeShopAlot's upgrade in October 2026 added the in-memory tier first and let it find bugs: routes the client called that the API did not serve, tokens without an issuer, a broken address endpoint. Then a real checkout failed on a foreign key the in-memory tests had waved through, and a shipping charge rounded to whole dollars slipped past a `decimal` the in-memory provider never checked. The pyramid grew a tier because the bugs showed where the old one was blind.",
          title: "Where WeShopAlot's tiers came from",
          tone: "aside",
        },
      ],
      takeaway:
        "Each tier may only answer the questions it can actually see; a green test that cannot see the database is not evidence about the database.",
      check: [
        {
          q: "`ApiTests.Checkout_BasketToOrder_UsesServerPrices` passes. Does that prove a checkout saves to SQL Server?",
          a: "No. It proves the order service computes the right subtotal and the controller returns it. Whether the row satisfies the foreign keys is a SQL Server question, answered by `SqlApiTests.Checkout_WritesAnOrder_ThatSatisfiesTheForeignKeys`.",
        },
        {
          q: "Where does a test of `calculateTotals` in the Angular basket belong, and why not in a component test with `HttpTestingController`?",
          a: "In a unit test of a pure function, once the arithmetic is pulled out of the service. It needs no HTTP and no `TestBed`; the component test would spend its time flushing fake requests to reach three lines of arithmetic.",
        },
      ],
      readings: ["aspnet-integration-tests", "xunit", "mstest"],
    },

    // ------------------------------------------------------------------ integration-tests
    {
      topic: "integration-tests",
      blocks: [
        "`WebApplicationFactory<Program>` starts your ASP.NET Core application inside the test process: `Program.cs` runs, services are registered, middleware is wired, and `CreateClient()` hands you an `HttpClient` whose requests go straight to that in-process server. Nothing listens on a port, yet every request is a real HTTP request through the real pipeline. Your test then does what a client does: `GET /api/product?sort=priceAsc` and assert on the status and the JSON. The `public partial class Program { }` at the bottom of WeShopAlot's `Program.cs` exists only so the test project can name the type.",
        "The factory's `ConfigureWebHost` is where a test swaps the pieces it cannot have. WeShopAlot's two factories make the same swaps for Redis, replacing `IResponseCacheService` with a cache that never caches and `IBasketRepository` with a dictionary (`TestDoubles.cs`), and set the two configuration values the API needs to start, the token key and issuer. They differ in exactly one decision: what database the API sees.",
        {
          code:
            "public class WeShopAlotSqlApiFactory : WebApplicationFactory<Program>\n{\n    public WeShopAlotSqlApiFactory()\n    {\n        var server = Environment.GetEnvironmentVariable(\"WESHOPALOT_TEST_SQLSERVER\")\n                     ?? @\"Server=(localdb)\\MSSQLLocalDB;Trusted_Connection=true;TrustServerCertificate=true\";\n        DatabaseName = $\"WeShopAlotTests_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}\"[..40];\n        ConnectionString = new SqlConnectionStringBuilder(server) { InitialCatalog = DatabaseName }.ConnectionString;\n    }\n\n    protected override void ConfigureWebHost(IWebHostBuilder builder)\n    {\n        builder.UseSetting(\"Token:Key\", \"integration-test-signing-key-...\");\n        builder.UseSetting(\"Token:Issuer\", \"https://weshopalot.test\");\n        builder.UseSetting(\"Settings:DbServerType\", \"SQLServer\");            // the real provider switch runs\n        builder.UseSetting(\"ConnectionStrings:WeShopAlotSQLConnection\", ConnectionString);\n        builder.ConfigureTestServices(services =>\n        {\n            services.RemoveAll<IResponseCacheService>();\n            services.AddSingleton<IResponseCacheService, TestDoubles.NoResponseCache>();\n            services.RemoveAll<IBasketRepository>();\n            services.AddSingleton<IBasketRepository, TestDoubles.InMemoryBasketRepository>();\n        });\n    }\n\n    public async Task<bool> TryRecreateAndSeedAsync()\n    {\n        using var scope = Services.CreateScope();\n        var db = scope.ServiceProvider.GetRequiredService<WeShopAlotContext>();\n        try { await DatabaseSeeder.RecreateAsync(db); }                      // migrations + OrderStatus rows\n        catch (Exception ex) when (ex is SqlException or PlatformNotSupportedException)\n        { UnavailableReason = ex.Message; return false; }                   // no SQL Server: tests go Inconclusive\n        await DatabaseSeeder.SeedAsync(db);                                  // the shipped catalog\n        return true;\n    }\n\n    public override async ValueTask DisposeAsync()\n    {\n        await using (var db = CreateDbContext()) await db.Database.EnsureDeletedAsync();\n        await base.DisposeAsync();\n    }\n}",
          title: "WeShopAlot.Testing.WebApis/WeShopAlotSqlApiFactory.cs (abridged)",
          note: "Compare WeShopAlotApiFactory, the fast tier: it removes the DbContextOptions registration and adds UseInMemoryDatabase, then hand-writes three products in SeedAsync. The SQL factory replaces nothing about the database; it configures the real one and calls the real seeder.",
        },
        "Read the SQL factory as the steps a new developer takes, done by code. It picks a database name nobody else is using, so two test classes or two developers on one server never collide. It tells the API, through ordinary configuration, which provider and connection string to use, so the production `UseSelectedDatabaseServer` switch runs unchanged. `TryRecreateAndSeedAsync` is `dotnet run --project WeShopAlot.Data.ConsoleApp` as a method call: the same `DatabaseSeeder.RecreateAsync` and `SeedAsync` from Module 4, so the test database has the same 16 guitars, 4 delivery methods, and 3 order statuses a developer's has. `CreateDbContext()` opens a second context on that database for assertions that look at rows rather than responses. And `DisposeAsync` drops it.",
        "The `TryRecreateAndSeedAsync` return value matters for a class. If no SQL Server answers, the factory records why and the test class reports every test **Inconclusive** rather than failed, so a teammate on macOS or a CI runner without SQL Server still gets a green run; the `[TestCategory(\"SqlServer\")]` attribute lets `dotnet test --filter TestCategory!=SqlServer` leave the tier out explicitly, which is what WeShopAlot's CI does today. Running the tier in GitHub Actions with a SQL Server service container is a Sprint 3 story in the repository.",
        {
          code:
            "[TestClass]\n[TestCategory(\"SqlServer\")]\n[DoNotParallelize]\npublic class SqlApiTests\n{\n    private static WeShopAlotSqlApiFactory factory;\n    private static HttpClient client;\n    private static string unavailable;\n\n    [ClassInitialize]\n    public static async Task ClassInitialize(TestContext _)\n    {\n        factory = new WeShopAlotSqlApiFactory();\n        if (!await factory.TryRecreateAndSeedAsync()) { unavailable = factory.UnavailableReason; return; }\n        client = factory.CreateClient();\n    }\n\n    [TestInitialize]\n    public void RequireSqlServer()\n    {\n        if (unavailable != null) Assert.Inconclusive($\"No SQL Server for the integration tests: {unavailable}\");\n    }\n\n    [TestMethod]\n    public async Task Catalog_IsTheShippedOne()\n    {\n        var seed = SeedData.Load();                                          // the JSON the database was seeded from\n        var page = await ReadAsync(await client.GetAsync(\"/api/product?pageSize=50\"));\n        Assert.AreEqual(seed.Products.Count, page.GetProperty(\"count\").GetInt32());\n    }\n\n    [TestMethod]\n    public async Task Checkout_WritesAnOrder_ThatSatisfiesTheForeignKeys()\n    {\n        var token = await RegisterAsync(\"checkout@sql.test\");\n        // ... POST /api/basket, then POST /api/order with the token ...\n        await using var db = factory.CreateDbContext();\n        var order = await db.Orders.Include(o => o.Status).SingleAsync(o => o.Id == orderId);\n        Assert.AreEqual(OrderStatusEnum.Pending, order.Status.Name);         // StatusId resolved through the FK\n    }\n}",
          title: "WeShopAlot.Testing.WebApis/SqlApiTests.cs (abridged)",
          note: "One factory per test class, built in ClassInitialize, so the database is created once for the class and not once per test. [DoNotParallelize] because one test rebuilds the database mid-class on purpose, to prove that the reset really resets.",
        },
        "Three habits make a test in this tier worth its extra seconds. **Assert on the real data, from its source**: `SeedData.Load()` gives the JSON the database was seeded from, so a count comes from `products.json` and not from a `16` typed into the test that goes stale the day someone adds a guitar. **Ask what only a database can answer**: read the `Order` row back and follow `StatusId` to the `Pending` row; check that `GetPendingMigrationsAsync()` is empty; sort by price and let SQL Server do the ordering. **Make each test self-contained**: register your own user, find product and delivery-method ids by name (identity values are not promised), and never depend on another test having run. If a test needs no database and no HTTP, it does not belong here at all; it belongs in the unit project.",
        {
          table: {
            head: ["Test", "What it proves", "Why the in-memory tier could not"],
            rows: [
              ["`Schema_EveryMigrationApplied_NonePending`", "The model and the migrations agree", "InMemory has no migrations"],
              ["`OrderStatuses_ComeFromTheMigration_NotTheSeeder`", "The `HasData` rows arrived with the schema, in enum order", "InMemory applies `HasData` too, but through `EnsureCreated`, not a migration"],
              ["`Catalog_IsTheShippedOne`", "The API serves exactly `products.json`", "The in-memory tier seeds its own three-product catalog"],
              ["`Products_SortedByPriceAsc_SqlServerPutsTheCheapestFirst`", "`ORDER BY Price` in SQL puts the $18 cigar-box guitar first", "LINQ to Objects ordering is not SQL Server ordering"],
              ["`Checkout_WritesAnOrder_ThatSatisfiesTheForeignKeys`", "An order row is accepted by every foreign key", "InMemory does not enforce foreign keys"],
              ["`SeedAsync_RunTwice_AddsNothing`", "Reseeding is a no-op", "Same code path, but only meaningful on the real schema"],
              ["`RecreateAsync_ThenSeed_StartsFromAKnownState`", "A rebuild wipes users and orders and reloads the catalog", "InMemory cannot run `RecreateAsync`"],
            ],
            caption: "What is in SqlApiTests today, and why each test lives in this tier",
          },
        },
        "For ShelfShare, Lab 12 asks for the same shape with SQLite instead of SQL Server, because ShelfShare's migrations were generated on SQLite from the start: a factory that sets `ConnectionStrings:ShelfShare` to a file in the temp folder named after a `Guid`, calls your seeder from Lab 4 (which is why Lab 4 wanted it in the data project), and deletes the file in `DisposeAsync`. The questions are the same: do the migrations apply, do the foreign keys hold, is the catalog the one in your JSON, does the status bench from Lab 6 return `409` from a real unique index and not from an `if`.",
        {
          callout:
            "An integration test that rebuilds a database is only safe because it names its own database. `WeShopAlotSqlApiFactory` never reads the API's or the seeder's user secrets; it builds a connection string of its own with a fresh name, and `WESHOPALOT_TEST_SQLSERVER` is deliberately a server address *without* a database name. Write yours the same way. A factory that reads the developer's connection string and calls `RecreateAsync` on it would wipe the developer's shop every time the tests ran.",
          title: "Never let a test find the real database",
          tone: "warning",
        },
      ],
      takeaway:
        "WebApplicationFactory runs the real application; the SQL Server tier gives it a real database built by the same seeder developers use, named per run and dropped afterwards, so the tests can ask the questions only a database can answer.",
      check: [
        {
          q: "Why does `WeShopAlotSqlApiFactory` set `Settings:DbServerType` and the connection string through `UseSetting`, instead of removing the `DbContextOptions` registration the way the in-memory factory does?",
          a: "So the production code path runs unchanged. `UseSelectedDatabaseServer` reads those two settings and calls `UseSqlServer`, exactly as it does in the deployed API. The in-memory factory has to replace the registration because no setting selects the in-memory provider.",
        },
        {
          q: "A teammate's `SqlApiTests` run leaves a database called `WeShopAlotTests_20261103_...` on their LocalDB. What happened, and is anything lost?",
          a: "The run was killed before `DisposeAsync` could drop it (a debugger stop, a crash). Nothing is lost: it holds only seed data and the test's own users, and its name says when it was made. Drop it by hand.",
        },
        {
          q: "Why do the tests look ids up by name (`ProductIdAsync(\"Blondie\")`) instead of using `1`?",
          a: "Because identity values are assigned by SQL Server in insertion order and are not part of the contract; a reordering of `products.json` or a reseed after a failed insert changes them. Names are in the seed data; ids are an implementation detail.",
        },
      ],
      readings: ["aspnet-integration-tests", "weshopalot-database", "mstest", "efcore"],
    },
  ],
};
