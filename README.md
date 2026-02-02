# 📅 AcademicSync: AI-Powered Smart Timetable Management System

**AcademicSync** is a state-of-the-art, AI-driven web application designed to revolutionize how educational institutions plan, schedule, and manage their academic timetables. By leveraging the power of **Google Gemini AI** and advanced algorithmic logic, it solves the complex constraint satisfaction problem of scheduling classes without conflicts.

This system is built for **Admins, Faculty, and Students**, providing a seamless, responsive, and intelligent experience for everyone in the campus ecosystem.

---

## 🌟 Vision & Purpose

Traditional manual timetabling is prone to errors, clashes, and inefficiency. **AcademicSync** aims to:
- **Zero Conflicts**: Automatically detect and resolve clashes (Teacher, Room, or Student batch).
- **AI Optimization**: Use Generative AI to suggest optimal schedules and explain constraints.
- **Real-Time Access**: Provide instant access to dynamic schedules for students and teachers anywhere, on any device.
- **Smart Assistance**: Integrated AI Chatbot to answer natural language queries like *"Where is Dr. Smith?"* or *"How many students are in Computer Science?"*.

---

## 🚀 Key Features

### 🧠 Intelligent Core
1.  **Hybrid Timetable Algorithm**: Combines backtracking algorithms with heuristic optimization to generate clash-free schedules.
2.  **AI Chatbot Assistant**: Ask questions naturally!
    *   *"Where is Prof. Johnson right now?"* (Real-time location tracking via schedule)
    *   *"Show me free classrooms."*
    *   *"Count of students in Mechanical Engineering."*
3.  **Conflict Detection**: Real-time validation prevents assigning a teacher to two places at once.

### 👥 For Administrators
-   **Dashboard**: A powerful command center to manage the entire institution's data.
-   **Resource Management**: Add/Edit/Delete Departments, Classrooms (with capacity & features), Courses (credits, type), and Faculty.
-   **One-Click Generation**: Generate a complete semester timetable in seconds.
-   **Constraint Settings**: Define working days, lunch breaks, and consecutive lecture limits.

### 👨‍🏫 For Faculty
-   **Personal Schedule**: View your specific teaching load and upcoming classes.
-   **Availability Status**: Check which colleagues are free or busy.
-   **Course Management**: Track enrolled students and attendance (future scope).

### 👨‍🎓 For Students
-   **My Timetable**: Personalized view of classes based on their specific Batch and Division.
-   **Room Finder**: Never get lost—know exactly where your next lecture is.

---

## 🛠️ Technology Stack

This project is built using the **MERN Stack** (MongoDB, Express.js, React, Node.js) with modern tooling.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React + Vite** | Blazing fast UI updates and component-based architecture. |
| **Styling** | **Tailwind CSS** | Modern, responsive design with dark/light mode support. |
| **Icons** | **Lucide React** | Beautiful, lightweight icons for a clean interface. |
| **Backend** | **Node.js + Express** | Robust REST API handling request routing and business logic. |
| **Database** | **MongoDB Atlas** | Cloud-native NoSQL database for flexible data storage. |
| **AI Engine** | **Google Gemini 1.5** | Powers the Chatbot and intelligent suggestions. |
| **Authentication** | **JWT (JSON Web Tokens)** | Secure, stateless authentication for all users. |

---

## ⚙️ Installation & Setup Guide

Follow these steps to set up the project locally on your machine.

### Prerequisites
*   **Node.js**: Download and install from [nodejs.org](https://nodejs.org/) (Version 16+ recommended).
*   **Git**: For version control.
*   **MongoDB Atlas Account**: You need a connection string (or use a local MongoDB).

### Step 1: Clone the Repository
Open your terminal or command prompt:
```bash
git clone https://github.com/Tarrun1506/timetable_management_system.git
cd timetable_management_system
```

### Step 2: Backend Setup
 Navigate to the server folder and install dependencies:
```bash
cd server
npm install
```

**Configuration**:
1.  Create a file named `.env` in the `server` folder.
2.  Add the following variables (Ask the project admin for keys or use your own):
    ```env
    PORT=8000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key
    GEMINI_API_KEY=your_google_gemini_api_key
    CLIENT_URL=http://localhost:5173
    ```
3.  **Start the Server**:
    ```bash
    npm run dev
    ```
    *You should see: "Server running on port 8000" and "Connected to MongoDB".*

### Step 3: Frontend Setup
Open a new terminal window (keep the server running), navigate to the client folder:
```bash
cd ../client
npm install
```

**Configuration**:
1.  Create a file named `.env.local` in the `client` folder.
    ```env
    VITE_API_URL=http://localhost:8000
    ```
2.  **Start the Client**:
    ```bash
    npm run dev
    ```
3.  Open your browser and visit: `http://localhost:5173`

---

## 📖 Usage Guide

### 1. Initial Login (Admin)
*   **Email**: `admin@college.edu`
*   **Password**: `Admin@123`
*   *Note: You will be prompted to change this password on first login.*

### 2. Setting Up Data (The "Flow")
To generate a timetable, the system needs data in a specific order:
1.  **System Config**: Go to Settings -> Set working days (e.g., Mon-Fri) and times (9 AM - 5 PM).
2.  **Infrastructure**: Add **Classrooms** (e.g., Room 101, Lab A) and **Labs**.
3.  **Academic Structure**: Add **Departments** (CS, Mech) and **Programs**.
4.  **People**: Add **Teachers** (assign them to departments) and **Students**.
5.  **Courses**: Create courses and **assign them to Teachers**. *Critical Step: If a course has no teacher, it cannot be scheduled.*

### 3. Generating a Timetable
1.  Navigate to **"Generate Timetable"** on the dashboard.
2.  Select the **Semester** and **Department**.
3.  Click **"Generate with AI"**.
4.  The system will process constraints and display the schedule.
5.  Click **"Publish"** to make it visible to students and faculty.

---

## 📂 Project Structure

A quick overview of the code organization for developers:

```
timetable_management_system/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/    # Reusable UI widgets (Sidebar, Navbar, Cards)
│   │   ├── context/       # Global State (Auth, Theme)
│   │   ├── pages/         # Main screens (Dashboard, Timetable, Login)
│   │   └── utils/         # Helper functions
│   └── public/            # Static images & assets
│
├── server/                # Backend (Node.js)
│   ├── algorithms/       # The brains: Timetable Generation Logic
│   ├── models/           # Database Schemas (User, Student, Course)
│   ├── routes/           # API Endpoints (Auth, Data, Chatbot)
│   ├── utils/            # Services (AI Chatbot, Email)
│   └── server.js         # Entry point
```

---

## 🤝 Contribution

We welcome contributions!
1.  **Fork** the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes.
4.  **Push** to the branch.
5.  Open a **Pull Request**.

---

## 📜 Credits

*   **Lead Developer**: Tarrun1506
*   **AI Integration**: Powered by Google DeepMind / Gemini
*   **UI Framework**: Tailwind Labs

---

*This README serves as the primary documentation for the AcademicSync project. For detailed API documentation or algorithmic details, please refer to the internal wiki.*