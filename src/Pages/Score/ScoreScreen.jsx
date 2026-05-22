import { useNavigate } from "react-router-dom"
import CSS from "../Score/ScoreScreen.css"
import { useAuth } from "../../Components/context"
import { useEffect, useLayoutEffect } from "react"

function ScoreScreen() {
    const navigate = useNavigate()
    const {name, globalScore, completedLevelName, globalHighScore, playBgMusic} = useAuth()

    useEffect(() => {
        playBgMusic()
    }, [playBgMusic])

    const categoryTranslation = {
        addition: "Penjumlahan",
        subtraction: "Pengurangan",
        multiplication: "Perkalian",
        division: "Pembagian",
        exponent: "Eksponen"
    }
    const translatedCategory = categoryTranslation[completedLevelName] || completedLevelName

    const nextLevelMap = {
        addition: "subtraction",
        subtraction: "multiplication",
        multiplication: "division",
        division: "exponent"
    }

    const nextLevel = nextLevelMap[completedLevelName]
    const hasNextLevel = !!nextLevel && globalScore === 100

    function backToCategoriesPage(){
        navigate("/category")
    }

    function playAgain(){
        window.history.back()
    }

    function nextLevelNavigation(){
        navigate(`/category/${nextLevel}`)
    }

    useLayoutEffect(()=>{
        document.body.classList = []
        if (completedLevelName == "addition") {
            document.body.classList.add('red')
        }else if(completedLevelName == "subtraction"){
            document.body.classList.add("blue")
        }else if(completedLevelName == "division"){
            document.body.classList.add("green")
        }else if(completedLevelName == "multiplication"){
            document.body.classList.add("purple")
        }else if(completedLevelName == "exponent"){
            document.body.classList.add("orange")
        }
    }, [])

  return (
    <main className="score-main">
        <p className="congrats">Selamat</p>

        <p className="done">Kerja bagus {name}, kamu baru saja menyelesaikan kategori {translatedCategory}!🚀</p>

        <div className="scores">
            <div className="current-score">
                <p>Skor</p>
                <p>{globalScore}</p>
            </div>

            <div className="high-score">
                <p>Skor Tertinggi</p>
                <p>{globalHighScore}</p>
            </div>
        </div>

        <div className="buttons">
            <button
            onClick={()=> playAgain()}
            >Main Lagi</button>

            {hasNextLevel && (
                <button
                onClick={()=> nextLevelNavigation()}
                >Level Berikutnya</button>
            )}

            <button
            onClick={()=> backToCategoriesPage()}
            >Menu Utama</button>
        </div>
    </main>
  )
}

export default ScoreScreen