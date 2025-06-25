# Rally Reactor

Backend API service for Rally.

---

## 🚀 How to Run Locally

### Requirements:

- **Node v23.11.1**
- **NVM** (Node Version Manager)

### Steps:

```bash
nvm install 23.11.1
nvm use 23.11.1

npm install
npm run build
npm start
```

> 🔧 The server runs on port `3000` by default. You can customize the port and other config via a `.env` file.

---

## 📡 API Endpoints (Work in Progress)

### ➕ Create Invite

**POST** `/rally-api/invite`

**Request Body:**

```json
{
  "groupName": "fakeGroupName"
}
```

---

### 🔍 Get Invite by ID

**GET** `/rally-api/invite/:inviteId`

Example:

```
GET /rally-api/invite/12345
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
