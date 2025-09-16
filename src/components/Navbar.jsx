import React, { useState } from 'react'
import OQLogo from '../assets/OQ.png'
import './navbar.css'
import setting from '../assets/setting.png'
import close from '../assets/close.png'
import logoutUser from '../services/logout'


const Navbar = ({settingsView,setSettingsView}) => {

  return (
    <>
     <div className='navmain'>
        <div className='logo'>
          <img src={OQLogo} alt="Oqulix Logo" />
          <h2 style={{margin:'10px'}}>Oqulix Finance</h2>
        </div>
        <div className='nav-actions'>
          <button className='settingButton'><img onClick={()=>settingsView?setSettingsView(false):setSettingsView(true)} src={settingsView?close:setting} alt="" /></button>
          <button  onClick={logoutUser}>Logout</button>
        </div>
        </div>   
    </>
  )
}

export default Navbar