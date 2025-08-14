import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'

export interface ApprovedDomain {
  id: string
  domain: string
  schoolName: string
  districtName: string
  isActive: boolean
  addedAt: Date
  addedBy: string
}

export async function validateTeacherDomain(email: string): Promise<{
  isValid: boolean
  domain?: string
  schoolName?: string
  districtName?: string
  error?: string
}> {
  try {
    // Extract domain from email
    const domain = email.split('@')[1]?.toLowerCase()
    
    if (!domain) {
      return {
        isValid: false,
        error: 'Invalid email format'
      }
    }

    // Query Firestore for approved domains
    const domainsRef = collection(db, 'approvedDomains')
    const q = query(
      domainsRef, 
      where('domain', '==', domain),
      where('isActive', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return {
        isValid: false,
        domain,
        error: `Domain '@${domain}' is not approved. Please contact your school administrator.`
      }
    }

    // Get the first matching domain (should only be one)
    const domainDoc = querySnapshot.docs[0]
    const domainData = domainDoc.data() as ApprovedDomain

    return {
      isValid: true,
      domain,
      schoolName: domainData.schoolName,
      districtName: domainData.districtName
    }
  } catch (error) {
    console.error('Error validating domain:', error)
    return {
      isValid: false,
      error: 'Error validating domain. Please try again.'
    }
  }
}

export async function getAllApprovedDomains(): Promise<ApprovedDomain[]> {
  try {
    const domainsRef = collection(db, 'approvedDomains')
    const q = query(domainsRef, where('isActive', '==', true))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ApprovedDomain[]
  } catch (error) {
    console.error('Error fetching approved domains:', error)
    return []
  }
}
