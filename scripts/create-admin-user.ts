/**
 * Creates (or promotes) a Firebase Auth user as a Craftyso dashboard admin:
 * creates the Auth user if needed, then writes users/{uid} with role
 * "owner" so firestore.rules' isAdmin() check passes for them.
 *
 * Requires FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY — see .env.example.
 * Run: node --env-file=.env.local --import tsx scripts/create-admin-user.ts -- <email> <password>
 */
import { adminAuth, adminDb } from "../lib/firebase/admin";

async function run() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: create-admin-user.ts <email> <password>");
    process.exit(1);
  }

  let user;
  try {
    user = await adminAuth.getUserByEmail(email);
    console.log(`User already exists: ${user.uid}`);
  } catch {
    user = await adminAuth.createUser({ email, password });
    console.log(`Created user: ${user.uid}`);
  }

  await adminDb.collection("users").doc(user.uid).set(
    { uid: user.uid, email, role: "owner" },
    { merge: true },
  );

  console.log(`\n${email} is now an admin (role: owner). Log in at /admin/login.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
