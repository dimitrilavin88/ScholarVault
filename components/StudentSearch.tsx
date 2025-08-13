'use client'

import { useState, useEffect } from 'react'
import { Search, User, Mail, Hash, School, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  name: string
  email: string
  studentId: string
  currentGrade: string
  currentSchool: string
  dateOfBirth: string
  schoolHistory: Array<{
    school: string
    grade: string
    year: string
  }>
}

interface StudentSearchProps {
  onSearch: (query: string) => void
}

export default function StudentSearch({ onSearch }: StudentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()

  // Mock data for demo
  const mockStudents: Student[] = demoStudents

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setShowResults(true)
    onSearch(searchQuery)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Filter mock data based on search query
    const filtered = mockStudents.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setSearchResults(filtered)
    setIsSearching(false)
  }

  const handleStudentClick = (studentId: string) => {
    router.push(`/student/${studentId}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div>
      {/* Search Input */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search by student name, ID, or email..."
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-secondary-900">
            Search Results ({searchResults.length})
          </h4>
          
          {isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-secondary-500 mt-2">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid gap-4">
              {searchResults.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentClick(student.id)}
                  className="bg-white border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-secondary-900">{student.name}</h5>
                        <div className="flex items-center space-x-4 text-sm text-secondary-500">
                          <span className="flex items-center space-x-1">
                            <Hash className="h-4 w-4" />
                            <span>{student.studentId}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <School className="h-4 w-4" />
                            <span>{student.currentGrade}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{student.currentSchool}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-secondary-500">Click to view profile</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              <User className="h-12 w-12 mx-auto mb-2 text-secondary-300" />
              <p>No students found matching your search.</p>
              <p className="text-sm">Try searching with a different name, ID, or email.</p>
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
        <h5 className="font-medium text-secondary-900 mb-2">Search Tips:</h5>
        <ul className="text-sm text-secondary-600 space-y-1">
          <li>• Search by student's full name or partial name</li>
          <li>• Use student ID numbers for exact matches</li>
          <li>• Email addresses work for students with school accounts</li>
          <li>• Results include students from all connected schools and districts</li>
        </ul>
      </div>
    </div>
  )
}
