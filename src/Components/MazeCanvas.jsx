import { useRef, useEffect, useCallback } from 'react'

/* ─── constants ─── */
const GRID   = 11
const CENTER  = Math.floor(GRID / 2)          // 5
const SIZE    = 500                             // logical canvas px
const PAD     = 42
const CELL    = Math.floor((SIZE - 2 * PAD) / GRID)  // ≈ 37

const EXITS = [
  { r: 0,        c: CENTER,    side: 'top',    idx: 0 },
  { r: CENTER,   c: GRID - 1,  side: 'right',  idx: 1 },
  { r: GRID - 1, c: CENTER,    side: 'bottom', idx: 2 },
  { r: CENTER,   c: 0,         side: 'left',   idx: 3 },
]

/* ─── path finder and validation ─── */
function findPath(g, sr, sc, tr, tc) {
  const queue = [[sr, sc, []]]
  const visited = Array.from({ length: GRID }, () => Array(GRID).fill(false))
  visited[sr][sc] = true

  while (queue.length > 0) {
    const [r, c, path] = queue.shift()
    const currentPath = [...path, { r, c }]

    if (r === tr && c === tc) {
      return currentPath
    }

    const cell = g[r][c]
    if (!cell.top && r > 0 && !visited[r - 1][c]) {
      visited[r - 1][c] = true
      queue.push([r - 1, c, currentPath])
    }
    if (!cell.right && c < GRID - 1 && !visited[r][c + 1]) {
      visited[r][c + 1] = true
      queue.push([r, c + 1, currentPath])
    }
    if (!cell.bottom && r < GRID - 1 && !visited[r + 1][c]) {
      visited[r + 1][c] = true
      queue.push([r + 1, c, currentPath])
    }
    if (!cell.left && c > 0 && !visited[r][c - 1]) {
      visited[r][c - 1] = true
      queue.push([r, c - 1, currentPath])
    }
  }
  return null
}

function isValidMaze(g) {
  for (let targetIdx = 0; targetIdx < 4; targetIdx++) {
    const targetExit = EXITS[targetIdx]
    const path = findPath(g, CENTER, CENTER, targetExit.r, targetExit.c)
    if (!path) return false

    for (const cell of path) {
      // Don't count starting point or the exit itself
      if ((cell.r === CENTER && cell.c === CENTER) || (cell.r === targetExit.r && cell.c === targetExit.c)) {
        continue
      }
      // Check if this intermediate cell is another exit
      for (let otherIdx = 0; otherIdx < 4; otherIdx++) {
        if (otherIdx === targetIdx) continue
        const otherExit = EXITS[otherIdx]
        if (cell.r === otherExit.r && cell.c === otherExit.c) {
          return false
        }
      }
    }
  }
  return true
}

/* ─── maze generator (recursive back-tracker) ─── */
function makeMaze() {
  while (true) {
    const g = Array.from({ length: GRID }, () =>
      Array.from({ length: GRID }, () => ({
        top: true, right: true, bottom: true, left: true, vis: false,
      })),
    )

    const stack = [[CENTER, CENTER]]
    g[CENTER][CENTER].vis = true
    const dirs = [
      [-1, 0, 'top', 'bottom'],
      [0,  1, 'right', 'left'],
      [1,  0, 'bottom', 'top'],
      [0, -1, 'left', 'right'],
    ]

    while (stack.length) {
      const [r, c] = stack[stack.length - 1]
      const nb = []
      for (const [dr, dc, w, o] of dirs) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < GRID && nc >= 0 && nc < GRID && !g[nr][nc].vis)
          nb.push([nr, nc, w, o])
      }
      if (!nb.length) { stack.pop(); continue }
      const [nr, nc, w, o] = nb[Math.floor(Math.random() * nb.length)]
      g[r][c][w] = false
      g[nr][nc][o] = false
      g[nr][nc].vis = true
      stack.push([nr, nc])
    }

    // open the four exits
    g[0][CENTER].top              = false
    g[CENTER][GRID - 1].right    = false
    g[GRID - 1][CENTER].bottom   = false
    g[CENTER][0].left             = false

    if (isValidMaze(g)) {
      return g
    }
  }
}

/* ─── component ─── */
export default function MazeCanvas({ answers, correctAnswer, onAnswer, themeColor = '#00e5ff' }) {
  const cvs        = useRef(null)
  const maze       = useRef(null)
  const player     = useRef({ r: CENTER, c: CENTER })
  const trail      = useRef([{ r: CENTER, c: CENTER }])
  const dragging   = useRef(false)
  const answered   = useRef(false)
  const props      = useRef({ answers, correctAnswer, onAnswer, themeColor })
  props.current = { answers, correctAnswer, onAnswer, themeColor }

  /* can we step from `a` to `b`? */
  const ok = useCallback((a, b) => {
    const m = maze.current
    if (!m) return false
    const dr = b.r - a.r, dc = b.c - a.c
    if (Math.abs(dr) + Math.abs(dc) !== 1) return false
    if (dr === -1) return !m[a.r][a.c].top
    if (dr ===  1) return !m[a.r][a.c].bottom
    if (dc ===  1) return !m[a.r][a.c].right
    if (dc === -1) return !m[a.r][a.c].left
    return false
  }, [])

  /* draw everything onto the canvas */
  const draw = useCallback(() => {
    const c = cvs.current, m = maze.current
    if (!c || !m) return
    const ctx = c.getContext('2d')
    const { answers: ans, themeColor: col } = props.current
    const t = trail.current, p = player.current
    const MP = CELL * GRID  // maze pixel width

    c.width  = SIZE
    c.height = SIZE

    ctx.clearRect(0, 0, SIZE, SIZE)

    /* background */
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(PAD, PAD, MP, MP, 8); ctx.fill() }
    else ctx.fillRect(PAD, PAD, MP, MP)

    /* trail */
    if (t.length > 0) {
      ctx.save()
      ctx.strokeStyle = col
      ctx.lineWidth   = CELL * 0.34
      ctx.lineCap     = 'round'
      ctx.lineJoin    = 'round'
      ctx.globalAlpha = 0.45
      ctx.shadowColor = col
      ctx.shadowBlur  = 14
      ctx.beginPath()
      t.forEach((cell, i) => {
        const x = PAD + cell.c * CELL + CELL / 2
        const y = PAD + cell.r * CELL + CELL / 2
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.restore()
    }

    /* walls */
    ctx.strokeStyle = 'rgba(255,255,255,0.88)'
    ctx.lineWidth   = 2.5
    ctx.lineCap     = 'round'
    for (let r = 0; r < GRID; r++) {
      for (let cc = 0; cc < GRID; cc++) {
        const x = PAD + cc * CELL, y = PAD + r * CELL, w = m[r][cc]
        if (w.top)    { ctx.beginPath(); ctx.moveTo(x, y);          ctx.lineTo(x + CELL, y);          ctx.stroke() }
        if (w.right)  { ctx.beginPath(); ctx.moveTo(x + CELL, y);   ctx.lineTo(x + CELL, y + CELL);   ctx.stroke() }
        if (w.bottom) { ctx.beginPath(); ctx.moveTo(x, y + CELL);   ctx.lineTo(x + CELL, y + CELL);   ctx.stroke() }
        if (w.left)   { ctx.beginPath(); ctx.moveTo(x, y);          ctx.lineTo(x, y + CELL);          ctx.stroke() }
      }
    }

    /* player dot */
    ctx.save()
    ctx.fillStyle   = col
    ctx.shadowColor = col
    ctx.shadowBlur  = 20
    ctx.beginPath()
    ctx.arc(PAD + p.c * CELL + CELL / 2, PAD + p.r * CELL + CELL / 2, CELL * 0.28, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    /* start marker (ring behind player) */
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth   = 2
    ctx.beginPath()
    ctx.arc(PAD + CENTER * CELL + CELL / 2, PAD + CENTER * CELL + CELL / 2, CELL * 0.38, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    /* exit indicators (small glowing dots at each opening) */
    ctx.save()
    ctx.fillStyle   = col
    ctx.globalAlpha = 0.55
    ctx.shadowColor = col
    ctx.shadowBlur  = 10
    for (const e of EXITS) {
      let ex, ey
      if (e.side === 'top')    { ex = PAD + e.c * CELL + CELL / 2; ey = PAD }
      if (e.side === 'right')  { ex = PAD + MP;                      ey = PAD + e.r * CELL + CELL / 2 }
      if (e.side === 'bottom') { ex = PAD + e.c * CELL + CELL / 2; ey = PAD + MP }
      if (e.side === 'left')   { ex = PAD;                           ey = PAD + e.r * CELL + CELL / 2 }
      ctx.beginPath(); ctx.arc(ex, ey, CELL * 0.2, 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()

    /* answer labels outside the maze */
    ctx.fillStyle    = 'white'
    ctx.font         = `bold ${Math.max(16, CELL * 0.55)}px poppins-Bold, sans-serif`
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(ans[0]), PAD + CENTER * CELL + CELL / 2, PAD / 2)
    ctx.fillText(String(ans[1]), PAD + MP + PAD / 2,              PAD + CENTER * CELL + CELL / 2)
    ctx.fillText(String(ans[2]), PAD + CENTER * CELL + CELL / 2, PAD + MP + PAD / 2)
    ctx.fillText(String(ans[3]), PAD / 2,                         PAD + CENTER * CELL + CELL / 2)

  }, [])

  /* convert client coords → grid cell */
  const cell = useCallback((cx, cy) => {
    const c = cvs.current
    if (!c) return null
    const r = c.getBoundingClientRect()
    const x = (cx - r.left) * (c.width / r.width) - PAD
    const y = (cy - r.top)  * (c.height / r.height) - PAD
    const gc = Math.floor(x / CELL), gr = Math.floor(y / CELL)
    if (gr < 0 || gr >= GRID || gc < 0 || gc >= GRID) return null
    return { r: gr, c: gc }
  }, [])

  /* check if a cell is one of the four exits */
  const exitOf = useCallback((c) => {
    for (const e of EXITS) if (c.r === e.r && c.c === e.c) return e.idx
    return -1
  }, [])

  /* actually move the player to `to`, append trail, check exit */
  const step = useCallback((to) => {
    player.current = { r: to.r, c: to.c }
    trail.current  = [...trail.current, { r: to.r, c: to.c }]
    const ei = exitOf(to)
    if (ei >= 0) {
      answered.current = true
      draw()
      setTimeout(() => props.current.onAnswer(props.current.answers[ei]), 350)
      return
    }
    draw()
  }, [exitOf, draw])

  /* attempt to move the player toward `target` */
  const move = useCallback((target) => {
    if (answered.current) return
    const p = player.current
    if (target.r === p.r && target.c === p.c) return

    /* backtrack? */
    const t = trail.current
    const bi = t.findIndex(c => c.r === target.r && c.c === target.c)
    if (bi >= 0 && bi < t.length - 1) {
      trail.current  = t.slice(0, bi + 1)
      player.current = { r: target.r, c: target.c }
      draw()
      return
    }

    /* direct adjacent */
    if (ok(p, target) && !t.some(c => c.r === target.r && c.c === target.c)) {
      step(target)
      return
    }

    /* skip-one (fast drag) */
    const dirs = [[-1,0],[0,1],[1,0],[0,-1]]
    for (const [dr, dc] of dirs) {
      const mid = { r: p.r + dr, c: p.c + dc }
      if (mid.r < 0 || mid.r >= GRID || mid.c < 0 || mid.c >= GRID) continue
      if (ok(p, mid) && ok(mid, target)
          && !t.some(c => c.r === mid.r    && c.c === mid.c)
          && !t.some(c => c.r === target.r && c.c === target.c)) {
        player.current = { r: mid.r, c: mid.c }
        trail.current  = [...trail.current, { r: mid.r, c: mid.c }]
        step(target)
        return
      }
    }
  }, [ok, draw, step])

  /* init / reset when question changes */
  useEffect(() => {
    maze.current     = makeMaze()
    player.current   = { r: CENTER, c: CENTER }
    trail.current    = [{ r: CENTER, c: CENTER }]
    dragging.current = false
    answered.current = false
    draw()
  }, [answers, draw])

  /* mouse + touch events */
  useEffect(() => {
    const c = cvs.current
    if (!c) return
    const start = (x, y) => { dragging.current = true; const cl = cell(x, y); if (cl) move(cl) }
    const mv    = (x, y) => { if (!dragging.current) return; const cl = cell(x, y); if (cl) move(cl) }
    const end   = ()      => { dragging.current = false }

    const md = e => start(e.clientX, e.clientY)
    const mm = e => { e.preventDefault(); mv(e.clientX, e.clientY) }
    const mu = () => end()
    const ts = e => { const t = e.touches[0]; start(t.clientX, t.clientY) }
    const tm = e => { e.preventDefault(); const t = e.touches[0]; mv(t.clientX, t.clientY) }
    const te = () => end()

    c.addEventListener('mousedown', md)
    c.addEventListener('mousemove', mm)
    window.addEventListener('mouseup', mu)
    c.addEventListener('touchstart', ts, { passive: false })
    c.addEventListener('touchmove',  tm, { passive: false })
    c.addEventListener('touchend',   te)

    return () => {
      c.removeEventListener('mousedown', md)
      c.removeEventListener('mousemove', mm)
      window.removeEventListener('mouseup', mu)
      c.removeEventListener('touchstart', ts)
      c.removeEventListener('touchmove',  tm)
      c.removeEventListener('touchend',   te)
    }
  }, [cell, move])

  return <canvas ref={cvs} className="maze-canvas" />
}
