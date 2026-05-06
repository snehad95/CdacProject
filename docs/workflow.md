# CDAC ExamWeb - Application Workflow & Technology Stack

## 1. Technology Stack & Languages

### Frontend (Client-Side)
- **Languages:** JavaScript (ES6+), JSX, CSS.
- **Framework/Library:** React 18, Vite.
- **Routing:** React Router DOM (v6).
- **API Communication:** Axios.
- **UI & Styling:** Bootstrap, React-Bootstrap, Custom CSS.
- **Animations:** Framer Motion.
- **Icons:** Lucide React.
- **Utilities:** jwt-decode.

### Backend (Server-Side)
- **Language:** JavaScript (Node.js).
- **Web Framework:** Express.js.
- **Database:** MongoDB (using Mongoose ODM).
- **Authentication & Security:** jsonwebtoken (JWT), bcryptjs (Hashing), cors, helmet, express-rate-limit.
- **File Handling:** Multer (for multipart/form-data & image uploads).
- **Email Services:** Nodemailer.

---

## 2. Application Workflow

### 2.1 Initial Load & Navigation
- The app initializes at `frontend/src/main.jsx`, rendering `App.jsx`.
- `App.jsx` handles all routing logic via React Router.
- Users arrive at `Home.jsx` which showcases the `HeroBanner`, `Navbar`, and `ExamCards`.

### 2.2 User Authentication Flow (Login/Register)
- **Frontend:** Users interact with `LoginModal.jsx` or `RegisterModal.jsx`. Submitting triggers an Axios POST request.
- **Backend:** Requests are routed through `server.js` -> `routes/authRoutes.js` -> `controllers/authController.js`.
- **Logic:** `authController` hashes new passwords using bcrypt or verifies existing ones. On successful login, a JWT is generated and returned to the client.
- **State:** Frontend stores the JWT and decodes it to determine user state and roles (Student/Admin).

### 2.3 Admin Workflow (Managing Exams & Content)
- **Access:** Admins login and navigate to `AdminDashboard.jsx`.
- **Actions:** Using the `src/components/admin/` components, admins can manage practice tests.
- **Backend Processing:** File uploads (like banners) hit `routes/practiceTestRoutes.js`, where Multer processes and saves the file to `backend/uploads/`. Test details are stored in MongoDB via Mongoose.

### 2.4 Student Exam Workflow (The Core Feature)
- **Selection:** Students browse `Exams.jsx` or `Test.jsx` and choose an assessment.
- **Pre-check:** They are routed to `ExamInstructions.jsx` or `PracticeInstructions.jsx`. The frontend enforces authentication.
- **The Arena:** Once started, students enter `ExamArena.jsx` or `PracticeArena.jsx`.
  - **Data Fetching:** The frontend queries backend APIs (e.g., `examRoutes.js`) to load questions dynamically from MongoDB.
  - **Interaction:** The Arena manages strict UI rules: countdown timers, question navigation, and proctoring events (e.g., detecting tab switches).
- **Submission:** Upon completion or timer expiration, `ExamArena.jsx` compiles responses and sends them via Axios to `routes/resultRoutes.js`.
- **Evaluation:** `resultController.js` compares submitted answers against the database, calculates the score, stores the Result, and sends the performance metrics back to the frontend.

### 2.5 Dashboard & History
- **Viewing Results:** Students navigate to `StudentDashboard.jsx`.
- **Backend Sync:** The dashboard fetches historical performance data directly from the MongoDB `Result` collection, formatted and returned by `resultController.js`.
