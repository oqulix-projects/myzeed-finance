import React, { useState } from 'react'
import './addExpense.css'
import revenueImg from '../assets/revenue.png'
import addexp from '../assets/addexp.png'
import AddExpenseModal from './AddExpenseModal';
import AddRevenueModal from './AddRevenueModal';

const AddExpense = ({onExpenseAdded, preferences, setExpenseModalOpen, setRevenueModalOpen}) => {

  return (
    <>
    <div style={{display:'flex',flexDirection:'column'}}>
      <div className='addExp'>
      <button className='add' onClick={() => setExpenseModalOpen(true)} > <i className="fa-solid fa-arrow-up"></i> Add Debit</button>
      <button className='add' onClick={() => setRevenueModalOpen(true)} > <i className="fa-solid fa-arrow-down"></i> Add Credit</button>
      {/* <button className='add credit-add'>Add Credit</button> */}
      </div>

      {/* <AddExpenseModal onExpenseAdded={onExpenseAdded} isOpen={expenseModalOpen} preferences={preferences} onClose={() => setExpenseModalOpen(false)} />
      <AddRevenueModal onExpenseAdded={onExpenseAdded} isOpen={revenueModalOpen} preferences={preferences}  onClose={() => setRevenueModalOpen(false)}/> */}
    </div>
    </>
  )
}

export default AddExpense