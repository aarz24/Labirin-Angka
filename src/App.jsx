import { useState } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import MyContextProvider, { useGame } from "./Components/context"
import Header from "./Components/Header"
import Modal from "./Components/Modal"
import Icon from "./Components/Icon"
import Home from "./Pages/Home"
import MazeLevelGame from "./Components/MazeLevelGame"
import ScoreScreen from "./Pages/Score/ScoreScreen"

function GameShell() {
  const { profile, updateProfile, saveError } = useGame()
  const [modal, setModal] = useState(null)
  const [name, setName] = useState("")
  const location = useLocation()
  return (
    <>
      <a href="#main-content" className="skip-link">
        Lewati ke konten
      </a>
      <Header
        onHelp={() => setModal("help")}
        onProfile={() => {
          setName(profile.name)
          setModal("profile")
        }}
      />
      {saveError && (
        <div className="save-warning" role="status">
          Penyimpanan browser tidak tersedia. Progres hanya tersimpan selama halaman ini terbuka.
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home onHelp={() => setModal("help")} />} />
        <Route path="/category" element={<Home onHelp={() => setModal("help")} />} />
        <Route path="/daily" element={<Home section="daily" />} />
        <Route path="/achievements" element={<Home section="achievements" />} />
        <Route path="/category/:category" element={<MazeLevelGame key={location.key} />} />
        <Route path="/daily/play" element={<MazeLevelGame key={location.key} daily />} />
        <Route path="/score" element={<ScoreScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {modal === "help" && (
        <Modal title="Satu soal. Empat jalan. Pilihanmu." onClose={() => setModal(null)}>
          <p className="modal-copy">
            Pecahkan soal matematika, lalu tuntun cahaya dari tengah labirin menuju gerbang dengan
            jawaban yang benar.
          </p>
          <ol className="help-steps">
            <li>
              <Icon name="compass" />
              <div>
                <strong>Temukan jalannya</strong>
                <p>
                  Gunakan tombol panah atau WASD. Di layar sentuh, gunakan tombol arah atau geser
                  cahaya melalui lorong.
                </p>
              </div>
            </li>
            <li>
              <Icon name="star" />
              <div>
                <strong>Kumpulkan bintang</strong>
                <p>
                  Setiap jawaban benar bernilai 20. Skor 60 / 80 / 100 memberimu 1 / 2 / 3 bintang.
                  Satu bintang membuka dunia berikutnya.
                </p>
              </div>
            </li>
            <li>
              <Icon name="bulb" />
              <div>
                <strong>Nikmati prosesnya</strong>
                <p>
                  Tidak ada batas waktu. Petunjuk menampilkan jalur yang benar, dengan pengurangan
                  10 XP sebelum pengali kesulitan. Tekan Esc untuk jeda.
                </p>
              </div>
            </li>
          </ol>
          <button className="button primary full-width" onClick={() => setModal(null)}>
            Siap berpetualang <Icon name="arrow" size={18} />
          </button>
        </Modal>
      )}
      {modal === "profile" && (
        <Modal title="Setiap penjelajah punya nama." onClose={() => setModal(null)}>
          <p className="modal-copy">
            Buat perjalanan ini menjadi milikmu. Progres tersimpan di browser ini; mengubah nama
            tidak menghapusnya.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (name.trim()) {
                updateProfile({ name: name.trim() })
                setModal(null)
              }
            }}
          >
            <label className="field-label" htmlFor="player-name">
              Nama penjelajah
            </label>
            <input
              id="player-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              required
              autoComplete="nickname"
            />
            <button className="button primary full-width" type="submit" disabled={!name.trim()}>
              Simpan nama <Icon name="check" size={18} />
            </button>
          </form>
        </Modal>
      )}
    </>
  )
}

export default function App() {
  return (
    <MyContextProvider>
      <GameShell />
    </MyContextProvider>
  )
}
