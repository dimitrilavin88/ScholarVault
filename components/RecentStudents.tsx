'use client'

import { useState } from 'react'
import { User, Calendar, School, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { demoStudents } from '@/data/demoData'

interface RecentStudent {
  id: string
  name: string
  currentGrade: string
  currentSchool: string
  lastViewed: string
  workSamplesCount: number
}

export default function RecentStudents() {
  const router = useRouter()
  
  const [recentStudents] = useState<RecentStudent[]>(
    demoStudents.slice(0, 4).map(student => ({
      id: student.id,
      name: student.name,
      currentGrade: student.currentGrade,
      currentSchool: student.currentSchool,
      lastViewed: student.lastViewed || 'Recently',
      workSamplesCount: student.workSamplesCount
    }))
  )

  const handleStudentClick = (studentId: string) => {
    router.push(`/student/${studentId}`)
  }

  if (recentStudents.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-500">
        <User className="h-12 w-12 mx-auto mb-2 text-secondary-300" />
        <p>No recently viewed students.</p>
        <p className="text-sm">Search for students to start building your history.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recentStudents.map((student) => (
        <div
          key={student.id}
          onClick={() => handleStudentClick(student.id)}
          className="flex items-center justify-between p-4 bg-white border border-secondary-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h5 className="font-semibold text-secondary-900">{student.name}</h5>
              <div className="flex items-center space-x-4 text-sm text-secondary-500">
                <span className="flex items-center space-x-1">
                  <School className="h-4 w-4" />
                  <span>{student.currentGrade}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{student.currentSchool}</span>
                </span>
                <span className="text-primary-600 font-medium">
                  {student.workSamplesCount} work samples
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-secondary-500">Last viewed</p>
              <p className="text-xs text-secondary-400">{student.lastViewed}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-secondary-400" />
          </div>
        </div>
      ))}
      
      <div className="text-center pt-4">
        <button className="text-sm text-primary-600 hover:text-primary-700 underline">
          View all recent students
        </button>
      </div>
    </div>
  )
}
