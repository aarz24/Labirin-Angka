import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { readProfile, recordRun } from "./gameEngine"
import music from "../assets/lagu-matematika.mp3"

const GameContext = createContext(null)

export default function MyContextProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      return readProfile(window.localStorage)
    } catch {
      return readProfile({ getItem: () => null })
    }
  })
  const [saveError, setSaveError] = useState(false)
  const audio = useRef(null)
  const synth = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem("labirin-expedition-v1", JSON.stringify(profile))
      setSaveError(false)
    } catch {
      setSaveError(true)
    }
  }, [profile])

  const playTone = useCallback(
    (correct = true) => {
      if (!profile.sound) return
      try {
        synth.current ??= new AudioContext()
        const context = synth.current
        void context.resume().catch(() => {})
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(correct ? 523.25 : 220, context.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(
          correct ? 1046.5 : 110,
          context.currentTime + 0.18,
        )
        gain.gain.setValueAtTime(0.09, context.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35)
        oscillator.start()
        oscillator.stop(context.currentTime + 0.35)
      } catch {
        // Audio is optional on browsers without Web Audio support.
      }
    },
    [profile.sound],
  )

  const toggleSound = () => {
    const enabled = !profile.sound
    setProfile((previous) => ({ ...previous, sound: enabled }))
    if (enabled) {
      audio.current ??= new Audio(music)
      audio.current.loop = true
      audio.current.volume = 0.13
      void audio.current.play().catch(() => {})
    } else {
      audio.current?.pause()
    }
  }

  useEffect(() => {
    const resume = () => {
      if (!profile.sound || document.hidden) return
      audio.current ??= new Audio(music)
      audio.current.loop = true
      audio.current.volume = 0.13
      void audio.current.play().catch(() => {})
    }
    const visibility = () => (document.hidden ? audio.current?.pause() : resume())
    window.addEventListener("pointerdown", resume)
    window.addEventListener("keydown", resume)
    document.addEventListener("visibilitychange", visibility)
    return () => {
      window.removeEventListener("pointerdown", resume)
      window.removeEventListener("keydown", resume)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [profile.sound])

  useEffect(
    () => () => {
      audio.current?.pause()
      void synth.current?.close().catch(() => {})
    },
    [],
  )

  const finishRun = useCallback(
    (result) => setProfile((previous) => recordRun(previous, result)),
    [],
  )
  const updateProfile = (updates) => setProfile((previous) => ({ ...previous, ...updates }))

  return (
    <GameContext.Provider
      value={{ profile, updateProfile, finishRun, toggleSound, playTone, saveError }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
