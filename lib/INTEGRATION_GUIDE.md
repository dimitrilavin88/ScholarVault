# TeacherDataManager Integration Guide

This guide shows you how to integrate the TeacherDataManager module with your existing ScholarVault app to automatically populate classrooms.

## 🚀 Quick Start

### 1. Import the Module

The TeacherDataManager automatically initializes when imported. Add this to your main app file or dashboard:

```javascript
import teacherDataManager from '@/lib/teacherDataManager'
```

### 2. Use in Your Components

#### Option A: Direct Usage (Simplest)

```javascript
import teacherDataManager from '@/lib/teacherDataManager'

function MyComponent() {
  // Get current user data (teacher + classrooms)
  const currentUser = teacherDataManager.getCurrentUser()
  
  // Get just classrooms
  const classrooms = teacherDataManager.getClassrooms()
  
  // Check loading states
  const loadingStatus = teacherDataManager.getLoadingStatus()
  
  if (loadingStatus.isLoadingClassrooms) {
    return <div>Loading classrooms...</div>
  }
  
  return (
    <div>
      <h2>Your Classrooms ({classrooms.length})</h2>
      {classrooms.map(classroom => (
        <div key={classroom.id}>
          <h3>{classroom.name}</h3>
          <p>Year: {classroom.schoolYear}</p>
          <p>Students: {classroom.students.length}</p>
        </div>
      ))}
    </div>
  )
}
```

#### Option B: Use Custom Hook (Recommended)

```javascript
import { useTeacherData } from '@/lib/useTeacherData'

function MyComponent() {
  const { currentUser, classrooms, loading, error, refreshData } = useTeacherData()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={refreshData}>Retry</button>
      </div>
    )
  }
  
  return (
    <div>
      <h2>Welcome, {currentUser?.firstName} {currentUser?.lastName}!</h2>
      <p>You have {classrooms.length} classrooms</p>
      
      {classrooms.map(classroom => (
        <div key={classroom.id}>
          <h3>{classroom.name}</h3>
          <p>Year: {classroom.schoolYear}</p>
          <p>Students: {classroom.students.length}</p>
        </div>
      ))}
    </div>
  )
}
```

## 🔄 How It Works

1. **Teacher Logs In** → Firebase Auth provides UID
2. **TeacherDataManager Detects Auth** → Automatically fetches teacher data
3. **Fetches Classrooms** → Queries `classrooms` collection where `teacherId == UID`
4. **Data Available** → Your components can access data immediately

## 📊 Data Structure

The `currentUser` object contains:

```javascript
{
  uid: "teacher_firebase_uid",
  firstName: "John",
  lastName: "Smith",
  email: "john@school.edu",
  school: "Lincoln High",
  // ... other teacher fields
  
  classrooms: [
    {
      id: "classroom_id",
      name: "Algebra I",
      schoolYear: "2024-2025",
      teacherId: "teacher_firebase_uid",
      students: ["student_id_1", "student_id_2"],
      createdAt: Timestamp,
      createdAtDate: Date
    }
  ],
  classroomCount: 1
}
```

## 🎯 Integration with Your Existing App

### Replace Manual Firebase Queries

**Before (manual queries):**
```javascript
// Old way - manual Firebase queries
const [classrooms, setClassrooms] = useState([])

useEffect(() => {
  const loadClassrooms = async () => {
    const q = query(
      collection(db, 'classrooms'),
      where('teacherId', '==', currentUser.uid)
    )
    const snapshot = await getDocs(q)
    // ... process data
  }
  loadClassrooms()
}, [currentUser.uid])
```

**After (TeacherDataManager):**
```javascript
// New way - automatic data
const { classrooms } = useTeacherData()

// Classrooms are automatically loaded and updated!
```

### Update Your ClassroomManager

Your `ClassroomManager` component is already updated to use TeacherDataManager. It will:

- ✅ Automatically load classrooms when teacher logs in
- ✅ Display classrooms from the database
- ✅ Handle loading states
- ✅ Show debug information
- ✅ Refresh data after changes

## 🔧 Troubleshooting

### Classrooms Not Showing?

1. **Check Console Logs** - Look for TeacherDataManager logs
2. **Verify Teacher ID** - Ensure `teacherId` in database matches user's UID
3. **Check Firestore Rules** - Ensure rules allow reading classrooms
4. **Verify Collection** - Ensure `classrooms` collection exists

### Debug Information

The updated ClassroomManager shows debug info:

```
Debug Info:
TeacherDataManager User: Yes
Classrooms from TeacherDataManager: 2
Local Classrooms State: 2
Effective Teacher ID: abc123...
```

### Manual Refresh

If you need to manually refresh data:

```javascript
await teacherDataManager.refreshData()
```

## 🚀 Next Steps

1. **Test the Integration** - Log in and check if classrooms appear
2. **Remove Debug Info** - Once working, remove the debug section
3. **Customize UI** - Style the classroom display as needed
4. **Add Features** - Use the data to build more functionality

## 📝 Example: Dashboard Integration

```javascript
// In your dashboard page
import { useTeacherData } from '@/lib/useTeacherData'

export default function DashboardPage() {
  const { currentUser, classrooms, loading } = useTeacherData()
  
  if (loading) {
    return <div>Loading dashboard...</div>
  }
  
  return (
    <div>
      <h1>Welcome, {currentUser?.firstName}!</h1>
      <p>You have {classrooms.length} classrooms</p>
      
      {/* Your existing components */}
      <ClassroomManager teacherId={currentUser?.uid} />
    </div>
  )
}
```

## 🎉 Benefits

- **Automatic Data Loading** - No more manual Firebase queries
- **Real-time Updates** - Data stays in sync automatically
- **Better Performance** - Data loaded once, cached in memory
- **Cleaner Code** - Remove complex useEffect hooks
- **Error Handling** - Built-in error management
- **Loading States** - Professional loading indicators

The TeacherDataManager will automatically populate your ClassroomManager with all classrooms associated with the current teacher's UID!
