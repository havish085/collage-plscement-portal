# Firebase Security Rules Specification 🛡️

This document describes the role-based security configurations applied to Cloud Firestore and Cloud Storage.

---

## 1. Cloud Firestore Rules (`firestore.rules`)

These rules ensure granular access controls by asserting database read and write permissions against user roles (`STUDENT`, `COMPANY_HR`, `TPO_ADMIN`).

### User Document Access
```javascript
match /users/{userId} {
  allow read: if isAuth();
  allow write: if isAuth() && (request.auth.uid == userId || getRole() == 'TPO_ADMIN');
}
```
*   **Read**: Any authenticated session can read profile documents to allow recruiters/TPOs to retrieve names.
*   **Write**: Users can only update their own profile document, or the write must be requested by a verified `TPO_ADMIN`.

### Job Drives Access
```javascript
match /jobs/{jobId} {
  allow read: if isAuth();
  allow create: if isAuth() && (getRole() == 'COMPANY_HR' || getRole() == 'TPO_ADMIN');
  allow update, delete: if isAuth() && (
    getRole() == 'TPO_ADMIN' || 
    (getRole() == 'COMPANY_HR' && resource.data.companyId == request.auth.uid)
  );
}
```
*   **Read**: Enrolled students must see active openings to check eligibility.
*   **Create**: Allowed only for Company HR recruiters or TPOs.
*   **Update/Delete**: Restrained to the posting HR or a TPO Admin.

### Application Tracking Access
```javascript
match /applications/{appId} {
  allow read: if isAuth() && (
    resource.data.studentId == request.auth.uid || 
    resource.data.companyId == request.auth.uid || 
    getRole() == 'TPO_ADMIN'
  );
  allow create: if isAuth() && getRole() == 'STUDENT';
  allow update: if isAuth() && (
    getRole() == 'TPO_ADMIN' || 
    resource.data.companyId == request.auth.uid
  );
}
```
*   **Read**: Application items are only readable by the student who applied, the HR representative hiring, or the TPO administrator.
*   **Create**: Students can submit applications.
*   **Update**: Recruiters can update application statuses (e.g. Shortlisted, Selected, Rejected).

---

## 2. Cloud Storage Rules (`storage.rules`)

Protects user files against non-PDF uploads, large sizes, or foreign access.

### Resumes Rules
```javascript
match /resumes/{studentId}/{fileName} {
  allow read: if isAuth();
  allow write: if isAuth() && 
                request.auth.uid == studentId &&
                request.resource.size < 5 * 1024 * 1024 && // 5MB Limit
                request.resource.contentType == 'application/pdf'; // PDF only
}
```
*   **Write**: A student can only upload files to their own subdirectory path.
*   **Format**: Enforced PDF contentType checks.
*   **Size**: Strictly constrained to less than 5MB to optimize database assets.
