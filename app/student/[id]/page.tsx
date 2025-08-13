'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Hash, 
  School, 
  Calendar, 
  FileText, 
  Download, 
  Eye,
  Filter,
  SortAsc,
  MapPin
} from 'lucide-react'
import WorkSampleViewer from '@/components/WorkSampleViewer'
import { demoStudents, demoWorkSamples } from '@/data/demoData'

interface WorkSample {
  id: string
  title: string
  subject: string
  gradeLevel: string
  uploadDate: string
  fileType: string
  fileSize: string
  fileUrl: string
  description: string
}

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
    district: string
  }>
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [workSamples, setWorkSamples] = useState<WorkSample[]>([])
  const [filteredSamples, setFilteredSamples] = useState<WorkSample[]>([])
  const [selectedSample, setSelectedSample] = useState<WorkSample | null>(null)
  const [filters, setFilters] = useState({
    subject: '',
    gradeLevel: '',
    sortBy: 'date'
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demo
  useEffect(() => {
    const foundStudent = demoStudents.find(s => s.id === params.id)
    const studentWorkSamples = demoWorkSamples.filter(sample => 
      sample.title.includes(foundStudent?.name.split(' ')[0] || '') ||
      sample.title.includes(foundStudent?.name.split(' ')[1] || '')
    )

    if (foundStudent) {
      setStudent(foundStudent)
      setWorkSamples(studentWorkSamples)
      setFilteredSamples(studentWorkSamples)
    }
    setIsLoading(false)
  }, [params.id])

  useEffect(() => {
    let filtered = [...workSamples]
    
    if (filters.subject) {
      filtered = filtered.filter(sample => sample.subject === filters.subject)
    }
    
    if (filters.gradeLevel) {
      filtered = filtered.filter(sample => sample.gradeLevel === filters.gradeLevel)
    }
    
    // Sort samples
    filtered.sort((a, b) => {
      if (filters.sortBy === 'date') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      } else if (filters.sortBy === 'subject') {
        return a.subject.localeCompare(b.subject)
      } else if (filters.sortBy === 'grade') {
        return a.gradeLevel.localeCompare(b.gradeLevel)
      }
      return 0
    })
    
    setFilteredSamples(filtered)
  }, [filters, workSamples])

  const subjects = [...new Set(workSamples.map(sample => sample.subject))]
  const gradeLevels = [...new Set(workSamples.map(sample => sample.gradeLevel))]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Student Not Found</h2>
          <p className="text-secondary-600 mb-4">The requested student profile could not be found.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
            <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mr-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <div className="card mb-8">
          <div className="flex items-start space-x-6">
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-secondary-900 mb-2">{student.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm text-secondary-600">ID: {student.studentId}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm text-secondary-600">{student.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <School className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm text-secondary-600">{student.currentGrade}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-secondary-400" />
                  <span className="text-sm text-secondary-600">DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* School History */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">School History</h3>
          <div className="space-y-3">
            {student.schoolHistory.map((history, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-secondary-50 rounded-lg">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <School className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-secondary-900">{history.school}</h4>
                  <p className="text-sm text-secondary-600">{history.grade} • {history.year}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-500">{history.district}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Samples Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-secondary-900">
              Work Samples ({filteredSamples.length})
            </h3>
            
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
                className="input-field max-w-xs"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              
              <select
                value={filters.gradeLevel}
                onChange={(e) => setFilters({...filters, gradeLevel: e.target.value})}
                className="input-field max-w-xs"
              >
                <option value="">All Grades</option>
                {gradeLevels.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="input-field max-w-xs"
              >
                <option value="date">Sort by Date</option>
                <option value="subject">Sort by Subject</option>
                <option value="grade">Sort by Grade</option>
              </select>
            </div>
          </div>

          {/* Work Samples Grid */}
          <div className="grid gap-4">
            {filteredSamples.map((sample) => (
              <div
                key={sample.id}
                className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-secondary-900 mb-2">{sample.title}</h4>
                    <p className="text-sm text-secondary-600 mb-3">{sample.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-secondary-500">
                      <span className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{sample.subject}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <School className="h-4 w-4" />
                        <span>{sample.gradeLevel}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(sample.uploadDate).toLocaleDateString()}</span>
                      </span>
                      <span>{sample.fileType} • {sample.fileSize}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedSample(sample)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button className="btn-primary flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSamples.length === 0 && (
            <div className="text-center py-8 text-secondary-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-secondary-300" />
              <p>No work samples found matching your filters.</p>
              <p className="text-sm">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* Work Sample Viewer Modal */}
      {selectedSample && (
        <WorkSampleViewer
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
        />
      )}
    </div>
  )
}
