import { Route, Routes } from "react-router-dom"
import MyContextProvider from "./Components/context"

import Category from "./Pages/Category/Category"
import Home from "./Pages/Home"
import ScoreScreen from "./Pages/Score/ScoreScreen"

import { useState } from "react"
import { useEffect } from "react"
import Addition from "./Pages/SingleLevel/Addition"
import Subtraction from "./Pages/SingleLevel/Subtraction"
import Division from "./Pages/SingleLevel/Division"
import Multiplication from "./Pages/SingleLevel/Multiplication"
import Exponent from "./Pages/SingleLevel/Exponent"

function App() {
  const [nameInLocalStorage, setNameInLocalStorage] = useState("")

  useEffect(()=>{
    if (localStorage.getItem("math-game-react")) {
      setNameInLocalStorage(localStorage.getItem("math-game-react"))
    }
  }, [])

  return (
    <MyContextProvider>
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/category" element={<Category />} />
      <Route path="/category/addition" element={<Addition />} />
      <Route path="/category/subtraction" element={<Subtraction />} />
      <Route path="/category/division" element={<Division />} />
      <Route path="/category/multiplication" element={<Multiplication />} />
      <Route path="/category/exponent" element={<Exponent />} />
      <Route path="/Score" element={<ScoreScreen />} />
    </Routes>
   </>
   </MyContextProvider>
  )
}

export default App
