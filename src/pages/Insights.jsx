import './insights.css'
// import ExpenseChart from "../components/ExpenseChart";
import Navbar from '../components/Navbar';
import Charts from '../components/Charts';
import React, { useEffect, useState } from 'react'
import { fetchUserExpenses } from '../services/fetchData'
import { calculateTotalAmount, filterExpensesByDate } from '../services/helpers'
import { fetchPreferences } from '../services/updatePreferences';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import DownloadStatement from '../components/DownloadStatement';
import data from '../assets/data.webp'
import Navigator from '../components/Navigator';


const Insights = () => {  
      const [allExpenses, setAllExpenses]=useState([])
      const [displayExpenses, setDisplayExpenses]=useState([])
      const [insightData,setInsightData]=useState({totalExpense:''})
      const [date,setDate]=useState({from:'',to:''}) 
      const [userId, setUserId]=useState('')
      const [preferences, setPreferences]=useState(null)
      const [downloadModal,setDownloadModal]=useState(false)
  
      useEffect(()=>{
          const fetchExpenses=async()=>{
          const fetchedExpenses=await fetchUserExpenses()
          setAllExpenses(fetchedExpenses)
          setDisplayExpenses(fetchedExpenses)
      };fetchExpenses();
          
      },[])
  
      useEffect(()=>{
          const ref=filterExpensesByDate(date.from,date.to, allExpenses)
          setDisplayExpenses(ref)
        },[date])
  
      useEffect(()=>{
          const totalExpenseRef=calculateTotalAmount(displayExpenses)
          setInsightData({...insightData,totalExpense:totalExpenseRef})
      },[displayExpenses])


      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUserId(user.uid);
            try {
              const prefs = await fetchPreferences(user.uid);
              setPreferences(prefs);
            } catch (err) {
              console.error('Error fetching preferences:', err);
            }
          } else {
            console.log('User is not logged in');
          }
        });
    
        return () => unsubscribe(); // Cleanup on unmount
      }, []);

      const getLineChartData = () => {
    if (!displayExpenses || displayExpenses.length === 0) return [];

    const filtered = filteredExpenses;

    const dateToAmountMap = {};

    filtered.forEach(exp => {
      const dateKey = new Date(exp.date).toISOString().split('T')[0]; // 'YYYY-MM-DD'
      if (!dateToAmountMap[dateKey]) dateToAmountMap[dateKey] = 0;
      dateToAmountMap[dateKey] += Number(exp.amount); // ensure it's a number
    });

    const chartData = Object.entries(dateToAmountMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => ({
        date,
        amount: Number(amount),
      }));


    return chartData;
  };

  return (
    <>
      <div><Navbar/></div>
      <Navigator  preferences={preferences}/>

      {downloadModal&&
        <div className='download-div'><DownloadStatement setDownloadModal={setDownloadModal} preferences={preferences} allExpenses={allExpenses}/></div>}
      <div className='insight-navbar'>
        <div style={{display:'flex',justifyContent:'right',width:'90%'}}>{
          !downloadModal&&
          <button title='Download Statement' className='download-stmnt' onClick={()=>setDownloadModal(!downloadModal)}> <img src={data} alt="" /> </button>
          }</div>
      </div>
      <div style={{maxWidth:'90vw'}}>
      <h1 className='finance-report-h1' style={{ fontWeight:'500', textAlign:'center'}}>Financial Insights</h1>
      
      <Charts preferences={preferences} setDate={setDate} date={date} insightData={insightData} displayExpenses={displayExpenses} setDisplayExpenses={setDisplayExpenses}/>
    </div>
    </>
  )
}

export default Insights