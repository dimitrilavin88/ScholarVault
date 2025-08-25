// Custom hook to integrate TeacherDataManager with React components
// This provides a clean interface for accessing teacher data and classrooms

import { useState, useEffect } from 'react'
import teacherDataManager from './teacherDataManager'

export function useTeacherData() {
  const [currentUser, setCurrentUser] = useState(null)
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if we already have data
    const user = teacherDataManager.getCurrentUser()
    if (user) {
      setCurrentUser(user)
      setClassrooms(user.classrooms || [])
      setLoading(false)
    }

    // Set up interval to check for data updates
    const interval = setInterval(() => {
      const user = teacherDataManager.getCurrentUser()
      if (user && user !== currentUser) {
        setCurrentUser(user)
        setClassrooms(user.classrooms || [])
        setLoading(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentUser])

  // Get loading status from TeacherDataManager
  const loadingStatus = teacherDataManager.getLoadingStatus()
  const teacherDataManagerError = teacherDataManager.getError()

  // Update error state if TeacherDataManager has an error
  useEffect(() => {
    if (teacherDataManagerError && teacherDataManagerError !== error) {
      setError(teacherDataManagerError)
    }
  }, [teacherDataManagerError, error])

  // Clear error
  const clearError = () => {
    setError(null)
    teacherDataManager.clearError()
  }

  // Refresh data
  const refreshData = async () => {
    try {
      setLoading(true)
      await teacherDataManager.refreshData()
      
      // Get updated data
      const user = teacherDataManager.getCurrentUser()
      if (user) {
        setCurrentUser(user)
        setClassrooms(user.classrooms || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    currentUser,
    classrooms,
    loading: loading || loadingStatus.isLoadingTeacherData || loadingStatus.isLoadingClassrooms,
    error,
    clearError,
    refreshData,
    loadingStatus
  }
}
