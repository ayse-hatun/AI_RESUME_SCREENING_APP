# Security & Authorization Pre‑Deployment Checklist

_This checklist maps the items you listed to the current state of the repository.  Items marked with **[x]** are already implemented.  Items marked with **[ ]** still need work._

---

## 🔐 Authentication / Role Security
- [x] **User schema contains `role` field** (enum: `admin`, `recruiter`, `viewer`).
- [ ] **Candidate role** – the schema does not include a `candidate` role; add it if you need separate candidate accounts.
- [x] **Auth middleware (`protect`) verifies JWT** and attaches `req.user`.
- [x] **Authorization middleware (`authorize`) validates `req.user.role`** against allowed roles.
- [ ] **HR‑only routes** – ensure each HR route uses `authorize('recruiter', 'admin')` (or a dedicated `hr` role) and checks ownership where needed.
- [ ] **Candidate‑only routes** – create routes that use `authorize('candidate')` and protect them with `protect`.
- [x] **Sensitive backend APIs are protected** – all major API groups (`/api`, `/api/jobs`, etc.) use the `protect` middleware.
- [ ] **Frontend route protection** – verify that React router guards (`/hr/*`, `/candidate/*`) redirect unauthenticated users.
- [ ] **Backend does NOT rely on frontend‑only protection** – double‑check that no route skips `protect`.
- [ ] **HR users can only edit/delete jobs they created** – add ownership check in the job controller.
- [ ] **Duplicate application prevention** – ensure a candidate cannot apply to the same job twice (unique index or controller check).

## 🗄️ Database Security
- [x] **MongoDB connection string stored in `.env`** (see `.env.example`).
- [x] **`.env` is listed in `.gitignore`**.
- [x] **No secrets/API keys committed** – repository does not contain keys.
- [ ] **MongoDB Atlas user uses a strong password** – verify on Atlas console.
- [ ] **Indexes for high‑query fields** – add indexes on `email`, `jobId`, etc. (e.g., `UserSchema.index({ email: 1 })`).
- [x] **Schema validation for required fields** – Mongoose schemas enforce required fields.

## 🌐 API Security
- [x] **Helmet middleware enabled** (`app.use(helmet())`).
- [x] **CORS configured with exact frontend domain** – uses `process.env.FRONTEND_URL` and Vercel pattern.
- [x] **`credentials: true` set when cookies are used**.
- [x] **Rate limiting applied** – global limiter for `/api/` and specific limiter for public applications.
- [ ] **Request body size limits** – not explicitly set; consider `express.json({ limit: '1mb' })`.
- [ ] **Mongo injection sanitization** – `express-mongo-sanitize` is currently commented out.
- [ ] **XSS sanitization** – no middleware present.
- [x] **Sensitive fields never returned** – `protect` removes password, OTP, reset token.
- [x] **Error responses hide stack traces** – global error handler only returns `err.message`.

## ✅ Input Validation
- [x] **Request bodies validated** – custom `validation.middleware.js` checks registration/login fields.
- [x] **Email validation exists** – regex in validation middleware and Mongoose schema.
- [x] **Password minimum length & complexity** – validation middleware enforces min 8 chars; schema enforces min 6.
- [x] **File upload validation** – size limit handled in `public.routes.js`; MIME type check should be verified in controller.
- [ ] **Resume uploads allow only safe formats** – ensure controller restricts to PDF/DOC/DOCX.

## 🖥️ Frontend Security
- [ ] **Protected routes redirect unauthorized users** – confirm React router guards are in place.
- [x] **API base URL uses env variables** (`VITE_API_BASE_URL`).
- [x] **No secret keys in frontend source** – no API keys are present.
- [ ] **Console logs / debug statements removed** – several `console.log` statements remain in backend code; clean them for production.
- [x] **Frontend build uses HTTPS APIs only** – Vercel serves over HTTPS.

## ⚡ Performance Optimization
- [ ] **React lazy loading / code splitting** – verify usage of `React.lazy` and `Suspense`.
- [ ] **Images are compressed & optimized** – check image assets.
- [ ] **Compression middleware enabled** – `compression` package not added to Express.
- [ ] **Database queries avoid over‑population** – review controllers for unnecessary `populate`.
- [ ] **Pagination for large datasets** – implement pagination in job listing, candidate list, etc.
- [ ] **API responses minimized** – ensure only needed fields are sent.

## 📦 Deployment Configuration
- [ ] **Frontend deployed on Vercel** – confirm deployment URL.
- [ ] **Backend deployed on Render (or Railway)** – confirm endpoint URL.
- [x] **Database hosted on MongoDB Atlas**.
- [x] **Production env vars configured on hosting platforms**.
- [x] **Backend CORS origin matches deployed frontend domain**.
- [x] **API endpoints use production URLs** (no localhost).
- [x] **HTTPS works for both frontend and backend**.

## 🛑 Error Handling & Logging
- [x] **Global error handling middleware exists**.
- [x] **Backend logs important failures** – `console.error` statements present.
- [ ] **Unhandled promise rejections handled** – add `process.on('unhandledRejection', ...)`.
- [x] **Failed DB connections handled gracefully** – `mongoose.connect` error handling should be in server startup.
- [ ] **Server restarts / monitoring** – configure a process manager (PM2, Render's auto‑restart).

## 🏗️ Scalability & Maintenance
- [x] **Separate controllers, routes, middleware, services**.
- [x] **Reusable middleware implemented** (`protect`, `authorize`, validation).
- [x] **Environment config supports dev & prod** – using `process.env` and `.env.example`.
- [x] **Consistent API naming**.
- [ ] **Future admin‑role expansion** – design role hierarchy for easy extension.

---
*Generated on 2026‑05‑16. Mark items as completed when you implement the missing pieces.*
