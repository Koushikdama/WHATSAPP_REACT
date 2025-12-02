# Firebase Setup Guide for WhatsApp Clone

## Prerequisites
- Node.js installed
- npm or yarn package manager
- A Google account for Firebase

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "whatsapp-clone")
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the Web icon (</>) to add a web app
2. Enter an app nickname (e.g., "WhatsApp Clone Web")
3. Check "Also set up Firebase Hosting" if you want to deploy later (optional)
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need these values for the next step

## Step 3: Configure Environment Variables

1. In your project root, create a `.env.local` file (it's already in `.gitignore`)
2. Copy the contents from `.env.example` and replace with your actual Firebase values:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABCD12345
```

## Step 4: Enable Firebase Authentication

1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click on the "Sign-in method" tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"
5. (Optional) Enable additional providers (Google, Phone, etc.)

## Step 5: Create Firestore Database

1. In Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select **"Start in test mode"** (for development)
   - This allows read/write access for 30 days
   - We'll add security rules later
4. Choose a Firestore location (preferably close to your users)
5. Click "Enable"

## Step 6: Set Up Firestore Security Rules (Important!)

After testing, replace the test mode rules with these production-ready rules:

1. In Firestore Database, click on the "Rules" tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read: if isAuthenticated() && 
        request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated() && 
        request.auth.uid in request.resource.data.participants;
      allow update: if isAuthenticated() && 
        request.auth.uid in resource.data.participants;
      allow delete: if false; // Prevent chat deletion
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuthenticated() && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if isAuthenticated() && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow update: if isAuthenticated() && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow delete: if isAuthenticated() && 
          request.auth.uid == resource.data.senderId;
      }
    }
    
    // Statuses collection
    match /statuses/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    // Calls collection
    match /calls/{callId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == resource.data.callerId || 
         request.auth.uid == resource.data.receiverId);
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.callerId;
      allow update: if isAuthenticated() && 
        (request.auth.uid == resource.data.callerId || 
         request.auth.uid == resource.data.receiverId);
      allow delete: if false; // Prevent call history deletion
    }
  }
}
```

3. Click "Publish"

## Step 7: Enable Firebase Cloud Messaging (Optional, for notifications)

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Click on the "Cloud Messaging" tab
4. Under "Web Push certificates", click "Generate key pair"
5. Copy the "Key pair" value - you'll need this for FCM setup later

## Step 8: Run the Application

1. Make sure your `.env.local` file is configured
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown (usually `http://localhost:3000` or `http://localhost:3001`)

## Step 9: Create Your First User

1. You'll see the authentication screen
2. Click "Sign Up"
3. Enter your name, email, and password
4. Click "Sign Up"
5. You should be redirected to the chat interface!

## Troubleshooting

### "Authentication failed" error
- Check that Email/Password authentication is enabled in Firebase Console
- Verify your `.env.local` file has the correct Firebase config values
- Make sure password is at least 6 characters

### "Permission denied" error when trying to read/write data
- Check that your Firestore security rules are set correctly
- Verify that you're authenticated (logged in)
- Check the browser console for detailed error messages

### Firebase initialization errors
- Verify all environment variables are set correctly in `.env.local`
- Restart the development server after changing `.env.local`
- Check that the Firebase SDK installed correctly: `npm list firebase`

## Next Steps

After setting up Firebase:

1. ✅ You now have user authentication working!
2. 🔄 Next: We'll migrate the static JSON data to Firestore
3. 📡 Then: Add real-time messaging with Firestore listeners
4. 📞 Finally: Implement WebRTC calls with Firebase signaling

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Get Started](https://firebase.google.com/docs/firestore)