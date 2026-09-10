import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useGame } from "../Components/context"
import { achievements, dayKey, DIFFICULTIES, isUnlocked, REALMS } from "../Components/gameEngine"
import Level from "../Components/Level"
import Icon from "../Components/Icon"
import Modal from "../Components/Modal"

export default function Home({ section = "adventure", onHelp }) {
  const { profile, updateProfile } = useGame()
  const [selected, setSelected] = useState(null)
  const [now, setNow] = useState(() => new Date())
  const navigate = useNavigate()
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  const totalStars = Object.values(profile.realms).reduce((total, realm) => total + realm.stars, 0)
  const explored = REALMS.filter((realm) => (profile.realms[realm.id]?.stars ?? 0) > 0).length
  const nextRealm =
    REALMS.find((realm) => isUnlocked(profile, realm.id) && !profile.realms[realm.id]?.stars) ??
    REALMS[0]
  const badges = achievements(profile)
  const todayDone = profile.dailyDates.includes(dayKey(now))
  const tomorrow = new Date(now)
  tomorrow.setUTCHours(24, 0, 0, 0)
  const remaining = Math.floor((tomorrow.getTime() - now.getTime()) / 1000)
  const countdown = `${String(Math.floor(remaining / 3600)).padStart(2, "0")}:${String(Math.floor(remaining / 60) % 60).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`
  const selectRealm = (realm) => setSelected(realm)

  return (
    <main id="main-content" className="dashboard">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">DUNIA ANGKA MENANTIMU</p>
          <h1>
            Selamat datang, {profile.name}
            <span className="welcome-dot">.</span>
          </h1>
        </div>
        <div className="quick-stats">
          <span>
            <Icon name="star" size={17} />
            <strong>{totalStars}</strong>
            <small>Bintang</small>
          </span>
          <span>
            <Icon name="fire" size={17} />
            <strong>{profile.xp}</strong>
            <small>Total XP</small>
          </span>
        </div>
      </div>

      {section === "adventure" && (
        <>
          <section className="hero" aria-label="Mulai petualangan">
            <img
              className="hero-art"
              src="/forest-expedition.webp"
              alt="Penjelajah berjubah kuning menemukan gerbang bercahaya di tengah labirin hutan"
              fetchPriority="high"
            />
            <div className="hero-shade" />
            <div className="hero-content">
              <span className="hero-badge">
                <span className="tiny-diamond" /> BUKAN SEKADAR ANGKA
              </span>
              <h2>
                Temukan jalan.
                <br />
                Taklukkan <em>angka.</em>
              </h2>
              <p>
                Di balik setiap labirin, ada cerita untuk ditemukan.
                <br className="desktop-break" /> Asah logikamu. Buka dunia baru. Jadilah legenda.
              </p>
              <div className="hero-buttons">
                <button className="button primary" onClick={() => selectRealm(nextRealm)}>
                  <Icon name="play" size={16} />
                  {profile.runs ? "Lanjutkan petualangan" : "Mulai petualangan"}
                  <Icon name="arrow" size={17} />
                </button>
                <button className="button ghost" onClick={onHelp}>
                  <Icon name="help" size={17} />
                  Cara bermain
                </button>
              </div>
              <div className="hero-features">
                <span>
                  <Icon name="compass" size={14} />5 dunia unik
                </span>
                <i />
                <span>
                  <Icon name="leaf" size={14} />
                  Belajar sambil menjelajah
                </span>
              </div>
            </div>
            <div className="hero-location">
              <span className="location-line" />
              <div>
                <small>PERJALANAN DIMULAI DI</small>
                <strong>Hutan Awal</strong>
              </div>
              <span className="coordinates">01 / 05</span>
            </div>
          </section>
          <section className="worlds-section" aria-labelledby="worlds-heading">
            <div className="section-heading">
              <div>
                <div className="section-kicker">
                  <span />
                  PETA PETUALANGAN
                </div>
                <h2 id="worlds-heading">Lima dunia. Tak terbatas cerita.</h2>
                <p>Mulai dari satu langkah. Buka dunia berikutnya dengan meraih bintang.</p>
              </div>
              <div className="difficulty-picker" role="group" aria-label="Kesulitan permainan">
                {DIFFICULTIES.map((item) => (
                  <button
                    key={item.id}
                    className={profile.difficulty === item.id ? "selected" : ""}
                    aria-pressed={profile.difficulty === item.id}
                    onClick={() => updateProfile({ difficulty: item.id })}
                  >
                    {item.id === "relaxed" && <Icon name="leaf" size={14} />}
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="realm-grid">
              {REALMS.map((realm, index) => (
                <Level key={realm.id} realm={realm} index={index} onSelect={selectRealm} />
              ))}
            </div>
          </section>
        </>
      )}

      {section === "daily" && (
        <section className="daily-feature">
          <div className="daily-feature-art" />
          <div className="daily-feature-copy">
            <span className="hero-badge">
              <Icon name="sun" size={16} />
              TANTANGAN HARIAN
            </span>
            <h2>
              Lima gerbang.
              <br />
              <em>Satu kesempatan bersinar.</em>
            </h2>
            <p>
              Satu soal dari setiap dunia. Labirin dan soal yang sama untuk semua penjelajah hari
              ini, dengan kesulitan Petualang.
            </p>
            <p className="daily-rule">
              Hadiah XP hanya untuk penyelesaian pertama setiap hari. Kamu selalu bisa berlatih
              kembali. Tantangan berganti pukul 00.00 UTC.
            </p>
            <button className="button primary" onClick={() => navigate("/daily/play")}>
              <Icon name={todayDone ? "reset" : "play"} size={17} />
              {todayDone ? "Berlatih lagi · tanpa XP" : "Terima tantangan"}
              <Icon name="arrow" size={18} />
            </button>
            <span className="daily-countdown">
              <Icon name="clock" size={16} />
              Tantangan baru dalam {countdown}
            </span>
          </div>
          <div className="daily-medallion">
            <Icon name="sun" size={64} />
            <span>{todayDone ? "SELESAI HARI INI" : "BONUS HARIAN"}</span>
            <strong>{todayDone ? <Icon name="check" size={45} /> : "+50 XP"}</strong>
            <small>{dayKey(now)}</small>
          </div>
        </section>
      )}

      {section === "achievements" && (
        <section className="achievements-section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">
                <span />
                JEJAK PERJALANANMU
              </div>
              <h2>Legenda dibangun selangkah demi selangkah.</h2>
              <p>
                {badges.filter((badge) => badge.unlocked).length} dari {badges.length} pencapaian
                ditemukan.
              </p>
            </div>
            <Icon name="trophy" size={42} />
          </div>
          <div className="achievement-grid">
            {badges.map((badge) => (
              <article
                key={badge.id}
                className={`achievement-card ${badge.unlocked ? "achieved" : ""}`}
              >
                <span className="achievement-emblem">
                  <Icon name={badge.icon} size={34} />
                </span>
                <span className="achievement-status">
                  {badge.unlocked ? (
                    <>
                      <Icon name="check" size={13} />
                      TERBUKA
                    </>
                  ) : (
                    <>
                      <Icon name="lock" size={13} />
                      BELUM TERBUKA
                    </>
                  )}
                </span>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="dashboard-bottom">
        <Link to={section === "daily" ? "/category" : "/daily"} className="daily-card">
          <span className="daily-icon">
            <Icon name={section === "daily" ? "compass" : "sun"} size={30} />
          </span>
          <div>
            <span className="eyebrow">
              {section === "daily" ? "PETUALANGANMU" : "SESUATU YANG BARU, SETIAP HARI"}
            </span>
            <h3>
              {section === "daily"
                ? "Dunia berikutnya menantimu."
                : todayDone
                  ? "Tantangan hari ini ditaklukkan."
                  : "Tantangan Harian"}
            </h3>
            <p>
              {section === "daily"
                ? "Kumpulkan bintang dan jelajahi kelima dunia."
                : "5 soal campuran. Labirin baru. Bonus +50 XP."}
            </p>
          </div>
          <div className="daily-card-end">
            {section !== "daily" && (
              <span>
                <Icon name="clock" size={13} />
                {countdown}
              </span>
            )}
            <Icon name="arrow" size={22} />
          </div>
        </Link>
        <section className="progress-card" aria-label="Progres penjelajah">
          <div className="progress-card-heading">
            <span className="progress-icon">
              <Icon name="flag" size={22} />
            </span>
            <h3>Jejak penjelajah</h3>
            <span>
              {explored}
              <small> / 5 dunia</small>
            </span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${explored * 20}%` }} />
          </div>
          <p>
            {explored === 5
              ? "Semua dunia terbuka. Saatnya meraih 15 bintang!"
              : "Perjalanan hebat dimulai dari rasa ingin tahu."}
          </p>
        </section>
      </div>
      <footer className="site-footer">
        <span>
          <Icon name="compass" size={15} />
          LABIRIN ANGKA<span className="footer-separator">/</span>Petualangan kecil, kemungkinan
          besar.
        </span>
        <span>
          <span className="online-dot" />
          Progres tersimpan di perangkat ini
        </span>
      </footer>

      {selected && (
        <Modal
          title={
            isUnlocked(profile, selected.id)
              ? `Jelajahi ${selected.name}`
              : `${selected.name} masih tersembunyi`
          }
          onClose={() => setSelected(null)}
        >
          <img
            className="realm-modal-art"
            src={`/realm-${REALMS.findIndex((realm) => realm.id === selected.id)}.webp`}
            alt=""
          />
          {isUnlocked(profile, selected.id) ? (
            <>
              <p className="modal-copy">
                Lima labirin {selected.operation.toLowerCase()} menantimu. Raih minimal 60 poin
                untuk mendapatkan bintang dan membuka dunia berikutnya.
              </p>
              <div className="difficulty-options">
                {DIFFICULTIES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateProfile({ difficulty: item.id })}
                    className={profile.difficulty === item.id ? "selected" : ""}
                    aria-pressed={profile.difficulty === item.id}
                  >
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.description}</small>
                    </span>
                    <span>{item.multiplier}× XP</span>
                  </button>
                ))}
              </div>
              <p className="gentle-note">
                <Icon name="leaf" size={15} />
                Tanpa batas waktu. Nikmati setiap langkah.
              </p>
              <button
                className="button primary full-width"
                onClick={() => navigate(`/category/${selected.id}`)}
              >
                Masuk ke labirin
                <Icon name="arrow" size={18} />
              </button>
            </>
          ) : (
            <>
              <p className="modal-copy">
                Raih satu bintang (skor 60) di{" "}
                <strong>
                  {REALMS[REALMS.findIndex((realm) => realm.id === selected.id) - 1]?.name}
                </strong>{" "}
                untuk membuka dunia ini.
              </p>
              <button className="button primary full-width" onClick={() => setSelected(nextRealm)}>
                Lanjutkan di {nextRealm.name}
                <Icon name="arrow" size={18} />
              </button>
            </>
          )}
        </Modal>
      )}
    </main>
  )
}
