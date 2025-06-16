import React from 'react'
import { Link } from "react-router-dom";
import '../MenuItem/MenuItem.css'

function MenuItem(props) {

  const { linkurl,linktext, isButton } = props;
  return (
    <>
      <Link to={linkurl}>{
        isButton ? (
          <button id="login" className="loginbtn">{linktext}</button>
        ) : (
          <span className="link-text">{linktext}</span>
        )
      }
      </Link>
    </>
  )
}

export default MenuItem