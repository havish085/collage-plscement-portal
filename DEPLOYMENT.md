# Production Deployment Guide 🚀

Follow these steps to deploy the College Placement Portal application to production using Firebase Hosting, Functions, and Firestore.

## 1. Firebase Authentication Activation

1.  Navigate to the [Firebase Console](https://console.firebase.google.com/).
2.  Open **Authentication** from the Build side-panel.
3.  Click **Get Started** and enable:
    *   **Email/Password** provider.
    *   **Google Sign-In** provider.
4.  Configure the support email address and click **Save**.

## 2. Cloud Firestore Database Setup

1.  In the Firebase Console, navigate to **Firestore Database**.
2.  Click **Create Database** and select **Production Mode**.
3.  Set the geographic region close to your target users (e.g., `asia-south1`).
4.  Once created, click the **Rules** tab, replace the contents with the rules defined in `firestore.rules`, and click **Publish**.

## 3. Cloud Storage Setup

1.  In the Firebase Console, navigate to **Storage**.
2.  Click **Get Started** and set rules in production mode.
3.  In the **Rules** tab, replace the content with the rules from `storage.rules` and click **Publish**.

## 4. Build and Deploy Cloud Functions (Vertex AI integration)

Navigate to the `functions/` directory, install packages, and deploy the callable AI analyzer:
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## 5. Compile and Deploy the Frontend App

Compile the React TypeScript frontend into static production-ready bundles, and push to Firebase Hosting:
```bash
# Compile and build files
npm run build

# Deploy Hosting to live domain
firebase deploy --only hosting
```

## 6. Accessing the Live Site

Once deployment completes, the Firebase CLI will output your live URL, which matches:
`https://collage-placement-portal.web.app` (or `https://collage-placement-portal.firebaseapp.com`).
Verify that the registration flow, profile edit, automated filters, and AI resume matching run correctly.
