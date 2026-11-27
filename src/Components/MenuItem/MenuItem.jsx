"use client";
import React from 'react'
import Link from "next/link";
import '../../assets/css/MenuItem.css'

function MenuItem(props) {

  const { linkurl,linktext, isButton } = props;
  return (
    <>
      <Link href={linkurl}>{
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