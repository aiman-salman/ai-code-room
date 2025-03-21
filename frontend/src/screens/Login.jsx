import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { setUser } = useContext(UserContext);

  const navigate = useNavigate(); 

    function submitHandler(e){

        e.preventDefault();
        
        const apiUrl = import.meta.env.VITE_API_URL;

        axios.post(`${apiUrl}/users/login`,{
            email,
            password
        }).then((res) => {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setUser(res.data.user);

                navigate('/');
        }).catch((err) => {
            console.log(err.response.data);
            toast.error('Invalid credentials or user not found. Please try again.', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              draggable: true,
              progress: undefined,
              toastClassName: "Toastify__toast--error Toastify__icon--error custom-toast-icon",
            });
        })
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#243949] to-[#517fa4]">
      <div className="border border-black p-8 sm:p-4 md:p-8 rounded-lg shadow-lg w-full max-w-xs sm:max-w-md md:max-w-md bg-white/3 backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
        <form onSubmit={submitHandler}>
            <div className='mb-4'>
                <label className="block text-white mb-2">Email</label>
                <input
                onChange={(e) => setEmail(e.target.value)}
                type="email" id="email" className="w-full p-3 rounded-full bg-opacity-50 backdrop-blur-md caret-white text-white focus:outline-none focus:ring-1 focus:ring-[#243949]" placeholder="Enter your email"
                />
            </div>
            <div className='mb-4'>
                <label className='block text-white mb-2'>Password</label>
                <input
                onChange={(e) => setPassword(e.target.value)}
                type="password" id="password" className="w-full p-3 rounded-full bg-opacity-50 backdrop-blur-md caret-white text-white focus:outline-none focus:ring-1 focus:ring-[#243949]" placeholder="Enter your password"
                />
            </div>
            <button type='submit' className="w-full cursor-pointer p-2 rounded-full bg-[#243949] text-white text-lg hover:text-[#517fa4]"
            >
                Log In
            </button>
        </form>
        <p className="text-zinc-400 mt-4 text-center">
            Don't have an account? <Link to="/register" className="text-[#243949] hover:underline">Create one</Link>
        </p>
      </div>
      <ToastContainer
        toastClassName="Toastify__toast--info Toastify__icon--info custom-toast-icon"
        className="custom-toast-container"
      />
    </div>
  )
}

export default Login