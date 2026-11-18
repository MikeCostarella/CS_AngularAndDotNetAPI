import type { LectureNotesDef } from "../types";

// Module 4 — Data with Entity Framework Core: lecture notes, one section per lecture topic.
// Written so far: migrations, seeding, providers (the three topics behind rebuilding WeShopAlot's
// database, which Module 12's integration tests stand on). The other topics show "notes coming".
// Edit freely; keep each section's topic id in step with units.ts. Inline markup: {{term-id}} or
// {{term-id|words}} glossary terms, `code`, **bold**, *italic*, [[resource-id]], [words](url).

export const M04_NOTES: LectureNotesDef = {
  moduleId: "m04",
  intro:
    "These notes go with the Module 4 lecture and Lab 4. The theme is that a database is an output of the code, not a thing anyone builds by hand: the schema is a set of migrations, the data a database must have is declared in the model, the sample data is a few JSON files, and one command turns all of that into a working database on any machine. WeShopAlot is the case study throughout, because the same command that gives a new developer a database gives Module 12's tests one too.",
  sections: [
    // ------------------------------------------------------------------ migrations
    {
      topic: "migrations",
      blocks: [
        "A {{migration}} is a C# class with an `Up` method that changes the schema and a `Down` method that undoes it. {{ef-core|EF Core}} generates it by comparing your current model (the entity classes plus `OnModelCreating`) with a snapshot of the model as it was at the last migration, and writing the difference. You review the file, commit it, and from then on every database that applies your migrations ends up with the same schema, in the same order.",
        {
          table: {
            head: ["File", "What it holds", "Who edits it"],
            rows: [
              ["`20230612144448_Initial-001.cs`", "`Up`: `EnsureSchema(\"WSA\")`, then `CreateTable` for every entity, with the `OrderStatus` rows inserted at the end", "Generated; you read it, and occasionally fix it"],
              ["`20261009010032_AddressNames.cs`", "`Up`: `AddColumn` for `FirstName` and `LastName` on `Address`, and `AlterColumn` widening `Order.Subtotal` to `decimal(18,2)`", "Generated during the October 2026 upgrade"],
              ["`*.Designer.cs`", "The model as it looked when that migration was made, so EF Core can diff the next one", "Never"],
              ["`WeShopAlotContextModelSnapshot.cs`", "The current model, updated by every `migrations add`", "Never by hand; merge conflicts here mean two people added a migration at once"],
            ],
            caption: "WeShopAlot.Data/Migrations",
          },
        },
        "Two things about WeShopAlot's first migration deserve a look. `modelBuilder.HasDefaultSchema(\"WSA\")` puts every table in a schema of its own, which is why the drop script in the next section can find them all with one query and leave anything else in the database alone. And `RemovePluralizingTableNameConvention()` keeps table names singular (`Product`, not `Products`), matching the entity names; that is a choice, not a requirement, and ShelfShare may make the other one.",
        {
          code:
            "cd C:\\projects\\WeShopAlot\\Solution\ndotnet tool install --global dotnet-ef        # once per machine\n\n# After changing an entity class:\ndotnet ef migrations add AddBookIsbn --project WeShopAlot.Data --startup-project WeShopAlot.Data.ConsoleApp\n\n# Then rebuild the database (next section), or on a database with data you want to keep:\ndotnet ef database update --project WeShopAlot.Data --startup-project WeShopAlot.Data.ConsoleApp",
          title: "Adding a migration (PowerShell)",
          note: "--project is where the migrations live; --startup-project is a project that can build the DbContext at design time. WeShopAlot's console app does that through a DesignTimeContextFactory, so dotnet ef never needs the API running.",
        },
        "Treat a migration like any other code change: it goes in the same pull request as the entity change, the reviewer reads the `Up` method, and the test suite checks that the model and the migrations agree. WeShopAlot has such a test (`SqlApiTests.Schema_EveryMigrationApplied_NonePending`, Module 12): if someone changes an entity and forgets `migrations add`, the pending migration fails the build before it reaches a shared database.",
        {
          callout:
            "`Migrate()` applies whatever migrations the database does not have yet and records each one in `__EFMigrationsHistory`. `EnsureCreated()` builds the current model directly, with no history, and cannot be followed by migrations later. Use `Migrate()` for anything real; `EnsureCreated()` only for throw-away databases such as the in-memory provider in a test.",
          title: "Migrate vs. EnsureCreated",
          tone: "warning",
        },
      ],
      takeaway:
        "The schema is code: a migration per change, reviewed and committed with the entity it belongs to, so every database built from the repository looks the same.",
      check: [
        {
          q: "You add a `Publisher` property to `Book`, run the app, and get `Invalid column name 'Publisher'`. What did you skip?",
          a: "`dotnet ef migrations add`. The model knows about the column; the database does not, because no migration has added it. Generate the migration, then apply it (or rebuild).",
        },
        {
          q: "Why does the drop script in WeShopAlot's seeder only touch schema `WSA`?",
          a: "Because `HasDefaultSchema(\"WSA\")` puts every WeShopAlot table there, including EF Core's own `__EFMigrationsHistory`. Scoping the drop to that schema removes all of WeShopAlot and nothing else that might share the database.",
        },
      ],
      readings: ["efcore-migrations", "weshopalot-database"],
    },

    // ------------------------------------------------------------------ seeding
    {
      topic: "seeding",
      blocks: [
        "Seeding is putting data into a freshly built database, and there are two different kinds of data, which EF Core handles two different ways. **Reference data** is data the code cannot work without: WeShopAlot's three `OrderStatus` rows, because every new `Order` points at the `Pending` row through a foreign key. **Sample data** is data that makes the app worth looking at: 16 guitars, 10 brands, 7 types, 4 delivery methods. The shop works with an empty catalog; it is just boring.",
        {
          table: {
            head: ["", "Reference data", "Sample data"],
            rows: [
              ["WeShopAlot example", "`OrderStatus` rows from `OrderStatusEnum`", "The catalog in `WeShopAlot.Data/Seed/Content/*.json`"],
              ["Declared where", "In the model: `modelBuilder.Entity<OrderStatus>().HasData(...)` in `Seeding.SeedMasterData`", "In JSON files embedded in the `WeShopAlot.Data` assembly"],
              ["Arrives when", "With the schema: the migration has `InsertData` calls, and `EnsureCreated` applies it too", "Only when something calls `DatabaseSeeder.SeedAsync`"],
              ["Present in the in-memory test database?", "Yes, automatically", "No, unless the test seeds it"],
              ["Changing it", "A new migration", "Edit the JSON and run the seeder"],
            ],
            caption: "Two kinds of seed data",
          },
        },
        "Model-level seeding (`HasData`) is right for rows the schema depends on, and wrong for anything large or changeable, because every edit becomes a migration. WeShopAlot generates the `OrderStatus` rows from the enum with a small reflection helper (`EnumSeedingExtension`), so the enum and the table cannot drift apart.",
        "The catalog takes the other path. The four JSON files are `EmbeddedResource` items in `WeShopAlot.Data.csproj`, so they travel inside the assembly and nothing has to copy files around. `SeedData.Load()` deserializes them into plain import models (`ImportedProduct` and friends) with no database involved, which is what lets `WeShopAlot.Testing.Unit/Seed/SeedDataTests` check the data itself: every product names a brand and a type that exist, prices fit the `decimal(5,2)` columns, picture URLs follow the naming scheme. Then `DatabaseSeeder.SeedAsync(context)` loads them in dependency order, looking brands and types up by name so products get the right foreign keys, and fills each table only if it is empty.",
        {
          code:
            "public static async Task RecreateAsync(WeShopAlotContext context, CancellationToken ct = default)\n{\n    var script = context.Database.ProviderName switch\n    {\n        SqlServerProvider => \"DropSqlServerTables.sql\",\n        PostgresProvider  => \"DropPostgresTables.sql\",\n        _ => throw new InvalidOperationException(\"RecreateAsync needs SQL Server or PostgreSQL\"),\n    };\n    if (await context.Database.CanConnectAsync(ct))                 // a brand-new database has nothing to drop\n        await context.Database.ExecuteSqlRawAsync(SeedData.ReadResource(script), ct);\n    await context.Database.MigrateAsync(ct);                        // schema + OrderStatus rows\n}\n\npublic static async Task<SeedCounts> SeedAsync(WeShopAlotContext context, SeedData data, CancellationToken ct = default)\n{\n    if (!await context.ProductTypes.AnyAsync(ct)) { /* add from data.ProductTypes */ }\n    if (!await context.ProductBrands.AnyAsync(ct)) { /* ... */ }\n    if (!await context.DeliveryMethods.AnyAsync(ct)) { /* ... */ }\n    if (!await context.Products.AnyAsync(ct))\n    {\n        var brandIds = await context.ProductBrands.ToDictionaryAsync(b => b.Name.Trim(), b => b.Id, ct);\n        var typeIds  = await context.ProductTypes.ToDictionaryAsync(t => t.Name.Trim(), t => t.Id, ct);\n        // products.json names its brand and type; the rows above give them their ids\n    }\n    return new SeedCounts(...);\n}",
          title: "WeShopAlot.Data/Seed/DatabaseSeeder.cs (abridged)",
          note: "Two methods on purpose. RecreateAsync is destructive and needs a relational provider. SeedAsync only adds what is missing and runs on any provider, so a test can call it on an in-memory database after EnsureCreated.",
        },
        "The command a developer runs is the console app, `WeShopAlot.Data.ConsoleApp`, and it is now nothing but a caller of those two methods: read the settings, `RecreateAsync`, `SeedAsync`, print the counts, exit. The settings are the same two the API uses (`Settings:DbServerType` and `ConnectionStrings:WeShopAlotSQLConnection`), read from the console app's own {{user-secrets|user secrets}}, then environment variables, then the command line, later sources winning. That last layer is the useful trick: `dotnet run --project WeShopAlot.Data.ConsoleApp -- --ConnectionStrings:WeShopAlotSQLConnection \"...Database=WeShopAlot_Scratch...\"` rebuilds a different database for one run without touching the secrets.",
        {
          callout:
            "Running the seeder is a **wipe**, not an update. Every table in schema `WSA` is dropped and rebuilt, so orders, users, and addresses in that database are gone. On your own LocalDB that is exactly what you want (\"give me a clean shop\"), and it is what every test run wants. It is never aimed at a database other people are using: the class server is rebuilt only by the instructor, on purpose. Resetting is the same command; there is no separate reset.",
          title: "What the seeder does to the database it points at",
          tone: "warning",
        },
        "Why move the seeder out of the console app and into `WeShopAlot.Data`? Until October 2026 the loading code lived in the console app as extension methods on a web host, and the JSON files were copied to its output folder. Nothing else could call it, so the API's integration tests invented their own catalog of three skateboards and a hat, and tested against data the real app never had. With `DatabaseSeeder` in the data project, the console app and the tests call the same code with the same data. That is the principle behind Module 12's SQL Server test tier, and it is the pattern Lab 4 asks for in ShelfShare: a seeder class in your data project, with the console (or startup) code as a thin caller.",
      ],
      takeaway:
        "Declare the rows the schema depends on in the model; keep the sample data in files; put the code that loads them where both the app and the tests can call it, and remember that rebuilding is a wipe.",
      check: [
        {
          q: "A teammate adds a fourth `OrderStatus`, `Shipped`, to the enum, runs the seeder, and the new row is not there. Why?",
          a: "`OrderStatus` is model-level seed data (`HasData`), so it arrives through a migration, not through `SeedAsync`. They need `dotnet ef migrations add AddShippedStatus`; the seeder's `Migrate()` step will then insert it.",
        },
        {
          q: "You add a $1,200 guitar to `products.json`. Which test fails first, and what does the failure tell you?",
          a: "`SeedDataTests.Prices_FitTheDecimal5_2Columns`, with no database involved: `Product.Price` is `decimal(5,2)`, so 999.99 is the ceiling. SQL Server would have refused the row at `SaveChanges`; the in-memory provider would have accepted it silently.",
        },
        {
          q: "Why does `SeedAsync` fill a table only when it is empty, when `RecreateAsync` has just emptied everything anyway?",
          a: "So that it is safe to call on its own. The tests call `SeedAsync` on an in-memory database that `RecreateAsync` cannot touch, and a second call anywhere must add nothing (`SqlApiTests.SeedAsync_RunTwice_AddsNothing` checks that).",
        },
      ],
      readings: ["weshopalot-database", "efcore", "aspnet-user-secrets"],
    },

    // ------------------------------------------------------------------ providers
    {
      topic: "providers",
      blocks: [
        "A provider is the package that turns EF Core's LINQ into one database's SQL and speaks its wire protocol. The same `DbContext` can run on several; what changes is one line in configuration. WeShopAlot's `UseSelectedDatabaseServer` reads `Settings:DbServerType` and calls `UseSqlServer` or `UseNpgsql` with the connection string. Lab 4 adds a third choice to ShelfShare, SQLite, which needs no server at all.",
        {
          table: {
            head: ["Provider", "Package", "Good for", "Watch out for"],
            rows: [
              ["SQL Server / LocalDB", "`Microsoft.EntityFrameworkCore.SqlServer`", "WeShopAlot's development and class server; the SQL Server test tier", "LocalDB is Windows-only; a container (`mcr.microsoft.com/mssql/server`) stands in elsewhere"],
              ["PostgreSQL", "`Npgsql.EntityFrameworkCore.PostgreSQL`", "WeShopAlot's second provider; most Linux hosting", "Migrations generated for SQL Server carry `nvarchar` and identity annotations that Npgsql maps for you, but a new migration should be generated against the provider you deploy on"],
              ["SQLite", "`Microsoft.EntityFrameworkCore.Sqlite`", "ShelfShare's labs; a file, no install", "Weak types (no real `decimal`), limited `ALTER TABLE`, so some migrations rebuild the table"],
              ["InMemory", "`Microsoft.EntityFrameworkCore.InMemory`", "Fast tests of application logic", "Not a database: no migrations, no foreign keys, no column sizes, no SQL. See below"],
            ],
            caption: "The providers this course meets",
          },
        },
        "The in-memory provider deserves its own paragraph because the fast tier of WeShopAlot's API tests runs on it, and because its name promises more than it delivers. It stores entities in dictionaries and runs your LINQ with LINQ to Objects. That means `Migrate()` throws, `ExecuteSqlRaw` throws, a `StatusId` pointing at a status that does not exist is accepted, a 600-character `Description` in a 500-character column is accepted, and `Skip(-6)` returns everything where SQL Server's `OFFSET -6 ROWS` is an error. EF Core's own documentation says to prefer a real database for testing; the in-memory provider is a quick way to test *your* code with the database out of the way, not a way to test the database.",
        {
          callout:
            "Three facts, four tiers. Pure logic (a price rule, a specification's `Skip` arithmetic) is a unit test with no provider at all. Service logic runs on the in-memory provider with no HTTP (`WeShopAlot.Testing.Services`), and routes, status codes, DTO shapes, and auth run on it through the whole API, both in seconds. Anything that is a claim about the database — a migration applies, a foreign key holds, an ordering is what SQL returns — needs the real provider. Module 12 builds all four on WeShopAlot.",
          title: "Which provider for which test",
          tone: "tip",
        },
      ],
      takeaway:
        "One context, several providers, one configuration line between them; and the in-memory provider is a stand-in for application tests, never evidence about the database.",
      check: [
        {
          q: "WeShopAlot's `Order` used to default `StatusId` to 0. The in-memory API tests passed; every real checkout failed. Why did the tests not catch it?",
          a: "The in-memory provider does not enforce foreign keys, so an `Order` pointing at a status 0 that does not exist saved fine. SQL Server rejected it. A unit test now pins the default (`OrderTests.NewOrder_StartsPending`), and the SQL Server tier proves a checkout writes a row.",
        },
        {
          q: "Could the SQL Server test tier run on SQLite to avoid needing LocalDB?",
          a: "Not without new migrations. WeShopAlot's migrations are SQL Server-specific (`WSA` schema, `nvarchar(max)`, identity annotations), and SQLite has no schemas and no real `decimal`. ShelfShare, which generates its migrations on SQLite from the start, can use a SQLite test database.",
        },
      ],
      readings: ["efcore", "weshopalot-database"],
    },
  ],
};
