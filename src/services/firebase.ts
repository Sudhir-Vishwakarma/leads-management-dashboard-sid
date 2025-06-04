import { getFirestore, collection, getDocs, setDoc, addDoc, updateDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "../config/firebase";

export const db = getFirestore(app);

export interface Lead {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp_number_: string;
  comments: string;
  platform: string;
  lead_status: string;
  created_time: string;
  followUpDate?: string;
  followUpTime?: string;
  customerComment?: string; // Add this line
  commentsHistory?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
}

// 

// Get leads collection for the current user// Add new interface for FollowUpData
export interface FollowUpData {
  followUpTimestamp?: Date; // Use single timestamp field
  customerComment?: string;
}

// Update updateLead function
// (Removed duplicate declaration of updateLead)

// 



export const getLeadsCol = () => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  
  if (!user || !user.phoneNumber) {
    throw new Error('User not authenticated or phone number missing');
  }
  
  // Clean phone number format (remove + and special characters)
  const phoneNumber = user.phoneNumber.replace(/[^\d]/g, '');
  return collection(db, `crm_users/${phoneNumber}/leads`);
};

export const fetchAllLeads = () => getDocs(getLeadsCol());

export const createLead = async (leadData: Lead) => {
  const auth = getAuth(app);
  const user = auth.currentUser;

  if (!user || !user.phoneNumber) {
    throw new Error("User not authenticated or phone number missing");
  }

  const phoneNumber = user.phoneNumber.replace(/[^\d]/g, '');
  const userDocRef = doc(db, `crm_users/${phoneNumber}`);

  // Ensure parent document exists
  await setDoc(userDocRef, { createdAt: new Date().toISOString() }, { merge: true });

  // Add lead to subcollection
  const leadsCol = collection(userDocRef, "leads");
  return addDoc(leadsCol, leadData);
};

export const updateLead = (id: string, data: Partial<Lead>) => 
  updateDoc(doc(getLeadsCol(), id), data);

export {app };