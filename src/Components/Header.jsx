import { Link, NavLink, useLocation } from "react-router-dom"
import { useGame } from "./context"
import { rankForXp } from "./gameEngine"
import Icon from "./Icon"

export default function Header({ onHelp, onProfile }) {
  const { profile, toggleSound } = useGame()
  const location = useLocation()
  const rank = rankForXp(profile.xp)
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Labirin Angka beranda">
        <span className="brand-mark">
          <Icon name="compass" size={32} />
        </span>
        <span>
          LABIRIN<span className="brand-sub">A N G K A</span>
        </span>
      </Link>
      <nav aria-label="Navigasi utama">
        <NavLink
          to="/category"
          className={({ isActive }) =>
            isActive || location.pathname === "/" ? "nav-link active" : "nav-link"
          }
        >
          <Icon name="compass" size={17} />
          Petualangan
        </NavLink>
        <NavLink to="/daily" className="nav-link">
          <Icon name="sun" size={17} />
          Tantangan Harian
          <span className="nav-dot" />
        </NavLink>
        <NavLink to="/achievements" className="nav-link">
          <Icon name="trophy" size={17} />
          Pencapaian
        </NavLink>
      </nav>
      <div className="header-actions">
        <button
          className="icon-button sound-button"
          aria-label={profile.sound ? "Matikan suara" : "Aktifkan suara"}
          aria-pressed={profile.sound}
          onClick={toggleSound}
        >
          <Icon name={profile.sound ? "sound" : "muted"} size={18} />
        </button>
        <button className="icon-button help-button" aria-label="Cara bermain" onClick={onHelp}>
          <Icon name="help" size={19} />
        </button>
        <span className="header-divider" />
        <button
          className="profile-button"
          onClick={onProfile}
          aria-label={`Ubah profil ${profile.name}`}
        >
          <span className="avatar">
            <Icon name="user" size={19} />
          </span>
          <span className="profile-name">
            {profile.name}
            <small>
              Level {rank.level} · {rank.name}
            </small>
            <span
              className="rank-track"
              role="progressbar"
              aria-label={
                rank.next
                  ? `${rank.next - profile.xp} XP menuju level berikutnya`
                  : "Level tertinggi"
              }
              aria-valuenow={Math.round(rank.progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${rank.progress * 100}%` }} />
            </span>
          </span>
          <Icon name="chevron" size={14} />
        </button>
      </div>
    </header>
  )
}
