# API and Firestore Collection Reference 📚

This document details the API parameters, Cloud Functions, and data structures utilized in the College Placement Portal.

---

## 1. Firebase Cloud Functions API

### `analyzeResumeWithGemini`
A HTTPS-callable function that interfaces with Google Vertex AI / Gemini API models to parse student profile data against job descriptions.

*   **Protocol**: HTTPS Callable
*   **Request Arguments**:
    ```json
    {
      "resumeText": "Student Name, Branch, CGPA, Technical Skills list, Project Details...",
      "jobDescription": "Full Job requirements, role, package details..."
    }
    ```
*   **Response Payload**:
    ```json
    {
      "result": "{\n  \"matchScore\": 85,\n  \"fitAnalysis\": \"...\",\n  \"missingSkills\": [\"Docker\"],\n  \"suggestedCertifications\": [\"AWS Practitioner\"],\n  \"resumeImprovements\": [\"Improve metrics\"],\n  \"topTips\": [\"Practice DSA\"]\n}"
    }
    ```

---

## 2. Firestore Collection Schemas

### `/users`
Contains account credentials, login metadata, and global authorization roles.
```json
{
  "uid": "USER_AUTH_UID",
  "name": "Sarah Jenkins",
  "email": "hr-demo@test.com",
  "role": "COMPANY_HR | STUDENT | TPO_ADMIN",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "companyName": "Google India" // Optional
}
```

### `/students`
Detailed academic profiles utilized by the Eligibility Engine.
```json
{
  "uid": "STUDENT_UID",
  "name": "Aravind Sharma",
  "email": "student-demo@test.com",
  "branch": "CSE | ECE | IT | EE | ME",
  "cgpa": 9.1,
  "gradYear": 2026,
  "skills": ["React", "Node.js", "Python"],
  "certifications": ["AWS Cloud Practitioner"],
  "projects": [
    {
      "title": "AI Placement Bot",
      "desc": "Slack chatbot project details..."
    }
  ],
  "resumeFileName": "Aravind_Resume.pdf",
  "resumeUrl": "mock-storage-url-link"
}
```

### `/jobs`
Recruitment drives posted by Company HR or TPOs.
```json
{
  "id": "JOB_DRIVE_ID",
  "companyId": "RECRUITER_UID",
  "companyName": "Google India",
  "title": "Associate Software Engineer",
  "type": "Full-Time | Internship",
  "description": "C++ SDE position description details...",
  "packageAmt": "32 LPA",
  "eligibility": {
    "minCGPA": 8.0,
    "branches": ["CSE", "IT"],
    "gradYears": [2026]
  },
  "skillsRequired": ["C++", "DSA", "System Design"],
  "deadline": "2026-08-30",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "applicantsCount": 1
}
```

### `/applications`
Recruitment workflow applications.
```json
{
  "id": "APP_ID",
  "jobId": "JOB_DRIVE_ID",
  "jobTitle": "Associate Software Engineer",
  "companyId": "RECRUITER_UID",
  "companyName": "Google India",
  "studentId": "STUDENT_UID",
  "studentName": "Aravind Sharma",
  "studentBranch": "CSE",
  "studentCGPA": 9.1,
  "status": "Applied | Under Review | Shortlisted | Interview Scheduled | Selected | Rejected",
  "appliedAt": "2026-07-02T12:00:00.000Z",
  "statusNotes": "Remarks from the company recruiter..."
}
```
