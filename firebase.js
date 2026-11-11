import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export async function readyAuth() {
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser;
}

export async function uploadImage(roomId, file) {
  await readyAuth();

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `rpgRooms/${roomId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, {
    contentType: file.type || "image/png"
  });

  return await getDownloadURL(storageRef);
}

export { doc, setDoc, getDoc, onSnapshot };
