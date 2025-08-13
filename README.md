# ScholarVault - Student Academic Portfolio System

ScholarVault is a secure web application that allows K-12 teachers to access and view student work samples from previous grades, even if the student has moved between schools or districts. The purpose is to give teachers a centralized, long-term academic portfolio for each student, making it easier to understand their progress, strengths, and learning needs over time.

## 🚀 Features

### Core MVP Features

1. **Secure Teacher Login**

   - Email/password authentication
   - Role-based permissions to control access
   - Demo credentials: `teacher@demo.edu` / any password

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

- **Frontend:** React 18 + Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **TypeScript:** Full type safety
- **Responsive Design:** Mobile-first approach

## 📁 Project Structure

```
ScholarVault/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Teacher dashboard
│   ├── student/[id]/           # Student profile pages
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/                  # Reusable components
│   ├── LoginForm.tsx           # Authentication modal
│   ├── StudentSearch.tsx       # Student search functionality
│   ├── QuickStats.tsx          # Dashboard statistics
│   ├── RecentStudents.tsx      # Recently viewed students
│   └── WorkSampleViewer.tsx    # Work sample preview modal
├── package.json                 # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

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

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Demo Walkthrough

### 1. Landing Page

- View the ScholarVault introduction and features
- Click "Teacher Login" or "Get Started" to access the login form

### 2. Teacher Login

- Use demo credentials: `teacher@demo.edu` / any password
- Click "Sign In" to access the dashboard

### 3. Dashboard

- View quick statistics and recent students
- Use the student search to find specific students
- Click on recent students to view their profiles

### 4. Student Search

- Search by name (e.g., "Emma", "Marcus", "Sophia")
- Search by student ID (e.g., "STU001", "STU002")
- Search by email (e.g., "emma.rodriguez@student.edu")
- Click on search results to view student profiles

### 5. Student Profile

- View comprehensive student information
- Browse school history across districts
- Filter and sort work samples by subject, grade, or date
- Click "View" to preview work samples
- Click "Download" to download files

### 6. Work Sample Viewer

- Preview document content (mock data for demo)
- Download work samples
- View file metadata and access logs

## 🔒 Security & Compliance

- **FERPA Compliant:** Student data protection standards
- **COPPA Compliant:** Children's online privacy protection
- **Audit Logging:** All access is tracked for compliance
- **Role-Based Access:** Teachers only see relevant students
- **Secure Authentication:** Protected login system

## 🎨 Design System

### Color Palette

- **Primary:** Blue tones for main actions and branding
- **Secondary:** Gray tones for text and backgrounds
- **Accent:** Green for success, red for errors

### Components

- **Buttons:** Primary (blue), Secondary (gray)
- **Cards:** White backgrounds with subtle shadows
- **Forms:** Clean input fields with focus states
- **Modals:** Overlay dialogs for detailed views

### Responsive Breakpoints

- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+

## 🔮 Future Enhancements

### Not in MVP (Future Features)

- Direct student uploads
- Parent access portal
- Feedback/comment tools
- Automatic integration with district SIS/LMS
- Advanced analytics and reporting
- Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- Built for K-12 educators and administrators
- Designed with FERPA and COPPA compliance in mind
- Focused on improving student learning outcomes through better data access

---

**ScholarVault** - Empowering teachers with comprehensive student insights across time and districts.
