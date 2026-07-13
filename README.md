<div align="center">
  <h1>🧠 Brain Care Backend</h1>
  <p><strong>Medical Ecosystem & Gamification Engine</strong></p>
  <p>A robust Node.js/Express API powering symptom tracking, medication logging, prescription management, doctor-patient linking, and the <em>Hope Garden</em> gamification system.</p>

  <!-- Shields.io Badges -->
  <p>
    <img src="https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
    <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
    <img src="https://img.shields.io/badge/Mongoose-9.x-880000?style=for-the-badge&logoColor=white" alt="Mongoose">
    <img src="https://img.shields.io/badge/JWT-Auth-FF6F00?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT">
    <img src="https://img.shields.io/badge/Port-5000-1E90FF?style=for-the-badge" alt="Port 5000">
  </p>
</div>

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Core Features](#-core-features)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🏗 Architecture Overview

```mermaid
flowchart TD
    Client["📱 Mobile / Web Client"] -->|HTTP Requests :5000| API

    subgraph API["🖥 Express.js Application"]
        direction TB
        MW["🔒 Global Middleware<br/>Helmet · CORS · Rate Limiter · JWT Auth"]

        subgraph Routes["📍 Route Layer"]
            direction TB
            G["🎮 Gamification<br/>/api/v1/gamification"]
            H["❤️ Health<br/>/api/v1/health"]
            P["📋 Prescriptions<br/>/api/v1/prescriptions"]
            L["🔗 Patient-Doctor Links<br/>/api/v1/links"]
            S["📝 Symptom Logs<br/>/api/v1/logs/symptoms"]
        end

        subgraph Controllers["⚙ Controller Layer"]
            direction TB
            GC["gamificationController"]
            HC["healthController"]
            PC["prescriptionController"]
            LC["linkController"]
            SC["symptomLogController"]
        end

        subgraph Models["🗃 Mongoose Models"]
            direction TB
            GardenState
            SymptomLog
            DailySymptomLog
            Medication
            MedicationLog
            Prescription
            PatientDoctorLink
        end
    end

    subgraph DB["🗄 MongoDB Atlas"]
        direction TB
        M1["📦 Collections"]
    end

    G --> GC
    H --> HC
    P --> PC
    L --> LC
    S --> SC

    GC --> GardenState
    HC --> SymptomLog & Medication & MedicationLog
    PC --> Prescription
    LC --> PatientDoctorLink
    SC --> DailySymptomLog

    GardenState --> M1
    SymptomLog --> M1
    DailySymptomLog --> M1
    Medication --> M1
    MedicationLog --> M1
    Prescription --> M1
    PatientDoctorLink --> M1

    Client --> MW --> Routes
```

---

## ✨ Core Features

### 🏥 Medical Ecosystem

| Feature | Description |
|---|---|
| **Symptom Tracking** | Log daily symptoms (headache, dizziness, fatigue, seizures, etc.) with date-range queries |
| **Medication Logging** | Add medications with reminder times, toggle taken/not-taken per dose, view today's adherence |
| **Prescription Management** | Full CRUD for prescriptions with auto-expiry — active status automatically transitions to inactive after `durationDays` elapses |
| **Doctor-Patient Linking** | Link patients to doctors with many-to-many relationships for care coordination |

### 🌱 Hope Garden — Gamification Engine

| Feature | Description |
|---|---|
| **Dual Resource Pools** | Earn water points (symptom logging, chat) & sunlight points (medication adherence) |
| **Stage Progression** | Every 100 combined points advances 1 stage (max 10 stages) |
| **Streak System** | Consecutive daily actions build streaks; every 7th day awards a 25-point bonus |
| **Daily Action Dedup** | Same action type can only earn points once per calendar day |
| **Smart Recovery Algorithm** | Days 45-60 get boosted multipliers (1.5× & reduced streak thresholds) to help users complete their garden |
| **Dormancy Safe** | Points never decay — no punishment for missed days |
| **Arabic/English Bilingual Messaging** | Recovery messages delivered in both languages |

---

## 🔌 API Endpoints

All endpoints require a `Bearer <token>` in the `Authorization` header unless noted otherwise.

### 🎮 Gamification — `/api/v1/gamification`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:patientId` | Retrieve or create a patient's Hope Garden state (points, stage, streak) |
| `POST` | `/award` | Award points for an action (`medication`, `symptom`, or `chat`) |
| `PUT` | `/reset/:patientId` | Reset garden state to zero (stage 0, no points) |

### ❤️ Health — `/api/v1/health`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/symptoms` | Log or upsert symptoms for today's date |
| `POST` | `/medications` | Register a new medication with reminder schedule |
| `POST` | `/medications/toggle` | Toggle a dose as taken / not taken |
| `GET` | `/medications/today` | Fetch all medications marked as taken today |
| `GET` | `/summary` | Get today's full health summary (medications, logs, symptoms) |

### 📋 Prescriptions — `/api/v1/prescriptions`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create a new prescription (doctorId, patientId, medicationName, dosage, frequency) |
| `GET` | `/:patientId` | Get all prescriptions for a patient (auto-expires inactive ones) |
| `PATCH` | `/:id/status` | Update prescription status (`active` / `inactive`) |
| `DELETE` | `/:id` | Delete a prescription |

### 🔗 Links — `/api/v1/links`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create a patient-doctor link (idempotent — returns existing if present) |
| `GET` | `/:doctorId/patients` | Retrieve all patients linked to a specific doctor |

### 📝 Symptom Logs — `/api/v1/logs/symptoms`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Log a new symptom entry for a patient |
| `GET` | `/:patientId` | Get all symptom logs for a patient (sorted newest first) |
| `DELETE` | `/` | Remove a specific symptom log entry |

### 🩺 Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `http://localhost:5000/` | Server health check — returns `"Brain Care API is running..."` |

---

## 📂 Project Structure

```text
📦 brain_care_backend
├── 📂 config
│   └── 📄 db.js                    # MongoDB connection via Mongoose
├── 📂 controllers
│   ├── 📄 gamificationController.js # Hope Garden points, streaks, stages
│   ├── 📄 healthController.js       # Symptom & medication logic
│   ├── 📄 linkController.js         # Patient-Doctor linking logic
│   ├── 📄 prescriptionController.js # Prescription CRUD + auto-expiry
│   └── 📄 symptomLogController.js   # Daily symptom log management
├── 📂 middlewares
│   ├── 📄 auth.js                   # JWT Bearer token verification
│   └── 📄 errorMiddleware.js        # Global error handler
├── 📂 models
│   ├── 📄 DailySymptomLog.js
│   ├── 📄 GardenState.js            # Water/sunlight points, stage, streak
│   ├── 📄 Medication.js
│   ├── 📄 MedicationLog.js
│   ├── 📄 PatientDoctorLink.js
│   ├── 📄 Prescription.js
│   └── 📄 SymptomLog.js
├── 📂 routes
│   ├── 📄 gamificationRoutes.js
│   ├── 📄 healthRoutes.js
│   ├── 📄 linkRoutes.js
│   ├── 📄 prescriptionRoutes.js
│   └── 📄 symptomLogRoutes.js
├── 📂 node_modules                  # Dependencies (gitignored)
├── 📄 .env                          # Environment variables (gitignored)
├── 📄 .gitignore
├── 📄 package.json
├── 📄 package-lock.json
└── 📄 server.js                     # Express app entry point (port 5000)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)
- A package manager (`npm` or `yarn`)

### 1. Clone the Repository

```bash
git clone https://github.com/Ghnnam/brain_care_backend.git
cd brain_care_backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/brain_care
JWT_SECRET=your_super_secret_key
```

### 4. Start the Server

```bash
# Development (with hot reload via nodemon)
npm run dev

# Production
npm start
```

The server starts on **`http://localhost:5000`**.

---

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|---|---|---|---|
| `PORT` | Server port | ❌ | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | ✅ | — |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | ✅ | — |

---

## 🔧 Troubleshooting

### MongoDB `queryTxt ETIMEOUT` Error on Mobile / ISP-Restricted Networks

**Symptom:** When running on a mobile data network (4G/5G) or certain restricted ISPs, you may encounter:

```
MongooseError: queryTxt ETIMEOUT mongodb+srv://...
```

**Root Cause:** The MongoDB Atlas `srv` connection format (`mongodb+srv://`) relies on DNS TXT records to resolve the shard addresses. Some mobile carriers and ISPs block or interfere with DNS TXT queries, causing the connection to time out.

**Solution — Use a Legacy / Direct Shard Connection String:**

1. In your MongoDB Atlas dashboard, click **Connect** → **Connect your application**.
2. Select **Driver: Node.js** and choose the **Legacy (SRVless)** format instead of the standard connection string.
3. The legacy string has the pattern:
   ```
   mongodb://<username>:<password>@<shard-00>-<code>.mongodb.net:27017,<shard-01>-<code>.mongodb.net:27017,<shard-02>-<code>.mongodb.net:27017/<db>?ssl=true&authSource=admin&replicaSet=<replicaset-name>
   ```
4. Update your `.env`:

   ```env
   MONGO_URI=mongodb://naglaaibraihmghnnam727_db_user:password@ac-0fdurch-shard-00-00.mdaom1a.mongodb.net:27017,ac-0fdurch-shard-00-01.mdaom1a.mongodb.net:27017,ac-0fdurch-shard-00-02.mdaom1a.mongodb.net:27017/brain_care?ssl=true&authSource=admin&replicaSet=atlas-w0c3km-shard-0
   ```

5. Reconnect. The DNS resolution bypasses `srv` lookups entirely.

### Fallback DNS Override (Alternative)

If the legacy string still times out, the server already includes a DNS override in `server.js`:

```js
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
```

This forces Node.js to use **Cloudflare (1.1.1.1)** or **Google (8.8.8.8)** as the DNS resolver instead of the ISP default. This alone often resolves `ETIMEOUT` issues on restrictive networks.

---

## 📄 License

This project is licensed under the ISC License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <img src="https://img.shields.io/badge/Developed_with_❤️_by-Ghnnam-2ea44f?style=for-the-badge" alt="Developed By">
</div>
