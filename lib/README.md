# Teacher Data Manager Module

A comprehensive JavaScript module for managing teacher authentication, data fetching, and classroom retrieval in Firebase web applications.

## Features

- **Automatic Authentication**: Listens for Firebase Auth state changes
- **Automatic Data Fetching**: Fetches teacher data and classrooms when user logs in
- **Error Handling**: Comprehensive error handling for all operations
- **Loading States**: Tracks loading states for different operations
- **Data Management**: Stores all data in a single `currentUser` object
- **Firebase v9 Modular**: Uses the latest Firebase Web SDK

## Installation

1. Ensure you have Firebase v9+ installed in your project
2. Copy `teacherDataManager.js` to your `lib` folder
3. Import and use the module in your components

## Basic Usage

```javascript
import teacherDataManager from './lib/teacherDataManager'

// The module automatically initializes and listens for auth changes
// When a teacher logs in, it automatically fetches their data and classrooms

// Sign in a teacher
await teacherDataManager.signIn(email, password)

// Get current user data (teacher info + classrooms)
const currentUser = teacherDataManager.getCurrentUser()

// Get just teacher data
const teacherData = teacherDataManager.getTeacherData()

// Get just classrooms
const classrooms = teacherDataManager.getClassrooms()

// Sign out
await teacherDataManager.logOut()
```

## Data Structure

The `currentUser` object contains:

```javascript
{
  uid: "teacher_firebase_uid",
  teacherData: {
    firstName: "John",
    lastName: "Smith",
    gender: "male",
    email: "john.smith@school.edu",
    school: "Lincoln High School",
    district: "Lincoln Unified",
    role: "Teacher",
    createdAt: Timestamp,
    lastLogin: Timestamp
  },
  email: "john.smith@school.edu",
  firstName: "John",
  lastName: "Smith",
  gender: "male",
  school: "Lincoln High School",
  district: "Lincoln Unified",
  role: "Teacher",
  createdAt: Timestamp,
  lastLogin: Timestamp,
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

## API Methods

### Authentication
- `signIn(email, password)` - Sign in a teacher
- `logOut()` - Sign out the current teacher

### Data Access
- `getCurrentUser()` - Get complete user data
- `getTeacherData()` - Get teacher profile data only
- `getClassrooms()` - Get classrooms array only
- `getAuthStatus()` - Check if user is authenticated
- `getLoadingStatus()` - Get loading states
- `getError()` - Get current error message

### Data Management
- `refreshData()` - Manually refresh teacher data and classrooms
- `clearError()` - Clear current error message

## Loading States

The module provides detailed loading states:

```javascript
const loadingStatus = teacherDataManager.getLoadingStatus()

// Check specific loading states
if (loadingStatus.isLoading) {
  // General authentication loading
}

if (loadingStatus.isLoadingTeacherData) {
  // Loading teacher profile
}

if (loadingStatus.isLoadingClassrooms) {
  // Loading classrooms
}
```

## Error Handling

```javascript
const error = teacherDataManager.getError()

if (error) {
  console.error('Error occurred:', error)
  
  // Clear error after handling
  teacherDataManager.clearError()
}
```

## Integration with React

### Basic Component Example

```javascript
import React, { useState, useEffect } from 'react'
import teacherDataManager from './lib/teacherDataManager'

function TeacherDashboard() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const user = teacherDataManager.getCurrentUser()
    if (user) {
      setCurrentUser(user)
      setLoading(false)
    }

    // Set up interval to check for data updates
    const interval = setInterval(() => {
      const user = teacherDataManager.getCurrentUser()
      if (user && user !== currentUser) {
        setCurrentUser(user)
        setLoading(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentUser])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!currentUser) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {currentUser.firstName} {currentUser.lastName}!</h1>
      <p>School: {currentUser.school}</p>
      <p>Classrooms: {currentUser.classroomCount}</p>
      
      {currentUser.classrooms.map(classroom => (
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

### Login Component Example

```javascript
import React, { useState } from 'react'
import teacherDataManager from './lib/teacherDataManager'

function TeacherLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await teacherDataManager.signIn(email, password)
      // Success - component will automatically update via auth state change
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
```

## Security Considerations

- The module automatically handles Firebase Auth state
- Teacher data is only fetched for authenticated users
- Classrooms are queried using the teacher's UID for security
- All Firestore queries use proper security rules

## Troubleshooting

### Teacher Document Not Found
- Ensure the teacher has signed up and has a document in the `teachers` collection
- Check that the document ID matches the Firebase Auth UID exactly

### Classrooms Not Loading
- Verify the `teacherId` field in classroom documents matches the teacher's UID
- Check Firestore security rules allow reading classrooms
- Ensure the `classrooms` collection exists

### Authentication Issues
- Verify Firebase configuration is correct
- Check that Firebase Auth is enabled in your project
- Ensure email/password authentication is enabled

## Performance Notes

- Data is fetched once when the user logs in
- Use `refreshData()` to manually update data after changes
- The module maintains data in memory for quick access
- Consider implementing caching strategies for large datasets

## Browser Support

- Modern browsers with ES6+ support
- Firebase v9+ Web SDK
- No additional dependencies required
