import { useCallback, useEffect, useRef, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { useGame } from "./context"
import {
  createRun,
  dayKey,
  DIFFICULTIES,
  DIRECTIONS,
  formatTime,
  isUnlocked,
  REALMS,
} from "./gameEngine"
import MazeCanvas from "./MazeCanvas"
import Modal from "./Modal"
import Icon from "./Icon"

export default function MazeLevelGame({ daily = false }) {
  const { category = "addition" } = useParams()
  const { profile, finishRun, playTone } = useGame()
  const navigate = useNavigate()
  const [settings] = useState(() => {
    const date = dayKey()
    const id = crypto.randomUUID()
    const difficulty = daily ? "adventure" : profile.difficulty
    return {
      id,
      date,
      difficulty,
      rounds: createRun(category, difficulty, daily ? `daily-v1-${date}` : id, daily),
    }
  })
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [paused, setPaused] = useState(false)
  const [exitTo, setExitTo] = useState("/category")
  const [seconds, setSeconds] = useState(0)
  const [hint, setHint] = useState(false)
  const [hints, setHints] = useState(0)
  const [resetToken, setResetToken] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const controls = useRef(null)
  const submitted = useRef(false)
  const finishing = useRef(false)
  const score = results.filter(Boolean).length * 20
  const realm = REALMS.find(
    (item) => item.id === (daily ? settings.rounds[index].question.category : category),
  )
  const difficulty = DIFFICULTIES.find((item) => item.id === settings.difficulty)
  const round = settings.rounds[index]

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused && !feedback && !document.hidden && !document.querySelector("dialog[open]"))
        setSeconds((previous) => previous + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [paused, feedback])

  useEffect(() => {
    const visibility = () => {
      if (document.hidden) setPaused(true)
    }
    const keydown = (event) => {
      if (event.key === "Escape" && !document.querySelector("dialog[open]")) {
        event.preventDefault()
        setPaused(true)
      }
    }
    const beforeUnload = (event) => {
      if (!finishing.current) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    const navigateAway = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      if (!(event.target instanceof Element)) return
      const link = event.target.closest("a[href]")
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.hash ||
        link.origin !== window.location.origin
      )
        return
      event.preventDefault()
      event.stopPropagation()
      setExitTo(link.pathname)
      setPaused(true)
    }
    document.addEventListener("visibilitychange", visibility)
    window.addEventListener("keydown", keydown)
    window.addEventListener("beforeunload", beforeUnload)
    document.addEventListener("click", navigateAway, true)
    return () => {
      document.removeEventListener("visibilitychange", visibility)
      window.removeEventListener("keydown", keydown)
      window.removeEventListener("beforeunload", beforeUnload)
      document.removeEventListener("click", navigateAway, true)
    }
  }, [])

  const handleAnswer = useCallback(
    (answer) => {
      if (submitted.current) return
      submitted.current = true
      const correct = answer === round.question.correctAnswer
      const nextStreak = correct ? streak + 1 : 0
      setStreak(nextStreak)
      setBestStreak((previous) => Math.max(previous, nextStreak))
      setResults((previous) => [...previous, correct])
      setFeedback({ correct, answer })
      playTone(correct)
    },
    [playTone, round.question.correctAnswer, streak],
  )

  function nextRound() {
    if (index === 4) {
      if (finishing.current) return
      finishing.current = true
      finishRun({
        id: settings.id,
        category,
        difficulty: settings.difficulty,
        score,
        seconds,
        hints,
        bestStreak,
        daily,
        date: settings.date,
        xp: 0,
      })
      navigate("/score", { replace: true })
    } else {
      submitted.current = false
      setIndex((previous) => previous + 1)
      setFeedback(null)
      setHint(false)
      setResetToken(0)
    }
  }

  if (!realm || (!daily && !isUnlocked(profile, category)))
    return <Navigate to="/category" replace />

  return (
    <main id="main-content" className="game-page" style={{ "--realm-color": realm.color }}>
      <div className="game-breadcrumb">
        <button
          className="button ghost"
          onClick={() => {
            setExitTo("/category")
            setPaused(true)
          }}
        >
          <Icon name="arrow" className="back-icon" size={14} />
          Peta petualangan
        </button>
        <span className="game-world-label">
          <span />
          {daily ? "Tantangan Harian" : realm.operation} · {difficulty.name}
        </span>
      </div>
      <div className="game-topbar">
        <div className="game-realm-title">
          <h1>{realm.name}</h1>
          <small>
            {daily ? `Ekspedisi harian · ${settings.date}` : "Ikuti cahayamu. Temukan jawabanmu."}
          </small>
        </div>
        <div className="game-metrics">
          <span>
            <Icon name="star" size={18} />
            {score}
            <small>poin</small>
          </span>
          <span>
            <Icon name="clock" size={18} />
            {formatTime(seconds)}
          </span>
          <button
            className="icon-button"
            onClick={() => {
              setExitTo("/category")
              setPaused(true)
            }}
            aria-label="Jeda permainan"
          >
            <Icon name="pause" size={20} />
          </button>
        </div>
      </div>
      <div className="game-columns">
        <section className="maze-panel">
          <div className="question-heading">
            <p className="eyebrow">
              GERBANG {index + 1} DARI 5 · {realm.operation.toUpperCase()}
            </p>
            <h2>
              {round.question.expression} = <span>?</span>
            </h2>
            <p>Hitung jawabannya, lalu temukan jalan ke gerbangnya.</p>
          </div>
          <div className="round-dots" aria-label={`${results.length} dari 5 soal dijawab`}>
            {[0, 1, 2, 3, 4].map((item) => (
              <span
                key={item}
                className={`round-dot ${item < results.length ? (results[item] ? "correct" : "wrong") : item === index ? "current" : ""}`}
              />
            ))}
          </div>
          <MazeCanvas
            key={index}
            grid={round.maze}
            question={round.question}
            onAnswer={handleAnswer}
            disabled={paused || Boolean(feedback)}
            hint={hint}
            resetToken={resetToken}
            controlsRef={controls}
          />
        </section>
        <aside className="game-sidebar">
          <section className="game-side-card">
            <h3>
              <Icon name="compass" size={17} />
              Kendalikan cahayamu
            </h3>
            <p>Panah / WASD, tombol arah, atau geser melalui lorong.</p>
            <div className="d-pad">
              {DIRECTIONS.map((direction, i) => (
                <button
                  key={direction.key}
                  className={`direction-${i}`}
                  aria-label={`Gerak ${direction.label.toLowerCase()}`}
                  disabled={paused || Boolean(feedback)}
                  onClick={() => controls.current?.(i)}
                >
                  <Icon name="arrow" size={16} />
                </button>
              ))}
            </div>
            <p className="control-note">
              Dinding menghalangi jalan.
              <br />
              Kamu selalu bisa kembali.
            </p>
            <button
              className="button ghost"
              disabled={paused || Boolean(feedback)}
              onClick={() => setResetToken((previous) => previous + 1)}
            >
              <Icon name="reset" size={14} />
              Kembali ke tengah
            </button>
          </section>
          <section className="game-side-card">
            <h3>
              <Icon name="bulb" size={17} />
              Sedikit cahaya bantuan
            </h3>
            <p>
              {hint
                ? "Ikuti garis putus-putus menuju gerbang yang benar."
                : "Tersesat? Terangi jalur menuju jawaban yang benar."}
            </p>
            <button
              className="button secondary"
              disabled={hint || paused || Boolean(feedback)}
              onClick={() => {
                setHint(true)
                setHints((previous) => previous + 1)
              }}
            >
              <Icon name={hint ? "check" : "bulb"} size={15} />
              {hint ? "Jalur diterangi" : "Petunjuk · −10 XP"}
            </button>
            <p className="control-note">
              Pengurangan XP sebelum pengali {difficulty.multiplier}×.
              <br />
              Skor dan bintang tetap sama.
            </p>
          </section>
          <section className="game-side-card streak-card">
            <h3>
              <Icon name="fire" size={17} />
              Api semangat
            </h3>
            <div className="streak-value">
              {streak}
              <small>jawaban beruntun</small>
            </div>
            <p>
              Jawaban beruntun terbaik memberi bonus 5 XP per jawaban sebelum pengali kesulitan.
            </p>
            <div className="journey-score">
              {[1, 2, 3, 4, 5].map((item) => (
                <span key={item} className={item <= streak ? "filled" : ""} />
              ))}
            </div>
          </section>
        </aside>
      </div>
      <p className="game-footnote">
        Tidak perlu terburu-buru. Setiap jalan yang salah adalah bagian dari belajar.
      </p>
      {feedback && !paused && (
        <Modal
          title={
            feedback.correct
              ? streak > 1
                ? `${streak} jawaban beruntun!`
                : "Jalan yang tepat!"
              : "Belum tepat. Terus jelajahi."
          }
          className="feedback-modal"
        >
          <div className={`feedback-emblem ${feedback.correct ? "" : "incorrect"}`}>
            <Icon name={feedback.correct ? "check" : "leaf"} size={38} />
          </div>
          <p className="modal-copy">
            {feedback.correct
              ? "Satu gerbang lagi terbuka. Rasa ingin tahumu membawa hasil."
              : `Gerbang pilihanmu bernilai ${feedback.answer}. Lihat jawabannya, lalu coba tantangan berikutnya.`}
          </p>
          <div className="feedback-equation">
            {round.question.expression} = {round.question.correctAnswer}
          </div>
          {feedback.correct && (
            <div className="feedback-gain">+20 poin · Teruskan petualanganmu</div>
          )}
          <button className="button primary full-width" onClick={nextRound}>
            {index === 4 ? "Lihat hasil perjalanan" : "Ke gerbang berikutnya"}
            <Icon name="arrow" size={18} />
          </button>
        </Modal>
      )}
      {paused && (
        <Modal title="Tarik napas. Labirin bisa menunggu." onClose={() => setPaused(false)}>
          <p className="modal-copy">
            Waktu berhenti selama jeda. Melanjutkan akan membawamu kembali ke posisi terakhir. Jika
            keluar, perjalanan yang belum selesai tidak disimpan.
          </p>
          <div className="pause-actions">
            <button className="button primary" onClick={() => setPaused(false)}>
              <Icon name="play" size={17} />
              Lanjutkan perjalanan
            </button>
            <button
              className="button ghost"
              onClick={() => {
                finishing.current = true
                navigate(exitTo)
              }}
            >
              Keluar dari perjalanan
            </button>
          </div>
        </Modal>
      )}
    </main>
  )
}
