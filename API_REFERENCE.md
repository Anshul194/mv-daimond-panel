# API Reference

This document summarizes the main backend HTTP endpoints used in this project, expected payload shapes, sample curl/axios calls, and where each endpoint is invoked in the codebase.

---

## Base URL
- Default: `https://ardordiamonds.com`
- If running in the frontend, the app reads `VITE_BASE_URL` from env.

---

## Product Attributes (Custom Attributes)

### POST /api/productattribute
- Description: Create a new product attribute (e.g., "Style") and its terms. Accepts multipart/form-data (file uploads for term images).
- Payload (multipart/form-data):
  - `title` (string)
  - `category_id` (string, optional)
  - `terms[i][value]` (string)
  - `terms[i][image]` (file)
- Where used: `src/store/slices/customAttributes.ts` -> `createCustomAttribute`

Example curl:
```bash
curl -X POST "https://ardordiamonds.com/api/productattribute" \
  -H "Authorization: Bearer AUTH_TOKEN" \
  -F 'title=Style' \
  -F 'category_id=CATEGORY_ID' \
  -F 'terms[0][value]=Vintage' \
  -F 'terms[0][image]=@vintage.png' \
  -F 'terms[1][value]=Modern' \
  -F 'terms[1][image]=@modern.png'
```

Axios example:
```js
const formData = new FormData();
formData.append('title', 'Style');
formData.append('category_id', categoryId);
terms.forEach((t, i) => {
  formData.append(`terms[${i}][value]`, t.value);
  formData.append(`terms[${i}][image]`, t.imageFile);
});
await axiosInstance.post(`${API_BASE_URL}/api/productattribute`, formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
```

---

### GET /api/productattribute
- Description: Fetch paginated list of product attributes.
- Query params: `page`, `limit`, `filters` (JSON string), `searchFields` (JSON string), `sort` (JSON string)
- Where used: `src/store/slices/customAttributes.ts` -> `fetchCustomAttributes`

Example:
```bash
curl "https://ardordiamonds.com/api/productattribute?page=1&limit=10"
```

---

### PUT /api/productattribute
- Description: Update an attribute. The slice sends multipart form with `id` as query param.
- Where used: `src/store/slices/customAttributes.ts` -> `updateCustomAttribute`

---

### DELETE /api/productattribute
- Description: Delete an attribute. The slice sends `id` as a param and may send formData in body.
- Where used: `src/store/slices/customAttributes.ts` -> `deleteCustomAttribute`

---

## Product

### POST /api/product
- Description: Create a product (multipart/form-data), including images and attributes.
- Where used: `src/store/slices/product.ts` -> `createProduct`

Example curl:
```bash
curl -X POST "https://ardordiamonds.com/api/product" \
  -H "Authorization: Bearer AUTH_TOKEN" \
  -F 'title=My Product' \
  -F 'category=CAT_ID' \
  -F 'images=@img1.png' \
  -F 'attributes[0][attributeId]=ATTR_ID' \
  -F 'attributes[0][value]=Vintage'
```

Additional example (create a featured product):
```bash
curl -X POST "https://ardordiamonds.com/api/product" \
  -F "name=Test Featured Ring" \
  -F "category_id=6854fc895e53f236d75c07af" \
  -F "price=1200" \
  -F "featured=true" \
  -H "Authorization: Bearer <TOKEN>"
```

### GET /api/product
- Description: Fetch paginated products. Query params: `page`, `limit`, `filters`, `searchFields`, `sort`.
- Where used: `src/store/slices/product.ts` -> `fetchProducts`

### PUT /api/product/:productId
- Description: Update product (FormData). Where used: `src/store/slices/product.ts` -> `updateProduct`

### DELETE /api/product/:productId
- Description: Delete product. Where used: `src/store/slices/product.ts` -> `deleteproduct`

---

### GET /api/productattribute/:categoryId
- Description: Fetch product attributes for a category (terms used in product form dropdowns).
- Where used: `src/store/slices/product.ts` -> `fetchProductAttributes`

Example fetch (axios):
```js
const res = await axiosInstance.get(`${API_BASE_URL}/api/productattribute/${categoryId}`);
const attributes = res.data.data; // shape depends on backend
```

---

### GET /api/blog-category
- Description: Fetch blog categories (paginated list).
- Where used: `src/store/slices/blogCategorySlice.ts` -> `fetchBlogCategories`

Sample response:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "message": "Blog categories fetched",
    "data": {
      "data": [
        {
          "_id": "687f37f4cbcd7779d79f48bc",
          "name": "Linda Patton",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "linda-patton-381",
          "createdAt": "2025-07-22T07:04:20.907Z",
          "updatedAt": "2025-07-22T07:04:20.907Z",
          "__v": 0
        },
        {
          "_id": "687f3563cbcd7779d79f47c2",
          "name": "Tobias Hamilton",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "tobias-hamilton-335",
          "createdAt": "2025-07-22T06:53:23.517Z",
          "updatedAt": "2025-07-22T06:53:23.517Z",
          "__v": 0
        },
        {
          "_id": "687f3561cbcd7779d79f47bd",
          "name": "Madonna Malone",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "madonna-malone-189",
          "createdAt": "2025-07-22T06:53:21.203Z",
          "updatedAt": "2025-07-22T06:53:21.203Z",
          "__v": 0
        },
        {
          "_id": "687f355fcbcd7779d79f47b8",
          "name": "Arsenio Perez",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "arsenio-perez-124",
          "createdAt": "2025-07-22T06:53:19.327Z",
          "updatedAt": "2025-07-22T06:53:19.327Z",
          "__v": 0
        },
        {
          "_id": "687f3514cbcd7779d79f479f",
          "name": "Winifred Mejia",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "winifred-mejia-864",
          "createdAt": "2025-07-22T06:52:04.489Z",
          "updatedAt": "2025-07-22T06:52:04.489Z",
          "__v": 0
        },
        {
          "_id": "687f3512cbcd7779d79f479a",
          "name": "Lucius Atkinson",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "lucius-atkinson-525",
          "createdAt": "2025-07-22T06:52:02.079Z",
          "updatedAt": "2025-07-22T06:52:02.079Z",
          "__v": 0
        },
        {
          "_id": "687f350fcbcd7779d79f4795",
          "name": "Vladimir Macias",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "vladimir-macias-195",
          "createdAt": "2025-07-22T06:51:59.914Z",
          "updatedAt": "2025-07-22T06:51:59.914Z",
          "__v": 0
        },
        {
          "_id": "687f350dcbcd7779d79f4790",
          "name": "Hector Tillman",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "hector-tillman-545",
          "createdAt": "2025-07-22T06:51:57.746Z",
          "updatedAt": "2025-07-22T06:51:57.746Z",
          "__v": 0
        },
        {
          "_id": "687f350bcbcd7779d79f478b",
          "name": "TaShya Mejia",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "tashya-mejia-889",
          "createdAt": "2025-07-22T06:51:55.113Z",
          "updatedAt": "2025-07-22T06:51:55.113Z",
          "__v": 0
        },
        {
          "_id": "687f3508cbcd7779d79f4786",
          "name": "Dieter Cook",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "dieter-cook-482",
          "createdAt": "2025-07-22T06:51:52.064Z",
          "updatedAt": "2025-07-22T06:51:52.064Z",
          "__v": 0
        },
        {
          "_id": "687de2085b27759cb4fa486b",
          "name": "Timothy Delgado",
          "image": "",
          "status": "active",
          "deletedAt": null,
          "slug": "timothy-delgado-405",
          "createdAt": "2025-07-21T06:45:28.761Z",
          "updatedAt": "2025-07-21T06:45:28.761Z",
          "__v": 0
        },
        {
          "_id": "6878cbb596dfc8337a3359b4",
          "name": "Education",
          "image": "/blog-category-images/profile-1752746933442-299021786.jpg",
          "status": "active",
          "deletedAt": null,
          "slug": "education-388",
          "createdAt": "2025-07-17T10:08:53.523Z",
          "updatedAt": "2025-07-17T10:08:53.523Z",
          "__v": 0
        }
      ],
      "pagination": {
        "totalPages": null,
        "totalItems": 12,
        "itemsPerPage": 10
      }
    }
  }
}
```

## Brands
- POST /api/brands (multipart) — `src/store/slices/brandslice.ts` -> `createBrand`
- GET /api/brands?… — `src/store/slices/brandslice.ts` -> `fetchBrands`
- PUT /api/brands/:id — `src/store/slices/brandslice.ts` -> `updateBrand`
- DELETE /api/brands/:id — `src/store/slices/brandslice.ts` -> `deleteBrand`

Example create curl:
```bash
curl -X POST "https://ardordiamonds.com/api/brands" \
  -H "Authorization: Bearer AUTH_TOKEN" \
  -F 'name=BrandName' \
  -F 'title=Brand Title' \
  -F 'logo=@logo.png'
```

---

## Sizes (example custom attribute slice)
- POST /api/size — `src/store/slices/sizeSlice.ts` -> `createSize`
- GET /api/size?… — `src/store/slices/sizeSlice.ts` -> `fetchSizes`
- GET/PUT/DELETE /api/size/:id — `src/store/slices/sizeSlice.ts` -> `fetchSizeById`, `updateSize`, `deleteSize`

---

## Orders
- POST /api/order — create order -> `src/store/slices/order.ts` -> `createOrder`
- GET /api/order?admin=true&… — fetch admin orders -> `src/store/slices/order.ts` -> `fetchOrders`
- GET /api/order/:orderId — `src/store/slices/order.ts` -> `fetchOrderById`
- PUT /api/order_update/:orderId — update order -> `src/store/slices/order.ts` -> `updateOrder`
- DELETE /api/order/:orderId — `src/store/slices/order.ts` -> `deleteOrder`

---

## Services / CMS
- `/api/service` (GET, POST, PUT, DELETE) — `src/store/slices/serviceSlice.ts`

---

## Vendor/Auth
- POST `/api/auth/register` — register vendor -> `src/store/slices/vendorslice.ts` -> `registerVendor`
- GET `/api/vendor` — list vendors -> `src/store/slices/vendorslice.ts` -> `fetchVendor`

---

## Tax Classes
- `/api/tax-class` and `/api/tax-class-option` endpoints used in `src/store/slices/taxClass.ts` and `src/store/slices/taxClassOption.ts`.

---

## Notes on patterns & flows
- axiosInstance: all requests use `src/services/axiosConfig.ts` to centralize base URL, interceptors and auth headers.
- Multipart uploads: endpoints that handle images/files set `Content-Type: multipart/form-data` in thunks.
- Pagination/filtering: many list endpoints accept `filters` and `searchFields` as JSON-encoded query params. See slice implementations for exact query building.
- Attribute <-> Product relationship: the frontend typically fetches attribute terms for a category and sends attribute mapping with product creation/update. If you need to attach a product to an attribute term after product creation, either:
  - Use a dedicated endpoint if your backend exposes one (e.g., `POST /api/productattribute/:attrId/products` or `POST /api/productattribute/:attrId/terms/:termId/products`), or
  - Update the product document (PUT /api/product/:productId) to include the attribute mapping.

---

## Want this expanded?
I can:
- Add curl examples for every endpoint in this file.
- Add response shape examples (please provide a sample API response or allow me to call the API).
- Generate a Markdown file with clickable links to the exact slice functions (I can add line ranges).

If you want, I can commit additional examples or generate a `docs/api/` folder with endpoint-by-endpoint docs. Let me know which option.