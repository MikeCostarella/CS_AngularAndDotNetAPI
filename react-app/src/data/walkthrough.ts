// The Service → UI walkthrough: WeShopAlot running locally, the API first
// (Swagger UI) and then the Angular client from shop to order confirmation.
// Each step pairs a screenshot with the HTTP calls behind it and talking
// points for lecture. Kept as data so the page and the search index render
// from one source. Inside prose, `code` renders as code.
//
// Every call listed here was checked against the WeShopAlot source
// (Client/src/app/**/*.service.ts and the checkout components, October 2026).

export type HttpVerb = "GET" | "POST" | "PUT" | "DELETE";

export interface WalkCall {
  method: HttpVerb | "STRIPE";
  route: string;
  /** When the call happens, e.g. "on load", "Add to basket". */
  when: string;
}

export interface WalkStep {
  /** Stable id: the section anchor (#/walkthrough?s=<id>). */
  id: string;
  /** "Service" for the API on its own, "UI" for the Angular client. */
  layer: "Service" | "UI";
  title: string;
  /** One or two words for the step chips. */
  short: string;
  /** The address bar at the time of the screenshot. */
  url: string;
  /** File in public/walkthrough/. */
  image: string;
  /** Pixel size of the image, so the page reserves its space before it loads. */
  size: [number, number];
  alt: string;
  /** One sentence: what is on screen. */
  summary: string;
  calls: WalkCall[];
  /** What to say in lecture. */
  points: string[];
  /** A question to put to the room. */
  ask?: string;
  /** Module numbers where this is studied. */
  modules: number[];
}

export const WALKTHROUGH_LEDE =
  "WeShopAlot running on one machine: the ASP.NET Core API on https://localhost:7244 and the Angular client on https://localhost:4200. We look at the service first, on its own, and then walk one purchase through the UI, naming the HTTP calls behind every screen. Open the browser's Network tab while you follow along and you will see the same calls.";

export const WALKTHROUGH_STEPS: WalkStep[] = [
  {
    id: "service",
    layer: "Service",
    title: "The API on its own: Swagger UI",
    short: "Swagger",
    url: "https://localhost:7244/swagger",
    image: "00-swagger.webp",
    size: [1400, 1464],
    alt: "Swagger UI for WeShopAlot.WebAPI listing the Account, Basket, Buggy, and Order endpoints",
    summary:
      "Swagger UI renders the OpenAPI document the API generates from its controllers: one group per controller, one row per operation.",
    calls: [{ method: "GET", route: "/swagger/v1/swagger.json", when: "on load: the OpenAPI document" }],
    points: [
      "Start here, before any UI. The API is the product: it runs, documents itself, and can be exercised with no client at all. The Angular app and the WPF desktop app are two clients of the same contract.",
      "Each group is a controller: Account, Basket, Buggy, Order, and, below the fold, Payment and Product. Expand a row and choose Try it out to send a real request and see the real response.",
      "The padlock shows on every row, even `POST /api/Account/login`, because Swagger's security requirement is registered globally in `SwaggerServiceExtensions.cs`. It describes the UI, not which endpoints need a token; the controllers' `[Authorize]` attributes decide that.",
      "Authorize: sign in with `POST /api/Account/login`, copy the token from the response, paste it here, and the protected endpoints start answering 200 instead of 401.",
      "Contract smells you can see from this page alone: `GET`, `POST`, and `DELETE` on `/api/Basket` with the id in the query string, and a Buggy controller that fails on purpose (it is our status-code test bench for Module 6).",
    ],
    ask: "Without reading any C#, what can you tell about this system from this page? What can't you tell?",
    modules: [1, 2],
  },
  {
    id: "shop",
    layer: "UI",
    title: "Shop: a paged, filtered list",
    short: "Shop",
    url: "https://localhost:4200/shop",
    image: "01-shop.webp",
    size: [1600, 840],
    alt: "WeShopAlot shop page with brand and type filters, sort, search, and six guitar cards, showing 1-6 of 16 results",
    summary:
      "The catalog: sort, brand and type filters, search, Cards or List, and a pager over 16 products, six at a time.",
    calls: [
      { method: "GET", route: "/api/product/brands", when: "on load: the Brands list" },
      { method: "GET", route: "/api/product/types", when: "on load: the Types list" },
      { method: "GET", route: "/api/product?sort=name&pageIndex=1&pageSize=6", when: "on load, and on every filter, sort, search, or page change" },
      { method: "GET", route: "/api/basket?id={basket_id}", when: "app start, if a basket id is in localStorage" },
      { method: "GET", route: "/api/account", when: "app start, if a token is in localStorage (the \"Welcome Mike\" menu)" },
    ],
    points: [
      "Every control on the left is a query parameter: Brands → `brandId`, Types → `typeId`, Sort → `sort`, the search box → `search`, the pager → `pageIndex` and `pageSize`. The client's `ShopParams` class is the API's `ProductSpecParams` seen from the other side.",
      "\"Showing 1 – 6 of 16\" comes straight from the response envelope `{ pageIndex, pageSize, count, data }`. The client never downloads all 16 products to count them.",
      "Two caches: the API keeps each distinct query in Redis for ten minutes, and the Angular `ShopService` keeps pages it has already fetched in a `Map`, so going back to page 1 makes no request at all. Watch the Network tab to prove it.",
      "Cards and List is client-only state: switching makes no request; the choice is remembered in localStorage, and the WPF client keeps the same setting.",
      "The footer says which API this build talks to and when it was built: `environment.apiUrl` and a build stamp. That line answers \"which server is this?\" before anyone has to ask.",
    ],
    ask: "Change the sort to price and go to page 2. Which query parameters change, and which stay the same?",
    modules: [5, 7, 8],
  },
  {
    id: "basket",
    layer: "UI",
    title: "Basket: the whole basket, every time",
    short: "Basket",
    url: "https://localhost:4200/basket",
    image: "02-basket.webp",
    size: [1600, 903],
    alt: "WeShopAlot basket page with one 12-String Cutaway at $800.00, quantity controls, and an order summary",
    summary: "One item in the basket, quantity buttons, a trash can, and an order summary with shipping still at $0.00.",
    calls: [
      { method: "POST", route: "/api/basket", when: "Add to basket, +, and − (the whole basket each time)" },
      { method: "DELETE", route: "/api/basket?id={basket_id}", when: "when the last item is removed" },
    ],
    points: [
      "The client invents the basket id, stores it in localStorage as `basket_id`, and sends the entire basket, items and all, on every change. The server stores it in Redis for 30 days; no login is needed to shop.",
      "Because each call replaces the whole basket, the operation is really a PUT. Sending it as POST tells caches and clients that it is not safe to repeat, which is the opposite of the truth. `PUT /api/baskets/{id}` is the honest contract (Module 9).",
      "The totals are computed in the browser from the basket in memory. That is fine for display; the server never trusts these numbers, as we will see at payment.",
      "The cart badge in the header is the same basket observable that this page renders: one source of client state, several views.",
    ],
    ask: "Two tabs, same basket: add a guitar in one and remove it in the other. Whose version wins, and why?",
    modules: [2, 9],
  },
  {
    id: "address",
    layer: "UI",
    title: "Checkout, step 1: Address (signed in)",
    short: "Address",
    url: "https://localhost:4200/checkout",
    image: "03-address.webp",
    size: [1600, 904],
    alt: "Checkout address step with the shipping address form pre-filled for the signed-in user",
    summary:
      "Checkout is behind a route guard. The shipping form arrives pre-filled from the user's saved address. (The address shown is a placeholder.)",
    calls: [
      { method: "GET", route: "/api/account/address", when: "on load: pre-fill the form (Bearer token)" },
      { method: "PUT", route: "/api/account/address", when: "Save as default address" },
    ],
    points: [
      "The `checkout` route has `canActivate: [AuthGuard]`. A signed-out user is sent to login first and returned here afterwards.",
      "From this step on, every request carries `Authorization: Bearer <jwt>`. The Angular JWT interceptor adds it, so no service method mentions tokens.",
      "This screen is proof of a fix: before the October 2026 upgrade, `GET /api/account/address` read the user from `ClaimsPrincipal.Current`, which ASP.NET Core never sets, so the form came up empty.",
      "One reactive form group per step (address, delivery, payment) inside a single checkout form. Go to Delivery stays disabled until the address group is valid.",
    ],
    ask: "Why is \"Save as default address\" a PUT and not a POST?",
    modules: [9, 10],
  },
  {
    id: "delivery",
    layer: "UI",
    title: "Checkout, step 2: Delivery",
    short: "Delivery",
    url: "https://localhost:4200/checkout",
    image: "04-delivery.webp",
    size: [1600, 602],
    alt: "Checkout delivery step with four delivery methods, FREE selected",
    summary: "Four delivery methods from the database; choosing one updates the order summary immediately.",
    calls: [
      { method: "GET", route: "/api/order/deliveryMethods", when: "on load (behind [Authorize])" },
      { method: "POST", route: "/api/basket", when: "choosing a method saves deliveryMethodId and shippingPrice on the basket" },
    ],
    points: [
      "The four options are rows in the `DeliveryMethods` table, seeded from JSON. Change one in the database and the page changes with no deploy.",
      "Lookup data behind `[Authorize]`: there is no clear reason anonymous users can't see shipping options. A small contract question worth arguing about.",
      "The client writes the shipping price onto the basket. That is a display convenience only: the payment and order services look the delivery method up again by id and use the database price.",
    ],
    ask: "If a student edits the request in DevTools to make UPS1 cost $0.00, what do they actually pay?",
    modules: [2, 9],
  },
  {
    id: "review",
    layer: "UI",
    title: "Checkout, step 3: Review",
    short: "Review",
    url: "https://localhost:4200/checkout",
    image: "05-review.webp",
    size: [1600, 595],
    alt: "Checkout review step showing the basket contents before payment",
    summary: "A read-only view of the basket. The interesting part is the button: Go to Payment talks to the API before it moves on.",
    calls: [{ method: "POST", route: "/api/payment/{basketId}", when: "Go to Payment: create or update the Stripe PaymentIntent" }],
    points: [
      "Go to Payment asks our API to create (or update) a Stripe PaymentIntent. The server, not the browser, holds the Stripe secret key.",
      "The server reprices the basket from the database, product by product, and adds the delivery method's real price before it tells Stripe the amount. Client totals are never trusted.",
      "The response is the basket again, now carrying a `paymentIntentId` and a `clientSecret`: a one-purchase key the browser will hand to Stripe in the next step.",
    ],
    ask: "Why does the API return the basket here instead of just the client secret?",
    modules: [11],
  },
  {
    id: "payment",
    layer: "UI",
    title: "Checkout, step 4: Payment",
    short: "Payment",
    url: "https://localhost:4200/checkout",
    image: "06-payment.webp",
    size: [1600, 620],
    alt: "Checkout payment step with Stripe card fields filled in with the 4242 test card",
    summary: "Name on card is ours; card number, expiry, and CVC are Stripe Elements. Submitting runs three calls in order.",
    calls: [
      { method: "POST", route: "/api/order", when: "Submit order, 1st: create the order from the basket" },
      { method: "STRIPE", route: "stripe.confirmCardPayment(clientSecret)", when: "Submit order, 2nd: browser → Stripe directly" },
      { method: "DELETE", route: "/api/basket?id={basket_id}", when: "Submit order, 3rd: on success, clear the basket" },
      { method: "POST", route: "/api/payment/webhook", when: "later: Stripe → our API, signed" },
    ],
    points: [
      "The card fields are Stripe-hosted iframes. The card number goes from the browser to Stripe and never touches our API, which keeps the app out of most PCI scope.",
      "4242 4242 4242 4242 with any future expiry and any CVC is Stripe's public test card; it only works with test keys. Never type a real card into a dev build.",
      "The order is created before the payment is confirmed. It starts as Pending, and the API marks it Payment Received or Payment Failed when Stripe calls the webhook, whose `Stripe-Signature` header is verified first.",
      "Submit twice? The order service looks for an existing order with the same `PaymentIntentId` and updates that order rather than adding a second one: an idempotency story to come back to in Module 11.",
    ],
    ask: "What should the user see if the order is created but the card is declined?",
    modules: [10, 11],
  },
  {
    id: "success",
    layer: "UI",
    title: "Success: the order is confirmed",
    short: "Success",
    url: "https://localhost:4200/checkout/success",
    image: "07-success.webp",
    size: [1600, 546],
    alt: "Order confirmation page with a green check and a View your order button",
    summary: "The cart badge is gone, the order exists on the server, and View your order reads it back.",
    calls: [
      { method: "GET", route: "/api/order/{id}", when: "View your order" },
      { method: "GET", route: "/api/order", when: "My orders, in the user menu" },
    ],
    points: [
      "The created order rides to this page in the router's navigation state. Refresh, and that state is gone, but the order is not: it lives on the server, and View your order fetches it by id.",
      "`GET /api/order/{id}` is scoped to the signed-in user, and someone else's order id returns 404, which hides that the order exists at all.",
      "Count the calls from the shop to here: about a dozen requests across four controllers, plus one to Stripe. That is the whole contract a second client has to honour, and the WPF app honours the same one.",
    ],
    ask: "Which of today's calls would you change first if you were redesigning the contract, and to what?",
    modules: [10],
  },
];
