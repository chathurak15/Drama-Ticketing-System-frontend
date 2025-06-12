import React, { useState } from 'react';
import '../Login/Login.css';

const Register = ({ switchToSignIn, handleLogin, loginError }) => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(loginData);
  };

  return (
    <div className='flex justify-center items-center h-screen'>
        <div className='shadow-lg px-8 py-5 border w-96'>
            <form>
                <div className='mb-4'>
                    <label htmlFor="email" className='block text-gray-700'>Email</label>
                    <input type="email" placeholder='Enter your email' className='w-full px-3 py-2 border'/>
                </div>
                <div>
                    <label htmlFor="password" className='block text-gray-700'>Password</label>
                    <input type="password" placeholder='Enter your password' className='w-full px-3 py-2 border'/>
                </div>
                <br/>
                <button className="loginb">Login</button>
                <br/>
            </form>

            {loginError && <p className="text-red-500 mt-2">Invalid login</p>}
            <div className='text-center mt-4'> <p>Don't have an account?</p> 
                <span onClick={switchToSignIn} className='text-blue-600 cursor-pointer underline'>Register</span>
            </div>
        </div>
    </div>
  );
};

export default Register;