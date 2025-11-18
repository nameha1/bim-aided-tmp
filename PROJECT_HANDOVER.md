
# Project Handover: BIM Aided

**Date:** November 18, 2025

## 1. Introduction

This document provides a comprehensive handover for the BIM Aided project. It covers the technology stack, environment configuration, database management, and other essential details required for future development and maintenance.

## 2. Technology Stack

The project is a modern web application built with the following technologies:

### Frontend:
- **Framework:** [Next.js](https://nextjs.org/) (v14) - A React framework for building server-side rendered and statically generated web applications.
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) - A collection of re-usable components built with Radix UI and Tailwind CSS.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- **Form Management:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation.
- **State Management:** [TanStack Query (React Query)](https://tanstack.com/query/v5) for server-state management.

### Backend & Database:
- **Backend-as-a-Service (BaaS):** [Firebase](https://firebase.google.com/)
  - **Authentication:** Firebase Authentication for user management.
  - **Database:** Firestore for the primary NoSQL database.
  - **Storage:** Firebase Storage is configured, but the primary file storage is Cloudflare R2.
- **File Storage:** [Cloudflare R2](https://www.cloudflare.com/products/r2/) - S3-compatible object storage.
- **Serverless Functions:** Next.js API Routes are used for backend logic.

### Other Key Libraries:
- **Email:** [Nodemailer](https://nodemailer.com/) for sending emails via SMTP.
- **PDF Generation:** [pdfmake](http://pdfmake.org/) and [jspdf](https://github.com/parallax/jsPDF) for creating PDFs on the client and server.
- **Date Management:** [date-fns](https://date-fns.org/)
- **Security:** [Google reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3) to protect against spam and abuse.

## 3. Environment Variables

The project uses a `.env.local` file for environment variables. **This file should not be committed to version control.**

### Firebase Configuration (Client-side)
These variables are prefixed with `NEXT_PUBLIC_` and are safe to be exposed to the browser.
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase project API key.
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase authentication domain.
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID.
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket name.
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID.
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase application ID.
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: Google Analytics measurement ID.
- `NEXT_PUBLIC_USE_FIREBASE_EMULATOR`: Set to `true` to use local Firebase emulators for development.

### Firebase Configuration (Server-side)
- `FIREBASE_SERVICE_ACCOUNT_KEY`: A JSON string containing the service account credentials for admin access. **This is highly sensitive.**

### Cloudflare R2 Storage Configuration
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID.
- `CLOUDFLARE_R2_ACCESS_KEY_ID`: Access key for Cloudflare R2.
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: Secret key for Cloudflare R2.
- `CLOUDFLARE_R2_BUCKET`: The name of the R2 bucket.
- `CLOUDFLARE_R2_ENDPOINT`: The endpoint URL for the R2 bucket.
- `NEXT_PUBLIC_R2_PUBLIC_URL`: The public URL for accessing files in the R2 bucket.

### Application Configuration
- `NEXT_PUBLIC_SITE_URL`: The public URL of the application.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SENDER_NAME`: Credentials for the SMTP server used for sending emails.
- `EMAIL_TO`: The default recipient email address for certain notifications.

### Security
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`: Google reCAPTCHA v3 site key (public).
- `RECAPTCHA_SECRET_KEY`: Google reCAPTCHA v3 secret key (private).

## 4. Database Management

The primary database is **Google Firestore**, a NoSQL document database.

- **Schema:** Firestore is schema-less, but the application code enforces a structure for the data. Refer to the type definitions in the source code (e.g., in `lib/types` or similar directories) to understand the data models.
- **Security Rules:** Firestore security rules are defined in `firestore.rules`. These rules control access to the data and are critical for security.
- **Indexes:** Firestore indexes are defined in `firestore.indexes.json`. These are required for complex queries and are deployed to Firebase.

## 5. Project Scripts

The `package.json` file contains several scripts for development and testing:

- `dev`: Starts the Next.js development server.
- `build`: Creates a production build of the application.
- `start`: Starts the production server.
- `lint`: Lints the codebase for errors and style issues.
- `analyze`: Analyzes the bundle size of the production build.
- `test-firebase`: Tests the connection to the Firebase backend.
- `test-minio`: (Legacy or unused) Tests connection to a Minio server.
- `test-r2`: Tests the connection and setup for Cloudflare R2.
- `setup-firestore`: A script to help set up Firestore (likely for initial data seeding or configuration).

## 6. Project Structure

The project follows a standard Next.js project structure.

- `src/app`: Contains the application's pages and routes (using the App Router).
- `src/components`: Contains reusable React components.
- `src/lib`: Contains utility functions, Firebase configuration, and other core logic.
- `public`: Contains static assets.
- `scripts`: Contains various helper scripts for testing and setup.

## 7. Deployment

The project is configured for deployment on **Netlify**, as indicated by the `netlify.toml` file.

- **Build Command:** `next build`
- **Publish Directory:** `.next`

The environment variables listed in section 3 must be configured in the Netlify deployment settings.

## 8. Getting Started

To run the project locally:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up environment variables:**
    - Create a `.env.local` file in the root of the project.
    - Copy the contents of `.env.example` (if it exists) or use the variable list in section 3 of this document to fill in the required values.
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
The application will be available at `http://localhost:3000`.
