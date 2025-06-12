import React from 'react'
import Header from '../Header/Header'
import Body from '../Body/Body'
import Footer from '../Footer/Footer'
import AuthPage from '../Login/AuthPage'

function Login() {
  return (
    <>
    <div id="wrapper">
        <Header />
        <Body>
          <div>
            <AuthPage/>
          </div>
          <br/>
          <div>
            <Footer/>
          </div>
        </Body>
    </div>
    </>
  )
}

export default Login