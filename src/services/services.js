// Export the function to use it in other parts of the application// deleteExpense.js
import { doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig"; // adjust path as needed

export const deleteData = async (type,id) => {
    console.log(type,id);
    
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        reject("User not authenticated");
        return;
      }

      try {
        const financeId='financialData'
        console.log(type);
        
        const expenseRef = doc(db, 'userData', user.uid, 'finances', financeId, type, id);
        // const expenseRef = doc(db, `users/${user.uid}/${type}`, id);
        await deleteDoc(expenseRef);
        console.log(`Deleted ${type}:`, id);
        resolve();
      } catch (error) {
        console.error("Error deleting expense:", error);
        reject(error);
      }
    });
  });
};

export default deleteData;

// filters.js

export const filterExpenses = (expenses, filters, searchText) => {
  return expenses.filter(exp => {
    // Dynamic filter checks
    for (const key in filters) {
      if (filters[key] !== "All" && exp[key] !== filters[key]) {
        return false;
      }
    }
    // Search filter (optional)
    if (searchText && !JSON.stringify(exp).toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    return true;
  });
};


// utils/sortExpenses.js

export const sortExpenses = (expenses, sortBy) => {
  if (!expenses || expenses.length === 0) return [];

  return [...expenses].sort((a, b) => {
    if (sortBy === "amount") {
      return parseFloat(b.amount) - parseFloat(a.amount); // Descending
    }

    if (sortBy === "date" || sortBy === "createdAt") {
      const dateA = a[sortBy]?.toDate ? a[sortBy].toDate() : new Date(a[sortBy]);
      const dateB = b[sortBy]?.toDate ? b[sortBy].toDate() : new Date(b[sortBy]);
      return dateB - dateA; // Descending by date
    }

    return 0;
  });
};



