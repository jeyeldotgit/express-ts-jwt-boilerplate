# Authentication System

## Overview

JWT-based authentication with **access tokens** (15min) and **refresh tokens** (7 days). Refresh tokens are stored in HTTP-only cookies and the database. Access tokens are sent in the `Authorization` header.

## Architecture

- **Access Token**: Short-lived JWT (15min) sent as `Bearer <token>` in Authorization header
- **Refresh Token**: Long-lived JWT (7 days) stored in HTTP-only cookie and database
- **Password Hashing**: bcrypt with 10 salt rounds
- **Session Management**: Refresh tokens stored in database for validation and logout

## Endpoints

### `POST /api/auth/signup`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200`
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "message": "User signed up successfully"
}
```

---

### `POST /api/auth/login`
Authenticate and receive tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200`
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "accessToken": "jwt_token_here",
  "message": "User logged in successfully"
}
```

**Sets Cookie:** `refreshToken` (HTTP-only, 7 days)

---

### `GET /api/auth/me`
Get current user (protected).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200`
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "message": "User found successfully"
}
```

---

### `POST /api/auth/refresh`
Get new access token using refresh token.

**Cookies:** `refreshToken` (automatically sent)

**Response:** `200`
```json
{
  "accessToken": "new_jwt_token",
  "message": "Access token generated successfully"
}
```

---

### `POST /api/auth/logout`
Invalidate session (protected).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Cookies:** `refreshToken` (automatically sent)

**Response:** `200`
```json
{
  "message": "User logged out successfully"
}
```

## Frontend Usage

### 1. Login and Store Token

```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({ email, password }),
});

const { accessToken, user } = await response.json();
localStorage.setItem('accessToken', accessToken);
```

### 2. Make Authenticated Requests

```typescript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});
```

### 3. Handle Token Expiration (Axios Interceptor)

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 - refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.accessToken);
        
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(error.config);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 4. Logout

```typescript
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  credentials: 'include',
});

localStorage.removeItem('accessToken');
```

## Environment Variables

```env
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
NODE_ENV=production
```

## Security Notes

- Always use `credentials: 'include'` (fetch) or `withCredentials: true` (axios)
- Store access tokens in memory or localStorage (not cookies)
- Refresh tokens are HTTP-only and cannot be accessed via JavaScript
- Use HTTPS in production
- Configure CORS to allow credentials: `cors({ origin: 'http://localhost:5173', credentials: true })`
