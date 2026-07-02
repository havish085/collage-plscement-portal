# Local Installation Guide 🛠️

Follow these steps to run the College Placement Portal locally on your machine.

## Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (Version 18 or above)
*   [npm](https://www.npmjs.com/) (Package Manager)
*   [Git](https://git-scm.com/)

---

## 1. Setup Project Repository

Clone or navigate to the project directory:
```bash
cd college-placement-portal
```

## 2. Install Project Dependencies

If you have cache directory permission issues, run the install with local caching enabled:
```bash
npm install --cache ./npm-cache
```
This installs the frontend dependencies (`react`, `react-router-dom`, `recharts`, `framer-motion`, `tailwindcss`, etc.) into your local `node_modules` folder.

## 3. Configure Local Firebase Environment

1.  Sign in to your Firebase account on the browser.
2.  Install the Firebase CLI globally if you haven't:
    ```bash
    npm install -g firebase-tools
    ```
3.  Login to Firebase CLI:
    ```bash
    firebase login
    ```
4.  Associate your project directory with your Firebase console project:
    ```bash
    firebase use --add collage-placement-portal
    ```

## 4. Set Gemini API Key for AI Integration

Set the environment config key inside your Firebase Cloud Functions directory:
```bash
firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
```

## 5. Launch the Local Dev Server

Start the Vite compiler:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`. You will see the login portal.

## 6. Accessing Demo Accounts

Use these pre-seeded demo profiles to log in and inspect the role-specific workspaces:

*   **Student Dashboard**:
    *   Email: `student-demo@test.com`
    *   Password: `admin123`
*   **Company HR Panel**:
    *   Email: `hr-demo@test.com`
    *   Password: `admin123`
*   **TPO Administrator Center**:
    *   Email: `tpo-demo@test.com`
    *   Password: `admin123`
