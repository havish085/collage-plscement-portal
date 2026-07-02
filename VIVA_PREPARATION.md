# Viva/Oral Examination Preparation Guide 🎓

This guide contains **25 detailed technical questions with structured answers** to prepare for your final-year project defense.

---

### Q1: What is the primary architecture of your College Placement Portal?
**Answer**: It is a Serverless Web Application. The frontend is built using React 18, TypeScript, and Tailwind CSS. The backend services (Authentication, Database, File Storage, and Serverless API endpoints) are powered by Firebase. AI resume analysis is performed by invoking the Vertex AI Gemini API via Firebase Cloud Functions.

---

### Q2: Why did you choose Vite over Create React App (CRA)?
**Answer**: Vite leverages native ES Modules (ESM) in the browser to load code during development, bypassing the expensive bundling step required by Webpack. It compiles using esbuild, which is written in Go and is 10-100x faster than Webpack-based compile scripts. It provides instant Hot Module Replacement (HMR) regardless of codebase size.

---

### Q3: Explain how your project handles role-based routing in the frontend.
**Answer**: We implement a `<ProtectedRoute>` component wrapping React Router routes. It accesses the `useAuth()` custom context. If the session state loads, the guard checks if the authenticated user's profile role (e.g., `STUDENT`, `COMPANY_HR`, or `TPO_ADMIN`) matches the list of `allowedRoles` configured for that route. If not, the user is redirected to their respective dashboard home page.

---

### Q4: How is the Firestore database schema structured? Is it SQL or NoSQL?
**Answer**: Cloud Firestore is a document-oriented NoSQL database. Instead of tables and rows, it organizes data into **collections**, **documents**, and **sub-collections**. Our schema features collections for `/users`, `/students`, `/companies`, `/jobs`, and `/applications`. Data is stored in key-value format (JSON) and supports nested objects/arrays (e.g., project sub-arrays).

---

### Q5: How did you implement the automated eligibility checking engine?
**Answer**: When a student opens a job opening, the frontend retrieves the student's profile (CGPA, Branch, Grad Year) and compares it to the job's eligibility requirements:
1. Student CGPA must be greater than or equal to the job's `minCGPA`.
2. Student Branch must be present in the job's allowed `branches` array.
3. Student Graduation Year must be in the job's allowed `gradYears` array.
If any condition fails, the Apply button is disabled, and the specific reason is rendered.

---

### Q6: Can students bypass the eligibility check by editing client-side React state? How do you prevent this?
**Answer**: Although client-side UI buttons can be modified in the browser DevTools, backend security is strictly enforced by **Firestore Security Rules** (`firestore.rules`). When a write is attempted on the `/applications` collection, the rules fetch the student's database document and the job's database document, verifying that the eligibility requirements are satisfied. If not, Firestore rejects the write request on the server side.

---

### Q7: Explain the role-based Firestore security rule for the `applications` collection.
**Answer**: The rules allow:
*   **Create**: Only users whose authenticated UID matches the application's `studentId` and whose role is `STUDENT`.
*   **Read**: Allowed only if the authenticated user's UID equals the applicant's `studentId` OR equals the hiring company's `companyId` OR the user has the `TPO_ADMIN` role.
*   **Update**: Only TPO Admin or the company HR (to modify applicant status).

---

### Q8: How does your Cloud Function interact with the Vertex AI Gemini API?
**Answer**: The callable function `analyzeResumeWithGemini` receives student details and job descriptions from the client. It initializes the `@google/generative-ai` SDK, gets the `gemini-1.5-flash` model, feeds a structured system prompt asking for a specific JSON schema output, and returns the response payload back to the client.

---

### Q9: Why did you choose a Callable Function over a standard HTTP REST trigger for the AI analyzer?
**Answer**: Firebase Callable Functions automatically handle CORS, validate authentication tokens (`context.auth`), parse JSON payloads internally, and integrate with client-side SDK hooks seamlessly, saving substantial boilerplate code.

---

### Q10: How do you enforce file upload safety in Cloud Storage?
**Answer**: Using `storage.rules`, we enforce that files uploaded to `/resumes/{studentId}`:
1. Are only written if the user's auth UID matches the path `{studentId}`.
2. Are less than 5MB in size (`request.resource.size < 5 * 1024 * 1024`).
3. Have the exact MIME type of a PDF (`request.resource.contentType == 'application/pdf'`).

---

### Q11: What is the purpose of Recharts in your TPO dashboard?
**Answer**: Recharts provides SVG-based, responsive chart components for React. We use it to render placement rates, packages distribution histograms, monthly hiring trend lines, and branch-wise placement aggregates by binding local stats state directly into Chart properties.

---

### Q12: How does the application support offline/mock mode?
**Answer**: In `AuthContext` and `dbMock`, we wrap Firestore and Auth operations in try-catch blocks. If Firebase initialization fails or is unconfigured in the developer's workspace, the portal falls back to using `localStorage` as a persistent document store with mock seeds for Student, HR, and TPO.

---

### Q13: What is state in React, and how did you manage it globally?
**Answer**: State represents data that can change over time and affects component rendering. We managed global user session state by utilizing the **React Context API** inside `AuthContext.tsx`. This makes the user session object and logout functions accessible to all components in the tree without "prop drilling".

---

### Q14: Explain the difference between `useEffect` and `useState` in React.
**Answer**: `useState` is a React Hook that declares a state variable and its updater function. `useEffect` is a hook that handles side-effects (e.g., API calls, document subscriptions, manual DOM updates) by running a callback function after the component renders or when dependency array items change.

---

### Q15: Why is TypeScript preferred over vanilla JavaScript in modern React applications?
**Answer**: TypeScript introduces static typing. It compiles code and flags type mismatches (e.g., passing a string where a number is expected) at build time, preventing runtime bugs, simplifying refactoring, and providing autocomplete tooltips.

---

### Q16: What is Tailwind CSS, and how does it optimize stylesheet size in production?
**Answer**: Tailwind is a utility-first CSS framework. It generates styles by parsing HTML/JS code for class names during build time, dropping any unused utilities. The resulting production CSS file is highly compressed, usually under 10KB.

---

### Q17: What does the `npm run build` command accomplish?
**Answer**: It compiles TypeScript code into production-compatible JavaScript, resolves asset files, compiles CSS, and bundles all files into a mini-set of optimized, hashed static assets inside the `dist` directory for web server deployment.

---

### Q18: What is single-page routing (SPA), and how did you set it up?
**Answer**: In a Single Page Application (SPA), the browser downloads a single HTML file. When users click nav links, the client-side router (`react-router-dom`) intercepts the click, matches the route, and updates the DOM dynamically without fetching a new HTML document from the server.

---

### Q19: Explain the indexing requirements in Firestore database.
**Answer**: Firestore automatically indexes every single field in a document. However, queries involving multiple fields with filters and ordering (e.g., querying applications where `companyId == XYZ` order by `appliedAt DESC`) require creating a **Composite Index** in Firestore.

---

### Q20: How do you handle dark mode styling in your Tailwind CSS config?
**Answer**: We configured Tailwind to use the `'class'` dark mode selector. In `Layout.tsx`, we toggle the `dark` class on the root `document.documentElement` element based on user toggle state, which automatically applies styles prefixed with `dark:` (e.g., `dark:bg-slate-950`).

---

### Q21: What is the significance of the `package.json` file?
**Answer**: It contains metadata about the project, script aliases (like `dev`, `build`), and the exact versions of dependencies (`react`, `firebase`, `recharts`) required to compile and run the application.

---

### Q22: How does the application notify students when status changes?
**Answer**: When a recruiter updates the status of an application, the `dbMock` or cloud function writes a new notification document to the `/notifications` collection mapped to that student's UID. The client-side listens to updates and shows toast alerts.

---

### Q23: Explain the "STAR" framework mentioned in the AI suggestions.
**Answer**: The STAR framework is a structured technique to describe projects or interview answers:
*   **S**ituation: Describe the context or challenge.
*   **T**ask: Explain the responsibility or goal.
*   **A**ction: Outline the steps taken to solve the problem.
*   **R**esult: Detail the outcome or performance gains.

---

### Q24: How does your database prevent duplicate job applications?
**Answer**: When a student clicks "Apply", the system queries the applications store for existing entries where both `studentId` and `jobId` match. If an entry is found, the system throws an error and prevents the write.

---

### Q25: How would you scale this application to support multiple colleges (Multi-tenant)?
**Answer**: We would add a `collegeId` attribute to `/users`, `/students`, `/jobs`, and `/applications`. Every read or query filter would include `where("collegeId", "==", currentCollegeId)` to segregate placement drives and profiles by university.
