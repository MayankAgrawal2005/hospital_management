# 🏥 CareSync 360 - AI-Powered Hospital Management System

CareSync 360 is a premium, full-stack healthcare platform designed to streamline medical interactions. Built with the **MERN** stack, it features an advanced **CareBot AI** for symptom analysis, comprehensive dashboards for doctors and patients, and secure medical record management.

---

## ✨ Key Features

### 👤 For Patients
- **🤖 CareBot AI (Interactive Chatbot)**: A state-of-the-art symptom checker that uses AI to analyze symptoms and recommend the appropriate medical specialist through a conversational UI.
- **📅 Smart Booking**: Intuitive scheduling system with specialization-based doctor matching.
- **📄 Medical History**: Instant access to digital prescriptions and diagnostic reports with download and deletion options.
- **🌙 Dynamic UI**: Premium dashboard with seamless Light and Dark mode transitions.

### 🩺 For Doctors
- **💼 Practice Suite**: Comprehensive management of patient appointments, clinical schedules, and patient queues.
- **✍️ Digital Prescriptions**: Issuance of professional prescriptions with automated PDF generation.
- **📂 Report Management**: Securely upload and manage patient diagnostic reports via Cloudinary integration.
- **👨‍⚕️ "My Health" Section**: A dedicated personal health dashboard for doctors to manage their own medical history as patients.

### 🛠️ Core System
- **🔐 Secure Authentication**: Robust JWT-based security with role-based access control.
- **✉️ Automated Notifications**: Real-time email confirmations for bookings and health updates.
- **☁️ Cloud Infrastructure**: Secure hosting of medical documents and images via Cloudinary.
- **⚡ Optimized Performance**: Clean backend architecture for high-speed data retrieval.

---

## 🚀 Technology Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion (Animations), React Hot Toast.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas with Mongoose ODM.
- **AI Engine**: Advanced symptom-to-specialization triage logic.
- **File Storage**: Cloudinary (for medical reports).

---

## 📂 Project Structure

```text
mxpertz/
├── backend/        # Node.js Express server, models, and controllers
├── task/           # React frontend (Vite/Tailwind)
├── test.js         # Backend testing utility
└── README.md       # Project documentation
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16.0 or higher)
- MongoDB Atlas Account
- Cloudinary API Credentials

### 1. Clone the Repository
```bash
git clone https://github.com/MayankAgrawal2005/hospital_management.git
cd mxpertz
```

### 2. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO=your_mongodb_atlas_uri
JWT_SECRET=your_secure_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

### 3. Install Dependencies & Start
**Start Backend:**
```bash
cd backend
npm install
npm start
```

**Start Frontend:**
```bash
cd ../task
npm install
npm run dev
```

---

## 📋 API Reference

| Feature | Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/auth` | Register, Login, and Password management |
| **AI Bot** | `/api/ai/triage` | Symptom analysis and specialist matching |
| **Records**| `/api/prescriptions`| CRUD operations for digital prescriptions |
| **Reports**| `/api/reports` | Secure document management and Cloudinary sync |

---

## 🎨 UI/UX Philosophy
CareSync 360 is built for clarity and speed. Every interaction is enhanced with micro-animations, glassmorphism elements, and a clean hierarchical layout to ensure medical professionals and patients can access information without friction.

---

## 📄 License
Distributed under the MIT License.

---

Developed with ❤️ by **CareSync 360 Team**
