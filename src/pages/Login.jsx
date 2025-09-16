import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Firebase Auth
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../assets/OQ.png";
import lg from "../assets/load2.gif"; // Import loading GIF

const Login = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(true); // Loading state for auth check
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {    
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); 
    } catch (error) {
      setError("Invalid email or password!");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/");
      } else {
        setLoading(false); // Only show login page after confirming user is not logged in
      }
    });

    return () => unsubscribe(); 
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#fff" 
      }}>
        <img src={lg} alt="Loading..." width="600px" />
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Oqulance Logo" style={{ width: "60px" }} />
        <h1 style={{ fontWeight: "300" }}>Oqulix Finance</h1>
        <p style={{ fontWeight: "100" }}>Track and optimize company expenses with ease.</p>
        <h2 style={{ fontWeight: "200" }}>Login to your account</h2>

        {error && <p className="error-message">{error}</p>}

        <form className="login-form" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            className="input-field" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
