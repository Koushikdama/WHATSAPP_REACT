# Quick Demo Guide - WhatsApp Clone Features

## 🚀 Getting Started

Your dev server is already running at: **http://localhost:5173**

## 🔐 Test Authentication

### 1. Login/Signup Flow

1. Open browser to `http://localhost:5173`
2. You'll see the **Login Page** with WhatsApp branding
3. Click **"Don't have an account? Sign Up"**
4. Create a test account:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
5. Click **"Sign Up"** and you'll be logged in

### 2. Test Logout

1. Click the **Settings** icon (⚙️) in the sidebar
2. Scroll to the bottom
3. Click the red **"Log Out"** button
4. Confirm the action
5. ✅ **You'll automatically be redirected to the login page**

## 🧪 Test WebRTC Calls

### Open Browser Console First

Press `F12` or `Cmd+Option+I` (Mac) to open DevTools.

### Run WebRTC Diagnostics

```javascript
// Check if WebRTC is supported and working
const results = await window.webrtcTest.runDiagnostics()
window.webrtcTest.printSummary(results)
```

Expected output:
```
📊 WebRTC Diagnostic Summary
Browser Support: ✅
  - getUserMedia: ✅
  - RTCPeerConnection: ✅
  - MediaDevices: ✅

Permissions:
  - Camera: prompt/granted ⚠️/✅
  - Microphone: prompt/granted ⚠️/✅
...
```

### Test a Real Call

**Requirements**: Two browser windows/tabs, two different accounts

1. **Window 1**: Login as User A
2. **Window 2**: Login as User B (different account)
3. In Window 1:
   - Open a chat with User B
   - Click the video/audio call icon
4. In Window 2:
   - You should see the **Incoming Call Screen**
   - Beautiful pulsing animation with caller info
   - Answer/Decline buttons
5. Click **Answer** to start the call
6. Test the controls:
   - 🎤 Mute/Unmute
   - 📹 Video On/Off
   - ❌ End Call

## 🔔 Test Notifications

### Run Notification Diagnostics

```javascript
// Check notification support and permissions
const results = await window.notificationTest.runDiagnostics()
window.notificationTest.printSummary(results)
```

### Test Notification Flow

```javascript
// This will:
// 1. Check support
// 2. Request permission (if needed)
// 3. Show a test notification
await window.notificationTest.testFlow()
```

### Test In-App Notifications

1. Open app in two browser windows (different accounts)
2. Send a message from Window 1
3. In Window 2, you should see an **in-app notification** popup
   - Slides down from top
   - Shows message preview
   - Auto-dismisses after 4 seconds

### Test Call Notifications

1. Initiate a call from Window 1
2. In Window 2, notification appears with:
   - Caller info
   - **Answer** and **Decline** buttons
   - Stays visible for 10 seconds

## 🎯 Quick Console Commands

### WebRTC Tests
```javascript
// Quick support check
window.webrtcTest.checkSupport()

// List available cameras and microphones
await window.webrtcTest.listDevices()

// Test media stream (grants permissions)
await window.webrtcTest.testMediaStream()
```

### Notification Tests
```javascript
// Check permission status
window.notificationTest.getPermission()

// Show test notification
window.notificationTest.showTest('Hello!', 'Test message')

// Request permission
await window.notificationTest.requestPermission()
```

## 📝 Console Logging

Watch the console for helpful logs:

**Notification Logs**:
- 🔔 Notifications supported: true/false
- 🔔 Notification permission status: granted/denied/default
- 🔔 Initializing notifications for user: [userId]
- 🔔 Foreground notification received: [payload]

**WebRTC Logs**:
- Connection states
- ICE candidate exchanges
- Media stream status
- Any errors

## 🐛 Troubleshooting

### WebRTC Not Working?

```javascript
// Full diagnostic
const diag = await window.webrtcTest.runDiagnostics()
window.webrtcTest.printSummary(diag)

// If camera/mic permission is 'denied':
// - Go to browser settings
// - Reset permissions for localhost
// - Reload page
```

### Notifications Not Appearing?

```javascript
// Check what's wrong
const diag = await window.notificationTest.runDiagnostics()
window.notificationTest.printSummary(diag)

// Common fixes:
// - Grant notification permission
// - Check browser supports notifications
// - Update VAPID key in notification.service.ts (line 38)
```

### Logout Not Redirecting?

✅ This has been fixed! The auth state change now automatically shows the login screen.

If still having issues:
- Check browser console for errors
- Clear cache and reload
- Verify Firebase is configured correctly

## 📚 Documentation

For detailed information, see:
- **Walkthrough**: Full documentation of all features
- **Implementation Plan**: Technical details and architecture
- **Source Files**:
  - [AuthScreen.tsx](file:///Users/dama.koushik/Desktop/whatsappui%203/components/AuthScreen.tsx) - Login/Signup UI
  - [SettingsScreen.tsx](file:///Users/dama.koushik/Desktop/whatsappui%203/components/SettingsScreen.tsx) - Logout button
  - [webrtc.service.ts](file:///Users/dama.koushik/Desktop/whatsappui%203/services/webrtc.service.ts) - WebRTC implementation
  - [notification.service.ts](file:///Users/dama.koushik/Desktop/whatsappui%203/services/notification.service.ts) - Notification system

## ✅ Success Checklist

- [ ] Can login with email/password
- [ ] Can signup new account
- [ ] Logout redirects to login automatically
- [ ] WebRTC diagnostics pass
- [ ] Can initiate video/audio call
- [ ] Can answer incoming call
- [ ] Can toggle video/audio in call
- [ ] Notification diagnostics pass
- [ ] In-app notifications appear
- [ ] Call notifications work

---

**Need Help?** Check the console logs and run the diagnostic commands above!