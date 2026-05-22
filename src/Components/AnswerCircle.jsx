import { useRef, useState } from "react"

function AnswerCircle({answer, activeButton, setActiveButton, index}) {

    function handleClick(){
        setActiveButton(answer)
    }
  return (
    <div 
    onClick={()=> handleClick()}
    className={activeButton == answer? "answer active" : "answer"}>
        <p>{answer}</p>
        </div>
  )
}

export default AnswerCircle