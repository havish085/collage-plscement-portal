# College Placement Portal 🎓

A modern, production-ready, and end-to-end College Placement Portal designed for students, recruiters (Company HR), and Training & Placement Officers (TPOs). The platform automates campus hiring pipelines, enforces student academic eligibility, displays interactive performance analytics, and leverages Vertex AI Gemini model to parse resumes and generate placement guidelines.

## 🚀 Key Features

*   **Role-Based Access Control**: Tailored workflows and dashboard layouts for Students, Company HR, and TPO Admin.
*   **Automated Eligibility Filter**: Prevents students from applying to drives where they do not satisfy CGPA, branch, or graduation year criteria.
*   **Recruiter Portal**: Post job/internship openings, review applicants, filter by branch/CGPA, download resumes, and manage candidates status.
*   **TPO Workspace**: Monitor campus placement percentage, highest/average packages, department metrics, and execute bulk status updates.
*   **AI Resume Analyzer**: Vertex AI Gemini API compares applicant profile metrics against any target job description to calculate match scores and missing skills.
*   **Real-time Alerts**: Automatic notifications for shortlists, interview slot assignments, and application status updates.

## 🛠️ Technology Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS, React Router, Recharts, Framer Motion
*   **Backend & DB**: Firebase Auth, Cloud Firestore, Cloud Storage, Firebase Cloud Functions
*   **AI**: Vertex AI Gemini API via Firebase Cloud Functions callable endpoints
*   **Hosting**: Firebase Hosting

## 📦 Directory Structure

```text
├── src/
│   ├── components/       # Shared UI Layout and Guard components
│   ├── context/          # Role-Based Authentication Context
│   ├── firebase/         # Firebase initialization and db mock fallback
│   ├── pages/            # Student, HR, and Admin workspace pages
│   ├── index.css         # Tailwind directives and custom scrollbar styles
│   ├── App.tsx           # Route patterns and client layout mounts
│   └── main.tsx          # React mount entry point
├── functions/            # Firebase Cloud Functions (Gemini API integration)
├── firestore.rules       # Granular database security rules
├── storage.rules         # Upload validation rules for PDF resumes
├── firebase.json         # Hosting configuration maps
├── package.json          # Dependency packages definitions
└── tsconfig.json         # TypeScript configuration
```

## 🚥 Quick Start

1.  Clone the repository and install packages:
    ```bash
    cd college-placement-portal
    npm install --cache ./npm-cache
    ```
2.  Run development server:
    ```bash
    npm run dev
    ```
3.  Default credentials for testing:
    *   **Student Profile**: `student-demo@test.com` (Password: `admin123`)
    *   **Recruiter Profile**: `hr-demo@test.com` (Password: `admin123`)
    *   **TPO Admin Profile**: `tpo-demo@test.com` (Password: `admin123`)
