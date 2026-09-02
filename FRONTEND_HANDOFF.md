# ShopSphere front-end handoff

## Purpose and source of truth

This document is a complete UI integration guide generated from the current Spring Boot source on 31 August 2026. The running backend code is the source of truth; use the OpenAPI JSON for generated types only after reconciling it with the **known contract gaps** below.

Backend base URL in local development: `http://localhost:8000`.

The API has no version prefix beyond `/api`. Swagger UI is available at `/swagger-ui/index.html` and the generated OpenAPI document at `/v3/api-docs` when the application is running.

## Technology and backend capabilities

| Area | Current implementation |
| --- | --- |
| Runtime | Java 21, Spring Boot 4.1, Spring MVC |
| Persistence | MySQL, Spring Data JPA/Hibernate; schema is updated automatically (`ddl-auto=update`) |
| Authentication | Stateless JWT bearer token, 24-hour expiry |
| Passwords | BCrypt |
| Authorization | `ROLE_CUSTOMER` and `ROLE_ADMIN` |
| API style | JSON REST API; multipart form-data for product images |
| Pagination | Spring `Page` JSON responses; query parameters `page`, `size`, `sort` |
| Product search | Keyword, category, exact brand, price range, and stock filters |
| Files | Images saved locally; JPEG, PNG, and WebP; 5 MB per image; 20 MB request limit |
| Payments | Simulated gateway only, with retry support |
| Email/invoices | Successful payment triggers asynchronous confirmation email and PDF invoice |
| API docs | springdoc OpenAPI / Swagger UI |

There is no frontend application, frontend framework, CORS configuration, external payment SDK, address model, shipping-address collection, review API, wishlist, coupon, tax, shipping-cost, refund, or user-profile endpoint in the current project.

## Authentication and authorization

### Login and token use

`POST /api/auth/login` is public. Submit:

```json
{ "username": "customer@example.com", "password": "password" }
```

Its successful response is a JSON string field named `message`, whose value is the JWT:

```json
{ "message": "eyJhbGciOiJIUzI1NiJ9..." }
```

Store that value as the access token and send it on every protected call:

```http
Authorization: Bearer <token>
```

Tokens expire after 86,400,000 ms (24 hours). There is no refresh-token endpoint and no server logout endpoint. Client logout is therefore local token removal. The JWT contains only the email subject, not the role or user ID.

### Roles

`ROLE_CUSTOMER` is assigned to every registered user. An initial admin is seeded automatically when the database has no such email: `admin@shopsphere.com` / `admin123` (this should be changed outside a local development environment).

Roles cannot be reliably discovered from the API or token: there is no `/me` endpoint, no profile endpoint, and no role claim in the JWT. A frontend should not treat a role-decoded token as authoritative. This is a backend gap that must be resolved before a safe admin/customer navigation split is possible.

### Route access matrix

| Visitor / customer | Customer only | Admin only |
| --- | --- | --- |
| Login, registration, product and category reads, product-image reads | Cart actions, order creation/read/cancel, payment creation/retry and own payment history | Product/category mutation, inventory mutation, order administration, payment administration, image deletion |

Important implementation detail: the security filter requires authentication for every endpoint other than `/api/auth/**`, `GET /api/products/**`, and `GET /api/categories/**`. Method-level role checks add the restrictions indicated above.

## User journeys and UI screens

### Public storefront

Build a product listing, search/filter page, product-detail page, category browsing, and an empty/no-results state. Product list/detail payloads do **not** include images or inventory, so load images separately for each product where needed. Stock availability is not available for a single product; only the search `inStock` filter exists.

### Authentication

Build registration and login screens. Registration does not log the user in and does not create a cart immediately. After registration, redirect to login. On login, extract `response.message` as the raw bearer token.

### Customer checkout flow

1. Add or update cart items. Adding an item reserves inventory immediately.
2. Create the order from the authenticated user's cart; the order starts `PENDING` and empties the cart.
3. Create a payment for that order. The simulated gateway responds synchronously with `COMPLETED` or `FAILED`.
4. If failed, offer retry using the returned payment ID. If completed, show confirmation; the backend also dispatches email/invoice asynchronously.

There is no cart retrieval endpoint. The cart is returned after every cart mutation only. Maintain the latest returned cart client-side, then refresh it by a benign mutation only if absolutely needed. A dedicated `GET /api/shopping-carts/users` endpoint is required for a robust returning-user cart page.

### Customer orders and payments

Show the customer order history from `/api/orders/user` and detail from `/api/orders/{orderId}`. The backend does not enforce ownership on the general order-detail or cancellation endpoints, so the UI must only present the current user's order IDs; server-side ownership must still be fixed for security.

Show payment history from `/api/payments/me`. A payment detail can be found by reference or order, but those endpoints have incomplete ownership protection (see gaps).

### Admin console

Build sections for products, product images, categories, inventory, orders, status workflow, all payments, and failed payments. Because role discovery is unavailable, do not expose this based only on client logic; it will require a backend role/current-user endpoint or a role-bearing JWT.

## Resource schemas

All names below use lower camel case. Monetary fields are JSON numbers and should be handled as decimal/currency values in the UI; do not perform floating-point money arithmetic.

### Product

```ts
type Product = {
  id: number;
  name: string;
  description: string | null;
  brand: string;
  price: number;
  categoryId: number;
  categoryName: string;
};
type ProductInput = {
  name: string;        // required, max 150
  description?: string; // max 1000
  brand: string;       // required, max 100
  price: number;       // required, > 0
  categoryId: number;  // required
};
```

The API does not return `active`, images, average rating/reviews, SKU, discount, or inventory as part of a product.

### Category

```ts
type Category = { id: number; name: string; description: string | null };
type CategoryInput = {
  name: string;        // required, max 100
  description?: string; // max 500
};
```

### Image

```ts
type ProductImage = {
  id: number;
  fileName: string;
  originalFileName: string;
  contentType: string | null;
  fileSize: number | null;
  url: string; // relative, e.g. /api/products/12/images/42
};
```

Use `${API_BASE_URL}${image.url}` in an `<img>` element. The raw image response does not explicitly set its content type in the controller, so test browser display against the running service.

### Cart

```ts
type CartItem = {
  id: number;
  productId: number;
  productName: string;
  price: number;       // price captured when first added
  quantity: number;
  totalPrice: number;
};
type ShoppingCart = {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
};
```

Cart items do not include product images, brand, current product price, or stock. The cart price is a snapshot from when the item was first added.

### Orders

```ts
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type OrderItem = {
  id: number; productId: number; productName: string;
  productPrice: number; quantity: number; subtotal: number;
};
type Order = {
  id: number; userId: number; totalAmount: number;
  status: OrderStatus; orderDate: string; items: OrderItem[];
};
```

Customer cancellation is accepted for `PENDING`, `CONFIRMED`, and `PACKED`; it is rejected after shipment, delivery, or a prior cancellation. Admin status transitions are strictly:

```text
PENDING   -> CONFIRMED | CANCELLED
CONFIRMED -> PACKED    | CANCELLED
PACKED    -> SHIPPED   | CANCELLED
SHIPPED   -> DELIVERED
DELIVERED/CANCELLED -> no transitions
```

### Payments

```ts
type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET' | 'CASH_ON_DELIVERY';
type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
type Payment = {
  id: number;
  paymentReference: string;
  gatewayTransactionId?: string | null;
  paidAmount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  completedAt?: string | null;
};
```

Although the declared `PaymentResponse` class has all fields above, the current mapper actually populates only `id`, `paymentReference`, `paidAmount`, and `paymentStatus`. Treat `gatewayTransactionId`, `paymentMethod`, and `completedAt` as absent in real responses until that mapper is corrected. Failure reason and attempt number are never returned.

### Inventory (admin)

```ts
type Inventory = {
  id: number; productId: number; productName: string;
  quantity: number; reservedQuantity: number; availableQuantity: number;
  minimumStock: number; maximumStock: number;
};
```

`availableQuantity` equals `quantity - reservedQuantity`.

### User

```ts
type User = { id: number; firstName: string; lastName: string; email: string; phone: string };
```

Registration requires first name and last name (each max 50), email (max 100), exactly 10 numeric phone digits, and password length 8–100. User update and deactivation service code exists but there is no controller endpoint for them.

### Spring page envelope

Every paginated endpoint returns Spring Data's `Page` representation rather than an array:

```ts
type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // zero-based current page
  first: boolean;
  last: boolean;
  empty: boolean;
  // Spring may additionally serialize pageable, sort, numberOfElements
};
```

## Complete endpoint catalog

### Auth (public)

| Method and path | Request | Success | Notes |
| --- | --- | --- | --- |
| `POST /api/auth/register` | `UserRegistrationRequest` | `201 User` | Does not log in |
| `POST /api/auth/login` | `{ username: email, password }` | `200 { message: token }` | Username must be a valid email |
| `POST /api/auth/email?orderId={id}&paymentId={id}` | none | `200` empty | Public route; manually triggers confirmation email |

### Products and product images

| Method and path | Access | Request/query | Success |
| --- | --- | --- | --- |
| `GET /api/products?page=0&size=10&sort=name,asc` | Public | Pageable; defaults page 0, size 10, sort name | `Page<Product>` |
| `GET /api/products/{id}` | Public | — | `Product` |
| `GET /api/products/search?keyword=&categoryId=&brand=&minPrice=&maxPrice=&inStock=&page=&size=&sort=` | Public | All filters optional | `Page<Product>` |
| `POST /api/products` | Admin | `ProductInput` | `201 Product` |
| `PUT /api/products/{id}` | Admin | `ProductInput` | `200 Product` |
| `DELETE /api/products/{id}` | Admin | — | `204` (soft-deactivates product) |
| `GET /api/products/{productId}/images` | Public | — | `ProductImage[]` |
| `GET /api/products/{productId}/images/{imageId}` | Public | — | binary image |
| `POST /api/products/{productId}/images` | Authenticated (not admin-only) | `multipart/form-data`, field `file` | `200 ProductImage` |
| `DELETE /api/products/{productId}/images/{imageId}` | Admin | — | `204` |

Search behavior: keyword matches name, description, or brand case-insensitively; brand filter is exact case-insensitive; price is inclusive. `inStock=true` means stored `quantity > 0`, not `availableQuantity > 0`, so it can report a product as in stock even if all units are reserved.

### Categories

| Method and path | Access | Request/query | Success |
| --- | --- | --- | --- |
| `GET /api/categories` | Public | — | `Category[]` |
| `GET /api/categories/{id}` | Public | — | `Category` |
| `GET /api/categories/{categoryId}/products?page=0&size=10&sort=name,asc` | Public | Pageable defaults | `Page<Product>` (active products only) |
| `POST /api/categories` | Admin | `CategoryInput` | `201 Category` |
| `PUT /api/categories/{id}` | Admin | `CategoryInput` | `200 Category` |
| `DELETE /api/categories/{id}` | Admin | — | `204` |

### Cart (all require authentication)

| Method and path | Request | Success |
| --- | --- | --- |
| `POST /api/shopping-carts/users` | none | `201 ShoppingCart` |
| `POST /api/shopping-carts/users/items` | `{ productId: number, quantity: integer >= 1 }` | `200 ShoppingCart` |
| `PATCH /api/shopping-carts/users/items/{productId}` | `{ quantity: integer >= 1 }` | `200 ShoppingCart` |
| `DELETE /api/shopping-carts/users/items/{productId}` | — | `200 ShoppingCart` |
| `DELETE /api/shopping-carts/users/clear` | — | `200 ShoppingCart` |

Adding an item creates a cart automatically if none exists. `POST /users` only works when the user does not already have a cart.

### Orders (all require authentication)

| Method and path | Effective access | Request/query | Success |
| --- | --- | --- | --- |
| `POST /api/orders` | Authenticated | none; uses current cart | `201 Order` |
| `GET /api/orders/user` | Authenticated | — | `Order[]` of current user, newest first |
| `GET /api/orders/{orderId}` | Authenticated | — | `Order` |
| `DELETE /api/orders/{orderId}` | Authenticated | — | `204` |
| `PATCH /api/orders/{orderId}/status?status={OrderStatus}` | Admin | status is required query parameter | `200 Order` |
| `GET /api/orders?page=&size=&sort=` | Admin | Pageable | `Page<Order>` |
| `GET /api/orders/status/{status}?page=&size=&sort=` | Admin | Pageable | `Page<Order>` |
| `GET /api/orders/user/{userId}/page?page=&size=&sort=` | Admin | Pageable | `Page<Order>` |

### Payments (all require authentication)

| Method and path | Effective access | Request/query | Success |
| --- | --- | --- | --- |
| `POST /api/payments` | Customer | `{ orderId, paymentMethod }` | `201 Payment` |
| `POST /api/payments/{paymentId}` | Customer | — | `201 Payment` retry; only for a failed prior payment |
| `GET /api/payments/me` | Authenticated | — | `Payment[]` for current user's orders |
| `GET /api/payments/reference/{paymentReference}` | Authenticated | — | `Payment` |
| `GET /api/payments/order/{orderId}` | Customer | — | latest `Payment` for that order |
| `GET /api/payments` | Admin | — | `Payment[]` |
| `GET /api/payments/failed` | Admin | — | `Payment[]` |

### Inventory (admin only)

| Method and path | Request | Success |
| --- | --- | --- |
| `POST /api/inventory` | `{ productId, quantity >= 0, minimumStock >= 0, maximumStock > 0 }` | `201 Inventory` |
| `PATCH /api/inventory/products/{productId}/increase` | `{ quantity: integer > 0 }` | `200 Inventory` |
| `PATCH /api/inventory/products/{productId}/decrease` | `{ quantity: integer > 0 }` | `200 Inventory` |
| `PATCH /api/inventory/products/{productId}/reserve` | `{ quantity: integer > 0 }` | `200 Inventory` |
| `PATCH /api/inventory/products/{productId}/release` | `{ quantity: integer > 0 }` | `200 Inventory` |
| `PATCH /api/inventory/products/{productId}/confirm` | `{ quantity: integer > 0 }` | `200 Inventory` |

## Errors and UI behavior

For expected domain errors (`404`, `409`, many `400`s), the response is:

```ts
type ApiError = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
};
```

Validation failures return `400` as a flat object mapping fields to messages, for example:

```json
{ "email": "must be a well-formed email address", "password": "must not be blank" }
```

Authentication failures return `401 ApiError` with message `Authentication is required or the token is invalid.` Authorization failures return `403 ApiError` with message `You do not have permission to access this resource.`

Not every runtime exception is handled globally. Some invalid conditions throw `IllegalArgumentException` and may surface as a generic server error. Build a fallback error toast/dialog for unrecognised response shapes and `5xx` errors.

## Known API contract gaps and risks to give Claude

These items are particularly important. They are implemented behavior, not UI choices.

1. **No CORS configuration.** A separately hosted SPA will normally be blocked by browsers. Add an allowed frontend origin in the backend before deployment; a dev proxy only hides this locally.
2. **Role/current-user contract missing.** Login returns a token under `message`, not user/role metadata. The token has email only, and there is no `/me` endpoint.
3. **No cart read endpoint.** A returning customer cannot fetch their cart without mutation.
4. **Product cards lack image and stock fields.** The UI must make additional image calls; product inventory is not publicly queryable. Avoid inventing ratings, sale prices, or stock counts.
5. **Image upload is not restricted to admins.** Any authenticated user can upload an image, while only admins can delete. The intended UI should treat image management as admin-only, but the server needs enforcement.
6. **Ownership checks are incomplete.** Any authenticated user can fetch/cancel an arbitrary order ID; any authenticated user can fetch a payment by reference; `GET /payments/order/{id}` verifies customer role but not ownership. Do not regard client-side hiding as a security control.
7. **Payment response mismatch.** DTO declares fields that `PaymentMapperImpl` does not set. The actual response reliably has `id`, `paymentReference`, `paidAmount`, and `paymentStatus` only.
8. **Public trigger-email endpoint.** `/api/auth/email` can trigger a confirmation email for arbitrary existing order/payment IDs and should not be used in a normal UI flow; payment success already triggers it.
9. **Product listing can include inactive products.** `GET /api/products` calls `findAll` and does not filter soft-deleted products, while product detail/search/category pages do. Treat it as a backend defect.
10. **Category listing can include deleted/inactive categories.** Categories are physically deleted, while soft-delete audit fields exist on all entities. Deleting a category that has products may fail due to database relationships.
11. **`inStock` filter is semantically inaccurate.** It checks total quantity rather than unreserved available quantity.
12. **Order cancellation restocks incorrectly.** Order creation confirms a reservation (decreasing quantity); cancellation calls `increaseStock`, but does not check ownership. It can fail if maximum stock would be exceeded.
13. **No checkout address/shipping data.** The order contains only items, total, status, date, and user ID. No delivery address, delivery charge, tax, or invoice download API exists.
14. **Reviews are database-only.** An entity exists but no review endpoints or UI contract exists.
15. **Admin inventory is not discoverable from product views.** There is no `GET` inventory endpoint, only create and stock-changing commands, so an inventory table cannot be populated after reload.
16. **No user profile endpoints.** Service methods exist but none are exposed by a controller.

## Frontend implementation guidance

- Use a single API client with `baseURL = http://localhost:8000`; add the bearer header only when a token exists.
- Treat `401` as expired/invalid session: clear local auth state and redirect to login. Treat `403` as an access-denied page.
- Keep API response types separate from ideal UI view models. For example, enrich a `Product` card with a fetched primary image, but make that enrichment explicit and tolerate no image.
- Include loading, empty, error, and optimistic-update rollback states for cart mutations because each mutation reserves/releases stock server-side.
- Use zero-based `page` values in all pageable requests. `sort` uses Spring syntax such as `sort=name,asc`.
- Display all order/payment timestamps as ISO local date-time values returned without a timezone offset. Use the storefront’s agreed timezone consistently.
- Never show or collect real card data: payment processing is simulated and the API accepts only an enum payment method.
- Do not call the public email trigger as part of checkout.

## Recommended backend additions before a production UI

1. Add CORS configuration for the chosen frontend origin.
2. Change login response to `{ accessToken, tokenType, expiresIn, user: { id, name, email, role } }`, or add an authenticated `/api/users/me` endpoint.
3. Add `GET /api/shopping-carts/users`.
4. Include primary image, image list or image URL, inventory availability, and `active` in a customer-safe product DTO; make product lists filter active records.
5. Add read endpoints for product inventory/admin inventory and profile management.
6. Enforce ownership for order and payment lookups/cancellation; enforce admin-only image upload and secure the email trigger.
7. Make `PaymentMapperImpl` map every field promised by `PaymentResponse`, and include failure reason/attempt information for retry UX.
8. Add a real, documented error-handler policy for invalid arguments and authentication failures.
9. Add address, shipping, payment-provider redirect/webhook, refund, and invoice-download APIs if those are product requirements.

