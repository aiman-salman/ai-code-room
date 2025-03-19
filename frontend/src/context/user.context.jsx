import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../config/axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const storedUser = JSON.parse(localStorage.getItem('user'));
    //     if (storedUser) {
    //         setUser(storedUser);
    //     }
    // }, []);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
    
        if (storedUser && token) {
          axios.get('/users/validate-token', {
            headers: { "Authorization": `Bearer ${token}` },
          })
            .then(response => {
              if (response.data.isValid) {
                setUser(storedUser); 
              } else {
                
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
                navigate('/login');
              }
            })
            .catch(() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              setUser(null);
              navigate('/login');
            })
            .finally(() => setLoading(false));
        } else {
          setLoading(false); 
        }
      }, []); 


      if (loading) return <div className='text-[#243949] font-bold text-2xl'>Loading...</div>;

    return(
        <UserContext.Provider value={{user, setUser}}>
            { children }
        </UserContext.Provider>
    );
};

