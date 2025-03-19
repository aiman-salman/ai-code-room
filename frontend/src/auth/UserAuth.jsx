import React,{ useContext, useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import { jwtDecode } from 'jwt-decode';

const UserAuth = ({ children }) => {

    const user = useContext(UserContext)
    const [ loading, setLoading ] = useState(true)
    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    useEffect(() => {

      const checkTokenExpiration = () => {
        if(!token){
          navigate('/login');
          return;
        }

        try{
          const decodedToken = jwtDecode(token)
          if(decodedToken  && decodedToken.exp * 1000 < Date.now()){
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login')
          }else{
            if(!user){
              navigate('/login')
            }else{
              setLoading(false)
            }
          }
        }catch(error){
          console.error('Error decoding token: ', error);
          navigate('/login')
        }
      };
      checkTokenExpiration();
    },[user, token, navigate]);

    if(loading){
        return <div>Loading...</div>
    }

   
  return ( 
    <>
      {children}
    </>
  )
}

export default UserAuth
