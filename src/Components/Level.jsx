import { useGame } from "./context"
import { isUnlocked } from "./gameEngine"
import Icon from "./Icon"

export function Stars({ count = 0, size = 14 }) {
  return (
    <span className="stars" aria-label={`${count} dari 3 bintang`}>
      {[1, 2, 3].map((star) => (
        <Icon key={star} name="star" size={size} className={star <= count ? "earned" : ""} />
      ))}
    </span>
  )
}

export default function Level({ realm, index, onSelect }) {
  const { profile } = useGame()
  const unlocked = isUnlocked(profile, realm.id)
  const progress = profile.realms[realm.id]
  return (
    <button
      className={`realm-card ${unlocked ? "unlocked" : "locked"}`}
      onClick={() => onSelect(realm)}
      style={{ "--realm-color": realm.color }}
      aria-label={`${realm.name}, ${realm.operation}${unlocked ? "" : ", terkunci"}`}
    >
      <div className="realm-art">
        <img src={`/realm-${index}.webp`} alt="" loading="lazy" />
        <span className="realm-number">DUNIA 0{index + 1}</span>
        <span className="realm-operation">{realm.symbol}</span>
        {!unlocked && (
          <span className="realm-lock">
            <Icon name="lock" size={14} />
          </span>
        )}
      </div>
      <div className="realm-info">
        <span className="operation-label">{realm.operation}</span>
        <h3>{realm.name}</h3>
        <p>{realm.description}</p>
        <div className="realm-bottom">
          <Stars count={progress?.stars} />
          <span>
            {unlocked ? (
              <>
                {progress?.runs ? "Jelajahi lagi" : "Jelajahi"}
                <Icon name="arrow" size={14} />
              </>
            ) : (
              "Belum terbuka"
            )}
          </span>
        </div>
      </div>
    </button>
  )
}
