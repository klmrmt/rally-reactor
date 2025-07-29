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

### 💭 User Preferences

#### Create/Update User Preferences

**POST** `/rally-api/preferences`

**Request Body:**

```json
{
  "rally_id": "ABC123",
  "cost_level": "medium",
  "vibe": "casual",
  "location_radius": 10
}
```

**Request Headers:**

```json
{
  "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIrMTIyNDYwMDEyNzgiLCJpYXQiOjE3NTI1NDkzMTgsImV4cCI6MTc1MjU1MjkxOH0.8KUmgm_mfJKje5996aiIxyLSkyfTKRasRZWzGO2X6LY"
}
```

**Valid Values:**
- `cost_level`: `"low"`, `"medium"`, `"high"`
- `vibe`: `"casual"`, `"formal"`, `"adventure"`, `"relaxed"`, `"energetic"`
- `location_radius`: `1` to `50` (miles)
- `rally_id`: 6-character alphanumeric string (e.g., `"ABC123"`) - must be a valid rally hex ID

#### Get User Preferences

**GET** `/rally-api/preferences?rally_id=ABC123`

**Request Headers:**

```json
{
  "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIrMTIyNDYwMDEyNzgiLCJpYXQiOjE3NTI1NDkzMTgsImV4cCI6MTc1MjU1MjkxOH0.8KUmgm_mfJKje5996aiIxyLSkyfTKRasRZWzGO2X6LY"
}
```

---

## ⚠️ Notes

- For testing, use [Postman](https://www.postman.com/) or any REST client.
- User preferences are unique per user per rally (one preference set per user per rally).
- The POST endpoint will create new preferences or update existing ones automatically.
- The rally_id must correspond to an existing rally in the system.
- **Note**: Currently, any authenticated user can submit preferences for any rally. Future implementation will validate that the user has accepted/joined the rally.

---
