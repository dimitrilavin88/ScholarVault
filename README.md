# ScholarVault - Student Academic Portfolio System

ScholarVault is a secure web application that allows K-12 teachers to access and view student work samples from previous grades, even if the student has moved between schools or districts. The purpose is to give teachers a centralized, long-term academic portfolio for each student, making it easier to understand their progress, strengths, and learning needs over time.

## 🚀 Features

### Core MVP Features

1. **Secure Teacher Authentication**

   - Firebase Authentication with email/password
   - Email domain validation for approved school districts
   - Teacher profile creation and management
   - Secure session management

2. **Student Search**

   - Search by name, student ID, or email
   - See profile with school history and available work samples
   - Cross-district access to historical data

3. **Student Profile Page**

   - Basic student info (name, grade, DOB, school history)
   - Work samples organized by grade level, subject, and upload date
   - Comprehensive school history tracking

4. **Work Sample Viewing**

   - Preview PDFs, images, or documents in-browser
   - Download option for offline review
   - File type support for various document formats

5. **Cross-District Access**
   - Authorized teachers can see historical work from prior schools
   - All access is logged for compliance

## 🛠️ Technical Stack

- **Frontend:** React 18 + Next.js 13.5.6 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **TypeScript:** Full type safety
- **Authentication:** Firebase Authentication
- **Database:** Google Cloud Firestore
- **State Management:** React Context API
- **Responsive Design:** Mobile-first approach

## 📁 Project Structure

```
ScholarVault/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Teacher dashboard
│   ├── student/[id]/           # Student profile pages
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout with AuthProvider
│   └── page.tsx                # Landing page
├── components/                  # Reusable components
│   ├── LoginForm.tsx           # Firebase authentication modal
│   ├── StudentSearch.tsx       # Student search functionality
│   ├── QuickStats.tsx          # Dashboard statistics
│   ├── RecentStudents.tsx      # Recently viewed students
│   └── WorkSampleViewer.tsx    # Work sample preview modal
├── contexts/                    # React Context providers
│   └── AuthContext.tsx         # Firebase authentication context
├── lib/                        # Utility libraries
│   ├── firebase.ts             # Firebase configuration
│   └── domainValidation.ts     # Email domain validation
├── data/                       # Mock data and interfaces
│   └── demoData.ts             # Sample student and work sample data
├── scripts/                    # Setup scripts
│   └── setupFirestore.js       # Firestore initialization script
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── firebase-config.example     # Firebase configuration template
├── FIREBASE_SETUP.md           # Detailed Firebase setup guide
└── README.md                   # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (see setup guide below)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ScholarVault
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**

   Follow the detailed setup guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) to:

   - Create a Firebase project
   - Enable Authentication and Firestore
   - Configure environment variables
   - Set up security rules

4. **Configure environment variables**

   Copy `firebase-config.example` to `.env.local` and fill in your Firebase configuration:

   ```bash
   cp firebase-config.example .env.local
   # Edit .env.local with your Firebase config
   ```

5. **Initialize Firestore**

   ```bash
   node scripts/setupFirestore.js
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Firebase Setup

### Quick Setup

1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com/)
2. **Enable Services**: Enable Authentication (Email/Password) and Firestore Database
3. **Configure App**: Get your Firebase config and add to `.env.local`
4. **Set Security Rules**: Use the rules provided in `FIREBASE_SETUP.md`
5. **Populate Data**: Run the setup script to add approved domains

### Environment Variables

Create a `.env.local` file with your Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 🧪 Testing

### Demo Accounts

For testing purposes, the following domains are pre-approved:

- `demo.edu` - Demo School District
- `lincoln.edu` - Lincoln Unified School District
- `springfield.k12.tx.us` - Springfield Independent School District
- `ousd.org` - Oakland Unified School District

### Test Flow

1. Create a new teacher account with an approved email domain
2. Sign in with your credentials
3. Access the dashboard and search for students
4. View student profiles and work samples

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Setup

Ensure your production environment has:

- All required Firebase environment variables
- Proper Firestore security rules
- Domain authorization in Firebase Console

## 📚 Documentation

- [Firebase Setup Guide](./FIREBASE_SETUP.md) - Complete Firebase configuration
- [Firebase Documentation](https://firebase.google.com/docs) - Official Firebase docs
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter issues:

1. Check the [Firebase Setup Guide](./FIREBASE_SETUP.md)
2. Review Firebase Console logs
3. Check browser console for client-side errors
4. Verify environment variables are correctly set
5. Ensure Firestore security rules are properly configured
