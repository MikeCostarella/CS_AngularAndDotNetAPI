# CS_AngularAndDotNetAPI — Angular and .NET Web APIs

Course site for **Angular and .NET Web APIs**, an upper-level undergraduate
course on full-stack web development: an Angular client and an ASP.NET Core
REST API, built, secured, tested, and deployed together.

Status: **draft course design for discussion**, not an official catalog listing.

Created by Mike Costarella.

## The two threads

- **WeShopAlot** is the reference system every module reads, runs, and
  critiques: an ASP.NET Core Web API (catalog, basket, accounts, orders,
  Stripe payments) with an Angular client.
  Source: https://github.com/MikeCostarella/WeShopAlot
- **ShelfShare** is the app students build in the labs, a campus
  book-lending library, from an empty folder (Lab 2) to a tested, deployed
  full-stack system (Lab 13).

## Course structure

- **Unit I — The HTTP Contract** (Modules 1–2, weeks 1–2)
- **Unit II — Building the API** (Modules 3–6, weeks 3–6)
- **Unit III — The Angular Client** (Modules 7–8, weeks 7–8; midterm checkpoint week 8)
- **Unit IV — State, Security, and Integration** (Modules 9–11, weeks 9–11)
- **Unit V — Ship It** (Modules 12–13, weeks 12–15; final projects)

## Editing content

The site is driven by one typed registry:

| File | Drives |
|---|---|
| `react-app/src/data/course.ts` | Thesis, outcomes, format, grading, integrity policy |
| `react-app/src/data/units.ts` | Units and modules: topics, labs (with step-by-step scripts), checkpoints |
| `react-app/src/data/lectures/mNN.ts` | Lecture notes, one section per topic (Module 1 written so far) |
| `react-app/src/data/glossary.ts` | Glossary terms used as `{{term-id}}` in the notes |
| `react-app/src/data/reference.ts` | The WeShopAlot page: solution map, endpoints, known issues |
| `react-app/src/data/projects.ts` | Example final projects and requirements |
| `react-app/src/data/resources.ts` | Readings (modules and notes cite them by id) |
| `react-app/src/data/tools.ts` | Tools & Setup page |
| `react-app/src/data/outcomeMap.ts` | Where each course outcome is taught, practiced, and assessed |

## Develop & build

Run in **PowerShell**:

```
cd C:\projects\CS_AngularAndDotNetAPI\react-app
npm install
npm run dev
npm run build      # tsc -b && vite build
```

Pushing to `main` triggers the GitHub Pages deploy workflow (set Settings →
Pages → Source to "GitHub Actions" once). Served at
https://mikecostarella.github.io/CS_AngularAndDotNetAPI/

## Fleet conventions

Hamburger accordion main menu (View / Units / Links), build timestamp in the
masthead, menu foot, and footer. The footer carries no copyright line and no
stack line — only the author credit and the license line. Base path in
`vite.config.ts` must equal `/CS_AngularAndDotNetAPI/`.

## License

Course content: CC BY-NC-SA 4.0. Code: MIT. See [LICENSE.md](LICENSE.md).
