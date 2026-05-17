# Pre‑Deployment Checklist for AI Resume Screening App

## 1️⃣ Authentication & Security
- [ ] **Password hashing** – Verify `bcrypt` is used for all password storage (`User` model pre‑save hook or explicit hash). 
- [ ] **JWT secret** – Ensure `process.env.JWT_SECRET` is defined in production environment and never hard‑coded.
- [ ] **JWT payload** – Tokens contain `id` (user ID) and `role` fields only.
- [ ] **Token expiration** – `expiresIn` is set (default `7d` or as defined by `process.env.JWT_EXPIRE`).
- [ ] **Auth middleware** – `src/middleware/auth.middleware.js` correctly verifies JWT, attaches `req.user`, and rejects invalid/expired tokens.
- [ ] **HTTP‑only cookies** – If using cookies, they are set with `httpOnly: true`, `secure: true` (in production), and `sameSite` appropriately.
- [ ] **Logout** – Logout endpoint clears token cookie or instructs client to remove stored token (localStorage removal). Verify token revocation isn’t necessary for stateless JWT.
- [ ] **Rate limiting & validation** – Ensure `validation.middleware.js` and any rate‑limit middleware are active for `/auth/*` routes.

## 2️⃣ Environment & Configuration
- [ ] **.env.example** – Contains all required vars: `JWT_SECRET`, `JWT_EXPIRE`, `FRONTEND_URL`, `ALLOWED_ORIGINS`, DB connection string, Google AI keys, etc.
- [ ] **Production .env** – No secret values committed to repo; verify they are set on Render/Vercel dashboards.
- [ ] **CORS** – `src/app.js` allows origins from `process.env.ALLOWED_ORIGINS` and includes Vercel preview URLs.
- [ ] **Static file serving** – `/uploads` folder served via `express.static`; confirm path works in production.
- [ ] **Node engine** – `package.json` specifies `"engines": { "node": ">=18.0.0" }`.

## 3️⃣ Codebase Clean‑up
- [ ] **Git ignore** – Verify `node_modules`, `uploads`, `.env`, `test‑*`, `scratch/`, and any debug scripts are excluded.
- [ ] **Removed debug endpoints** – Confirm `/api/auth/test-cleanup` is deleted.
- [ ] **Deprecated SDKs** – Ensure `@google/generative-ai` is removed; only `@google/genai` remains.
- [ ] **Dependencies** – `nodemon` moved to `devDependencies`.
- [ ] **Linting** – Run `npm run lint` (if set) without errors.

## 4️⃣ Database & Models
- [ ] **User model** – Password hashed before save, OTP fields cleared after verification, reset token hashed.
- [ ] **Resume model** – `skillProficiency` stored at root level; UI reads from correct field.
- [ ] **Indexes** – Ensure indexes on email (unique) and any frequently queried fields.

## 5️⃣ API & Routes
- [ ] **Protected routes** – All routes requiring auth use `auth.middleware`.
- [ ] **Error handling** – Consistent JSON error responses with status codes.
- [ ] **Rate limits** – Verify any `express-rate-limit` applied to auth endpoints.

## 6️⃣ Frontend
- [ ] **Token storage** – Tokens stored in HTTP‑only cookies *or* secure `localStorage` with clear logout logic.
- [ ] **Logout UI** – Navbar logout button triggers token removal and redirects to login.
- [ ] **Theme persistence** – Verify theme setting doesn’t expose sensitive data.
- [ ] **Build** – Run `npm run build` in `frontend` and ensure no missing assets.

## 7️⃣ Deployment
- [ ] **Render backend** – Environment variables set, health checks pass, `/api/*` reachable from Vercel frontend.
- [ ] **Vercel frontend** – `VITE_API_BASE_URL` points to Render URL.
- [ ] **Static uploads** – Confirm temporary storage plan or migrate to cloud storage (S3/Cloudinary) for production.
- [ ] **HTTPS** – All endpoints served over HTTPS in production.
- [ ] **Monitoring** – Enable logging for auth failures and unhandled rejections.

## 8️⃣ Post‑Deployment Verification
- [ ] **Register a new user** – Verify email flow, OTP, and token issuance.
- [ ] **Login** – Tokens validate, protected API calls succeed.
- [ ] **Logout** – Token cleared, subsequent protected calls are rejected.
- [ ] **Resume upload & screening** – End‑to‑end flow works, skill extraction displayed correctly.
- [ ] **CORS** – Frontend can call backend from Vercel domain.
- [ ] **Performance** – API response times within acceptable limits.

---
*Checklist created on 2026‑05‑16. Update as needed before each production release.*
