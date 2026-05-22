import { useContext, useEffect, useRef, useState, createContext } from "react";
import bgMusicFile from "../assets/lagu-matematika.mp3";

export const ContextContainer = createContext()

const MyContextProvider = ({children}) => {
    const [name, setName] = useState(()=> localStorage.getItem("math-game-react"))
    const [globalScore, setGlobalScore] = useState(0)
    const [globalHighScore, setGlobalHighScore] = useState(0)
    const [completedLevelName, setCompletedLevelName] = useState("")
    const bgAudioRef = useRef(null)
    const shouldPlayRef = useRef(false)

    const playBgMusic = () => {
        shouldPlayRef.current = true
        if (!bgAudioRef.current) {
            bgAudioRef.current = new Audio(bgMusicFile)
            bgAudioRef.current.loop = true
            bgAudioRef.current.volume = 0.35
        }
        if (bgAudioRef.current.paused) {
            bgAudioRef.current.play().catch(err => {
                console.log("Autoplay blocked, will play on user interaction:", err)
            })
        }
    }

    const stopBgMusic = () => {
        shouldPlayRef.current = false
        if (bgAudioRef.current && !bgAudioRef.current.paused) {
            bgAudioRef.current.pause()
        }
    }

    useEffect(() => {
        const handleInteraction = () => {
            if (shouldPlayRef.current && bgAudioRef.current && bgAudioRef.current.paused) {
                bgAudioRef.current.play().catch(err => {
                    console.log("Interaction play failed:", err)
                })
            }
        }
        window.addEventListener("click", handleInteraction)
        window.addEventListener("keydown", handleInteraction)

        return () => {
            window.removeEventListener("click", handleInteraction)
            window.removeEventListener("keydown", handleInteraction)
            if (bgAudioRef.current) {
                bgAudioRef.current.pause()
                bgAudioRef.current = null
            }
        }
    }, [])

    function setNameFunction(playersName){
        setName(playersName)
    }

    function updateUserHighScore(category, score) {
        if (!name) return;
        const usersData = JSON.parse(localStorage.getItem("math-game-users-data") || "[]");
        let user = usersData.find(u => u.name.toLowerCase() === name.trim().toLowerCase());
        if (!user) {
            user = { name: name.trim(), scores: {}, lastScore: null, lastCategory: null, lastPlayedAt: null };
            usersData.push(user);
        }
        // Update high score per category
        const prevScore = user.scores[category] || 0;
        if (score > prevScore) {
            user.scores[category] = score;
        }
        // Always update last score info (most recent game played)
        user.lastScore = score;
        user.lastCategory = category;
        user.lastPlayedAt = new Date().toISOString();
        localStorage.setItem("math-game-users-data", JSON.stringify(usersData));
        console.log("📊 CURRENT USERS SCORE DATA JSON:", JSON.stringify(usersData, null, 2));
    }

    return(
        <ContextContainer.Provider value={{name, setNameFunction, globalScore, setGlobalScore, globalHighScore, setGlobalHighScore, completedLevelName, setCompletedLevelName, updateUserHighScore, playBgMusic, stopBgMusic}}>
            {children}
        </ContextContainer.Provider>
    )
}

export function useAuth(){
    return useContext(ContextContainer)
}

export default MyContextProvider