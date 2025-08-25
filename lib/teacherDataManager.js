// Teacher Data Manager Module
// Handles authentication, teacher data fetching, and classroom retrieval for Firebase web app

import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from 'firebase/firestore'
import { auth, db } from './firebase'

class TeacherDataManager {
  constructor() {
    // Store the current user data (teacher info + classrooms)
    this.currentUser = null
    
    // Store authentication state
    this.isAuthenticated = false
    
    // Store loading states
    this.isLoading = false
    this.isLoadingTeacherData = false
    this.isLoadingClassrooms = false
    
    // Store error states
    this.error = null
    
    // Bind methods to preserve context
    this.handleAuthStateChange = this.handleAuthStateChange.bind(this)
    this.signIn = this.signIn.bind(this)
    this.logOut = this.logOut.bind(this)
    this.fetchTeacherData = this.fetchTeacherData.bind(this)
    this.fetchTeacherClassrooms = this.fetchTeacherClassrooms.bind(this)
    
    // Initialize authentication listener
    this.initAuthListener()
  }

  /**
   * Initialize the authentication state listener
   * This will automatically run when a user logs in/out
   */
  initAuthListener() {
    // Listen for authentication state changes
    onAuthStateChanged(auth, this.handleAuthStateChange)
  }

  /**
   * Handle authentication state changes
   * Automatically fetch teacher data when user logs in
   * @param {Object} user - Firebase Auth user object or null
   */
  async handleAuthStateChange(user) {
    if (user) {
      // User is signed in
      console.log('User authenticated:', user.uid)
      this.isAuthenticated = true
      
      // Fetch teacher data and classrooms
      await this.fetchTeacherData(user.uid)
      await this.fetchTeacherClassrooms(user.uid)
    } else {
      // User is signed out
      console.log('User signed out')
      this.isAuthenticated = false
      this.currentUser = null
      this.error = null
    }
  }

  /**
   * Sign in a teacher with email and password
   * @param {string} email - Teacher's email address
   * @param {string} password - Teacher's password
   * @returns {Promise<Object>} - Teacher data object
   */
  async signIn(email, password) {
    try {
      this.isLoading = true
      this.error = null
      
      console.log('Signing in teacher:', email)
      
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      console.log('Teacher signed in successfully:', user.uid)
      
      // The auth state change listener will automatically fetch teacher data
      // Return the user object for immediate use if needed
      return user
      
    } catch (error) {
      console.error('Sign in error:', error)
      this.error = error.message
      throw error
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Sign out the current teacher
   */
  async logOut() {
    try {
      console.log('Signing out teacher')
      await signOut(auth)
      // Auth state change listener will handle cleanup
    } catch (error) {
      console.error('Sign out error:', error)
      this.error = error.message
      throw error
    }
  }

  /**
   * Fetch teacher data from Firestore
   * @param {string} teacherUid - Teacher's Firebase Auth UID
   * @returns {Promise<Object|null>} - Teacher document data or null if not found
   */
  async fetchTeacherData(teacherUid) {
    try {
      this.isLoadingTeacherData = true
      this.error = null
      
      console.log('Fetching teacher data for UID:', teacherUid)
      
      // Get reference to teacher document
      const teacherDocRef = doc(db, 'teachers', teacherUid)
      
      // Fetch the teacher document
      const teacherDoc = await getDoc(teacherDocRef)
      
      if (teacherDoc.exists()) {
        // Teacher document exists, get the data
        const teacherData = teacherDoc.data()
        console.log('Teacher data retrieved:', teacherData)
        
        // Initialize currentUser if it doesn't exist
        if (!this.currentUser) {
          this.currentUser = {}
        }
        
        // Store teacher data in currentUser
        this.currentUser.uid = teacherUid
        this.currentUser.teacherData = teacherData
        this.currentUser.email = teacherData.email
        this.currentUser.firstName = teacherData.firstName
        this.currentUser.lastName = teacherData.lastName
        this.currentUser.gender = teacherData.gender
        this.currentUser.school = teacherData.school
        this.currentUser.district = teacherData.district
        this.currentUser.role = teacherData.role
        this.currentUser.createdAt = teacherData.createdAt
        this.currentUser.lastLogin = teacherData.lastLogin
        
        return teacherData
      } else {
        // Teacher document does not exist
        console.warn('Teacher document not found for UID:', teacherUid)
        this.error = 'Teacher profile not found. Please contact support.'
        
        // Initialize currentUser with basic auth info
        if (!this.currentUser) {
          this.currentUser = {}
        }
        this.currentUser.uid = teacherUid
        this.currentUser.teacherData = null
        this.currentUser.error = 'Profile not found'
        
        return null
      }
      
    } catch (error) {
      console.error('Error fetching teacher data:', error)
      this.error = 'Failed to fetch teacher data: ' + error.message
      throw error
    } finally {
      this.isLoadingTeacherData = false
    }
  }

  /**
   * Fetch all classrooms associated with a teacher
   * @param {string} teacherUid - Teacher's Firebase Auth UID
   * @returns {Promise<Array>} - Array of classroom documents
   */
  async fetchTeacherClassrooms(teacherUid) {
    try {
      this.isLoadingClassrooms = true
      this.error = null
      
      console.log('Fetching classrooms for teacher UID:', teacherUid)
      
      // Get reference to classrooms collection
      const classroomsRef = collection(db, 'classrooms')
      
      // Create query to find classrooms where teacherId matches the teacher's UID
      // Order by creation date (newest first)
      const classroomsQuery = query(
        classroomsRef,
        where('teacherId', '==', teacherUid),
        orderBy('createdAt', 'desc')
      )
      
      // Execute the query
      const querySnapshot = await getDocs(classroomsQuery)
      
      // Extract classroom data from query results
      const classrooms = []
      querySnapshot.forEach((doc) => {
        const classroomData = doc.data()
        classrooms.push({
          id: doc.id,
          name: classroomData.name,
          schoolYear: classroomData.schoolYear,
          teacherId: classroomData.teacherId,
          students: classroomData.students || [],
          createdAt: classroomData.createdAt,
          // Convert Firestore timestamp to Date if it exists
          createdAtDate: classroomData.createdAt ? classroomData.createdAt.toDate() : null
        })
      })
      
      console.log(`Found ${classrooms.length} classrooms for teacher`)
      
      // Store classrooms in currentUser
      if (this.currentUser) {
        this.currentUser.classrooms = classrooms
        this.currentUser.classroomCount = classrooms.length
      }
      
      return classrooms
      
    } catch (error) {
      console.error('Error fetching teacher classrooms:', error)
      this.error = 'Failed to fetch classrooms: ' + error.message
      
      // Initialize empty classrooms array on error
      if (this.currentUser) {
        this.currentUser.classrooms = []
        this.currentUser.classroomCount = 0
      }
      
      throw error
    } finally {
      this.isLoadingClassrooms = false
    }
  }

  /**
   * Get the current user data (teacher info + classrooms)
   * @returns {Object|null} - Current user data or null if not authenticated
   */
  getCurrentUser() {
    return this.currentUser
  }

  /**
   * Get teacher data only
   * @returns {Object|null} - Teacher data or null if not found
   */
  getTeacherData() {
    return this.currentUser?.teacherData || null
  }

  /**
   * Get teacher classrooms only
   * @returns {Array} - Array of classrooms or empty array if none
   */
  getClassrooms() {
    return this.currentUser?.classrooms || []
  }

  /**
   * Get authentication status
   * @returns {boolean} - True if user is authenticated
   */
  getAuthStatus() {
    return this.isAuthenticated
  }

  /**
   * Get loading status
   * @returns {Object} - Object with loading states
   */
  getLoadingStatus() {
    return {
      isLoading: this.isLoading,
      isLoadingTeacherData: this.isLoadingTeacherData,
      isLoadingClassrooms: this.isLoadingClassrooms
    }
  }

  /**
   * Get current error
   * @returns {string|null} - Error message or null
   */
  getError() {
    return this.error
  }

  /**
   * Clear current error
   */
  clearError() {
    this.error = null
  }

  /**
   * Manually refresh teacher data and classrooms
   * Useful for updating data after changes
   */
  async refreshData() {
    if (this.currentUser?.uid) {
      console.log('Refreshing teacher data and classrooms')
      await this.fetchTeacherData(this.currentUser.uid)
      await this.fetchTeacherClassrooms(this.currentUser.uid)
    }
  }
}

// Create and export a singleton instance
const teacherDataManager = new TeacherDataManager()

export default teacherDataManager

// Also export the class for testing or custom instances
export { TeacherDataManager }
