# Rally Reactor

Backend API service for Rally.

---

## 🚀 How to Run Locally

### Requirements:

- **Node v24.3.0**
- **NVM** (Node Version Manager)

### Steps:

```bash
nvm install 24.3.0
nvm use 24.3.0

npm install
npm run build
npm start
```

> 🔧 The server runs on port `3000` by default. You can customize the port and other config via a `.env` file.

---

## 📡 API Endpoints (Work in Progress)

### ➕ Create Rally

**POST** `/rally-api/rally/create`

**Request Body:**

```json
{
  "groupName": "Friday Night Crew",
  "callToRally": "Bring your own snacks!",
  "hangoutDateTime": "2025-08-01T19:00:00.000Z"
}
```

**Request Headers:**

```json
{
  "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIrMTIyNDYwMDEyNzgiLCJpYXQiOjE3NTI1NDkzMTgsImV4cCI6MTc1MjU1MjkxOH0.8KUmgm_mfJKje5996aiIxyLSkyfTKRasRZWzGO2X6LY"
}
```

---

### 🔍 Get Rally by ID

**GET** `/rally-api/rally/:rallyId`

**Request Headers:**

```json
{
  "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIrMTIyNDYwMDEyNzgiLCJpYXQiOjE3NTI1NDkzMTgsImV4cCI6MTc1MjU1MjkxOH0.8KUmgm_mfJKje5996aiIxyLSkyfTKRasRZWzGO2X6LY"
}
```

Example:

```
GET /rally-api/rally/123456
```

---

### 📲 Send MFA Code

**POST** `/rally-api/auth/otp/send`

**Request Body:**

```json
{
  "phoneNumber": "+12024567041"
}
```

---

### 🔐 Login with MFA

**POST** `/rally-api/auth/otp/verify`

**Request Body:**

```json
{
  "phoneNumber": "+12024567041",
  "mfaCode": "123321"
}
```

---

## ⚠️ Notes

- For testing, use [Postman](https://www.postman.com/) or any REST client.

---
