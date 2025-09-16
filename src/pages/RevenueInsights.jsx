import './insights.css'
// import ExpenseChart from "../components/ExpenseChart";
import Navbar from '../components/Navbar';
import Charts from '../components/Charts';
import React, { useEffect, useState } from 'react'
import { fetchOnlyRevenue, fetchUserRevenue } from '../services/fetchData'
import { calculateTotalAmount, filterExpensesByDate } from '../services/helpers'
import { fetchPreferences } from '../services/updatePreferences';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import DownloadStatement from '../components/DownloadStatement';
import data from '../assets/data.webp'
import Navigator from '../components/Navigator';
import RevenueChart from '../components/RevenueChart';

const RevenueInsights = () => {  
      const [allRevenue, setAllRevenue]=useState([])
      const [displayRevenue, setDisplayRevenue]=useState([])
      const [insightData,setInsightData]=useState({totalRevenue:''})
      const [date,setDate]=useState({from:'',to:''}) 
      const [userId, setUserId]=useState('')
      const [preferences, setPreferences]=useState(null)
      const [downloadModal,setDownloadModal]=useState(false)
  
      useEffect(()=>{
          const fetchRevenue=async()=>{
          const fetchedRevenue=await fetchOnlyRevenue()
          setAllRevenue(fetchedRevenue)
          setDisplayRevenue(fetchedRevenue)
      };fetchRevenue();
          
      },[])
  
      useEffect(()=>{
          const ref=filterExpensesByDate(date.from,date.to, allRevenue)
          setDisplayRevenue(ref)
        },[date])
  
      useEffect(()=>{
          const totalRevenueRef=calculateTotalAmount(displayRevenue)
          setInsightData({...insightData,totalRevenue:totalRevenueRef})
      },[displayRevenue])


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
    if (!displayRevenue || displayRevenue.length === 0) return [];

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
      
      <RevenueChart content={'Revenue'} preferences={preferences} setDate={setDate} date={date} insightData={insightData} displayRevenue={displayRevenue} />
    </div>
    </>
  )
}

export default RevenueInsights