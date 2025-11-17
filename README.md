# 🎓 MI Platform - Matemática Integral

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.4-FFCA28?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D14.0.0-brightgreen?logo=node.js)](https://nodejs.org/)

A comprehensive educational management platform built with React and Firebase for managing students, teachers, groups, sessions, assessments, and academic reporting.

## ✨ Introduction

MI Platform (Matemática Integral Platform) is a full-stack web application designed to streamline educational administration and learning management. The platform provides tools for managing students, teachers, groups, class sessions, quizzes, mock exams, homework assignments, forms, and comprehensive reporting.

### Key Features

- 👥 **User Management**: Role-based access control for students and teachers
- 🎯 **Student Management**: Track and manage student information
- 👨‍🏫 **Teacher Management**: Organize and manage teaching staff
- 👨‍👩‍👧‍👦 **Group Management**: Create and manage student groups
- 📅 **Session Management**: Schedule and track class sessions
- 📊 **Assessment Tools**: Quizzes, mock exams, and homework tracking
- 📝 **Form Builder**: Create and manage custom forms for data collection
- 📈 **Reporting**: Generate comprehensive reports and analytics
- 🔐 **Secure Authentication**: Firebase Authentication with email/password
- ☁️ **Cloud Storage**: Firebase Firestore for data storage

## 🚀 Technologies Used

### Frontend
- **React** (18.3.1) - UI library
- **React Router DOM** (6.25.1) - Client-side routing
- **React Icons** (5.2.1) - Icon library
- **Font Awesome** (6.6.0) - Icon components
- **Chart.js** (4.3.0) - Data visualization
- **React Chart.js 2** (5.2.0) - Chart.js React wrapper
- **React Modal** (3.16.1) - Modal components
- **XLSX** (0.18.5) - Excel file processing

### Backend & Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - File storage

### Development Tools
- **React Scripts** (5.0.1) - Build tooling
- **Jest** - Testing framework
- **React Testing Library** - Component testing

## ⚙️ Installation

### Prerequisites

- Node.js (>= 14.0.0)
- npm or yarn
- Firebase project with Authentication, Firestore, and Storage enabled

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/matematica-integral-web.git
   cd matematica-integral-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Firebase configuration:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   ```

## 🧩 Project Structure

```
matematica-integral-web/
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   ├── manifest.json      # PWA manifest
│   └── robots.txt         # SEO configuration
├── src/
│   ├── components/        # Reusable components
│   │   ├── dataContainer/
│   │   ├── dataModal/
│   │   ├── deleteIcon/
│   │   ├── fieldMapingModal/
│   │   ├── navBar/
│   │   ├── studentsListModal/
│   │   └── RequireAuth.js
│   ├── contexts/          # React contexts
│   │   └── auth.js        # Authentication context
│   ├── firebase/          # Firebase configuration
│   │   └── firebase.js    # Firebase initialization
│   ├── hooks/             # Custom React hooks
│   │   └── useFetchData.js
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   │   └── Login.jsx
│   │   ├── platform/      # Main platform pages
│   │   │   ├── editForm/
│   │   │   ├── formResponse/
│   │   │   ├── forms/
│   │   │   ├── groups/
│   │   │   ├── homeworks/
│   │   │   ├── mockExams/
│   │   │   ├── platformMenu/
│   │   │   ├── reports/
│   │   │   ├── responsesViewer/
│   │   │   ├── scores/
│   │   │   ├── sessions/
│   │   │   ├── students/
│   │   │   └── teachers/
│   │   └── userProfile/   # User profile page
│   ├── App.js             # Main application component
│   ├── App.css            # Global styles
│   └── index.js           # Application entry point
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── LICENSE               # License file
├── package.json          # Dependencies and scripts
└── README.md            # Project documentation
```

## 🚀 Deployment

### Recommended Deployment Platforms

#### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Configure environment variables in Vercel dashboard
4. Deploy: `vercel --prod`

#### Netlify
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Configure environment variables in Netlify dashboard
4. Set build command: `npm run build`
5. Set publish directory: `build`

#### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy --only hosting`

#### AWS Amplify
1. Connect your repository to AWS Amplify
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `build`
3. Add environment variables in Amplify console
4. Deploy automatically on push

### Environment Variables for Production

Ensure all environment variables are configured in your deployment platform's environment settings. Never commit `.env` files to version control.

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📝 Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## 🔒 Security

- Firebase Authentication handles user authentication
- Role-based access control implemented
- Environment variables used for sensitive configuration
- Firestore security rules should be configured appropriately

## 📜 License

This project is proprietary software. All rights reserved.

Copyright (c) 2024 Steven Morales Fallas

**All rights reserved.** Redistribution, modification, reproduction, sublicensing, or any form of transaction (including commercial, educational, or promotional use) involving this repository, its source code, or derived works is strictly prohibited without the explicit and personal written authorization of the Lead Developer, Steven Morales Fallas.

Unauthorized commercial use, resale, or licensing of this repository or its contents is strictly forbidden and will be subject to applicable legal action.

See [LICENSE](LICENSE) for full details.

## 👤 Author

**Steven Morales Fallas**
- Full Stack Developer
- Lead Developer of MI Platform

## 🤝 Contributing

This is a private project. Contributions are not accepted at this time.

## 📧 Contact

For inquiries regarding this project, please contact the author directly.

---

**Note**: This platform is designed for educational purposes and requires proper Firebase configuration to function correctly.


