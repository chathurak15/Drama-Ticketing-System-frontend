import React, { useState } from 'react';
import '../Login/Login.css';

function SignIn({ switchToRegister, handleRegister }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    handleRegister(formData);
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='shadow-lg px-8 py-4 border w-150'>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="text" className='block text-gray-700'>First Name</label>
                <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required  className='w-full px-3 py-2 border' />
            </div>
            <br/>
            <div>
                <label htmlFor="text" className='block text-gray-700'>Last Name</label>
                <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required  className='w-full px-3 py-2 border'/>
            </div>
            <br/>
            <div>
                <label htmlFor="email" className='block text-gray-700'>Email</label>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required  className='w-full px-3 py-2 border'/>
            </div>
            <br/>
            <div>
                <label htmlFor="tel" className='block text-gray-700'>Mobile Number</label>
                <input type="tel" name="mobileNumber" placeholder="Mobile Number" value={formData.mobileNumber} onChange={handleChange} required  className='w-full px-3 py-2 border'/>
            </div>
            <br/>
            <div>
                <label htmlFor="password" className='block text-gray-700'>Password</label>
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required  className='w-full px-3 py-2 border '/>
            </div>
            <br/>
            <div>
                <label htmlFor="confirmPassword" className='block text-gray-700'>Confirm Password</label>
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required  className='w-full px-3 py-2 border' />
            </div>
            <br/>
            <div>
                <select  className='w-full px-3 py-2 border'>
                    <option value="">Select Your Role</option>
                    <option value="user">User</option>
                    <option value="theartreManager">Theartre Manager</option>
                    <option value="organizer">Organizer</option>
                </select>
            </div>
            <br/>
            <button type="submit" className="loginb">Register & Login</button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{" "}
          <span onClick={switchToRegister} className="text-blue-600 cursor-pointer underline">Login</span>
        </p>
      </div>
    </div>
  );
}

export default SignIn;