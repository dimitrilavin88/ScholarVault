// Script to set up Firestore with sample approved domains
// Run this script after setting up your Firebase project

const { initializeApp } = require('firebase/app')
const { getFirestore, doc, setDoc } = require('firebase/firestore')

// Your Firebase configuration (uses process.env for script)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const approvedDomains = [
  {
    id: 'demo-edu',
    domain: 'demo.edu',
    district: 'Demo School District',
    description: 'Demo domain for testing purposes',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'lincoln-unified',
    domain: 'lincoln.edu',
    district: 'Lincoln Unified School District',
    description: 'Lincoln Unified School District teachers',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'springfield-isd',
    domain: 'springfield.k12.tx.us',
    district: 'Springfield Independent School District',
    description: 'Springfield ISD teachers',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'oakland-unified',
    domain: 'ousd.org',
    district: 'Oakland Unified School District',
    description: 'Oakland USD teachers',
    isActive: true,
    createdAt: new Date()
  }
]

async function setupFirestore() {
  try {
    console.log('Setting up Firestore with approved domains...')
    
    for (const domain of approvedDomains) {
      await setDoc(doc(db, 'approvedDomains', domain.id), domain)
      console.log(`Added domain: ${domain.domain}`)
    }
    
    console.log('Firestore setup completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error setting up Firestore:', error)
    process.exit(1)
  }
}

setupFirestore()
