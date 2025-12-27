// API Testing Guide for Auth Routes

## Login Endpoint

**POST** `/api/auth/login`

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-123",
      "tenantId": "tenant-123",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "0123456789",
      "isActive": true
    }
  }
}
```

### Error Response (401)

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Error Response (400)

```json
{
  "success": false,
  "message": "Email is required"
}
```

---

## Logout Endpoint

**POST** `/api/auth/logout`

### Success Response (200)

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Usage with JWT Token (Future)

Once JWT implementation is complete, the login response will include:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Then use the token in subsequent requests:

```
Authorization: Bearer <token>
```

---

## Notes

1. **Password Field**: Currently, the system compares passwords directly.

   - TODO: Implement bcrypt for password hashing and verification
   - Add `password` field to Users table if not already present

2. **JWT Token**:

   - TODO: Uncomment JWT generation in AuthController.login
   - Set `JWT_SECRET` and `JWT_EXPIRE` in .env file

3. **Protected Routes**:
   - Apply `authMiddleware` to routes that require authentication
   - Example: `router.use(authMiddleware)` in route files
