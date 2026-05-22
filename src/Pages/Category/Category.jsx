import CSS from "../Category/Category.css"
import Level from "../../Components/Level"
import { useAuth } from "../../Components/context"
import { useEffect } from "react"

function Category() {
    const levels = [
        {name: "addition", displayName: "Penjumlahan", display: "2+2", color:"red"},
        {name: "subtraction", displayName: "Pengurangan", display: "4-1", color:"blue"},
        {name: "multiplication", displayName: "Perkalian", display: "2X2", color:"purple"},
        {name: "division", displayName: "Pembagian", display: "10/5", color:"green"},
        {name: "exponent", displayName: "Eksponen", display: "2³", color:"orange"}
    ]
    
    const levelCircles = levels.map((level, index)=>{
        const isLocked = index > 0 && Number(localStorage.getItem(`math-game-hs-${levels[index - 1].name}`)) !== 100;
        return <Level 
        levelName={level.name} 
        levelDisplay={level.display}
        levelDisplayName={level.displayName}
        color={level.color}
        key={level.name}
        isLocked={isLocked}
        />
    })

    const {name, setNameFunction, playBgMusic} = useAuth()

    useEffect(() => {
        playBgMusic()
    }, [playBgMusic])


  return (
    <main className='categories-main'>
        <div className="top">
            <p>Halo {name} 👋<br />
             Silakan pilih kategori yang ingin kamu mainkan</p>
        </div>
        

        <div className="categories-body">
            <h1>Kategori</h1>

        <div className="categories-container">
            {levelCircles}
            
            </div>
            
        </div>
    </main>
  )
}

export default Category