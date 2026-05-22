import React from 'react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Level({levelName, levelDisplay, levelDisplayName, isLocked}) {
    const navigate = useNavigate()
    const btnRef = useRef()


    function handleClick(name){
        if (isLocked) return;
        btnRef.current.classList.add(`active-${name}`)
        setTimeout(() => {
             navigate(`/category/${levelName}`)
        }, 500);
       
    }


  return (
    <div 
    onClick={()=>handleClick(levelName)}
    className={`${levelName} ${isLocked ? "locked-level" : ""}`}>

        <div
        ref={btnRef}
        className={`${levelName}-circle`}>
            <p>{isLocked ? "🔒" : levelDisplay}</p>
            </div>
                <p>{levelDisplayName}</p>
            </div>
  )
}

export default Level