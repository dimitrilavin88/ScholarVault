// Script to set up initial classroom structure in Firestore
// Run this script after setting up your Firebase project and creating teacher accounts

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore')

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

// Sample classroom data structure matching your existing collection
const sampleClassrooms = [
  {
    name: 'Algebra I',
    schoolYear: '2024-2025',
    teacherId: 'REPLACE_WITH_ACTUAL_TEACHER_UID', // You'll need to replace this
    students: [],
    createdAt: serverTimestamp()
  },
  {
    name: 'World History',
    schoolYear: '2024-2025',
    teacherId: 'REPLACE_WITH_ACTUAL_TEACHER_UID', // You'll need to replace this
    students: [],
    createdAt: serverTimestamp()
  },
  {
    name: 'English Literature',
    schoolYear: '2024-2025',
    teacherId: 'REPLACE_WITH_ACTUAL_TEACHER_UID', // You'll need to replace this
    students: [],
    createdAt: serverTimestamp()
  }
]

async function setupClassrooms() {
  try {
    console.log('Setting up sample classrooms in Firestore...')
    
    // Note: You'll need to replace the teacherId with actual teacher UIDs
    // You can get these from your Firebase Authentication or from existing teacher documents
    console.log('\n⚠️  IMPORTANT: Before running this script, you need to:')
    console.log('1. Create a teacher account first')
    console.log('2. Get the teacher UID from Firebase Authentication')
    console.log('3. Replace "REPLACE_WITH_ACTUAL_TEACHER_UID" in the script with the actual UID')
    console.log('\nTo get a teacher UID:')
    console.log('1. Go to Firebase Console > Authentication > Users')
    console.log('2. Find your teacher account and copy the UID')
    console.log('3. Update the script and run it again')
    
    // Uncomment the following lines after updating the teacherId
    /*
    for (const classroom of sampleClassrooms) {
      await addDoc(collection(db, 'classrooms'), classroom)
      console.log(`Added classroom: ${classroom.name}`)
    }
    */
    
    console.log('\nSetup script completed!')
    console.log('Remember to update the teacherId and uncomment the creation code.')
    process.exit(0)
  } catch (error) {
    console.error('Error setting up classrooms:', error)
    process.exit(1)
  }
}

setupClassrooms()
