'use client'

import { useState } from 'react'
import { Search, Shield, Users, FileText, GraduationCap } from 'lucide-react'
import LoginForm from '@/components/LoginForm'

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ScholarVault</h1>
            </div>
            <button
              onClick={() => {
                console.log('Teacher Login button clicked')
                setShowLogin(true)
              }}
              className="btn-primary"
            >
              Teacher Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Secure Access to Student Academic Portfolios
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            ScholarVault provides K-12 teachers with centralized, long-term access to student work samples 
            across grades and schools, helping you understand student progress and learning needs over time.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="btn-primary text-lg px-8 py-3"
          >
            Get Started
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Search</h3>
            <p className="text-gray-600">Find students by name, ID, or email across districts</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Samples</h3>
            <p className="text-gray-600">View and download historical academic work</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-District Access</h3>
            <p className="text-gray-600">See student history from previous schools</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">FERPA Compliant</h3>
            <p className="text-gray-600">Secure, audited access to student data</p>
          </div>
        </div>

        {/* Compliance Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Built for Educational Compliance
          </h3>
          <p className="text-gray-600 mb-6">
            ScholarVault is designed to meet FERPA and COPPA requirements, ensuring student data protection 
            while providing teachers with the insights they need to support student learning.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>FERPA Compliant</span>
            <span>COPPA Compliant</span>
            <span>Audit Logged</span>
            <span>Role-Based Access</span>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {showLogin && (
        <LoginForm onClose={() => setShowLogin(false)} />
      )}
    </div>
  )
}
