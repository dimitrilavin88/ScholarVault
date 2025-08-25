// Example usage of TeacherDataManager module
// This shows how to integrate the module with your existing app

import teacherDataManager from './teacherDataManager'

// Example 1: Basic usage in a React component
export function TeacherLoginExample() {
  const handleLogin = async (email, password) => {
    try {
      // Sign in the teacher
      await teacherDataManager.signIn(email, password)
      
      // The module automatically fetches teacher data and classrooms
      // You can access them immediately or wait for the auth state to change
      
      console.log('Login successful!')
      
    } catch (error) {
      console.error('Login failed:', error.message)
    }
  }

  const handleLogout = async () => {
    try {
      await teacherDataManager.logOut()
      console.log('Logout successful!')
    } catch (error) {
      console.error('Logout failed:', error.message)
    }
  }

  // Get current data
  const currentUser = teacherDataManager.getCurrentUser()
  const teacherData = teacherDataManager.getTeacherData()
  const classrooms = teacherDataManager.getClassrooms()
  const isAuthenticated = teacherDataManager.getAuthStatus()
  const loadingStatus = teacherDataManager.getLoadingStatus()
  const error = teacherDataManager.getError()

  return {
    currentUser,
    teacherData,
    classrooms,
    isAuthenticated,
    loadingStatus,
    error,
    handleLogin,
    handleLogout
  }
}

// Example 2: Using in a dashboard component
export function DashboardExample() {
  // Get all current data
  const currentUser = teacherDataManager.getCurrentUser()
  
  if (!currentUser) {
    return { message: 'No user data available' }
  }

  // Access teacher information
  const teacherName = `${currentUser.firstName} ${currentUser.lastName}`
  const teacherSchool = currentUser.school
  const teacherEmail = currentUser.email
  
  // Access classroom information
  const classroomCount = currentUser.classroomCount
  const teacherClassrooms = currentUser.classrooms
  
  // Example: Display teacher info
  console.log(`Welcome, ${teacherName} from ${teacherSchool}!`)
  console.log(`You have ${classroomCount} classrooms`)
  
  // Example: Process classrooms
  teacherClassrooms.forEach(classroom => {
    console.log(`Classroom: ${classroom.name} (${classroom.schoolYear})`)
    console.log(`Students: ${classroom.students.length}`)
  })

  return {
    teacherName,
    teacherSchool,
    teacherEmail,
    classroomCount,
    teacherClassrooms
  }
}

// Example 3: Error handling and loading states
export function StatusExample() {
  const loadingStatus = teacherDataManager.getLoadingStatus()
  const error = teacherDataManager.getError()
  
  // Check if data is still loading
  if (loadingStatus.isLoadingTeacherData) {
    console.log('Loading teacher profile...')
  }
  
  if (loadingStatus.isLoadingClassrooms) {
    console.log('Loading classrooms...')
  }
  
  // Handle errors
  if (error) {
    console.error('Error occurred:', error)
    
    // Clear error after handling
    teacherDataManager.clearError()
  }
  
  return { loadingStatus, error }
}

// Example 4: Manual refresh
export function RefreshExample() {
  const refreshData = async () => {
    try {
      console.log('Refreshing teacher data...')
      await teacherDataManager.refreshData()
      console.log('Data refreshed successfully!')
    } catch (error) {
      console.error('Failed to refresh data:', error.message)
    }
  }

  return { refreshData }
}

// Example 5: Integration with existing AuthContext
export function AuthContextIntegration() {
  // You can use this module alongside your existing AuthContext
  // or replace parts of it with this more focused approach
  
  const getTeacherInfo = () => {
    const currentUser = teacherDataManager.getCurrentUser()
    
    if (!currentUser) {
      return null
    }

    return {
      uid: currentUser.uid,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      gender: currentUser.gender,
      email: currentUser.email,
      school: currentUser.school,
      district: currentUser.district,
      role: currentUser.role,
      createdAt: currentUser.createdAt,
      lastLogin: currentUser.lastLogin
    }
  }

  const getClassroomInfo = () => {
    const currentUser = teacherDataManager.getCurrentUser()
    
    if (!currentUser) {
      return []
    }

    return currentUser.classrooms.map(classroom => ({
      id: classroom.id,
      name: classroom.name,
      schoolYear: classroom.schoolYear,
      teacherId: classroom.teacherId,
      students: classroom.students,
      createdAt: classroom.createdAtDate || classroom.createdAt
    }))
  }

  return {
    getTeacherInfo,
    getClassroomInfo
  }
}
