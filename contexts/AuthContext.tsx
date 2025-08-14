'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface TeacherData {
  firstName: string
  lastName: string
  email: string
  school: string
  district: string
  role: string
  createdAt: Date
  lastLogin: Date
}

interface AuthContextType {
  currentUser: User | null
  teacherData: TeacherData | null
  loading: boolean
  signUp: (email: string, password: string, teacherData: Omit<TeacherData, 'createdAt' | 'lastLogin'>) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [loading, setLoading] = useState(true)

  async function signUp(
    email: string, 
    password: string, 
    teacherData: Omit<TeacherData, 'createdAt' | 'lastLogin'>
  ) {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update user profile with display name
      await updateProfile(user, {
        displayName: `${teacherData.firstName} ${teacherData.lastName}`
      })

      // Store teacher data in Firestore
      const teacherDoc = {
        ...teacherData,
        createdAt: new Date(),
        lastLogin: new Date()
      }

      await setDoc(doc(db, 'teachers', user.uid), teacherDoc)

      // Update local state
      setTeacherData(teacherDoc)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update last login time
      if (user.uid) {
        await setDoc(doc(db, 'teachers', user.uid), {
          lastLogin: new Date()
        }, { merge: true })
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  async function logOut() {
    try {
      await signOut(auth)
      setTeacherData(null)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  async function fetchTeacherData(uid: string) {
    try {
      const teacherDoc = await getDoc(doc(db, 'teachers', uid))
      if (teacherDoc.exists()) {
        setTeacherData(teacherDoc.data() as TeacherData)
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      
      if (user) {
        await fetchTeacherData(user.uid)
      } else {
        setTeacherData(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    currentUser,
    teacherData,
    loading,
    signUp,
    signIn,
    logOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
