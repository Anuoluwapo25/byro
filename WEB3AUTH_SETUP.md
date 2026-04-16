# Web3Auth Migration Setup Guide

## Overview
Your project has been migrated from Privy to Web3Auth with the following features:
- **Email-only authentication** (no social logins)
- **Whitelabel UI customization** ready to use
- **Growth Plan pricing** required for production

## Files Created/Modified

### New Files
- `/frontend/src/app/web3auth/Web3AuthProvider.tsx` - Web3Auth provider with React context
- `/frontend/src/components/auth/LoginWeb3Auth.tsx` - Email-only login component

### Modified Files
- `/frontend/src/app/layout.tsx` - Replaced Privy with Web3Auth provider
- `/frontend/src/components/auth/Login.jsx` - Now uses LoginWeb3Auth component
- `/frontend/src/services/api.js` - Added `authenticateWithWeb3Auth` method
- `/.env.local` - Added `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`

## Setup Steps

### Step 1: Get Web3Auth Client ID
1. Go to https://dashboard.web3auth.io
2. Create a new project or use an existing one
3. Copy your Client ID
4. Replace `YOUR_WEB3AUTH_CLIENT_ID` in `.env.local` with your actual Client ID

### Step 2: Configure Email-Only Authentication
The Web3Auth Modal Config in `Web3AuthProvider.tsx` is already configured to:
- Disable all social logins (Google, Twitter, Facebook, Discord, etc.)
- Enable email passwordless login only
- Use `authConnectionId: 'w3a-email_passwordless-demo'` for seamless email flow
- Set sessionTime to 7 days
- Use 'local' storage for persistent sessions

### Step 3: Configure Whitelabel Settings
Update the `uiConfig` in `Web3AuthProvider.tsx` (line 45-54):

```tsx
uiConfig: {
  appName: "Byro",                      // Your app name
  appUrl: "https://byro.africa",        // Your app URL
  logoLight: "/assets/images/logo.svg", // Light theme logo
  logoDark: "/assets/images/logo.svg",  // Dark theme logo
  defaultLanguage: "en",
  mode: "light",                        // "light" or "dark"
  theme: {
    primary: "#FF6600",                 // Your brand color
  },
  useLogoLoader: true,                  // Show logo while loading
},
```

### Step 4: Backend Integration
Your backend needs to handle the new Web3Auth endpoint:
- **Endpoint**: `POST /auth/web3auth/`
- **Body**:
  ```json
  {
    "user_id": "string",
    "email": "user@example.com",
    "name": "User Name"
  }
  ```
- **Response**: Should include access token (same format as Privy)
  ```json
  {
    "access": "JWT_TOKEN",
    "refresh": "REFRESH_TOKEN",
    ...
  }
  ```

### Step 5: Session Management
The Web3Auth provider handles:
- **Session Duration**: 7 days (configurable via `sessionTime`)
- **Storage**: Local storage (persistent across tabs)
- **Auto-refresh**: Handled by Web3Auth SDK

### Step 6: Optional - Growth Plan Features
For production, consider upgrading to Web3Auth Growth Plan for:
- Advanced whitelabel customization
- Custom domains
- Premium support
- Custom branding on modal

Test in **Sapphire Devnet** for free during development.

## Usage in Components

### Login Hook
```tsx
import { useWeb3Auth } from "@/app/web3auth/Web3AuthProvider";

export default function MyComponent() {
  const { isLoggedIn, userInfo, login, logout } = useWeb3Auth();

  return (
    <>
      {isLoggedIn ? (
        <>
          <p>Welcome {userInfo.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </>
  );
}
```

## Email Authentication Flow

1. **User enters name + email** on login page
2. **Web3Auth handles the rest**:
   - Sends verification code to email
   - User enters code in modal
   - Session created
3. **Backend receives**: `user_id`, `email`, `name`
4. **Frontend redirected** to `/profile` (new user) or `/events` (returning user)

## Removal of Privy

Old Privy files can be deleted:
- `/frontend/src/app/privy/AuthProvider.tsx` (no longer used)
- Privy imports from `@privy-io/react-auth` in other files

Old environment variables (optional to keep):
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `NEXT_PUBLIC_PRIVY_CLIENT_ID`

## Testing

### Local Development
1. Use `WEB3AUTH_NETWORK.SAPPHIRE_DEVNET` in Web3AuthProvider
2. Test email signup/login
3. Verify backend receives authentication data

### Production
1. Switch to `WEB3AUTH_NETWORK.SAPPHIRE_MAINNET`
2. Upgrade to Web3Auth Growth Plan (if using advanced features)
3. Update Client ID for production

## Troubleshooting

### "Web3Auth initialization error"
- Ensure `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` is set
- Check environment variables are loaded

### "Email not found in user info"
- Web3Auth may not return email. Check Web3Auth dashboard settings
- Ensure email passwordless is enabled

### "Backend authentication error"
- Verify `/auth/web3auth/` endpoint exists on backend
- Check request body format matches backend expectations

## References
- Web3Auth Docs: https://docs.metamask.io/embedded-wallets/sdk/react/
- Web3Auth Dashboard: https://dashboard.web3auth.io
- Pricing: https://web3auth.io/pricing.html
