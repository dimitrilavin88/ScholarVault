# Firebase Classroom Setup Guide

This guide will help you set up the classroom management system in your Firebase Firestore database.

## Overview

The classroom management system uses the following Firestore collections:

1. **`classrooms`** - Stores classroom information
2. **`teachers`** - Stores teacher information (already exists)
3. **`approvedDomains`** - Stores approved school domains (already exists)

## Collection Structure

### 1. Classrooms Collection

**Path**: `classrooms/{classroomId}`

**Document Structure**:
```javascript
{
  name: "Algebra I",                    // String - Classroom name
  schoolYear: "2024-2025",              // String - School year
  teacherId: "teacher_uid_here",        // String - Teacher's Firebase UID
  students: ["student_id_1", "student_id_2"], // Array - List of student IDs
  createdAt: Timestamp                  // Timestamp - When classroom was created
}
```

### 2. Teachers Collection (Existing)

**Path**: `teachers/{teacherId}`

**Document Structure**:
```javascript
{
  firstName: "John",                    // String - Teacher's first name
  lastName: "Smith",                    // String - Teacher's last name
  gender: "male",                       // String - Teacher's gender
  email: "john.smith@school.edu",       // String - Teacher's email
  school: "Lincoln High School",        // String - School name
  district: "Lincoln Unified",          // String - District name
  role: "Teacher",                      // String - Teacher's role
  createdAt: Timestamp,                 // Timestamp - Account creation time
  lastLogin: Timestamp                  // Timestamp - Last login time
}
```

## Setup Steps

### Step 1: Update Firestore Security Rules

1. Go to Firebase Console > Firestore Database > Rules
2. Update your rules to include classroom permissions:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Teachers can read/write their own data
    match /teachers/{teacherId} {
      allow read, write: if request.auth != null && request.auth.uid == teacherId;
    }

    // Teachers can manage their own classrooms
    match /classrooms/{classroomId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.teacherId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.teacherId;
    }

    // Anyone can read approved domains
    match /approvedDomains/{domainId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

3. Click "Publish"

### Step 2: Create Sample Data (Optional)

If you want to populate your database with sample classrooms:

1. **Create a teacher account first** through your app
2. **Get the teacher UID**:
   - Go to Firebase Console > Authentication > Users
   - Find your teacher account and copy the UID
3. **Update the setup script**:
   - Edit `scripts/setupClassrooms.js`
   - Replace `REPLACE_WITH_ACTUAL_TEACHER_UID` with the actual UID
   - Uncomment the creation code
4. **Run the script**:
   ```bash
   node scripts/setupClassrooms.js
   ```

### Step 3: Test the System

1. Start your development server: `npm run dev`
2. Sign in with your teacher account
3. Navigate to the dashboard
4. Try creating a new classroom
5. Add students to the classroom
6. Switch between different classrooms

## Data Operations

### Creating a Classroom

```javascript
const classroomData = {
  name: "World History",
  schoolYear: "2024-2025",
  teacherId: "teacher_uid_here",
  students: [],
  createdAt: serverTimestamp()
}

const docRef = await addDoc(collection(db, 'classrooms'), classroomData)
```

### Adding a Student

```javascript
const studentId = Date.now().toString()

// Update the classroom document
await updateDoc(doc(db, 'classrooms', classroomId), {
  students: arrayUnion(studentId)
})
```

### Querying Teacher's Classrooms

```javascript
const q = query(
  collection(db, 'classrooms'),
  where('teacherId', '==', teacherId),
  orderBy('createdAt', 'desc')
)

const querySnapshot = await getDocs(q)
```

## Security Features

- **Teacher Isolation**: Teachers can only access their own classrooms
- **Data Validation**: All required fields must be provided
- **Real-time Updates**: Changes are immediately reflected in the UI
- **Error Handling**: Comprehensive error handling for all operations

## Troubleshooting

### Common Issues

1. **"Missing or insufficient permissions"**
   - Check that your Firestore rules are published
   - Verify the teacherId matches the authenticated user's UID

2. **"Classrooms not loading"**
   - Check the browser console for errors
   - Verify the teacherId is being passed correctly
   - Check that the classrooms collection exists

3. **"Cannot create classroom"**
   - Ensure all required fields are filled
   - Check that the user is authenticated
   - Verify Firestore rules allow creation

### Debug Tips

1. **Check Firestore Console**: Monitor real-time data changes
2. **Browser Console**: Look for JavaScript errors
3. **Network Tab**: Check for failed API requests
4. **Firebase Logs**: Review server-side error logs

## Production Considerations

1. **Indexes**: Create composite indexes for complex queries
2. **Data Validation**: Implement server-side validation rules
3. **Backup Strategy**: Set up regular data backups
4. **Monitoring**: Enable Firebase Performance Monitoring
5. **Security**: Review and tighten security rules before production

## Support

If you encounter issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review your Firestore security rules
3. Check the browser console for client-side errors
4. Verify your environment variables are correctly set
5. Ensure your Firebase project is properly configured
