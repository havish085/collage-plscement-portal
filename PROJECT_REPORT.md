# Academic Project Report 🎓
**Title**: College Placement Portal with Vertex AI Gemini Matching Engine  
**Course**: Final Year Computer Science & Engineering (B.E. / B.Tech)  

---

## Chapter 1: Introduction & Literature Review
Manual campus placement tracking using spreadsheets is highly inefficient. Student details quickly fall out of sync, eligibility rules are verified manually, and recruiter pipelines become cluttered with ineligible applications. 

This project presents a serverless solution that implements real-time role-based workspaces and integrates Google's Vertex AI Gemini model to evaluate resume content against recruiter requirements.

---

## Chapter 2: Requirements Analysis & Specification
*   **Functional Requirements**:
    *   Authentication via Email/Password and Google OAuth.
    *   Role-based panels for Student, Company HR, and TPO Admin.
    *   Dynamic eligibility checking engine.
    *   Gemini-powered resume comparison reporting.
    *   Placement visual stats charts using Recharts.
*   **Non-Functional Requirements**:
    *   Under 2-second response latency for operations.
    *   Responsive design matching desktop and mobile viewports.
    *   Granular role-based security rules.

---

## Chapter 3: Database & Architectural Design
Data is organized into standard collections on Firestore:
1.  **users**: `uid`, `email`, `role`, `createdAt`
2.  **students**: `uid`, `branch`, `cgpa`, `gradYear`, `skills`, `projects`, `resumeUrl`
3.  **jobs**: `id`, `companyId`, `eligibility`, `packageAmt`, `deadline`
4.  **applications**: `id`, `studentId`, `jobId`, `status`, `statusNotes`
5.  **notifications**: `id`, `userId`, `message`, `read`, `createdAt`

---

## Chapter 4: Implementation Methodology
The project employs React 18 for view construction. State transitions are controlled via React Hooks and context bindings. Custom layouts wrap navigation routes, guarded by Firebase-based verification. Cloud Firestore real-time queries power the notification alerts, while the AI recommendations are compiled asynchronously via serverless Firebase Functions.

---

## Chapter 5: Verification & Results
*   **Unit Tests**: Checked compilation build runs cleanly.
*   **Manual Checks**: Tested login bypasses, validated eligibility locks when CGPA requirements are set higher than current profile, and confirmed resume upload filters reject non-PDF files.
