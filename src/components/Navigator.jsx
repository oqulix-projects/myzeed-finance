import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navigator.css'
import img from '../assets/image.png'
import { fetchCompanyDetails } from '../services/fetchData'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebaseConfig'


const Navigator = ({preferences}) => {

  const [userId, setUserId] = useState(null);

   useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUserId(user.uid);
          } else {
            console.log('User is not logged in');
          }
        });
    
        return () => unsubscribe(); // Cleanup on unmount
      }, []);

  const [companyDetails,setCompanyDetails]=useState({})
   useEffect(() => {
    const getCompanyDetails = async () => {
      try {
        const companyDetailsRef = await fetchCompanyDetails(userId);
        setCompanyDetails(companyDetailsRef);
      } catch (err) {
        console.log(err);
      }
    };
  
    if (userId) {
      getCompanyDetails();
    }
  }, [userId]);

const location=useLocation()
  return (
    <>
    <div className='navigation'>
      <div className='navigation-buttons'>
        <Link to={'/'}><button className={`default-btn ${location.pathname === '/' ? 'active' : ''}`}>Overview</button></Link>
        <Link to={'/home/insights'}><button className={`default-btn ${location.pathname === '/home/insights' ? 'active' : ''}`}>Expense Insights</button></Link>
        <Link to={'/home/revenueinsights'}><button className={`default-btn ${location.pathname === '/home/revenueinsights' ? 'active' : ''}`}>Revenue Insights</button></Link>

      </div>
      <div className='comp-div'>
        <img className='company-logo' src={companyDetails?companyDetails.logo:img} alt="" />
                <h1 className='comp-name' style={{ fontWeight:'800'}}>{preferences&&preferences.cName || "Loading..."}</h1>
      </div>
    <div></div>
    </div>
    
    </>
  )
}

export default Navigator