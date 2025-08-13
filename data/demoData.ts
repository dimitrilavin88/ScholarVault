export interface Student {
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
  workSamplesCount: number
  lastViewed?: string
}

export interface WorkSample {
  id: string
  title: string
  subject: string
  gradeLevel: string
  uploadDate: string
  fileType: string
  fileSize: string
  fileUrl: string
  description: string
  teacherName?: string
  schoolName?: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  school: string
  role: string
  subjects: string[]
  lastLogin: string
}

export interface School {
  id: string
  name: string
  district: string
  type: 'Elementary' | 'Middle' | 'High'
  address: string
  phone: string
}

export const demoStudents: Student[] = [
  {
    id: '1',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@student.edu',
    studentId: 'STU001',
    currentGrade: '10th Grade',
    currentSchool: 'Lincoln High School',
    dateOfBirth: '2008-03-15',
    workSamplesCount: 24,
    lastViewed: '2 hours ago',
    schoolHistory: [
      { school: 'Lincoln High School', grade: '10th Grade', year: '2023-2024', district: 'Lincoln Unified' },
      { school: 'Lincoln High School', grade: '9th Grade', year: '2022-2023', district: 'Lincoln Unified' },
      { school: 'Riverside Middle School', grade: '8th Grade', year: '2021-2022', district: 'Riverside Unified' },
      { school: 'Riverside Middle School', grade: '7th Grade', year: '2020-2021', district: 'Riverside Unified' },
      { school: 'Oakwood Elementary', grade: '6th Grade', year: '2019-2020', district: 'Oakwood Unified' }
    ]
  },
  {
    id: '2',
    name: 'Marcus Chen',
    email: 'marcus.chen@student.edu',
    studentId: 'STU002',
    currentGrade: '11th Grade',
    currentSchool: 'Lincoln High School',
    dateOfBirth: '2007-08-22',
    workSamplesCount: 31,
    lastViewed: '1 day ago',
    schoolHistory: [
      { school: 'Lincoln High School', grade: '11th Grade', year: '2023-2024', district: 'Lincoln Unified' },
      { school: 'Lincoln High School', grade: '10th Grade', year: '2022-2023', district: 'Lincoln Unified' },
      { school: 'Lincoln High School', grade: '9th Grade', year: '2021-2022', district: 'Lincoln Unified' },
      { school: 'Oakwood Middle School', grade: '8th Grade', year: '2020-2021', district: 'Oakwood Unified' },
      { school: 'Oakwood Middle School', grade: '7th Grade', year: '2019-2020', district: 'Oakwood Unified' },
      { school: 'Oakwood Elementary', grade: '6th Grade', year: '2018-2019', district: 'Oakwood Unified' }
    ]
  },
  {
    id: '3',
    name: 'Sophia Williams',
    email: 'sophia.williams@student.edu',
    studentId: 'STU003',
    currentGrade: '9th Grade',
    currentSchool: 'Lincoln High School',
    dateOfBirth: '2009-01-10',
    workSamplesCount: 18,
    lastViewed: '3 days ago',
    schoolHistory: [
      { school: 'Lincoln High School', grade: '9th Grade', year: '2023-2024', district: 'Lincoln Unified' },
      { school: 'Maple Middle School', grade: '8th Grade', year: '2022-2023', district: 'Maple Unified' },
      { school: 'Maple Middle School', grade: '7th Grade', year: '2021-2022', district: 'Maple Unified' },
      { school: 'Maple Elementary', grade: '6th Grade', year: '2020-2021', district: 'Maple Unified' }
    ]
  },
  {
    id: '4',
    name: 'Jake Thompson',
    email: 'jake.thompson@student.edu',
    studentId: 'STU004',
    currentGrade: '12th Grade',
    currentSchool: 'Lincoln High School',
    dateOfBirth: '2006-11-05',
    workSamplesCount: 42,
    lastViewed: '1 week ago',
    schoolHistory: [
      { school: 'Lincoln High School', grade: '12th Grade', year: '2023-2024', district: 'Lincoln Unified' },
      { school: 'Lincoln High School', grade: '11th Grade', year: '2022-2023', district: 'Lincoln Unified' },
      { school: 'Lincoln High School', grade: '10th Grade', year: '2021-2022', district: 'Lincoln Unified' },
      { school: 'Lincoln High School', grade: '9th Grade', year: '2020-2021', district: 'Lincoln Unified' },
      { school: 'Riverside Middle School', grade: '8th Grade', year: '2019-2020', district: 'Riverside Unified' },
      { school: 'Riverside Middle School', grade: '7th Grade', year: '2018-2019', district: 'Riverside Unified' }
    ]
  },
  {
    id: '5',
    name: 'Aisha Patel',
    email: 'aisha.patel@student.edu',
    studentId: 'STU005',
    currentGrade: '8th Grade',
    currentSchool: 'Riverside Middle School',
    dateOfBirth: '2010-06-18',
    workSamplesCount: 15,
    lastViewed: '2 days ago',
    schoolHistory: [
      { school: 'Riverside Middle School', grade: '8th Grade', year: '2023-2024', district: 'Riverside Unified' },
      { school: 'Riverside Middle School', grade: '7th Grade', year: '2022-2023', district: 'Riverside Unified' },
      { school: 'Riverside Elementary', grade: '6th Grade', year: '2021-2022', district: 'Riverside Unified' },
      { school: 'Riverside Elementary', grade: '5th Grade', year: '2020-2021', district: 'Riverside Unified' }
    ]
  },
  {
    id: '6',
    name: 'Lucas Johnson',
    email: 'lucas.johnson@student.edu',
    studentId: 'STU006',
    currentGrade: '7th Grade',
    currentSchool: 'Oakwood Middle School',
    dateOfBirth: '2011-04-12',
    workSamplesCount: 12,
    lastViewed: '5 days ago',
    schoolHistory: [
      { school: 'Oakwood Middle School', grade: '7th Grade', year: '2023-2024', district: 'Oakwood Unified' },
      { school: 'Oakwood Elementary', grade: '6th Grade', year: '2022-2023', district: 'Oakwood Unified' },
      { school: 'Oakwood Elementary', grade: '5th Grade', year: '2021-2022', district: 'Oakwood Unified' },
      { school: 'Oakwood Elementary', grade: '4th Grade', year: '2020-2021', district: 'Oakwood Unified' }
    ]
  }
]

export const demoWorkSamples: WorkSample[] = [
  // Emma Rodriguez - 10th Grade
  {
    id: '1',
    title: 'Algebra II Final Project - Quadratic Functions',
    subject: 'Mathematics',
    gradeLevel: '10th Grade',
    uploadDate: '2024-01-15',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    fileUrl: '#',
    description: 'Comprehensive project demonstrating understanding of quadratic functions, including graphs, equations, and real-world applications.',
    teacherName: 'Dr. Sarah Johnson',
    schoolName: 'Lincoln High School'
  },
  {
    id: '2',
    title: 'English Essay - Literary Analysis of To Kill a Mockingbird',
    subject: 'English',
    gradeLevel: '10th Grade',
    uploadDate: '2023-12-10',
    fileType: 'DOCX',
    fileSize: '1.8 MB',
    fileUrl: '#',
    description: 'Critical analysis essay exploring themes of justice, racism, and moral growth in Harper Lee\'s classic novel.',
    teacherName: 'Ms. Jennifer Davis',
    schoolName: 'Lincoln High School'
  },
  {
    id: '3',
    title: 'Science Lab Report - Photosynthesis Experiment',
    subject: 'Biology',
    gradeLevel: '9th Grade',
    uploadDate: '2023-05-20',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    fileUrl: '#',
    description: 'Detailed lab report documenting the effects of light intensity on plant growth and photosynthesis rates.',
    teacherName: 'Mr. Robert Wilson',
    schoolName: 'Lincoln High School'
  },
  {
    id: '4',
    title: 'History Research Paper - Civil Rights Movement',
    subject: 'History',
    gradeLevel: '9th Grade',
    uploadDate: '2023-04-15',
    fileType: 'PDF',
    fileSize: '4.2 MB',
    fileUrl: '#',
    description: 'Research paper examining key figures and events of the Civil Rights Movement in the 1950s and 1960s.',
    teacherName: 'Dr. Michael Brown',
    schoolName: 'Lincoln High School'
  },
  {
    id: '5',
    title: 'Geometry Test - Circles and Spheres',
    subject: 'Mathematics',
    gradeLevel: '9th Grade',
    uploadDate: '2023-03-10',
    fileType: 'PDF',
    fileSize: '1.5 MB',
    fileUrl: '#',
    description: 'Unit test covering concepts of circles, spheres, and their properties including area, volume, and surface area.',
    teacherName: 'Dr. Sarah Johnson',
    schoolName: 'Lincoln High School'
  },
  {
    id: '6',
    title: 'Spanish Oral Presentation - Cultural Traditions',
    subject: 'Spanish',
    gradeLevel: '9th Grade',
    uploadDate: '2023-02-28',
    fileType: 'MP4',
    fileSize: '15.2 MB',
    fileUrl: '#',
    description: 'Video presentation discussing cultural traditions and celebrations in Spanish-speaking countries.',
    teacherName: 'Señora Maria Garcia',
    schoolName: 'Lincoln High School'
  },
  {
    id: '7',
    title: 'Art Portfolio - Mixed Media Exploration',
    subject: 'Art',
    gradeLevel: '9th Grade',
    uploadDate: '2023-01-20',
    fileType: 'PDF',
    fileSize: '8.7 MB',
    fileUrl: '#',
    description: 'Portfolio showcasing mixed media artwork including paintings, sculptures, and digital art pieces.',
    teacherName: 'Ms. Lisa Anderson',
    schoolName: 'Lincoln High School'
  },
  {
    id: '8',
    title: 'Physical Education - Fitness Assessment',
    subject: 'Physical Education',
    gradeLevel: '9th Grade',
    uploadDate: '2022-12-15',
    fileType: 'DOCX',
    fileSize: '0.8 MB',
    fileUrl: '#',
    description: 'Fitness assessment report including cardiovascular endurance, strength, and flexibility measurements.',
    teacherName: 'Coach David Martinez',
    schoolName: 'Lincoln High School'
  },
  // Marcus Chen - 11th Grade
  {
    id: '9',
    title: 'AP Calculus BC - Integration Techniques',
    subject: 'Mathematics',
    gradeLevel: '11th Grade',
    uploadDate: '2024-01-20',
    fileType: 'PDF',
    fileSize: '3.8 MB',
    fileUrl: '#',
    description: 'Advanced calculus project demonstrating mastery of various integration techniques and applications.',
    teacherName: 'Dr. Sarah Johnson',
    schoolName: 'Lincoln High School'
  },
  {
    id: '10',
    title: 'AP Literature - Poetry Analysis',
    subject: 'English',
    gradeLevel: '11th Grade',
    uploadDate: '2023-12-18',
    fileType: 'DOCX',
    fileSize: '2.1 MB',
    fileUrl: '#',
    description: 'In-depth analysis of selected poems from the AP Literature curriculum, focusing on themes and poetic devices.',
    teacherName: 'Ms. Jennifer Davis',
    schoolName: 'Lincoln High School'
  },
  // Sophia Williams - 9th Grade
  {
    id: '11',
    title: 'Chemistry Lab - Chemical Reactions',
    subject: 'Chemistry',
    gradeLevel: '9th Grade',
    uploadDate: '2024-01-10',
    fileType: 'PDF',
    fileSize: '2.9 MB',
    fileUrl: '#',
    description: 'Laboratory report documenting various chemical reactions and their observable changes.',
    teacherName: 'Dr. Emily Chen',
    schoolName: 'Lincoln High School'
  },
  // Jake Thompson - 12th Grade
  {
    id: '12',
    title: 'AP Physics - Mechanics Project',
    subject: 'Physics',
    gradeLevel: '12th Grade',
    uploadDate: '2024-01-25',
    fileType: 'PDF',
    fileSize: '5.2 MB',
    fileUrl: '#',
    description: 'Comprehensive physics project analyzing mechanical systems and their applications in real-world scenarios.',
    teacherName: 'Dr. James Thompson',
    schoolName: 'Lincoln High School'
  }
]

export const demoTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@lincoln.edu',
    school: 'Lincoln High School',
    role: 'Mathematics Teacher',
    subjects: ['Algebra I', 'Algebra II', 'Geometry', 'AP Calculus BC'],
    lastLogin: '2024-01-27T10:30:00Z'
  },
  {
    id: '2',
    name: 'Jennifer Davis',
    email: 'jennifer.davis@lincoln.edu',
    school: 'Lincoln High School',
    role: 'English Teacher',
    subjects: ['English 9', 'English 10', 'AP Literature'],
    lastLogin: '2024-01-27T09:15:00Z'
  },
  {
    id: '3',
    name: 'Robert Wilson',
    email: 'robert.wilson@lincoln.edu',
    school: 'Lincoln High School',
    role: 'Science Teacher',
    subjects: ['Biology', 'Environmental Science'],
    lastLogin: '2024-01-26T16:45:00Z'
  }
]

export const demoSchools: School[] = [
  {
    id: '1',
    name: 'Lincoln High School',
    district: 'Lincoln Unified',
    type: 'High',
    address: '1234 Lincoln Ave, Lincoln, CA 95648',
    phone: '(916) 555-0100'
  },
  {
    id: '2',
    name: 'Riverside Middle School',
    district: 'Riverside Unified',
    type: 'Middle',
    address: '5678 Riverside Blvd, Riverside, CA 95661',
    phone: '(916) 555-0200'
  },
  {
    id: '3',
    name: 'Oakwood Middle School',
    district: 'Oakwood Unified',
    type: 'Middle',
    address: '9012 Oakwood Dr, Oakwood, CA 95662',
    phone: '(916) 555-0300'
  },
  {
    id: '4',
    name: 'Maple Middle School',
    district: 'Maple Unified',
    type: 'Middle',
    address: '3456 Maple St, Maple, CA 95663',
    phone: '(916) 555-0400'
  }
]

export const demoStats = {
  totalStudents: 1247,
  totalWorkSamples: 15892,
  connectedSchools: 12,
  connectedDistricts: 8,
  activeTeachers: 89,
  monthlyAccesses: 2456
}
