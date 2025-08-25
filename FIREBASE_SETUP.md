# Firebase Setup Guide for ScholarVault

This guide will help you set up Firebase Authentication and Firestore for the ScholarVault application.

## Prerequisites

- A Google account
- Node.js installed on your system
- Basic understanding of Firebase

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "scholarvault-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Email/Password"
5. Enable it and click "Save"

## Step 3: Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database
5. Click "Done"

## Step 4: Get Firebase Configuration

1. In your Firebase project, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click on the web icon (</>)
5. Register your app with a nickname (e.g., "ScholarVault Web")
6. Copy the Firebase configuration object

## Step 5: Set Environment Variables

1. Create a `.env.local` file in your project root
2. Copy the values from `firebase-config.example` and replace them with your actual Firebase config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 6: Set Up Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Teachers can read/write their own data
    match /teachers/{teacherId} {
      allow read, write: if request.auth != null && request.auth.uid == teacherId;
    }

    // Teachers can manage their own classrooms
    match /classrooms/{classroomId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.teacherId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.teacherId;
    }

    // Anyone can read approved domains
    match /approvedDomains/{domainId} {
      allow read: if true;
      allow write: if false; // Only admins can modify
    }

    // Students and work samples (for future use)
    match /students/{studentId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can modify
    }

    match /workSamples/{sampleId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can modify
    }
  }
}
```

3. Click "Publish"

## Step 7: Populate Approved Domains

1. Create a `.env` file in your project root with your Firebase config (without NEXT*PUBLIC* prefix)
2. Run the setup script:

```bash
node scripts/setupFirestore.js
```

This will create sample approved domains in your Firestore database.

## Step 8: Test the Application

1. Start your development server: `npm run dev`
2. Try to create a new teacher account with an email from an approved domain
3. Try to sign in with the created account

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/unauthorized-domain)"**

   - Add your localhost domain to authorized domains in Firebase Console > Authentication > Settings > Authorized domains

2. **"Firebase: Error (auth/invalid-api-key)"**

   - Check that your environment variables are correctly set
   - Restart your development server after changing environment variables

3. **"Firestore: Missing or insufficient permissions"**

   - Check your Firestore security rules
   - Ensure you're in test mode for development

4. **"Module not found" errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that Firebase is properly installed

### Security Considerations

- **Never commit your `.env.local` file** to version control
- **Use proper security rules** in production
- **Enable authentication methods** only as needed
- **Regularly review** your Firebase project settings

## Production Deployment

When deploying to production:

1. Update Firestore security rules to be more restrictive
2. Set up proper authentication methods
3. Configure custom domains
4. Set up monitoring and logging
5. Review and update environment variables

## Support

If you encounter issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review the [Firebase Console](https://console.firebase.google.com/) for error logs
3. Check your browser's developer console for client-side errors
4. Verify your environment variables are correctly set
