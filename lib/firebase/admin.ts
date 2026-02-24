import admin from 'firebase-admin'

function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin SDK: faltan variables de entorno. Configura FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY'
    )
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    databaseURL,
  })
}

const app = getAdminApp()

export const adminDb = admin.database()
export const adminAuth = admin.auth()
export default app
