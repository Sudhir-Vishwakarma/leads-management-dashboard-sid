import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Lead, LeadsResponse } from '../types';
import { db, getLeadsCol, updateLead } from '../services/firebase';
import { doc, setDoc, addDoc, getDocs } from 'firebase/firestore';

const BASE_API_URL = 'https://asia-south1-starzapp.cloudfunctions.net/whatsAppWebHook-2/fetch-individual-client-leads';

const generateLeadHash = (lead: Lead) => `${lead.whatsapp_number_}_${lead.created_time}`;

export const syncLeadsFromSheets = async (): Promise<void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.phoneNumber) {
      throw new Error('User not authenticated or phone number missing');
    }

    // Sanitize and extract phone number digits
    const sanitizedPhone = user.phoneNumber.replace(/[^\d]/g, '');
    const sheetName = sanitizedPhone.slice(-10); // Get last 10 digits

    // Construct dynamic API URL
    const API_URL = `${BASE_API_URL}?sheetId=1D87OvwIf9Nw9UPHL93CzFyjQGzlO_vDM-jH0IN21jsU&sheetName=${sheetName}`;

    // Ensure parent document exists
    const userDocRef = doc(db, `crm_users/${sanitizedPhone}`);
    await setDoc(userDocRef, {
      source: "sheet",
      lastSyncedAt: new Date().toISOString()
    }, { merge: true });

    // ✅ Fetch leads from Google Sheets
    const response = await axios.get<LeadsResponse>(API_URL);
    const sheetsLeads = response.data.leads;

    // ✅ Fetch existing leads from Firestore
    const firestoreSnapshot = await getDocs(getLeadsCol());
    const firestoreLeads = firestoreSnapshot.docs.map(doc => doc.data() as Lead);
    const existingHashes = new Set(firestoreLeads.map(lead => generateLeadHash(lead)));

    // ✅ Filter only new leads
    const newLeads = sheetsLeads.filter(sheetLead =>
      !existingHashes.has(generateLeadHash(sheetLead))
    );

    // ✅ Add new leads to subcollection
    await Promise.all(newLeads.map(lead => addDoc(getLeadsCol(), lead)));

    console.log(`Synced ${newLeads.length} new leads from Sheets`);
  } catch (error) {
    console.error('Error syncing leads:', error);
    throw error;
  }
};

export const fetchLeadsFromFirestore = async (): Promise<Lead[]> => {
  try {
    const snapshot = await getDocs(getLeadsCol());
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as Lead);
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

export const updateLeadStatus = async (leadId: string, newStatus: string): Promise<void> => {
  try {
    await updateLead(leadId, { lead_status: newStatus });
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
};

// Follow-Up Store in FireStore
export const scheduleFollowUp = async (
  leadId: string,
  date: Date,
  time: string
): Promise<void> => {
  try {
    await updateLead(leadId, { followUpDate: date.toISOString(), followUpTime: time });
  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    throw error;
  }
};

export const updateCustomerComment = async (
  leadId: string,
  comment: string
): Promise<void> => {
  try {
    await updateLead(leadId, { customerComment: comment });
  } catch (error) {
    console.error('Error updating customer comment:', error);
    throw error;
  }
};
