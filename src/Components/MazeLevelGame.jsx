import x from "../assets/x.svg"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./context"
import MazeCanvas from "./MazeCanvas"
import ding from "../assets/game ding.mp3"
import wrong from "../assets/fail.mp3"

function MazeLevelGame({
  levelName,
  bodyClass,
  themeColor = "#00e5ff",
  createQuestion,
  renderQuestion,
  totalQuestions = 5,
}) {
  const [question, setQuestion] = useState(() => createQuestion())
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [score, setScore] = useState(0)
  const [overlayState, setOverlayState] = useState(null)
  const navigate = useNavigate()
  const { setGlobalScore, setCompletedLevelName, setGlobalHighScore, updateUserHighScore, stopBgMusic } = useAuth()
  const audioCorrectRef = useRef()
  const audioWrongRef = useRef()

  useLayoutEffect(() => {
    document.body.classList = []
    document.body.classList.add(bodyClass)
    setCompletedLevelName(levelName)
  }, [bodyClass, levelName, setCompletedLevelName])

  useEffect(() => {
    stopBgMusic()
  }, [stopBgMusic])

  useEffect(() => {
    setQuestion(createQuestion())
    setCurrentQuestion(1)
    setScore(0)
    setOverlayState(null)
  }, [createQuestion])

  function playSoundEffect(soundEffectRef) {
    soundEffectRef.current.currentTime = 0

    if (soundEffectRef === audioWrongRef) {
      soundEffectRef.current.play()
      setTimeout(() => {
        soundEffectRef.current.pause()
      }, 2000)
    } else {
      soundEffectRef.current.play()
    }
  }

  function highScoreSetter(currentScore) {
    const prevHs = localStorage.getItem(`math-game-hs-${levelName}`)
    updateUserHighScore(levelName, currentScore)

    if (prevHs == null) {
      setGlobalHighScore(currentScore)
      localStorage.setItem(`math-game-hs-${levelName}`, currentScore)
    } else if (currentScore >= prevHs) {
      localStorage.setItem(`math-game-hs-${levelName}`, currentScore)
      setGlobalHighScore(currentScore)
    } else {
      setGlobalHighScore(prevHs)
    }
  }

  function finishGame(finalScore) {
    setGlobalScore(finalScore)
    highScoreSetter(finalScore)
    navigate("/score")
  }

  function goToNextQuestion() {
    if (currentQuestion === totalQuestions) {
      finishGame(score)
      return
    }

    setQuestion(createQuestion())
    setCurrentQuestion((previous) => previous + 1)
    setOverlayState(null)
  }

  function handleAnswer(selectedAnswer) {
    if (overlayState) {
      return
    }

    if (selectedAnswer === question.correctAnswer) {
      playSoundEffect(audioCorrectRef)
      const nextScore = score + 20

      if (currentQuestion === totalQuestions) {
        finishGame(nextScore)
        return
      }

      setScore(nextScore)
      setQuestion(createQuestion())
      setCurrentQuestion((previous) => previous + 1)
      return
    }

    playSoundEffect(audioWrongRef)
    setOverlayState({
      selectedAnswer,
      correctAnswer: question.correctAnswer,
    })
  }

  function leaveGameConfirmation() {
    const leaveGame = confirm("Apakah kamu yakin ingin meninggalkan permainan?")
    if (leaveGame) {
      navigate("/category")
    }
  }

  return (
    <main className="gameplay-main">
      <audio ref={audioCorrectRef} src={ding} />
      <audio ref={audioWrongRef} src={wrong} />

      <div className="x-container">
        <img
          src={x}
          onClick={() => leaveGameConfirmation()}
          alt="exit game"
          className="cancel"
        />
      </div>

      <p className="progress">
        Pertanyaan {currentQuestion} dari {totalQuestions}
      </p>

      <p className="question">
        {renderQuestion(question)}
      </p>

      <p className="maze-instruction">
        Tarik garis dari tengah ke garis akhir yang benar.
      </p>

      <div className="maze-container">
        <MazeCanvas
          answers={question.answers}
          correctAnswer={question.correctAnswer}
          onAnswer={handleAnswer}
          themeColor={themeColor}
        />
      </div>

      <div className="maze-progress-text">
        Skor: {score}
      </div>

      <div className={`overlay ${overlayState ? "visible" : ""}`}>
        <div className="score-showcase">
          <p>
            Oops, garis akhir itu salah. Jawaban untuk {renderQuestion(question)} sebenarnya adalah
            <span> {overlayState?.correctAnswer}</span>
          </p>

          <button
            onClick={() => {
              goToNextQuestion()
            }}
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </main>
  )
}

export default MazeLevelGame