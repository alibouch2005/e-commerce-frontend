import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { getUser, logout } from "../services/authService";




export function AuthProvider({ children }) {

  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);

useEffect(()=>{

  getUser()
    .then(res=>{
      setUser(res.data);
    })
    .catch((err)=>{

      if(err.response?.status === 401){
        setUser(null);
      }else{
        console.error(err);
      }

    })
    .finally(()=>{
      setLoading(false);
    });

},[])

  const handleLogout = async ()=>{

    await logout();

    setUser(null);

  };

  return(

    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout:handleLogout,
        loading
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}