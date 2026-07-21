# 🛠️ CDAC ExamWeb - Comprehensive Technology Stack Guide

This document provides an exhaustive overview of the technology stack utilized across the **CDAC ExamWeb** application. It explains **which technologies are used**, **why they were chosen**, and **where they are implemented** within the codebase.

---

## 🏗️ Architecture Overview

CDAC ExamWeb is built as a modern, high-performance, real-time **Full-Stack JavaScript (MERN + Redis + WebSockets)** application. The architecture is modularized into:
1. **Frontend:** Client-side Single Page Application (SPA) built with React and Vite.
2. **Backend:** RESTful API & Real-Time WebSocket server powered by Node.js and Express.
3. **Data Layer:** MongoDB (Persistence & Replica Set) and Redis (In-Memory Caching & Session Store).
4. **DevOps & Infrastructure:** Docker containerization, Nginx load balancing, and process clustering.

```
+-----------------------------------------------------------------------+
|                         CLIENT TIER (Browser)                         |
|   React 18 | Vite | Bootstrap | Framer Motion | Axios | Socket.IO    |
+-----------------------------------------------------------------------+
                                   ▲
                                   │ HTTPS / WebSockets
                                   ▼
+-----------------------------------------------------------------------+
|                    GATEWAY & LOAD BALANCER (Nginx)                    |
|                Reverse Proxy | SSL Termination | Caching              |
+-----------------------------------------------------------------------+
                                   ▲
                                   │
             +---------------------+---------------------+
             ▼                                           ▼
+-------------------------+                 +-------------------------+
|   BACKEND REPLICA 1     |                 |   BACKEND REPLICA 2/3   |
| Node.js | Express | JWT |                 | Node.js | Express | JWT |
| Socket.IO | Rate Limit  |                 | Socket.IO | Rate Limit  |
+-------------------------+                 +-------------------------+
             ▲                                           ▲
             │                                           │
             +---------------------+---------------------+
                                   │
             +---------------------+---------------------+
             ▼                                           ▼
+-------------------------+                 +-------------------------+
|    PRIMARY DATABASE     |                 |  CACHE & SESSION STORE  |
|   MongoDB (Replica Set) |                 |     Redis (In-Memory)   |
+-------------------------+                 +-------------------------+
```

---

## 🎨 1. Frontend Technology Stack (`/frontend`)

| Technology / Library | Version | Why Used (Purpose & Benefits) | Where Used (File / Module Location) |
| :--- | :---: | :--- | :--- |
| **React** (`react`, `react-dom`) | `18.2.0` | **Core UI Framework:** Component-based architecture with virtual DOM for high-performance dynamic rendering and reactive state management. | Entire user interface (`/src/App.jsx`, all pages across student portal, faculty panel, and admin dashboard). |
| **Vite** (`vite`, `@vitejs/plugin-react`) | `5.2.0` | **Build Tool & Bundler:** Lightning-fast cold starts, instant Hot Module Replacement (HMR) during dev, and optimized ES-module bundling for production. | `vite.config.js`, local development server (`npm run dev`), and production bundling (`npm run build`). |
| **React Router DOM** (`react-router-dom`) | `6.23.0` | **Client-Side Routing:** Seamless Single Page Application (SPA) navigation without full page reloads, role-based protected routes, and nested layouts. | `/src/App.jsx`, route guards, navigation components (`Navbar`, sidebar links). |
| **Bootstrap & React-Bootstrap** (`bootstrap`, `react-bootstrap`) | `5.3.3` / `2.10.2` | **Responsive UI Grid & Component Library:** Pre-built responsive grid system, accessible modals, cards, form controls, and layout utility classes. | Modal popups (`/src/components/RegisterModal.jsx`), admin tables (`ManageCertificates.jsx`), form layouts. |
| **Vanilla CSS & Glassmorphism** | Modern | **Custom Aesthetic Styling:** Tailored custom design tokens, modern dark/light mode accents, glassmorphic overlays, and fluid responsive layouts. | `/src/index.css` and individual component stylesheet files. |
| **Lucide React** (`lucide-react`) | `1.8.0` | **Modern Iconography:** Clean, lightweight SVG icons that scale crisp across all devices without bloated font packages. | Dashboard headers, action buttons, practice test indicators, status badges (`ManagePracticeTests.jsx`). |
| **Framer Motion** (`framer-motion`) | `12.38.0` | **Animations & Micro-Interactions:** Smooth page transitions, interactive card hover effects, modal animations, and dynamic visual feedback. | Exam start screens, result display cards, animated modals, and interactive dashboard metrics. |
| **Axios** (`axios`) | `1.6.0` | **HTTP REST Client:** Promise-based HTTP requests with automated interceptors for injecting JWT authorization headers and centralized API error handling. | API service utilities (`/src/services/api.js`), fetching exam lists, submitting practice tests, student authentication. |
| **Socket.IO Client** (`socket.io-client`) | `4.8.3` | **Real-Time WebSockets:** Low-latency bidirectional connection between browser and server for live timer countdowns, proctoring alerts, and instant updates. | Live exam session screens, proctoring monitor hooks, real-time warning modals. |
| **JWT Decode** (`jwt-decode`) | `4.0.0` | **Token Inspection:** Decodes JSON Web Tokens directly in the browser to inspect user roles (`admin`, `student`), permissions, and token expiration instantly. | Authentication providers (`AuthContext`), route authorization checks. |
| **React Hot Toast** (`react-hot-toast`) | `2.6.0` | **Feedback Notifications:** Lightweight, elegant toast notifications for immediate user feedback on success, failure, or validation alerts. | Form submission callbacks, login/logout events, test auto-save notifications. |

---

## ⚙️ 2. Backend Technology Stack (`/backend`)

| Technology / Library | Version | Why Used (Purpose & Benefits) | Where Used (File / Module Location) |
| :--- | :---: | :--- | :--- |
| **Node.js** | `v18+` | **Runtime Environment:** Asynchronous, non-blocking I/O runtime enabling high concurrency across thousands of simultaneous exam submissions and live websocket connections. | Core server execution (`node server.js`). Uses ES Modules (`"type": "module"`). |
| **Express.js** (`express`) | `4.19.2` / `5.2.1` | **Web Framework:** Robust, minimalist framework for defining REST API routes, middleware execution pipelines, request parsing, and error handling. | `server.js`, all route handlers (`/routes/authRoutes.js`, `/routes/examRoutes.js`, etc.). |
| **Mongoose** (`mongoose`) | `8.3.2` / `9.4.1` | **ODM for MongoDB:** Schema-based data modeling with built-in validation, relational population (User ↔ Result ↔ Exam), and query hooks. | `/models/User.js`, `/models/Exam.js`, `/models/Question.js`, `/models/Result.js`, `/models/Certificate.js`. |
| **JSON Web Token** (`jsonwebtoken`) | `9.0.2` | **Authentication & Authorization:** Stateless, cryptographically signed tokens containing user ID and role (`admin`, `student`, `instructor`) to verify requests securely. | `/middleware/auth.js`, login/register controller endpoints, protected admin APIs. |
| **Bcrypt.js** (`bcryptjs` / `bcrypt`) | `2.4.3` | **Cryptographic Password Hashing:** Salted hashing algorithm that securely stores passwords in the database, preventing plain-text data breach vulnerabilities. | User registration, password change flows, and credential verification during login. |
| **Socket.IO Server** (`socket.io`) | `4.8.3` | **Real-Time Engine:** Server-side WebSocket management to track online students during exams, broadcast live proctoring flags, and synchronize test timers. | `server.js` websocket event handlers, proctoring tracking rooms. |
| **Rate Limiter & Security Headers** (`rate-limiter-flexible`, `express-rate-limit`, `helmet`) | Latest | **DDoS & Exploit Protection:** Protects APIs from brute-force login attempts and DDoS attacks by throttling requests. Helmet sets HTTP security headers against XSS/clickjacking. | Global middleware in `server.js` and dedicated rate limiters on `/api/auth/login`. |
| **CORS** (`cors`) | `2.8.5` | **Cross-Origin Resource Sharing:** Safely allows requests from the frontend origin (e.g., `localhost:5173` or domain) to the backend origin (`localhost:5000` or API domain). | Global Express configuration in `server.js`. |
| **Node Device Detector** (`node-device-detector`) | `2.2.5` | **Proctoring Device Analytics:** Inspects `User-Agent` headers to identify student browser, OS, and device type to detect suspicious switching or unauthorized devices during exams. | Exam session initiation routes and proctoring logs. |
| **Multer** (`multer`) | `1.4.5` | **File Upload Middleware:** Handles `multipart/form-data` uploads safely for profile images, CSV bulk question imports, and certificate templates. | `/middleware/upload.js`, question import routes, certificate generation endpoints. |
| **Nodemailer** (`nodemailer`) | `8.0.6` | **Transactional Emails:** Automated sending of registration confirmations, OTP verifications, password reset links, and result/certificate delivery emails. | `/utils/sendEmail.js`, notification services triggered by user actions. |
| **Dotenv** (`dotenv`) | `16.4.5` | **Environment Configuration:** Safely loads sensitive API keys, database connection URIs, and JWT secrets from `.env` files outside source control. | Entry point `server.js` and configuration loaders (`/config/db.js`). |

---

## 🗄️ 3. Database, Caching & DevOps / Deployment Stack

| Technology / System | Role & Why Used | Where Used / Implementation Details |
| :--- | :--- | :--- |
| **MongoDB** (`mongo:6-jammy`) | **Primary NoSQL Database:** Document-oriented database providing flexible schema design capable of storing complex nested question options, student responses, and analytical results. Configured with **Replica Sets (`rs0`)** for transactional integrity and high availability. | Configured via `MONGO_URI` in `.env`. Persistent Docker volume (`mongo_data:/data/db`). Accessed via Mongoose ORM. |
| **Redis** (`redis:7-alpine`) | **In-Memory Caching & Session Store:** Provides sub-millisecond read/write speeds for active exam countdown timers, rate-limiting counters, live proctoring session states, and caching frequently queried practice tests/leaderboards. | Configured via `REDIS_URL` in `docker-compose.yml`. Persistent Docker volume (`redis_data:/data`). |
| **Docker & Docker Compose** | **Containerization & Orchestration:** Encapsulates the entire multi-tier stack into standardized containers (`nginx`, `backend`, `frontend`, `mongo`, `redis`). Ensures exact parity across development, staging, and production environments without dependency conflicts. | `docker-compose.yml`, `/backend/Dockerfile`, `/frontend/Dockerfile`. |
| **Nginx** (`nginx:alpine`) | **Reverse Proxy & Load Balancer:** Acts as the primary ingress gateway (`port 80/443`). Routes static frontend traffic, handles SSL termination, and balances API traffic across multiple backend server replicas (`replicas: 3` in high-availability mode). | `nginx.conf` and `docker-compose.yml` service configuration. |
| **PM2 & Process Management** (`ecosystem.config.js`) | **Production Process Manager:** Manages Node.js background processes on server deployments. Enables clustering (taking advantage of multi-core CPU architectures), automatic crash restart, and zero-downtime reloads. | `ecosystem.config.js` in root directory for non-containerized production servers. |
| **Concurrently** (`concurrently`) | **Local Development Orchestration:** Runs both the Express backend (`npm run server`) and Vite frontend (`npm run client`) simultaneously in a single terminal session during local development. | Root `package.json` script: `npm run dev`. |

---

## 💡 Summary of Why This Stack Excels for Online Examination Systems

1. **High Concurrency & Real-Time Performance:** Node.js + Express combined with Socket.IO and Redis allows thousands of students to take timed exams simultaneously without server bottlenecks or delayed proctoring alerts.
2. **Data Flexibility:** MongoDB's document model gracefully handles diverse question formats (Multiple Choice, True/False, Programming Snippets, Descriptive) without rigid schema migrations.
3. **Responsive & Engaging User Experience:** React 18, Vite, Bootstrap, and Framer Motion ensure the student test portal is fast, intuitive, mobile-responsive, and visually engaging.
4. **Enterprise Security:** Multi-layered security using JWT stateless tokens, Bcrypt password hashing, Rate Limiting, Helmet headers, and Device Detection protects exam integrity and user data.
5. **High Availability Deployment:** Docker Compose with Nginx load balancing and MongoDB Replica Sets guarantees zero downtime during critical national or institutional exam schedules.
