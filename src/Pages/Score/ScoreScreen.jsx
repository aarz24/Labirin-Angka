import { useEffect, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useGame } from "../../Components/context"
import {
  CRYSTAL_XP,
  DIFFICULTIES,
  formatTime,
  isUnlocked,
  rankForXp,
  REALMS,
  shareText,
  starsForScore,
} from "../../Components/gameEngine"
import { Stars } from "../../Components/Level"
import Icon from "../../Components/Icon"

export default function ScoreScreen() {
  const { profile } = useGame()
  const navigate = useNavigate()
  const [shared, setShared] = useState("")
  useEffect(() => {
    if (!shared) return
    const timer = setTimeout(() => setShared(""), 2500)
    return () => clearTimeout(timer)
  }, [shared])
  const result = profile.lastResult
  if (!result) return <Navigate to="/category" replace />
  const index = REALMS.findIndex((realm) => realm.id === result.category)
  const realm = REALMS[index]
  const next = !result.daily && REALMS[index + 1]
  const nextAvailable = next && isUnlocked(profile, next.id)
  const stars = starsForScore(result.score)
  const rank = rankForXp(profile.xp)
  const leveledUp = rank.level > rankForXp(profile.xp - result.xp).level
  const share = async () => {
    const text = shareText(result)
    try {
      if (navigator.share) {
        await navigator.share({ text })
        setShared("Dibagikan!")
      } else {
        await navigator.clipboard.writeText(text)
        setShared("Tersalin ke papan klip")
      }
    } catch {
      setShared("")
    }
  }
  return (
    <main id="main-content" className="results-page">
      <section className="result-card">
        {stars > 0 && (
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <i key={i} style={{ "--x": `${(i * 37) % 100}%`, "--delay": `${(i % 7) * 0.15}s` }} />
            ))}
          </div>
        )}
        <p className="eyebrow">
          {result.daily
            ? "TANTANGAN HARIAN SELESAI"
            : `${realm.name.toUpperCase()} · PERJALANAN SELESAI`}
        </p>
        <div className="result-icon">
          <Icon name={stars === 3 ? "crown" : stars ? "trophy" : "leaf"} size={40} />
        </div>
        <h1>
          {stars === 3
            ? "Sebuah perjalanan sempurna."
            : stars
              ? "Bintangmu telah bersinar."
              : "Setiap langkah berarti."}
        </h1>
        <p>
          {profile.name}, kamu berhasil melewati kelima gerbang.
          <br />
          {stars
            ? "Simpan rasa ingin tahumu. Masih banyak yang menanti."
            : "Coba lagi dan raih skor 60 untuk mendapatkan bintang pertamamu."}
        </p>
        <div className="result-stars">
          <Stars count={stars} size={38} />
        </div>
        <div className="result-gates" aria-label={`${result.score / 20} dari 5 gerbang benar`}>
          {result.rounds.map((correct, gate) => (
            <span key={gate} className={correct ? "correct" : "wrong"}>
              <Icon name={correct ? "check" : "close"} size={14} />
            </span>
          ))}
        </div>
        {leveledUp && (
          <div className="result-levelup">
            <Icon name="crown" size={18} />
            Naik ke Level {rank.level} · {rank.name}
          </div>
        )}
        <div className="result-stats">
          <div>
            <strong>{result.score}</strong>
            <span>SKOR AKHIR / 100</span>
          </div>
          <div>
            <strong>+{result.xp}</strong>
            <span>XP DIPEROLEH</span>
          </div>
          <div>
            <strong>{formatTime(result.seconds)}</strong>
            <span>WAKTU PERJALANAN</span>
          </div>
        </div>
        <div className="result-detail">
          <span>{result.score / 20} / 5 jawaban benar</span>
          <span>
            {result.crystals} kristal · +{result.crystals * CRYSTAL_XP} XP
          </span>
          <span>{result.hints} petunjuk</span>
          <span>{DIFFICULTIES.find((item) => item.id === result.difficulty)?.name}</span>
        </div>
        {nextAvailable && (
          <div className="result-unlock">
            <Icon name="flag" size={18} />
            Dunia berikutnya tersedia: {next.name}
          </div>
        )}
        {result.daily && result.xp === 0 && (
          <p className="modal-copy">
            XP harian sudah diklaim. Tantangan baru tersedia pukul 00.00 UTC.
          </p>
        )}
        <div className="result-actions">
          {nextAvailable && (
            <button className="button primary" onClick={() => navigate(`/category/${next.id}`)}>
              Jelajahi {next.name}
              <Icon name="arrow" size={16} />
            </button>
          )}
          <button
            className={`button ${nextAvailable ? "secondary" : "primary"}`}
            onClick={() => navigate(result.daily ? "/daily/play" : `/category/${result.category}`)}
          >
            <Icon name="reset" size={16} />
            Jelajahi lagi
          </button>
          <button className="button ghost" onClick={share}>
            <Icon name="share" size={16} />
            {shared || "Bagikan hasil"}
          </button>
        </div>
        <Link className="result-home" to="/category">
          <Icon name="compass" size={15} />
          Kembali ke peta petualangan
        </Link>
      </section>
    </main>
  )
}
