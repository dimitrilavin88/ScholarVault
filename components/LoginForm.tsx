'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Mail, Lock, User, School, Building } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { validateTeacherDomain } from '@/lib/domainValidation'

interface LoginFormProps {
  onClose: () => void
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const { signUp, signIn } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [school, setSchool] = useState('')
  const [district, setDistrict] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [domainValidation, setDomainValidation] = useState<{
    isValid: boolean
    schoolName?: string
    districtName?: string
  } | null>(null)

  const handleModeToggle = (signUp: boolean) => {
    setIsSignUp(signUp)
    setError('')
    setSuccess('')
    setDomainValidation(null)
    // Reset form fields when switching modes
    if (signUp) {
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFirstName('')
      setLastName('')
      setSchool('')
      setDistrict('')
    } else {
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    }
  }

  const handleEmailChange = async (emailValue: string) => {
    setEmail(emailValue)
    
    if (isSignUp && emailValue.includes('@')) {
      try {
        const validation = await validateTeacherDomain(emailValue)
        setDomainValidation({
          isValid: validation.isValid,
          schoolName: validation.schoolName,
          districtName: validation.districtName
        })
        
        if (validation.isValid && validation.schoolName && validation.districtName) {
          setSchool(validation.schoolName)
          setDistrict(validation.districtName)
        }
      } catch (error) {
        console.error('Domain validation error:', error)
      }
    } else {
      setDomainValidation(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        // Handle signup
        if (!email || !password || !confirmPassword || !firstName || !lastName || !school || !district) {
          setError('Please fill in all required fields')
          return
        }
        
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        
        if (password.length < 8) {
          setError('Password must be at least 8 characters long')
          return
        }

        // Validate domain
        if (!domainValidation?.isValid) {
          setError('Please enter a valid email from an approved school domain')
          return
        }
        
        // Create account using Firebase
        await signUp(email, password, {
          firstName,
          lastName,
          email,
          school,
          district,
          role: 'Teacher'
        })
        
        setSuccess('Account created successfully! You can now sign in.')
        // Reset form and switch to login mode
        setTimeout(() => {
          handleModeToggle(false)
          setSuccess('')
        }, 2000)
        
      } else {
        // Handle login
        if (!email || !password) {
          setError('Please enter both email and password')
          return
        }
        
        // Sign in using Firebase
        await signIn(email, password)
        
        // Close modal and redirect to dashboard
        onClose()
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err.message || (isSignUp ? 'Signup failed. Please try again.' : 'Login failed. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Create Teacher Account' : 'Teacher Login'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Toggle between Login and Signup */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleModeToggle(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isSignUp 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeToggle(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isSignUp 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create Account
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

          {/* Signup Fields - Only show when isSignUp is true */}
          {isSignUp && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                    School
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="school"
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Lincoln High School"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="district"
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Lincoln Unified"
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`input-field pl-10 ${
                  domainValidation && !domainValidation.isValid ? 'border-red-500' : 
                  domainValidation && domainValidation.isValid ? 'border-green-500' : ''
                }`}
                placeholder="teacher@school.edu"
                required
              />
            </div>
            
            {/* Domain validation feedback */}
            {domainValidation && (
              <div className={`mt-2 text-sm ${
                domainValidation.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {domainValidation.isValid ? (
                  <span>✓ Valid school domain: {domainValidation.schoolName} ({domainValidation.districtName})</span>
                ) : (
                  <span>✗ Invalid or unapproved domain</span>
                )}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder={isSignUp ? "Create a password (min. 8 characters)" : "Enter your password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field - Only show when signing up */}
          {isSignUp && (
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
              : (isSignUp ? 'Create Account' : 'Sign In')
            }
          </button>

          <div className="mt-4 text-center">
            {!isSignUp && (
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Forgot your password?
              </button>
            )}
          </div>

          {!isSignUp && (
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Demo Credentials:</p>
              <p>Email: teacher@demo.edu</p>
              <p>Password: (any password)</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
