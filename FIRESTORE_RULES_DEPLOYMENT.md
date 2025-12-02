# Firestore Rules Deployment Instructions

## Firestore Security Rules Deployment

I've created the `firestore.rules` file with proper security rules. Now you need to deploy them to your Firebase project.

### Option 1: Deploy via Firebase Console (Recommended for Quick Fix)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `whatsapp-d94fc`
3. **Navigate to Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top
4. **Replace the rules**:
   - Copy the entire contents of the `firestore.rules` file I created
   - Paste it into the rules editor
   - Click "Publish"

### Option 2: Deploy via Firebase CLI

If you have Firebase CLI installed:

\`\`\`bash
# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
\`\`\`

## What Changed

### Fixed AuthContext.tsx
- ✅ Prevented Firestore calls when user is logged out
- ✅ Added better error handling for missing user profiles
- ✅ Added helpful comments explaining the auth flow

### Created Firestore Security Rules
The rules now properly:
- ✅ Allow authenticated users to read all user profiles
- ✅ Allow users to only create/update/delete their own profile
- ✅ Allow chat participants to read/write messages
- ✅ Prevent unauthorized access to chats and messages
- ✅ Protect call history and status updates

## Expected Results

After deploying these changes:
- ✅ No more "Missing or insufficient permissions" error after logout
- ✅ Signup should work correctly (user profile creation is allowed)
- ✅ Users can only access data they're authorized to see
- ✅ Better security for your Firestore data

## Testing Steps

1. **Test Logout**:
   - Login to the app
   - Click the three dots menu
   - Click "Log out"
   - **Expected**: No Firebase errors in console, clean logout

2. **Test Signup**:
   - Open app in incognito window
   - Click "Sign Up"
   - Create a new account
   - **Expected**: Successful signup with no permission errors

3. **Test Login**:
   - Login with existing credentials
   - **Expected**: Successful login, user profile loads correctly
