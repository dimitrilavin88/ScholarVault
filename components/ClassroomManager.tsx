'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, BookOpen, GraduationCap, UserPlus, X, Loader2, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import teacherDataManager from '@/lib/teacherDataManager'
import { db } from '@/lib/firebase'
import { 
  doc, 
  addDoc, 
  collection, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore'

interface Student {
  id: string
  firstName: string
  lastName: string
  grade: string
  email: string
}

interface Classroom {
  id: string
  name: string
  schoolYear: string
  teacherId: string
  students: string[] // Array of student IDs
  createdAt: Date
}

interface ClassroomManagerProps {
  teacherId?: string
}

export default function ClassroomManager({ teacherId }: ClassroomManagerProps) {
  const { teacherData, currentUser, loading } = useAuth()
  
  console.log('ClassroomManager received teacherId:', teacherId)
  console.log('Current user from AuthContext:', currentUser)
  console.log('Teacher data from AuthContext:', teacherData)
  console.log('Auth loading state:', loading)
  
  // Get data from TeacherDataManager
  const teacherDataManagerUser = teacherDataManager.getCurrentUser() as any
  const teacherDataManagerClassrooms = teacherDataManager.getClassrooms()
  const teacherDataManagerLoading = teacherDataManager.getLoadingStatus()
  const teacherDataManagerError = teacherDataManager.getError()
  
  console.log('TeacherDataManager currentUser:', teacherDataManagerUser)
  console.log('TeacherDataManager classrooms:', teacherDataManagerClassrooms)
  console.log('TeacherDataManager loading:', teacherDataManagerLoading)
  console.log('TeacherDataManager error:', teacherDataManagerError)
  
  // Use currentUser.uid as the primary teacherId, fallback to prop if needed
  const effectiveTeacherId = currentUser?.uid || teacherId
  
  console.log('Effective teacherId being used:', effectiveTeacherId)
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAddStudentForm, setShowAddStudentForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states for creating classroom
  const [newClassroom, setNewClassroom] = useState({
    name: '',
    schoolYear: ''
  })

  // Form states for adding student
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    email: ''
  })

  // Search functionality for students
  const [studentSearchQuery, setStudentSearchQuery] = useState('')

  // Mock student data for demonstration - replace with real student data later
  const getStudentDisplayInfo = (studentId: string) => {
    // This is temporary - you'll want to fetch real student data from your students collection
    // For now, we'll create a mock student object based on the ID
    return {
      id: studentId,
      firstName: `Student ${studentId.slice(-3)}`, // Last 3 chars of ID
      lastName: 'Name',
      grade: '10th',
      email: `student${studentId.slice(-3)}@school.edu`
    }
  }

  // Load classrooms from TeacherDataManager
  useEffect(() => {
    if (!effectiveTeacherId) return
    
    const loadClassrooms = async () => {
      try {
        setIsLoadingData(true)
        console.log('Loading classrooms for effectiveTeacherId:', effectiveTeacherId)
        
        // Check if TeacherDataManager has data
        if (teacherDataManagerUser && teacherDataManagerUser.classrooms) {
          console.log('Using classrooms from TeacherDataManager:', teacherDataManagerUser.classrooms)
          
          // Convert TeacherDataManager classrooms to our Classroom interface
          const loadedClassrooms: Classroom[] = teacherDataManagerUser.classrooms.map((classroom: any) => ({
            id: classroom.id,
            name: classroom.name,
            schoolYear: classroom.schoolYear,
            teacherId: classroom.teacherId,
            students: classroom.students || [],
            createdAt: classroom.createdAtDate || classroom.createdAt || new Date()
          }))
          
          console.log('Converted classrooms:', loadedClassrooms)
          setClassrooms(loadedClassrooms)
          if (loadedClassrooms.length > 0) {
            setSelectedClassroom(loadedClassrooms[0])
          }
        } else {
          console.log('No classrooms found in TeacherDataManager')
          setClassrooms([])
        }
      } catch (error) {
        console.error('Error loading classrooms:', error)
        setError('Failed to load classrooms. Please try again.')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadClassrooms()
  }, [effectiveTeacherId, teacherDataManagerUser])

  // Don't render if still loading authentication or no teacherId
  if (loading || !effectiveTeacherId) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>Loading classroom data...</p>
          <p className="text-sm mt-2">Teacher ID: {effectiveTeacherId || 'Not available'}</p>
          <p className="text-sm">Auth Loading: {loading ? 'Yes' : 'No'}</p>
          <p className="text-sm">Current User UID: {currentUser?.uid || 'Not available'}</p>
        </div>
      </div>
    )
  }

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!newClassroom.name || !newClassroom.schoolYear) {
        setError('Please fill in all fields')
        return
      }

      // Create new classroom in Firebase
      const classroomData = {
        name: newClassroom.name,
        schoolYear: newClassroom.schoolYear,
        teacherId: effectiveTeacherId,
        students: [],
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'classrooms'), classroomData)
      
      // Create new classroom object with the generated ID
      const newClassroomObj: Classroom = {
        id: docRef.id,
        name: newClassroom.name,
        schoolYear: newClassroom.schoolYear,
        teacherId: effectiveTeacherId,
        students: [],
        createdAt: new Date()
      }

      // Add to classrooms array
      setClassrooms(prev => [newClassroomObj, ...prev])
      setSelectedClassroom(newClassroomObj)
      
      // Refresh data in TeacherDataManager
      await teacherDataManager.refreshData()
      
      // Reset form
      setNewClassroom({ name: '', schoolYear: '' })
      setShowCreateForm(false)
      setSuccess('Classroom created successfully!')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error creating classroom:', err)
      setError(err.message || 'Failed to create classroom. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!newStudent.firstName || !newStudent.lastName || !newStudent.grade || !newStudent.email) {
        setError('Please fill in all fields')
        return
      }

      if (!selectedClassroom) {
        setError('No classroom selected')
        return
      }

      // Create new student object
      const student: Student = {
        id: Date.now().toString(), // Generate unique ID
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        grade: newStudent.grade,
        email: newStudent.email
      }

      // Add student to selected classroom
      const updatedClassroom = {
        ...selectedClassroom,
        students: [...selectedClassroom.students, student.id]
      }

      // Update in Firebase
      const classroomRef = doc(db, 'classrooms', selectedClassroom.id)
      await updateDoc(classroomRef, {
        students: updatedClassroom.students
      })

      // Update local state
      setClassrooms(prev => prev.map(c => c.id === selectedClassroom.id ? updatedClassroom : c))
      setSelectedClassroom(updatedClassroom)
      
      // Refresh data in TeacherDataManager
      await teacherDataManager.refreshData()
      
      // Reset form
      setNewStudent({ firstName: '', lastName: '', grade: '', email: '' })
      setShowAddStudentForm(false)
      setSuccess('Student added successfully!')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error adding student:', err)
      setError(err.message || 'Failed to add student. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClassroomSelect = (classroom: Classroom) => {
    setSelectedClassroom(classroom)
  }

  const removeStudent = async (studentId: string) => {
    if (!selectedClassroom) return

    try {
      const updatedClassroom = {
        ...selectedClassroom,
        students: selectedClassroom.students.filter(s => s !== studentId)
      }

      // Update in Firebase
      const classroomRef = doc(db, 'classrooms', selectedClassroom.id)
      await updateDoc(classroomRef, {
        students: updatedClassroom.students
      })

      // Update local state
      setClassrooms(prev => prev.map(c => c.id === selectedClassroom.id ? updatedClassroom : c))
      setSelectedClassroom(updatedClassroom)
      
      // Refresh data in TeacherDataManager
      await teacherDataManager.refreshData()
      
      setSuccess('Student removed successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error removing student:', err)
      setError('Failed to remove student. Please try again.')
    }
  }

  const deleteClassroom = async (classroomId: string) => {
    if (!confirm('Are you sure you want to delete this classroom? This action cannot be undone.')) {
      return
    }

    try {
      // Delete from Firebase
      await deleteDoc(doc(db, 'classrooms', classroomId))
      
      // Update local state
      const updatedClassrooms = classrooms.filter(c => c.id !== classroomId)
      setClassrooms(updatedClassrooms)
      
      if (selectedClassroom?.id === classroomId) {
        setSelectedClassroom(updatedClassrooms.length > 0 ? updatedClassrooms[0] : null)
      }
      
      // Refresh data in TeacherDataManager
      await teacherDataManager.refreshData()
      
      setSuccess('Classroom deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error deleting classroom:', err)
      setError('Failed to delete classroom. Please try again.')
    }
  }

  if (isLoadingData) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">
          <Loader2 className="h-12 w-12 mx-auto mb-2 text-gray-300 animate-spin" />
          <p>Loading classrooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-secondary-900 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
          Classroom Management
        </h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Classroom
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>TeacherDataManager User: {teacherDataManagerUser ? 'Yes' : 'No'}</p>
        <p>Classrooms from TeacherDataManager: {teacherDataManagerClassrooms.length}</p>
        <p>Local Classrooms State: {classrooms.length}</p>
        <p>Effective Teacher ID: {effectiveTeacherId}</p>
      </div>

      {/* Classroom Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Classroom
        </label>
        <div className="flex flex-wrap gap-2">
          {classrooms.map((classroom) => (
            <div key={classroom.id} className="flex items-center gap-2">
              <button
                onClick={() => handleClassroomSelect(classroom)}
                className={`classroom-tab ${
                  selectedClassroom?.id === classroom.id
                    ? 'classroom-tab-active'
                    : 'classroom-tab-inactive'
                }`}
              >
                {classroom.name}
              </button>
              <button
                onClick={() => deleteClassroom(classroom.id)}
                className="text-red-500 hover:text-red-700 text-sm p-1"
                title="Delete classroom"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Classroom Display */}
      {selectedClassroom ? (
        <div className="space-y-6">
          {/* Classroom Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Class Name</p>
                <p className="font-semibold text-gray-900">{selectedClassroom.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">School Year</p>
                <p className="font-semibold text-gray-900">{selectedClassroom.schoolYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student Count</p>
                <p className="font-semibold text-gray-900">{selectedClassroom.students.length}</p>
              </div>
            </div>
          </div>

          {/* Students Section */}
          <div>
            {/* Classroom Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedClassroom.students.length}</div>
                  <div className="text-sm text-blue-700">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedClassroom.name}</div>
                  <div className="text-sm text-green-700">Class Name</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedClassroom.schoolYear}</div>
                  <div className="text-sm text-purple-700">School Year</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedClassroom.students.length > 0 ? 'Active' : 'Empty'}
                  </div>
                  <div className="text-sm text-orange-700">Status</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Students ({selectedClassroom.students.length})
              </h4>
              <button
                onClick={() => setShowAddStudentForm(true)}
                className="btn-secondary flex items-center text-sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </button>
            </div>

            {/* Student Search */}
            {selectedClassroom.students.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search students by name..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {studentSearchQuery && (
                  <div className="mt-2 text-sm text-gray-600">
                    {(() => {
                      const filteredCount = selectedClassroom.students.filter(studentId => {
                        const student = getStudentDisplayInfo(studentId)
                        return student.firstName.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                               student.lastName.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                               student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
                      }).length
                      return `Showing ${filteredCount} of ${selectedClassroom.students.length} students`
                    })()}
                  </div>
                )}
              </div>
            )}

            {selectedClassroom.students.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h5 className="text-lg font-medium mb-2">No Students Yet</h5>
                <p className="mb-4 text-gray-600">This classroom is ready for students!</p>
                <button
                  onClick={() => setShowAddStudentForm(true)}
                  className="btn-primary inline-flex items-center"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Student
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      const filteredStudents = selectedClassroom.students
                        .map(studentId => {
                          const student = getStudentDisplayInfo(studentId)
                          
                          // Filter students based on search query
                          if (studentSearchQuery && 
                              !student.firstName.toLowerCase().includes(studentSearchQuery.toLowerCase()) &&
                              !student.lastName.toLowerCase().includes(studentSearchQuery.toLowerCase()) &&
                              !student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())) {
                            return null
                          }
                          
                          return { studentId, student }
                        })
                        .filter((item): item is { studentId: string; student: any } => item !== null)
                      
                      if (filteredStudents.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-medium mb-2">No Students Found</p>
                              <p className="text-sm">Try adjusting your search terms or add new students.</p>
                            </td>
                          </tr>
                        )
                      }
                      
                      return filteredStudents.map(({ studentId, student }) => (
                        <tr key={studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.firstName} {student.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {studentId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {student.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => removeStudent(studentId)}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50 px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium mb-2">No Classrooms Yet</h4>
          <p className="mb-4">Create your first classroom to get started managing your students.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Classroom
          </button>
        </div>
      )}

      {/* Create Classroom Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Classroom</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateClassroom} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classroom Name
                  </label>
                  <input
                    type="text"
                    value={newClassroom.name}
                    onChange={(e) => setNewClassroom(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Algebra I, World History"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Year
                  </label>
                  <input
                    type="text"
                    value={newClassroom.schoolYear}
                    onChange={(e) => setNewClassroom(prev => ({ ...prev, schoolYear: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., 2024-2025, 2024"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Classroom'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Student to {selectedClassroom?.name}</h3>
              <button
                onClick={() => setShowAddStudentForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={newStudent.firstName}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, firstName: e.target.value }))}
                      className="input-field"
                      placeholder="First Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={newStudent.lastName}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, lastName: e.target.value }))}
                      className="input-field"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, grade: e.target.value }))}
                    className="input-field"
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="9th">9th</option>
                    <option value="10th">10th</option>
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                    placeholder="student@school.edu"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddStudentForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Student'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
