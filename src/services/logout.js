// logout.js
import { getAuth, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const logoutUser = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      try {
    await signOut(auth);
    
    // Optional: redirect to login page
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
  }
};
}

export default logoutUser;
