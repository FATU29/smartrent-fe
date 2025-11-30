# Auth Hooks & Cookie Monitoring

## Overview

Authentication system with automatic logout when cookies are deleted or missing.

## Features

### 1. **Automatic Cookie Monitoring** (AuthProvider)

- Checks cookies every 5 seconds
- Auto-logout if `access_token` cookie is missing while user is authenticated
- Prevents ghost authentication state

### 2. **Improved Logout** (useLogout)

- Works even without cookies
- Always clears local state
- Gracefully handles API errors

### 3. **Auth Guard Hook** (useAuthGuard)

- For components requiring authentication
- Checks cookies on mount and logout if missing

### 4. **Force Logout Hook** (useForceLogout)

- Immediately clears auth state
- Useful for emergency logout or testing

## Usage

### Basic Logout

```tsx
import { useLogout } from '@/hooks/useAuth'

const MyComponent = () => {
  const { logoutUser } = useLogout()

  const handleLogout = async () => {
    const result = await logoutUser()
    if (result.success) {
      console.log('Logged out successfully')
    }
  }

  return <button onClick={handleLogout}>Logout</button>
}
```

### Auth Guard (Protected Components)

```tsx
import { useAuthGuard } from '@/hooks/useAuth'

const ProtectedComponent = () => {
  const { isAuthenticated } = useAuthGuard()

  if (!isAuthenticated) return null

  return <div>Protected Content</div>
}
```

### Force Logout

```tsx
import { useForceLogout } from '@/hooks/useAuth'

const AdminPanel = () => {
  const { forceLogout } = useForceLogout()

  // Force logout all users (admin only)
  const handleForceLogoutAll = () => {
    forceLogout()
  }

  return <button onClick={handleForceLogoutAll}>Force Logout</button>
}
```

## How It Works

### Cookie Monitoring Flow

```
┌─────────────────────────────────────────────────────────┐
│                    AuthProvider                          │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │  Every 5 seconds:                          │         │
│  │  1. Check if isAuthenticated = true        │         │
│  │  2. Get cookies from cookieManager         │         │
│  │  3. If no access_token → logout()          │         │
│  └────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                    ┌──────────┐
                    │  logout() │
                    └──────────┘
                          │
                          ▼
        ┌──────────────────────────────────┐
        │ 1. Clear cookies                  │
        │ 2. Clear localStorage (user data) │
        │ 3. Reset store state              │
        └──────────────────────────────────┘
```

### Logout Flow

```
┌──────────────────────────────────────────────────────────┐
│                    useLogout()                            │
│                                                           │
│  1. Get access_token from cookies                        │
│                                                           │
│     ┌────────────┐                                       │
│     │ Has token? │                                       │
│     └────────────┘                                       │
│         │     │                                           │
│        YES    NO                                          │
│         │     │                                           │
│         │     └──> logout() locally                      │
│         │          return success                         │
│         │                                                 │
│         ▼                                                 │
│  2. Call AuthService.logout(token)                       │
│                                                           │
│     ┌──────────────┐                                     │
│     │  API Success?│                                     │
│     └──────────────┘                                     │
│         │     │                                           │
│        YES    NO                                          │
│         │     │                                           │
│         │     └──> Still logout() locally                │
│         │                                                 │
│         ▼                                                 │
│  3. logout() - clear everything                          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Scenarios Handled

### ✅ Scenario 1: User manually deletes cookies

- **Detection**: Cookie monitoring (every 5s)
- **Action**: Auto logout
- **Result**: User sees login screen

### ✅ Scenario 2: User clicks logout button

- **Detection**: Manual logout
- **Action**: Call API + clear state
- **Result**: User logged out properly

### ✅ Scenario 3: Cookies expired

- **Detection**: Cookie monitoring or next API call
- **Action**: Auto logout
- **Result**: User sees login screen

### ✅ Scenario 4: Network error during logout

- **Detection**: API call fails
- **Action**: Still clear local state
- **Result**: User logged out locally

### ✅ Scenario 5: No cookies but localStorage has user

- **Detection**: Cookie monitoring
- **Action**: Auto logout to sync state
- **Result**: Consistent logout

## Configuration

### Cookie Check Interval

Default: 5 seconds (5000ms)

To change, edit `src/contexts/auth/index.tsx`:

```tsx
const intervalId = setInterval(checkCookies, 10000) // 10 seconds
```

### Cookie Names

Defined in `src/utils/cookies/index.ts`:

- `access_token` - JWT access token
- `refresh_token` - JWT refresh token

## Testing

### Manual Test: Delete Cookies

1. Login to app
2. Open DevTools → Application → Cookies
3. Delete `access_token` cookie
4. Wait 5 seconds
5. ✅ User should be auto logged out

### Manual Test: Logout Without Internet

1. Login to app
2. Turn off internet
3. Click logout
4. ✅ User should be logged out locally

## Notes

- **Persistence**: User data stored in `localStorage` via Zustand persist
- **Cookies**: Tokens stored in httpOnly cookies (secure)
- **Sync**: Cookie monitoring ensures localStorage and cookies stay in sync
- **Performance**: 5-second interval has minimal performance impact

## Related Files

- `src/contexts/auth/index.tsx` - AuthProvider with cookie monitoring
- `src/hooks/useAuth/index.tsx` - Auth hooks (login, logout, etc.)
- `src/hooks/useAuth/useAuthGuard.ts` - Auth guard and force logout
- `src/store/auth/index.store.ts` - Zustand store for auth state
- `src/utils/cookies/index.ts` - Cookie management utilities
