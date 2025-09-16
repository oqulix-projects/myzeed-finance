import React, { useState } from "react";
import "./AddExpenseModal.css";
import { auth, db } from "../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import Swal from "sweetalert2";

const AddExpenseModal = ({ isOpen, onClose, onExpenseAdded, preferences = {} }) => {
  if (!isOpen) return null;

  const [expenseDetails, setExpenseDetails] = useState({
    date: "",
    amount: "",
    remarks: "",
  });

  const closeModal = () => {
    setExpenseDetails({ date: "", amount: "", remarks: "" });
    onClose();
  };

  const user = auth.currentUser;
  const userId = user ? user.uid : null;
  console.log(userId);
  

  const addExpense = async (event) => {
    event.preventDefault();

    if (!userId) {
      alert("Error!!! Login to continue");
      return;
    }

    const { date, amount } = expenseDetails;
    const requiredKeys = Object.keys(preferences?.fields || {});

    const isFormIncomplete =
      !date || !amount ;

    if (isFormIncomplete) {
      alert("Fill the form completely");
      return;
    }
    const financeId='financialData'
    try {
const expenseRef = collection(db, "userData", userId, "finances", financeId, "expenses");   
   await addDoc(expenseRef, {
        userID: user.uid,
        ...expenseDetails,
        createdAt: new Date(),
      });

      Swal.fire({
        icon: "success",
        title: "✔️ Expense Added!",
        showConfirmButton: false,
        timer: 800,
      });

      onExpenseAdded();
    } catch (error) {
      console.log("Error while adding expense", error);
      Swal.fire({
        icon: "error",
        title: "❌ Error Adding Expense",
        showConfirmButton: false,
        timer: 800,
      });
    }
  };

  //   const handleUpload = async (e) => {
  //   const file = e.target.files[0];
  //   const text = await file.text();
  //   const data = JSON.parse(text);
  //   const financeId='financialData'
  //   const ref = collection(db, "userData", userId, "finances", financeId, "expenses");

  //   for (const item of data) await addDoc(ref, item);
  //   alert("Uploaded!");
  // };


  return (
    <div className="modal-overlay">
          {/* <input type="file" accept=".json" onChange={handleUpload} /> */}

      <div className="modal-content">
        <h2>Add Debited Amount</h2>
        <form className="expense-form">
          
            <input
              onChange={(e) =>
                setExpenseDetails({ ...expenseDetails, date: e.target.value })
              }
              type="date"
              className="input-field"
            />

  
              {/* Dropdowns from preferences.fields */}
              {preferences && preferences.fields &&
                Object.entries(preferences.fields)
                  .filter(([_, values]) => Array.isArray(values) && values.length > 0)
                  .map(([key, values]) => (
                    <select
                      key={key}
                      onChange={(e) =>
                        setExpenseDetails((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="input-field-select"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select {key}
                      </option>
                      {values.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ))}

          

        
            <input
              onChange={(e) =>
                setExpenseDetails({
                  ...expenseDetails,
                  amount: e.target.value,
                })
              }
              type="number"
              placeholder="Amount"
              className="input-field"
            />
         

        
            <input
              onChange={(e) =>
                setExpenseDetails({
                  ...expenseDetails,
                  remarks: e.target.value,
                })
              }
              type="text"
              placeholder="Remarks"
              className="input-field remarks"
            />
        

          
        </form>
        <div className="button-container">
            <button type="button" className="cancel-button" onClick={closeModal}>
              Cancel
            </button>
            <button className="add-button" onClick={addExpense}>
              Add Expense
            </button>
          </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
