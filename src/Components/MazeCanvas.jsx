import { useCallback, useEffect, useRef, useState } from "react"
import { canMove, DIRECTIONS, findPath, getExits, sameCell } from "./gameEngine"
import Icon from "./Icon"

const SIZE = 500
const PAD = 52
const cellKey = (cell) => `${cell.r},${cell.c}`

export default function MazeCanvas({
  grid,
  question,
  crystals = [],
  fog = false,
  onAnswer,
  onCollect,
  disabled,
  hint,
  resetToken,
  controlsRef,
}) {
  const middle = Math.floor(grid.length / 2)
  const origin = { r: middle, c: middle }
  const [trail, setTrail] = useState([origin])
  const [visited, setVisited] = useState(() => new Set([cellKey(origin)]))
  const [collected, setCollected] = useState(() => new Set())
  const collectedRef = useRef(collected)
  const position = useRef(origin)
  const answered = useRef(false)
  const dragging = useRef(false)
  const svg = useRef(null)
  const player = trail[trail.length - 1]
  const cellSize = (SIZE - 2 * PAD) / grid.length
  const exits = getExits(grid.length)
  const revealed = new Set()
  if (fog) {
    for (const key of visited) {
      const [r, c] = key.split(",").map(Number)
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) revealed.add(`${r + dr},${c + dc}`)
    }
  }
  const point = (cell) => ({
    x: PAD + (cell.c + 0.5) * cellSize,
    y: PAD + (cell.r + 0.5) * cellSize,
  })
  const points = (path) => path.map((cell) => `${point(cell).x},${point(cell).y}`).join(" ")
  const hintPath = hint
    ? findPath(grid, player, exits[question.answers.indexOf(question.correctAnswer)])
    : []

  const move = useCallback(
    (target) => {
      if (
        disabled ||
        answered.current ||
        document.querySelector("dialog[open]") ||
        !canMove(grid, position.current, target)
      )
        return false
      position.current = target
      const key = cellKey(target)
      setTrail((previous) => {
        const backtrack = previous.findIndex((cell) => sameCell(cell, target))
        return backtrack >= 0 ? previous.slice(0, backtrack + 1) : [...previous, target]
      })
      setVisited((previous) => (previous.has(key) ? previous : new Set(previous).add(key)))
      if (crystals.some((cell) => sameCell(cell, target)) && !collectedRef.current.has(key)) {
        collectedRef.current = new Set(collectedRef.current).add(key)
        setCollected(collectedRef.current)
        onCollect?.()
      }
      const exitIndex = getExits(grid.length).findIndex((exit) => sameCell(exit, target))
      if (exitIndex >= 0) {
        answered.current = true
        onAnswer(question.answers[exitIndex])
      }
      return true
    },
    [crystals, disabled, grid, onAnswer, onCollect, question.answers],
  )

  const moveDirection = useCallback(
    (index) => {
      const direction = DIRECTIONS[index]
      move({ r: position.current.r + direction.dr, c: position.current.c + direction.dc })
    },
    [move],
  )

  useEffect(() => {
    controlsRef.current = moveDirection
    const keydown = (event) => {
      if (
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
      )
        return
      if (document.querySelector("dialog[open]")) return
      const key = event.key.toLowerCase()
      const index = [
        ["arrowup", "w"],
        ["arrowright", "d"],
        ["arrowdown", "s"],
        ["arrowleft", "a"],
      ].findIndex((keys) => keys.includes(key))
      if (index >= 0) {
        event.preventDefault()
        moveDirection(index)
      }
    }
    window.addEventListener("keydown", keydown)
    return () => {
      controlsRef.current = null
      window.removeEventListener("keydown", keydown)
    }
  }, [controlsRef, moveDirection])

  useEffect(() => {
    const start = { r: middle, c: middle }
    position.current = start
    setTrail([start])
    answered.current = false
    dragging.current = false
  }, [middle, resetToken])

  const pointerMove = (event) => {
    const bounds = svg.current.getBoundingClientRect()
    const target = {
      c: Math.floor((((event.clientX - bounds.left) * SIZE) / bounds.width - PAD) / cellSize),
      r: Math.floor((((event.clientY - bounds.top) * SIZE) / bounds.height - PAD) / cellSize),
    }
    if (target.c < 0 || target.r < 0 || target.c >= grid.length || target.r >= grid.length) return
    const from = position.current
    if (target.r !== from.r && target.c !== from.c) return
    const dr = Math.sign(target.r - from.r)
    const dc = Math.sign(target.c - from.c)
    const distance = Math.abs(target.r - from.r) + Math.abs(target.c - from.c)
    for (let step = 0; step < distance; step++) {
      if (!move({ r: position.current.r + dr, c: position.current.c + dc })) break
    }
  }

  const walls = []
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      const x = PAD + c * cellSize
      const y = PAD + r * cellSize
      if (cell.top) walls.push(<line key={`${r}-${c}-t`} x1={x} y1={y} x2={x + cellSize} y2={y} />)
      if (cell.left) walls.push(<line key={`${r}-${c}-l`} x1={x} y1={y} x2={x} y2={y + cellSize} />)
      if (r === grid.length - 1 && cell.bottom)
        walls.push(
          <line key={`${r}-${c}-b`} x1={x} y1={y + cellSize} x2={x + cellSize} y2={y + cellSize} />,
        )
      if (c === grid.length - 1 && cell.right)
        walls.push(
          <line key={`${r}-${c}-r`} x1={x + cellSize} y1={y} x2={x + cellSize} y2={y + cellSize} />,
        )
    }),
  )
  const labels = ["UTARA", "TIMUR", "SELATAN", "BARAT"]
  const labelPoints = [
    { x: 250, y: 22 },
    { x: 476, y: 250 },
    { x: 250, y: 478 },
    { x: 24, y: 250 },
  ]

  return (
    <>
      <svg
        ref={svg}
        className="maze-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        tabIndex={0}
        aria-label={`Labirin. Posisi baris ${player.r + 1}, kolom ${player.c + 1}. Gunakan panah atau WASD. Jawaban utara ${question.answers[0]}, timur ${question.answers[1]}, selatan ${question.answers[2]}, barat ${question.answers[3]}.`}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          svg.current.focus()
          dragging.current = true
          svg.current.setPointerCapture(event.pointerId)
          pointerMove(event)
        }}
        onPointerMove={(event) => {
          if (dragging.current) pointerMove(event)
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
        onPointerCancel={() => {
          dragging.current = false
        }}
      >
        <defs>
          <radialGradient id="maze-lantern">
            <stop offset="0" stopColor="#f2d79a" stopOpacity="0.28" />
            <stop offset="0.55" stopColor="#e4c98a" stopOpacity="0.08" />
            <stop offset="1" stopColor="#e4c98a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="maze-player-gradient" cx="0.38" cy="0.34" r="0.75">
            <stop offset="0" stopColor="#fff7dc" />
            <stop offset="0.6" stopColor="#edd294" />
            <stop offset="1" stopColor="#c9a45c" />
          </radialGradient>
          <radialGradient id="maze-floor-gradient">
            <stop offset="0" stopColor="#26382c" />
            <stop offset="0.7" stopColor="#1b2a21" />
            <stop offset="1" stopColor="#141f19" />
          </radialGradient>
          <linearGradient id="maze-gate-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a4c37" />
            <stop offset="1" stopColor="#243021" />
          </linearGradient>
          <linearGradient id="maze-crystal-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e9fbff" />
            <stop offset="0.45" stopColor="#8fd6ff" />
            <stop offset="1" stopColor="#4f9fd6" />
          </linearGradient>
          <filter id="maze-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="maze-fog-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <pattern
            id="maze-stone"
            width={cellSize}
            height={cellSize}
            patternUnits="userSpaceOnUse"
            x={PAD}
            y={PAD}
          >
            <rect width={cellSize} height={cellSize} fill="#ffffff03" />
            <rect
              x="1.5"
              y="1.5"
              width={cellSize - 3}
              height={cellSize - 3}
              rx="3"
              fill="none"
              stroke="#ffffff07"
            />
          </pattern>
        </defs>
        <rect
          className="maze-floor"
          x={PAD}
          y={PAD}
          width={SIZE - PAD * 2}
          height={SIZE - PAD * 2}
          rx="7"
          fill="url(#maze-floor-gradient)"
        />
        <rect
          x={PAD}
          y={PAD}
          width={SIZE - PAD * 2}
          height={SIZE - PAD * 2}
          rx="7"
          fill="url(#maze-stone)"
        />
        <g className="maze-tiles">
          {[...visited].map((key) => {
            const [r, c] = key.split(",").map(Number)
            return (
              <rect
                key={key}
                x={PAD + c * cellSize + 2}
                y={PAD + r * cellSize + 2}
                width={cellSize - 4}
                height={cellSize - 4}
                rx="3"
              />
            )
          })}
        </g>
        <circle
          className="maze-lantern"
          cx={point(player).x}
          cy={point(player).y}
          r={cellSize * 1.7}
          fill="url(#maze-lantern)"
        />
        {crystals.map((cell) => {
          const { x, y } = point(cell)
          const size = cellSize * 0.22
          return (
            <g
              key={cellKey(cell)}
              className={`maze-crystal ${collected.has(cellKey(cell)) ? "collected" : ""}`}
              style={{ transformOrigin: `${x}px ${y}px` }}
            >
              <circle className="maze-crystal-glow" cx={x} cy={y} r={size * 1.6} />
              <polygon
                filter="url(#maze-glow)"
                points={`${x},${y - size} ${x + size * 0.8},${y} ${x},${y + size} ${x - size * 0.8},${y}`}
              />
              <polygon
                className="maze-crystal-facet"
                points={`${x},${y - size} ${x + size * 0.8},${y} ${x},${y}`}
              />
              <line x1={x - size * 0.8} y1={y} x2={x + size * 0.8} y2={y} />
              <path
                className="maze-crystal-glint"
                d={`M${x + size * 0.9},${y - size * 0.9}v${size * 0.5}M${x + size * 0.65},${y - size * 0.65}h${size * 0.5}`}
              />
            </g>
          )
        })}
        {exits.map((exit, index) => (
          <g
            key={index}
            className={`maze-gate ${
              hint && question.answers[index] === question.correctAnswer ? "target" : ""
            }`}
          >
            <circle
              className="maze-gate-ring"
              cx={point(exit).x}
              cy={point(exit).y}
              r={cellSize * 0.46}
            />
            <rect
              className="maze-exit"
              x={point(exit).x - cellSize * 0.36}
              y={point(exit).y - cellSize * 0.36}
              width={cellSize * 0.72}
              height={cellSize * 0.72}
              rx="6"
            />
            <text
              className="maze-exit-text"
              x={point(exit).x}
              y={point(exit).y}
              style={{ fontSize: grid.length > 9 ? 11 : 14 }}
            >
              {question.answers[index]}
            </text>
            <text className="maze-exit-text" x={labelPoints[index].x} y={labelPoints[index].y}>
              {question.answers[index]}
            </text>
            <text
              className="maze-exit-label"
              x={labelPoints[index].x}
              y={labelPoints[index].y + 18}
              style={{ fontSize: index % 2 ? 6 : 7 }}
            >
              {labels[index]}
            </text>
          </g>
        ))}
        <polyline className="maze-trail" points={points(trail)} />
        <g className="maze-wall-shadow">{walls}</g>
        <g className="maze-wall">{walls}</g>
        {fog && (
          <g className="maze-fog" filter="url(#maze-fog-blur)">
            {grid.flatMap((row, r) =>
              row.map((_, c) => {
                const key = `${r},${c}`
                if (exits.some((exit) => sameCell(exit, { r, c }))) return null
                return (
                  <rect
                    key={key}
                    className={revealed.has(key) ? "revealed" : ""}
                    x={PAD + c * cellSize - 1.5}
                    y={PAD + r * cellSize - 1.5}
                    width={cellSize + 3}
                    height={cellSize + 3}
                  />
                )
              }),
            )}
          </g>
        )}
        {hint && <polyline className="maze-hint" points={points(hintPath)} />}
        <circle
          className="maze-player-pulse"
          cx={point(player).x}
          cy={point(player).y}
          r={cellSize * 0.3}
        />
        <circle
          className="maze-player-halo"
          cx={point(player).x}
          cy={point(player).y}
          r={cellSize * 0.36}
        />
        <circle
          className="maze-player"
          cx={point(player).x}
          cy={point(player).y}
          r={cellSize * 0.17}
          fill="url(#maze-player-gradient)"
          filter="url(#maze-glow)"
        />
      </svg>
      <span className="sr-only" aria-live="polite">
        Posisi: baris {player.r + 1}, kolom {player.c + 1}. Arah terbuka:{" "}
        {DIRECTIONS.filter((direction) =>
          canMove(grid, player, { r: player.r + direction.dr, c: player.c + direction.dc }),
        )
          .map((direction) => direction.label)
          .join(", ")}
        .
      </span>
      <div className="maze-legend">
        <span>
          <i className="player-dot" />
          Kamu di sini
        </span>
        <span>
          <Icon name="flag" size={12} />
          Temukan gerbang jawaban
        </span>
        {crystals.length > 0 && (
          <span>
            <Icon name="gem" size={12} />
            Kristal {collected.size} / {crystals.length}
          </span>
        )}
        {fog && (
          <span>
            <Icon name="cloud" size={12} />
            Kabut tersingkap saat kamu melangkah
          </span>
        )}
      </div>
    </>
  )
}
