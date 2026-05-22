import { useRef } from "react"
import { useEffect } from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../Components/context"

function Home() {
  const {name, setNameFunction, playBgMusic} = useAuth()
  const [inputValue, setInputValue] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()
  const validatorRef=useRef()
  const inputRef = useRef()

  useEffect(()=>{
    if(localStorage.getItem("math-game-react")){
      setInputValue(localStorage.getItem("math-game-react"))
    }
    playBgMusic()
  }, [playBgMusic])

  function handleSubmit(e){
    e.preventDefault()

    if (inputValue.trim()) {
    setNameFunction(inputValue)
    localStorage.setItem("math-game-react", inputRef.current.value)
    playBgMusic() // Ensure music plays when they press start

    const usersData = JSON.parse(localStorage.getItem("math-game-users-data") || "[]")
    const existingUser = usersData.find(u => u.name.toLowerCase() === inputValue.trim().toLowerCase())
    if (!existingUser) {
      usersData.push({
        name: inputValue.trim(),
        scores: {}
      })
      localStorage.setItem("math-game-users-data", JSON.stringify(usersData))
    }

    navigate("/category")
    }else{
      validatorRef.current.classList.remove("hidden")
      setTimeout(() => {
        validatorRef.current.classList.add("hidden")
      }, 3000);

    }
    
  }

  function handleCopyJSON() {
    const dataStr = localStorage.getItem("math-game-users-data") || "[]"
    navigator.clipboard.writeText(JSON.stringify(JSON.parse(dataStr), null, 2))
      .then(() => alert("Data JSON berhasil disalin!"))
      .catch(() => alert("Gagal menyalin data JSON."))
  }

  function handleDownloadJSON() {
    const dataStr = localStorage.getItem("math-game-users-data") || "[]"
    const blob = new Blob([JSON.stringify(JSON.parse(dataStr), null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "math-game-scores.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="home-overlay">
      <div className="popup">
        
      <form
      onSubmit={(e)=>{
        handleSubmit(e)
      }}
      >
       <h2>Masukkan nama kamu</h2>

       <input 
       ref={inputRef}
       value={inputValue}
       onChange={(e)=> {
        validatorRef.current.classList.add("hidden")
        setInputValue(e.target.value)
      }}
       type="text" 
       placeholder="Ketik nama kamu di sini"/>

       <p 
       ref={validatorRef}
       className="validator hidden">Silakan masukkan nama kamu untuk melanjutkan 😁</p>

       <button type="submit">Mulai Bermain</button>
      </form>
      
      </div>

      <button className="floating-data-btn" onClick={() => setIsModalOpen(true)}>
        📊 Data JSON
      </button>

      {isModalOpen && (
        <div className="data-modal-overlay">
          <div className="data-modal">
            <h2>Basis Data Skor Pengguna (JSON)</h2>
            <div className="json-container">
              <pre>{JSON.stringify(JSON.parse(localStorage.getItem("math-game-users-data") || "[]"), null, 2)}</pre>
            </div>
            <div className="modal-actions">
              <button onClick={handleCopyJSON}>Salin JSON</button>
              <button onClick={handleDownloadJSON}>Unduh JSON</button>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home