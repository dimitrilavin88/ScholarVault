'use client'

import { useState } from 'react'
import { Search, User, LogOut, GraduationCap, Bell } from 'lucide-react'
import StudentSearch from '@/components/StudentSearch'
import RecentStudents from '@/components/RecentStudents'
import QuickStats from '@/components/QuickStats'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { logOut, teacherData } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleLogout = async () => {
    try {
      await logOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
            <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ScholarVault</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {teacherData ? (() => {
                        const title = teacherData.gender?.toLowerCase() === 'male' ? 'Mr.' : 
                                     teacherData.gender?.toLowerCase() === 'female' ? 'Mrs.' : '';
                        return title ? `${title} ${teacherData.lastName}` : `${teacherData.firstName} ${teacherData.lastName}`;
                      })() : 'Loading...'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {teacherData ? `Teacher - ${teacherData.school}` : 'Loading...'}
                    </p>
                  </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {teacherData ? (() => {
              const title = teacherData.gender?.toLowerCase() === 'male' ? 'Mr.' : 
                           teacherData.gender?.toLowerCase() === 'female' ? 'Mrs.' : '';
              return title ? `${title} ${teacherData.lastName}` : teacherData.firstName;
            })() : 'Teacher'}!
          </h2>
          <p className="text-gray-600">
            Search for students to view their academic portfolios and work samples.
          </p>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Search Section */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">
            Student Search
          </h3>
          <StudentSearch onSearch={handleSearch} />
        </div>

        {/* Recent Students */}
        <div className="card">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">
            Recently Viewed Students
          </h3>
          <RecentStudents />
        </div>
      </main>
    </div>
  )
}
