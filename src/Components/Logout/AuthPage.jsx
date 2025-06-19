import React, { useState } from 'react';
import SignIn from '../Pages/Login';
import Register from '../Pages/Register';
import Profile from './Profile';

function AuthPage() {
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginError, setLoginError] = useState(false);

  const handleRegister = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    setLoggedInUser(newUser); // Auto login after registration
  };

  const handleLogin = ({ email, password }) => {
    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );
    if (matchedUser) {
      setLoggedInUser(matchedUser);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (loggedInUser) {
    return <Profile user={loggedInUser} />;
  }

  return (
    <>
      {showLogin ? (
        <SignIn switchToSignIn={() => setShowLogin(false)} handleLogin={handleLogin} loginError={loginError} />
      ) : (
        <Register switchToRegister={() => setShowLogin(true)} handleRegister={handleRegister} />
      )}
    </>
  );
}

export default AuthPage;