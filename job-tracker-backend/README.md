# Job Tracker Backend 🚀

AI-Powered Job Application Tracker — Backend API built with Node.js, Express, MongoDB & Google Gemini.

## 📁 Folder Structure

```
job-tracker-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register, Login, Me
│   ├── applicationController.js # CRUD for applications
│   └── aiController.js        # Gemini AI features
├── middleware/
│   └── authMiddleware.js      # JWT protect middleware
├── models/
│   ├── User.js                # User schema
│   └── Application.js         # Job application schema
├── routes/
│   ├── authRoutes.js
│   ├── applicationRoutes.js
│   └── aiRoutes.js
├── .env.example
├── server.js
└── package.json
```

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment variables
```bash
cp .env.example .env
```
Fill in your values in `.env`:
- `MONGO_URI` → Get from [MongoDB Atlas](https://cloud.mongodb.com)
- `JWT_SECRET` → Any random long string
- `GEMINI_API_KEY` → Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Run the server
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Applications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/applications` | Get all (+ stats) | ✅ |
| GET | `/api/applications/:id` | Get single | ✅ |
| POST | `/api/applications` | Create new | ✅ |
| PUT | `/api/applications/:id` | Update | ✅ |
| DELETE | `/api/applications/:id` | Delete | ✅ |

**Query params for GET /api/applications:**
- `?status=Interview` → filter by status
- `?sort=oldest` → sort order (newest/oldest/company)

### AI Features
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/cover-letter` | Generate cover letter | ✅ |
| POST | `/api/ai/analyze-job` | Analyze job description | ✅ |

---

## 🧪 Test with Postman

**Register:**
```json
POST /api/auth/register
{
  "name": "Hiruni Himasha",
  "email": "hiruni@example.com",
  "password": "123456"
}
```

**Add Application:**
```json
POST /api/applications
Headers: Authorization: Bearer <token>
{
  "company": "Google",
  "role": "Frontend Developer",
  "location": "Remote",
  "status": "Applied",
  "jobDescription": "We are looking for a React developer..."
}
```

**Generate Cover Letter:**
```json
POST /api/ai/cover-letter
Headers: Authorization: Bearer <token>
{
  "company": "Google",
  "role": "Frontend Developer",
  "jobDescription": "We are looking for a React developer...",
  "userName": "Hiruni Himasha"
}
```
