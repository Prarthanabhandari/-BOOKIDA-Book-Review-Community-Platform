# 📚 BOOKIDA — Book Review & Community Platform

<div align="center">

> *"Every book you read becomes a permanent insight."*
> *— Inspired by Derek Sivers*

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/JWT-Auth-black?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)

**A full-stack web application where readers discover books, write structured reviews, and build a permanent digital reading legacy.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Installation](#-installation) · [API](#-api-reference) · [Database](#-database-schema) · [Screenshots](#-screenshots)

</div>

---

## 🌟 What is Bookida?

Bookida is a **community-driven book review platform** built with React, Node.js, Express, and PostgreSQL. It replaces scattered, unstructured book notes with a single searchable platform where readers can write detailed reviews, discover books through community opinions, and admins can curate featured content.

The platform supports **three user roles**:

| Role | Access |
|------|--------|
| 🌐 **Guest** | Browse, search, filter, read reviews, submit a review with name only |
| 👤 **Registered User** | Personal dashboard, edit/delete own reviews, reviewer profile |
| 🛡️ **Admin** | Full admin dashboard, moderation, feature toggle, user management |

---

## ✨ Features

### 🏠 Home Page
- Animated live statistics pulled directly from PostgreSQL
- Featured Community Reviews — admin-curated 2×3 grid
- Genre filter pills for instant category filtering
- Each card links to `/review/:id`

### 🔍 Explore Page
- Vintage three-column layout (Left Sidebar · Main Feed · Right Sidebar)
- Real-time category filtering via PostgreSQL `WHERE category = $1`
- Full-text search across title, author, category, and content
- Clickable Recent 10 Reviews — each linked to `/review/:id`
- Top 5 Reviewers with gold avatar circles
- Dynamic Archives grouped by month/year

### ✍️ Write Review
- **ISBN Auto-Fetch** — enter ISBN → cover loads from Open Library API
- Live preview card that updates as you type
- Guest support — submit without an account
- Star rating with hover highlight

### 👤 My Reading Legacy
- Personal stats: Total Reviews, Avg Rating, Categories, Latest date
- Grid of own review cards with Edit and Delete
- Edit navigates to `/edit/:id` with pre-filled form from PostgreSQL

### 🛡️ Admin Dashboard
- **Sidebar Navigation** — Dashboard · Reviews · Members · Categories · Messages · Settings
- **Clickable Stat Cards** — each filters the Book Reviews tab
- **Guest vs Member Doughnut Chart** — Chart.js
- **Moderation Table** — Feature, Delete, Reject & Message User
- **Contact Inbox** — messages with unread badge tracking
- **User Management** — view and remove members

### 🎨 Theme Switcher
- Floating panel on every page
- 4 palettes: Classic Brown · Retro Blue · Sunset Warm · Vintage Earth
- CSS variables — instant switch, no flicker
- Persisted in `localStorage`

---

## 🛠️ Tech Stack

```
Frontend        React 18 (Vite) · React Router v6 · Axios
                Lucide React · Chart.js · react-chartjs-2
                CSS Variables (4 themes)

Backend         Node.js · Express.js
                jsonwebtoken · bcryptjs · cors · dotenv

Database        PostgreSQL 15 · pg (node-postgres)

External API    Open Library API (ISBN → cover image)
```

---

## 📦 Dependencies

### Backend Dependencies
```bash
cd backend
npm install express pg bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18.2 | Web server framework |
| `pg` | ^8.x | PostgreSQL client for Node.js |
| `bcryptjs` | ^2.4.3 | Password hashing |
| `jsonwebtoken` | ^9.0.2 | JWT authentication |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `dotenv` | ^16.3.1 | Environment variable management |
| `nodemon` | ^3.0.1 | Auto-restart during development |

### Frontend Dependencies
```bash
cd frontend
npm install axios react-router-dom lucide-react chart.js react-chartjs-2
```

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | Core UI framework (comes with Vite) |
| `react-dom` | ^18.2.0 | DOM rendering (comes with Vite) |
| `react-router-dom` | ^6.20.1 | Client-side routing |
| `axios` | ^1.6.2 | HTTP requests to backend API |
| `lucide-react` | ^0.294.0 | Icon library |
| `chart.js` | ^4.x | Doughnut chart in Admin Dashboard |
| `react-chartjs-2` | ^5.x | React wrapper for Chart.js |

---

## 🚀 How to Run the Project

### Step 1 — Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/bookida.git
cd bookida
```

### Step 2 — PostgreSQL Setup
```bash
# Open PostgreSQL
psql -U postgres

# Run these commands inside psql
CREATE DATABASE bookida;
\c bookida

CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(100) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  avatar       VARCHAR(255) DEFAULT '',
  bio          TEXT DEFAULT '',
  review_count INT DEFAULT 0,
  role         VARCHAR(20) DEFAULT 'user',
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  author        VARCHAR(255) NOT NULL,
  reviewer_id   INT REFERENCES users(id) ON DELETE CASCADE,
  reviewer_name VARCHAR(100) NOT NULL,
  rating        INT CHECK (rating >= 1 AND rating <= 5),
  content       TEXT NOT NULL,
  excerpt       TEXT,
  category      VARCHAR(100),
  cover         VARCHAR(255) DEFAULT '',
  comments      INT DEFAULT 0,
  likes         INT DEFAULT 0,
  featured      BOOLEAN DEFAULT false,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contacts (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

\q
```

### Step 3 — Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookida
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=bookida_secret_key_2024
```

Start the backend server:
```bash
node server.js
```

You should see:

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    BROWSER  (React + Vite)                │
│                    http://localhost:5173                   │
│                                                            │
│  Navbar │ Pages (13 routes) │ AuthContext │ ThemeToggle   │
└───────────────────────┬──────────────────────────────────┘
                        │  axios  /api/*
                        │  Vite proxy → localhost:5000
                        ▼
┌──────────────────────────────────────────────────────────┐
│                EXPRESS SERVER  (Node.js)                   │
│                http://localhost:5000                       │
│                                                            │
│   /api/auth/*      authRoutes    →  authController         │
│   /api/reviews/*   reviewRoutes  →  reviewController       │
│                                                            │
│   Middlewares: protect · optionalAuth · adminOnly          │
└───────────────────────┬──────────────────────────────────┘
                        │  pg Pool
                        ▼
┌──────────────────────────────────────────────────────────┐
│                  PostgreSQL 15  Database                   │
│                                                            │
│     ┌──────────┐  ┌──────────────┐  ┌──────────────┐     │
│     │  users   │  │   reviews    │  │   contacts   │     │
│     └──────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────────────────────┘
                        ▲
                        │  ISBN cover fetch
┌──────────────────────┴───────────────────────────────────┐
│               Open Library API  (external)                 │
│       covers.openlibrary.org/b/isbn/{isbn}-L.jpg           │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Bookida2/
├── backend/
│   ├── config/
│   │   └── db.js                  PostgreSQL pool
│   ├── controllers/
│   │   ├── authController.js      register · login · getMe
│   │   └── reviewController.js    CRUD · admin · stats · contacts
│   ├── middlewares/
│   │   ├── authMiddleware.js      protect · optionalAuth · adminOnly
│   │   └── errorMiddleware.js     notFound · errorHandler
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── reviewRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── BookCard.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── ThemeToggle.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Explore.jsx
    │   │   ├── Write.jsx
    │   │   ├── ReviewDetail.jsx    /review/:id
    │   │   ├── EditReview.jsx      /edit/:id
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── MyReviews.jsx       /my-reviews
    │   │   ├── Profile.jsx         /profile/:name
    │   │   ├── AllReviewers.jsx    /all-reviewers
    │   │   ├── About.jsx
    │   │   ├── Contact.jsx
    │   │   └── AdminDashboard.jsx  /admin/dashboard
    │   ├── styles/index.css        global CSS + 4 themes
    │   ├── api.js                  axios · authAPI · reviewsAPI
    │   ├── mockData.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js              proxy /api → localhost:5000
    └── package.json
```

---

## ⚙️ Installation

### Prerequisites
- Node.js v18+
- PostgreSQL 15
- Git

### 1 · Clone the repo

```bash
git clone https://github.com/Prarthanabhandari/bookida.git
cd bookida
```

### 2 · Create the database

```bash
psql -U postgres
```

```sql
CREATE DATABASE bookida;
\c bookida

CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(100) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  avatar       VARCHAR(255) DEFAULT '',
  bio          TEXT DEFAULT '',
  review_count INT DEFAULT 0,
  role         VARCHAR(20) DEFAULT 'user',
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reviews (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  author        VARCHAR(255) NOT NULL,
  reviewer_id   INT REFERENCES users(id) ON DELETE CASCADE,
  reviewer_name VARCHAR(100) NOT NULL,
  rating        INT CHECK (rating >= 1 AND rating <= 5),
  content       TEXT NOT NULL,
  excerpt       TEXT,
  category      VARCHAR(100),
  cover         VARCHAR(255) DEFAULT '',
  comments      INT DEFAULT 0,
  likes         INT DEFAULT 0,
  featured      BOOLEAN DEFAULT false,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contacts (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

\q
```

### 3 · Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookida
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=bookida_secret_key_2024
```

```bash
node server.js
# ✅ Bookida API running on http://localhost:5000
# ✅ PostgreSQL Connected!
```

### 4 · Frontend

```bash
cd ../frontend
npm install
npm run dev
# ✅ http://localhost:5173
```

---

## 🔐 Admin Credentials

```
Email    →  prarthana****************
Password →  ******
```

The backend auto-assigns `role: "admin"` for these credentials. After login the navbar shows **ADMIN DASHBOARD**.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | None | Register |
| `POST` | `/api/auth/login` | None | Login → JWT |
| `GET` | `/api/auth/me` | JWT | Current user |

### Reviews — Public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/reviews` | None | All (paginated + `?category=`) |
| `GET` | `/api/reviews/stats` | None | Live counts |
| `GET` | `/api/reviews/featured` | None | Featured reviews |
| `GET` | `/api/reviews/recent` | None | Last 10 |
| `GET` | `/api/reviews/top-reviewers` | None | Top 5 |
| `GET` | `/api/reviews/archives` | None | By month/year |
| `GET` | `/api/reviews/search?q=` | None | Full-text search |
| `GET` | `/api/reviews/:id` | None | Single review |
| `POST` | `/api/reviews/contact` | None | Submit message |

### Reviews — Protected

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/reviews/my-reviews` | JWT | Own reviews |
| `POST` | `/api/reviews` | Optional JWT | Create review |
| `PUT` | `/api/reviews/:id` | JWT + Owner/Admin | Update |
| `DELETE` | `/api/reviews/:id` | JWT + Owner/Admin | Delete |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/api/reviews/:id/feature` | Admin | Toggle featured |
| `GET` | `/api/reviews/admin/reviews` | Admin | All reviews |
| `GET` | `/api/reviews/admin/users` | Admin | All users |
| `DELETE` | `/api/reviews/admin/users/:id` | Admin | Remove user |
| `GET` | `/api/reviews/admin/contacts` | Admin | All messages |
| `PUT` | `/api/reviews/admin/contacts/:id/read` | Admin | Mark read |

---

## 🗃️ Database Schema

```
┌───────────────────────────┐        ┌─────────────────────────────────┐
│          USERS            │        │            REVIEWS               │
├───────────────────────────┤        ├─────────────────────────────────┤
│ PK id           SERIAL    │  1     │ PK id            SERIAL          │
│    name         VARCHAR   │───────▶│ FK reviewer_id   INT  (NULL ok) │
│    email        VARCHAR   │  N     │    reviewer_name VARCHAR         │
│    password     VARCHAR   │        │    title         VARCHAR         │
│    role         VARCHAR   │        │    author        VARCHAR         │
│    review_count INT       │        │    rating        INT  (1-5)      │
│    created_at   TIMESTAMP │        │    content       TEXT            │
└───────────────────────────┘        │    category      VARCHAR         │
                                     │    cover         VARCHAR         │
┌───────────────────────────┐        │    featured      BOOLEAN         │
│         CONTACTS          │        │    created_at    TIMESTAMP       │
├───────────────────────────┤        └─────────────────────────────────┘
│ PK id        SERIAL       │
│    name      VARCHAR      │   reviewer_id is NULLABLE
│    email     VARCHAR      │   → allows guest reviews
│    message   TEXT         │
│    read      BOOLEAN      │   CONTACTS has no FK
│    created_at TIMESTAMP   │   → captures guest messages
└───────────────────────────┘
```

---

## 🔒 Role-Based Access Control

```
GUEST       Browse · Read · Search · Filter · Submit (name only)
               │
               ▼
REGISTERED  + Write/Edit/Delete own reviews
USER        + My Reading Legacy dashboard
            + Reviewer profile page
               │
               ▼
ADMIN       + Admin Dashboard (/admin/dashboard)
            + Edit/Delete ANY review
            + Toggle featured status
            + Manage all users
            + Read contact messages
```

---

## 🎨 Theme System

| Theme | Base | Header | Accent |
|-------|------|--------|--------|
| 🟤 Classic Brown | `#FAF8F5` | `#1a1208` | `#c8860a` |
| 🔵 Retro Blue | `#BBE0EF` | `#161E54` | `#F16D34` |
| 🌸 Sunset Warm | `#FFF7CD` | `#c45070` | `#F57799` |
| 🌿 Vintage Earth | `#F9F8F6` | `#3d2b1f` | `#8a6a50` |

Applied via **CSS variables on `:root`** — all components update instantly.

---

## 🗺️ Page Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Home | Public |
| `/explore` | Explore | Public |
| `/about` | About | Public |
| `/contact` | Contact | Public |
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/write` | Write Review | Public |
| `/review/:id` | Review Detail | Public |
| `/profile/:name` | Reviewer Profile | Public |
| `/all-reviewers` | All Reviewers | Public |
| `/my-reviews` | My Dashboard | 🔒 User |
| `/edit/:id` | Edit Review | 🔒 Owner / Admin |
| `/admin/dashboard` | Admin Dashboard | 🛡️ Admin only |

---

## 📸 Screenshots

> Add your screenshots to a `/screenshots` folder in the repo root.

| Page | Screenshot |
|------|-----------|
| Home — Hero + Live Stats | ![Home](screenshots/home.png) |
| Explore — 3-Column Layout | ![Explore](screenshots/explore.png) |
| Write — ISBN Fetch + Preview | ![Write](screenshots/write.png) |
| Review Detail | ![Detail](screenshots/review-detail.png) |
| My Reading Legacy | ![Dashboard](screenshots/my-dashboard.png) |
| Admin Dashboard | ![Admin](screenshots/admin-overview.png) |
| Moderation + Reject Modal | ![Moderation](screenshots/admin-moderation.png) |
| Theme Switcher | ![Theme](screenshots/theme-switcher.png) |

---

## 📦 Scripts

```bash
# ── Backend ──────────────────────────────
cd backend
node server.js            # start server
npx kill-port 5000        # free port if busy

# ── Frontend ─────────────────────────────
cd frontend
npm run dev               # dev server → localhost:5173
npm run build             # production build
npm run preview           # preview production build
```

---

## 🧪 Test Results

| Test | Status |
|------|--------|
| User Registration | ✅ PASS |
| JWT Login | ✅ PASS |
| Admin Hardcode Login | ✅ PASS |
| Guest Review Submit | ✅ PASS |
| ISBN Auto-Fetch | ✅ PASS |
| Category Filter (SQL) | ✅ PASS |
| Full-Text Search | ✅ PASS |
| Non-admin blocked from `/admin` | ✅ PASS |
| Feature Toggle (Home sync) | ✅ PASS |
| Contact → Admin Inbox | ✅ PASS |
| Edit/Delete own review | ✅ PASS |
| Admin delete any review | ✅ PASS |
| Stat card navigation | ✅ PASS |
| Theme switcher persistence | ✅ PASS |

---

## 🔮 Future Enhancements

- [ ] AI-based personalised book recommendations
- [ ] Email notifications (welcome, password reset, featured alert)
- [ ] Google / Facebook OAuth login
- [ ] Multi-language support
- [ ] React Native mobile app
- [ ] Reading lists (To Read / Reading / Finished)
- [ ] Advanced filters (rating range, date range)
- [ ] Social sharing (Twitter, LinkedIn, WhatsApp)
- [ ] Profile image upload
- [ ] Review analytics charts on My Dashboard

---

## 📄 Environment Variables

```env
# backend/.env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookida
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

---

## 👩‍💻 Author

**Prarthana Basawraj Bhandari**

| | |
|--|--|
| Roll No | 2024MCA42 |
| Programme | MCA — Final Year Project |
| Institute | K.B. Joshi Institute of Information Technology, Pune |
| University | S.N.D.T. Women's University |
| Guide | Prof. Manali Sapkal |
| Year | 2025 – 2026 |

---

<div align="center">

Built with ❤️ by **Prarthana Basawraj Bhandari**

⭐ **Star this repo if you found it helpful!**

</div>
