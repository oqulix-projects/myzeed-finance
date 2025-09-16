import { auth, db } from "../firebaseConfig";; // adjust the path as needed
import { collection, query, orderBy, getDocs, doc, getDoc, where } from 'firebase/firestore';

export const fetchUserExpenses = async () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe(); // immediately unsubscribe after getting the user

      if (!user) {
        return resolve([]); // no user, return empty array
      }

      try {
        const financeId = 'financialData'
        const userExpensesRef = collection(db, "userData", user.uid, "finances", financeId, "expenses");
        const q = query(userExpensesRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const expensesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        resolve(expensesList);
      } catch (error) {
        reject(error);
      }
    });
  });
};


export const fetchUserRevenue = async () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe(); // immediately unsubscribe after getting the user

      if (!user) {
        return resolve([]); // no user, return empty array
      }

      try {
        const financeId='financialData'
        const userRevenueRef = collection(db, "userData", user.uid, "finances", financeId, "revenue");
        const p = query(userRevenueRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(p);
        const revenueList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        resolve(revenueList);
      } catch (error) {
        reject(error);
      }
    });
  });
};




export const fetchCompanyDetails = async (userId) => {
  const docRef = doc(db, "userData", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data(); // ✅ returns the company/admin info
  } else {
    console.log("No such document!");
    return null;
  }
};

// Fetchonly revenue
export const fetchOnlyRevenue = async () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe(); // stop listening immediately

      if (!user) {
        return resolve([]); // no user logged in
      }

      try {
        const financeId = 'financialData';
        const userRevenueRef = collection(
          db,
          "userData",
          user.uid,
          "finances",
          financeId,
          "revenue"
        );

        // Only fetch documents where creditType === "revenue"
        const q = query(
          userRevenueRef,
          where("creditType", "==", "revenue"),
          orderBy("date", "desc")
        );

        const querySnapshot = await getDocs(q);
        const revenueList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        resolve(revenueList);
      } catch (error) {
        reject(error);
      }
    });
  });
};