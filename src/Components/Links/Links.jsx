import React from 'react'
import MenuItem from '../MenuItem/MenuItem'
import language from "/images/internet.png"

function Links() {
  return (
    <div className="flex items-center space-x-8 text-white">
      <MenuItem linktext="Home" linkurl="/" />
      <MenuItem linktext="Shows" linkurl="/shows" />
      <MenuItem linktext="Dramas" linkurl="/dramas" />
      {/* <MenuItem linktext="Actors" linkurl="/actors" /> */}
      <MenuItem linktext="Terms" linkurl="/terms" />
      <MenuItem linktext="Contact US" linkurl="/contact" />
      <MenuItem linktext = "Login" linkurl="/login" isButton={true}/>
      <MenuItem linktext = "Register" linkurl="/register" isButton={true}/>
      <button id="languagebtn" className="cursor-pointer"><img src = {language} className="h-9 w-auto"/></button>
    </div>
  )
}

export default Links