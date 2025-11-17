# 🎓 MI Platform - Matemática Integral

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.4-FFCA28?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D14.0.0-brightgreen?logo=node.js)](https://nodejs.org/)

A comprehensive educational management platform built with React and Firebase for managing students, teachers, groups, sessions, assessments, and academic reporting.

## ✨ Introduction

MI Platform (Matemática Integral Platform) is a full-stack web application designed to streamline educational administration and learning management. The platform provides tools for managing students, teachers, groups, class sessions, quizzes, mock exams, homework assignments, forms, and comprehensive reporting.

### ⚠️ Project Status

**Important Note:** This project was paused over a year ago by the client academy due to resource issues. The client has given full permission for us to show or distribute this project. The platform is now publicly accessible without requiring authentication for demonstration purposes.

### Key Features

- 👥 **User Management**: Role-based access control for students and teachers
- 🎯 **Student Management**: Track and manage student information
- 👨‍🏫 **Teacher Management**: Organize and manage teaching staff
- 👨‍👩‍👧‍👦 **Group Management**: Create and manage student groups
- 📅 **Session Management**: Schedule and track class sessions
- 📊 **Assessment Tools**: Quizzes, mock exams, and homework tracking
- 📝 **Form Builder**: Create and manage custom forms for data collection
- 📈 **Reporting**: Generate comprehensive reports and analytics
- 🗄️ **Data Management**: Advanced tools for data manipulation, bulk deletion, and test data generation
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
│   │   │   ├── dataManagement/
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

## 🔥 Firebase Database Structure

This section documents the complete Firestore database structure used in the application. All collections and their document schemas are detailed below.

### Firestore Collections

#### 1. **students**
Stores student information and parent/guardian contact details.

```javascript
{
  id: string,                    // Document ID (auto-generated)
  identificator: string,          // Student identifier
  name: string,                   // Student full name
  email: string,                 // Student email address
  phone: string,                 // Student phone number (format: +countrycode...)
  parentName: string,            // Parent/guardian name
  parentEmail: string,           // Parent/guardian email
  parentPhone: string,           // Parent/guardian phone (format: +countrycode...)
  groupId: string                // Reference to groups collection document ID
}
```

#### 2. **teachers**
Stores teacher information and subject assignments.

```javascript
{
  id: string,                    // Document ID (auto-generated)
  identificator: string,          // Teacher identifier
  name: string,                   // Teacher full name
  email: string,                 // Teacher email address
  phone: string,                 // Teacher phone number (format: +countrycode...)
  subject: string                // Subject taught by the teacher
}
```

#### 3. **groups**
Stores class group information and teacher assignments.

```javascript
{
  id: string,                    // Document ID (auto-generated)
  identificator: string,          // Group identifier
  name: string,                   // Group name
  description: string,            // Group description
  teacherMath: string,            // Reference to teachers collection (Math teacher ID)
  teacherVerbal: string          // Reference to teachers collection (Verbal teacher ID)
}
```

#### 4. **sessions**
Stores class session information and attendance records.

```javascript
{
  id: string,                    // Document ID (auto-generated)
  identificator: string,          // Session identifier
  name: string,                   // Session name/title
  date: string,                   // Session date (format: YYYY-MM-DD)
  groupId: string,                // Reference to groups collection document ID
  teacherId: string,              // Reference to teachers collection document ID
  attendance: {                   // Object mapping student IDs to attendance status
    [studentId]: string           // Values: "present", "absent", "excusedAbsence"
  }
}
```

#### 5. **scores**
Stores quiz/exam scores for students.

```javascript
{
  id: string,                    // Document ID (auto-generated)
  identificator: string,          // Score record identifier
  name: string,                   // Quiz/exam name
  date: string,                   // Date of the quiz/exam (format: YYYY-MM-DD)
  groupId: string,                // Reference to groups collection document ID
  scores: {                       // Object mapping student IDs to their scores
    [studentId]: string           // Score value (can be numeric or text)
  }
}
```

#### 6. **homeworks**
Stores homework assignments and submission status.

```javascript
{
  id: string,                    // Document ID (auto-generated)
  identificator: string,          // Homework identifier
  name: string,                   // Homework name/title
  startDate: string,              // Assignment start date (format: YYYY-MM-DD)
  submitDate: string,             // Submission deadline (format: YYYY-MM-DD)
  groupId: string,                // Reference to groups collection document ID
  teacherId: string,              // Reference to teachers collection document ID
  scores: {                       // Object mapping student IDs to submission status
    [studentId]: string           // Values: "notSubmited", "submited", or other status
  }
}
```

#### 7. **mockExams**
Stores mock exam information and attendance.

```javascript
{
  id: string,                    // Document ID (auto-generated)
  identificator: string,          // Mock exam identifier
  name: string,                   // Mock exam name/title
  startDate: string,              // Exam start date (format: YYYY-MM-DD)
  endDate: string,                // Exam end date (format: YYYY-MM-DD)
  attendance: {                   // Object mapping student IDs to attendance status
    [studentId]: string           // Attendance status (e.g., "present", "absent")
  }
}
```

#### 8. **forms**
Stores form templates with questions and configuration.

```javascript
{
  id: string,                    // Document ID (auto-generated)
  identificator: string,          // Form identifier
  name: string,                   // Form name/title
  subject: string,                // Subject associated with the form
  estado: string,                 // Form status: "Activo" or "Inactivo"
  timeLimit: string,              // Time limit in minutes (as string, "0" = no limit)
  questions: [                    // Array of question objects
    {
      type: string,                // Question type: "text", "multiple-choice", or "checkboxes"
      questionText: string,       // The question text
      options: [string],          // Array of answer options (for multiple-choice/checkboxes)
      correctAnswers: [string],   // Array of correct answer options
      imageUrl: string            // URL to question image (stored in Firebase Storage)
    }
  ]
}
```

#### 9. **responses**
Stores student responses to forms.

```javascript
{
  id: string,                    // Document ID (auto-generated)
  formId: string,                // Reference to forms collection document ID
  timestamp: string,              // ISO 8601 timestamp of submission
  responses: [string],            // Array of student responses (formatted as strings)
  grade: number                  // Calculated grade percentage (0-100) or null if not graded
}
```

#### 10. **reports**
Stores generated report records.

```javascript
{
  id: string,                    // Document ID (auto-generated)
  groupId: string,                // Reference to groups collection document ID
  sessionId: string,              // Reference to sessions collection document ID
  scoreId: string,                // Reference to scores collection document ID
  mockExamId: string,             // Reference to mockExams collection document ID (optional)
  date: string                    // Report generation date (format: YYYY-MM-DD)
}
```

### Firebase Storage Structure

#### **questions/**
Stores images uploaded for form questions.

```
questions/
  └── {formId}/
      └── {filename}
```

- **Path pattern**: `questions/{formId}/{filename}`
- **Usage**: Images are uploaded when editing forms and referenced via `imageUrl` in the question object
- **Access**: Images are publicly accessible via download URLs stored in Firestore

### Relationships Between Collections

```
groups
  ├── teacherMath → teachers.id
  └── teacherVerbal → teachers.id

students
  └── groupId → groups.id

sessions
  ├── groupId → groups.id
  └── teacherId → teachers.id

scores
  └── groupId → groups.id

homeworks
  ├── groupId → groups.id
  └── teacherId → teachers.id

responses
  └── formId → forms.id

reports
  ├── groupId → groups.id
  ├── sessionId → sessions.id
  ├── scoreId → scores.id
  └── mockExamId → mockExams.id
```

### Data Validation Notes

- **Phone numbers**: Must include country code (format: `+countrycode...`)
- **Dates**: Stored as strings in `YYYY-MM-DD` format
- **Attendance status**: Valid values are `"present"`, `"absent"`, or `"excusedAbsence"`
- **Form status**: Valid values are `"Activo"` or `"Inactivo"`
- **Time limits**: Stored as strings, `"0"` indicates no time limit
- **Grades**: Stored as numbers (0-100) or `null` if not applicable

### Firebase Services Used

- **Firebase Authentication**: User authentication (currently disabled for public access)
- **Cloud Firestore**: Primary database for all application data
- **Firebase Storage**: File storage for question images
- **Firebase Analytics**: Usage analytics (initialized but optional)

## 🗄️ Data Management Module

The Data Management module provides advanced administrative tools for managing the platform's database. This module is designed for development, testing, and administrative purposes.

### Access

**URL Route:** `/platform/data-management`

Access the Data Management module by navigating to the route `/platform/data-management` in the application, or through the platform menu (if available for authorized administrators).

### Features

#### 1. **Bulk Data Deletion**
- Delete all data from specific Firestore collections
- Supports deletion from all major collections:
  - Students, Teachers, Groups
  - Sessions, Scores, Homeworks
  - Mock Exams, Forms
  - Responses, Reports
- Batch deletion for improved performance
- Real-time status updates during deletion process

#### 2. **Test Data Generation**
- Generate comprehensive fake data for testing purposes
- Creates realistic test data including:
  - **Teachers**: Multiple teacher profiles with contact information
  - **Students**: Student profiles with parent/guardian information
  - **Groups**: Student groups with assigned teachers
  - **Sessions**: Class sessions with attendance records
  - **Scores**: Quiz scores for students
  - **Homeworks**: Homework assignments with submission tracking
  - **Mock Exams**: Mock exam records with attendance
  - **Forms**: Form templates with various question types
  - **Responses**: Student responses to forms with grading
  - **Reports**: Report records linking sessions, scores, and mock exams
- Automatically creates relationships between entities (students to groups, sessions to teachers, etc.)
- Generates realistic attendance and scoring data

#### 3. **Reset and Regenerate**
- Combined operation that first deletes all existing data
- Then generates fresh test data
- Useful for resetting the development environment
- Includes confirmation dialog to prevent accidental execution

### Usage

**⚠️ WARNING**: All operations in this module are **destructive** and **irreversible**. Exercise extreme caution when using these features.

1. **Access the Data Management Module**
   - Navigate to the route: `/platform/data-management`
   - Or access from the platform menu (if available)
   - Available to authorized administrators only

2. **Delete All Data**
   - Click "Delete All Data" button
   - Confirms deletion of all collections
   - Shows progress for each collection being deleted
   - Displays total number of documents deleted

3. **Generate Fake Data**
   - Click "Generate Fake Data" button
   - Creates realistic test data across all collections
   - Shows progress during generation
   - Confirms successful generation

4. **Reset and Generate New Data**
   - Click "Delete and Generate New Data" button
   - Confirmation dialog appears to prevent accidental execution
   - Deletes all existing data first
   - Then generates fresh test data

### Safety Features

- **Confirmation Dialogs**: Critical operations require explicit confirmation
- **Status Indicators**: Real-time feedback on operation progress
- **Error Handling**: Comprehensive error messages for troubleshooting
- **Loading States**: Visual indicators during processing
- **Warning Messages**: Clear warnings about destructive nature of operations

### Use Cases

- **Development Environment**: Quickly populate test data for development
- **Testing**: Generate varied datasets for testing features
- **Demonstrations**: Create sample data for platform demonstrations
- **Data Reset**: Clear and reset the database for clean slate testing
- **QA Testing**: Generate different data scenarios for quality assurance

### Technical Implementation

The Data Management module uses:
- **Firebase Firestore Batch Operations**: For efficient bulk deletions
- **Firebase Firestore Transactions**: To ensure data consistency
- **React State Management**: For real-time UI updates
- **Error Handling**: Comprehensive try-catch blocks with user feedback
- **Internationalization**: Fully translated interface (ES/EN)

### Collections Affected

The following Firestore collections are managed by this module:
- `students`
- `teachers`
- `groups`
- `sessions`
- `scores`
- `homeworks`
- `mockExams`
- `forms`
- `responses`
- `reports`

### Notes

- All operations are performed on the actual Firebase database
- Changes cannot be undone once executed
- Generated test data follows realistic patterns and relationships
- Data generation respects Firestore collection schemas
- Phone numbers include proper country code formatting
- Dates are formatted according to application standards

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

**Note:** Authentication has been disabled for public demonstration purposes. In a production environment, the following security measures should be implemented:

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


