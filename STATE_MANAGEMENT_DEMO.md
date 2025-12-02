# State Management & Token Authentication - Demo Guide

## 🎯 What We've Implemented

You now have a **professional-grade state management and authentication system** similar to Spring Boot microservices!

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                      │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Zustand Stores (State Management)           │
│  ┌──────────────┬──────────────┬────────────────┐       │
│  │  Auth Store  │  User Store  │   App Store    │       │
│  └──────────────┴──────────────┴────────────────┘       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Service Layer (Business Logic)              │
│  ┌──────────────┬──────────────┬────────────────┐       │
│  │ Auth Service │ Token Service│  API Service   │       │
│  └──────────────┴──────────────┴────────────────┘       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Axios Interceptors (Middleware)             │
│  • Auto JWT injection                                    │
│  • Automatic token refresh                               │
│  • Error handling                                        │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Firebase / Backend API                      │
└──────────────────────────────────────────────────────────┘
```

## 🚀 Features Implemented

### ✅ State Management (Zustand)
- **AuthStore**: Login, signup, logout, token management
- **UserStore**: User data management
- **AppStore**: Global app state (theme, notifications)
- **DevTools**: Redux DevTools integration
- **Persistence**: Auto-save to localStorage

### ✅ Token Management
- **JWT Tokens**: Access token + refresh token
- **Auto Refresh**: Tokens refresh automatically before expiry
- **Secure Storage**: localStorage with encryption support
- **Validation**: Token expiry checking
- **Decoding**: Extract payload from JWT

### ✅ API Layer
- **Axios Interceptors**: Auto-inject Authorization header
- **Auto Retry**: Failed requests retry after token refresh
- **Error Handling**: Centralized error transformation
- **Request Queue**: Queue requests during token refresh

## 🧪 Testing the Features

### 1. Access Zustand Stores
```javascript
// Open browser console (F12)

// Get auth store
const authStore = window.__ZUSTAND_STORES__?.authStore

// Check current auth state
authStore.getState()

// Get user info
authStore.getState().user

// Get tokens
authStore.getState().accessToken
authStore.getState().refreshToken
```

### 2. Test Token Management
```javascript
// Import token service in console
const { tokenService } = await import('/src/services/token.service.ts')

// Check if tokens exist
tokenService.hasValidTokens()

// Get access token
const token = tokenService.getAccessToken()

// Decode token
const payload = tokenService.decodeToken(token)
console.log('Token payload:', payload)

// Check expiration
console.log('Token expired?', tokenService.isTokenExpired(token))

// Get time until expiration
console.log('Expires in (seconds):', tokenService.getTimeUntilExpiration(token))
```

### 3. Test Authentication Flow

**Login:**
```javascript
// Use auth store directly
const { useAuthStore } = await import('/src/store/authStore.ts')
const authStore = useAuthStore.getState()

// Login
await authStore.login({
    email: 'test@example.com',
    password: 'password123'
})

// Check state after login
console.log('User:', authStore.user)
console.log('Authenticated:', authStore.isAuthenticated)
console.log('Access Token:', authStore.accessToken)
```

**Signup:**
```javascript
await authStore.signup({
    email: 'newuser@example.com',
    password: 'password123',
    name: 'New User'
})
```

**Logout:**
```javascript
await authStore.logout()
console.log('Logged out:', !authStore.isAuthenticated)
```

### 4. Test API Calls with Auto Token Injection

```javascript
// Import API service
const { api } = await import('/src/services/api.service.ts')

// Make an API call (token automatically added)
try {
    const response = await api.get('/users/me')
    console.log('User data:', response.data)
} catch (error) {
    console.error('API error:', error)
}

// Make a POST request
const response = await api.post('/messages', {
    content: 'Hello!',
    receiverId: 'user123'
})
```

### 5. Monitor Token Refresh

**Open Network Tab** in DevTools and watch for:
1. Request with expired token → 401 response
2. Automatic call to `/auth/refresh`
3. Original request retried with new token

```javascript
// Manually trigger token refresh
await authStore.refreshAccessToken()
console.log('Token refreshed!')
```

### 6. Test App Store (Global State)

```javascript
const { useAppStore } = await import('/src/store/appStore.ts')
const appStore = useAppStore.getState()

// Toggle theme
appStore.toggleTheme()
console.log('Current theme:', appStore.theme)

// Add notification
appStore.addNotification({
    type: 'message',
    title: 'New Message',
    body: 'You have a new message!'
})

// Check notifications
console.log('Notifications:', appStore.notifications)
console.log('Unread count:', appStore.unreadCount)
```

### 7. Test User Store

```javascript
const { useUserStore } = await import('/src/store/userStore.ts')
const userStore = useUserStore.getState()

// Add users
userStore.addUser({
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isOnline: true,
    lastSeen: new Date().toISOString()
})

// Get user
const user = userStore.getUser('user1')
console.log('User:', user)

// Update user
userStore.updateUser('user1', { isOnline: false })
```

## 📊 Checking Token in Requests

### Network Tab Inspection

1. Open DevTools → Network tab
2. Make any API request
3. Click on the request
4. Go to "Headers" tab
5. Look for: `Authorization: Bearer eyJhbGci...` ✅

### Example Request Headers
```
GET /api/users/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## 🔍 Zustand DevTools

### Enable Redux DevTools

1. Install Redux DevTools Chrome extension
2. Open DevTools → Redux tab
3. Select "AuthStore", "UserStore", or "AppStore"
4. View state changes in real-time!

**Features:**
- Time travel debugging
- Action history
- State diff viewer
- Export/import state

## 🎨 Using Stores in Components

### Before (Context API):
```typescript
import { useAuth } from './context/AuthContext';

function MyComponent() {
    const { currentUser, login, logout } = useAuth();
    // ...
}
```

### After (Zustand - Direct):
```typescript
import { useAuthStore } from './store';

function MyComponent() {
    const { user, login, logout, isAuthenticated } = useAuthStore();
    // ...
}
```

### Selective Re-renders (Optimization):
```typescript
// Only re-render when user changes
function MyComponent() {
    const user = useAuthStore(state => state.user);
    // Component only re-renders when user changes!
}
```

## 🔐 Token Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Logs In                          │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  Firebase Auth → Get ID Token (JWT) + Refresh Token     │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  Token Service → Store in localStorage                   │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  Auth Store → Update Zustand state                       │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  Component → Make API Request                            │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  Axios Interceptor → Add Authorization header            │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  Backend → Receives request with JWT                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                   ┌────▼────┐
                   │ Success │
                   └────┬────┘
                        │
                   ┌────▼────┐
                   │  Return │
                   │  Data   │
                   └────┬────┘
                        │
              ┌─────────▼──────────┐
              │  401 Unauthorized? │
              └─────────┬──────────┘
                        │
              ┌─────────▼──────────────────────┐
              │  Interceptor → Refresh Token   │
              └─────────┬──────────────────────┘
                        │
              ┌─────────▼──────────────────────┐
              │  Retry Original Request        │
              └────────────────────────────────┘
```

## 📁 File Structure

```
src/
├── store/                      # Zustand stores
│   ├── authStore.ts           # Auth state & actions ✅
│   ├── userStore.ts           # User data ✅
│   ├── appStore.ts            # Global app state ✅
│   └── index.ts               # Export all stores ✅
│
├── services/                   # Business logic layer
│   ├── token.service.ts       # JWT token management ✅
│   ├── auth.service.ts        # Auth API calls ✅
│   ├── api.service.ts         # Axios with interceptors ✅
│   └── firestore.service.ts   # Existing Firestore service
│
├── types/
│   └── auth.types.ts          # Auth type definitions ✅
│
├── utils/
│   └── storage.utils.ts       # Secure storage helpers ✅
│
└── context/
    └── AuthContext.tsx        # Updated with Zustand integration ✅
```

## 🔄 Migration Status

### ✅ Completed
- Token service
- API service with interceptors
- Auth service (Firebase integration)
- Zustand stores (auth, user, app)
- AuthContext integration
- Type definitions
- Storage utilities

### 🚧 Optional Enhancements
- ChatStore for messaging state
- API service for other endpoints
- Offline support with service workers
- WebSocket authentication with tokens
- Token rotation strategy
- Rate limiting

## 💡 Key Differences from Spring Boot

| Spring Boot | Our React App |
|-------------|---------------|
| `@Service` classes | Zustand stores |
| `@RestTemplate` / `WebClient` | Axios with interceptors |
| JWT `TokenProvider` | Token service |
| Security filter chain | Axios interceptors |
| Session management | Token auto-refresh |
| `@Autowired` DI | Import & use stores |

## 🎓 Learning Resources

### Token Management
- JWT format: `header.payload.signature`
- Access token: Short-lived (5-60 min)
- Refresh token: Long-lived (days/weeks)
- Token rotation: Get new refresh token on each refresh

### Zustand Best Practices
- Keep stores focused (single responsibility)
- Use selectors to avoid re-renders
- DevTools for debugging
- Persist important state
- Actions should be async-safe

## 🐛 Troubleshooting

### Tokens Not Stored
```javascript
// Check storage availability
const { isStorageAvailable } = await import('/src/utils/storage.utils.ts')
console.log('Storage available:', isStorageAvailable())

// Check tokens
import { StorageKeys } from '/src/utils/storage.utils.ts'
console.log('Access token:', localStorage.getItem(StorageKeys.ACCESS_TOKEN))
console.log('Refresh token:', localStorage.getItem(StorageKeys.REFRESH_TOKEN))
```

### API Requests Not Including Token
```javascript
// Check if token exists
const token = tokenService.getAccessToken()
console.log('Token:', token ? 'Exists' : 'Missing')

// Make test request and check headers in Network tab
await api.get('/test')
```

### State Not Updating
```javascript
// Check Zustand store
const authStore = useAuthStore.getState()
console.log('Auth state:', authStore)

// Force re-render
authStore.checkAuth()
```

## ✅ Verification Checklist

- [ ] Login sets tokens in localStorage
- [ ] Tokens appear in request headers
- [ ] Token refresh works on 401
- [ ] Logout clears tokens
- [ ] Zustand stores update correctly
- [ ] DevTools show state changes
- [ ] Page refresh preserves auth
- [ ] Expired tokens auto-refresh

---

**🎉 Congratulations!** You now have enterprise-grade state management and authentication!