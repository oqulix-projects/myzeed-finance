import React, { useEffect, useState } from 'react'
import './HomePage.css'
import Navbar from '../components/Navbar'
import ExpenseTable from '../components/ExpenseTable'
import Settings from '../components/Settings'
import { fetchPreferences } from '../services/updatePreferences'
import { auth } from '../firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import Navigator from '../components/Navigator'
import { fetchCompanyDetails } from '../services/fetchData'
import lg from "../assets/load2.gif";

const HomePage = () => {
    const [settingsView, setSettingsView] = useState(false)
    const [userId, setUserId] = useState(null);
    const [preferences, setPreferences]=useState(null)
    const [triggerRefresh, setTriggerRefresh]=useState(false)
    const [companyDetails,setCompanyDetails]=useState(null)
    

    
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
    }, [triggerRefresh]);

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
}, [triggerRefresh,userId]);

  
    
  return (
    <>
{preferences?<>
  <Navbar settingsView={settingsView} setSettingsView={setSettingsView}/>
  
  {settingsView==1&&
  <div className='settingsDiv'><Settings setTriggerRefresh={setTriggerRefresh} triggerRefresh={triggerRefresh} /></div>}
  <Navigator preferences={preferences}/>
   <div style={!settingsView?{filter:'blur(0px)'}:{filter:'blur(10px)'}}>
      <div >
        <div >
          {/* <h1 style={{fontSize:'25px', fontWeight:'100'}}>Track and optimize company expenses with ease.</h1> */}
        </div>
      </div>
      <ExpenseTable preferences={preferences}/>
      </div>
</>:
<> <div style={{ 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#fff" 
      }}>
        <img src={lg} alt="Loading..." width="600px" />
      </div></>
}
    </>
  )
}

export default HomePage