import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Your Firestore initialization

/**
 * Updates the user's preferences in Firestore under users/{userId}/preferences.
 * Creates the document if it doesn't exist.
 *
 * @param {string} userId - The authenticated user's ID.
 * @param {string} cName - Company name.
 * @param {Object} fields - The preference fields (category, type, service, etc.)
 */
export const updatePreferences = async (userId, cName, fields) => {
  try {
    const prefRef = doc(db, "userData", userId, "finances", 'preferences'); // 'data' is the preferences doc ID
    await setDoc(prefRef, {
      cName,
      fields
    });
    console.log('Preferences updated successfully');
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};


/**
 * Fetches the user's preferences from Firestore under users/{userId}/preferences/data.
 * @param {string} userId - The authenticated user's ID.
 */
export const fetchPreferences = async (userId) => {
  try {
    const prefRef = doc(db, "userData", userId, "finances", 'preferences');
    const docSnap = await getDoc(prefRef);
    
    if (docSnap.exists()) {
      return docSnap.data(); // Return the fetched data
    } else {
      console.log('No preferences found!');
      return null; // If no preferences found, return null
    }
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw error;
  }
};
