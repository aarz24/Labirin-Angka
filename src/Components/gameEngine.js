export const REALMS = [
  {
    id: "addition",
    name: "Hutan Awal",
    operation: "Penjumlahan",
    symbol: "+",
    description: "Langkah kecil, petualangan besar.",
    color: "#a7c88d",
  },
  {
    id: "subtraction",
    name: "Lembah Kristal",
    operation: "Pengurangan",
    symbol: "−",
    description: "Temukan jalan di antara kristal.",
    color: "#89c8df",
  },
  {
    id: "multiplication",
    name: "Menara Arkan",
    operation: "Perkalian",
    symbol: "×",
    description: "Bangkitkan keajaiban angka.",
    color: "#b6a2da",
  },
  {
    id: "division",
    name: "Ngarai Senja",
    operation: "Pembagian",
    symbol: "÷",
    description: "Pecahkan rahasia pasir waktu.",
    color: "#dfa47b",
  },
  {
    id: "exponent",
    name: "Gerbang Bintang",
    operation: "Eksponen",
    symbol: "x²",
    description: "Taklukkan batas terakhir.",
    color: "#dfc780",
  },
]

export const DIFFICULTIES = [
  {
    id: "relaxed",
    name: "Santai",
    size: 7,
    multiplier: 1,
    fog: false,
    description: "Labirin 7 × 7 · angka kecil",
  },
  {
    id: "adventure",
    name: "Petualang",
    size: 9,
    multiplier: 1.5,
    fog: false,
    description: "Labirin 9 × 9 · tantangan sedang",
  },
  {
    id: "expert",
    name: "Ahli",
    size: 11,
    multiplier: 2,
    fog: true,
    description: "Labirin 11 × 11 · berkabut · angka besar",
  },
]

export const CRYSTALS_PER_MAZE = 3
export const CRYSTAL_XP = 3

export const RANKS = [
  { name: "Pemula", xp: 0 },
  { name: "Penjelajah", xp: 200 },
  { name: "Pemandu Jalur", xp: 600 },
  { name: "Penjaga Gerbang", xp: 1400 },
  { name: "Ahli Labirin", xp: 3000 },
  { name: "Legenda Hutan", xp: 6000 },
]

export function rankForXp(xp) {
  const value = Number.isFinite(xp) ? Math.max(0, xp) : 0
  let index = 0
  while (index + 1 < RANKS.length && value >= RANKS[index + 1].xp) index++
  const next = RANKS[index + 1]
  return {
    level: index + 1,
    name: RANKS[index].name,
    current: RANKS[index].xp,
    next: next?.xp ?? null,
    progress: next ? (value - RANKS[index].xp) / (next.xp - RANKS[index].xp) : 1,
  }
}

export const DIRECTIONS = [
  { dr: -1, dc: 0, wall: "top", opposite: "bottom", label: "Atas", key: "ArrowUp" },
  { dr: 0, dc: 1, wall: "right", opposite: "left", label: "Kanan", key: "ArrowRight" },
  { dr: 1, dc: 0, wall: "bottom", opposite: "top", label: "Bawah", key: "ArrowDown" },
  { dr: 0, dc: -1, wall: "left", opposite: "right", label: "Kiri", key: "ArrowLeft" },
]

export function seededRandom(seed) {
  let state = 2166136261
  for (const character of String(seed)) state = Math.imul(state ^ character.charCodeAt(0), 16777619)
  return () => {
    state += 0x6d2b79f5
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function getExits(size) {
  const middle = Math.floor(size / 2)
  return [
    { r: 0, c: middle },
    { r: middle, c: size - 1 },
    { r: size - 1, c: middle },
    { r: middle, c: 0 },
  ]
}

export const sameCell = (a, b) => a.r === b.r && a.c === b.c

export function generateMaze(size = 7, random = Math.random) {
  if (!Number.isInteger(size) || size < 5 || size > 25 || size % 2 === 0) {
    throw new RangeError("Maze size must be an odd integer between 5 and 25")
  }
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ top: true, right: true, bottom: true, left: true })),
  )
  const exits = getExits(size)
  const middle = Math.floor(size / 2)
  const stack = [{ r: middle, c: middle }]
  const visited = new Set([`${middle},${middle}`])
  while (stack.length) {
    const current = stack[stack.length - 1]
    const neighbors = DIRECTIONS.map((direction) => ({
      ...direction,
      r: current.r + direction.dr,
      c: current.c + direction.dc,
    })).filter(
      (next) =>
        next.r >= 0 &&
        next.r < size &&
        next.c >= 0 &&
        next.c < size &&
        !visited.has(`${next.r},${next.c}`) &&
        !exits.some((exit) => sameCell(exit, next)),
    )
    if (!neighbors.length) {
      stack.pop()
      continue
    }
    const next = neighbors[Math.floor(random() * neighbors.length)]
    grid[current.r][current.c][next.wall] = false
    grid[next.r][next.c][next.opposite] = false
    visited.add(`${next.r},${next.c}`)
    stack.push({ r: next.r, c: next.c })
  }
  exits.forEach((exit, index) => {
    const direction = DIRECTIONS[index]
    const inside = { r: exit.r - direction.dr, c: exit.c - direction.dc }
    grid[exit.r][exit.c][direction.opposite] = false
    grid[inside.r][inside.c][direction.wall] = false
  })
  return grid
}

export function placeCrystals(grid, random = Math.random, count = CRYSTALS_PER_MAZE) {
  const size = grid.length
  const middle = Math.floor(size / 2)
  const exits = getExits(size)
  const candidates = []
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      const openings = DIRECTIONS.filter((direction) => !cell[direction.wall]).length
      const here = { r, c }
      if (
        openings === 1 &&
        !sameCell(here, { r: middle, c: middle }) &&
        !exits.some((exit) => sameCell(exit, here))
      )
        candidates.push(here)
    }),
  )
  for (let index = candidates.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[candidates[index], candidates[other]] = [candidates[other], candidates[index]]
  }
  return candidates.slice(0, count)
}

export function canMove(grid, from, to) {
  if (to.r < 0 || to.c < 0 || to.r >= grid.length || to.c >= grid.length) return false
  const direction = DIRECTIONS.find(
    (item) => from.r + item.dr === to.r && from.c + item.dc === to.c,
  )
  return Boolean(direction && !grid[from.r][from.c][direction.wall])
}

export function findPath(grid, start, end) {
  const queue = [[start]]
  const visited = new Set([`${start.r},${start.c}`])
  for (let index = 0; index < queue.length; index++) {
    const path = queue[index]
    const current = path[path.length - 1]
    if (sameCell(current, end)) return path
    for (const direction of DIRECTIONS) {
      const next = { r: current.r + direction.dr, c: current.c + direction.dc }
      const key = `${next.r},${next.c}`
      if (!visited.has(key) && canMove(grid, current, next)) {
        visited.add(key)
        queue.push([...path, next])
      }
    }
  }
  return []
}

export function createQuestion(category, difficulty = "relaxed", random = Math.random) {
  const tier = Math.max(
    0,
    DIFFICULTIES.findIndex((item) => item.id === difficulty),
  )
  const integer = (max) => 1 + Math.floor(random() * max)
  let left = integer([12, 30, 80][tier])
  let right = integer([9, 20, 50][tier])
  let correctAnswer
  let expression
  switch (category) {
    case "subtraction":
      if (right > left) [left, right] = [right, left]
      correctAnswer = left - right
      expression = `${left} − ${right}`
      break
    case "multiplication":
      left = integer([6, 10, 15][tier])
      right = integer([6, 10, 12][tier])
      correctAnswer = left * right
      expression = `${left} × ${right}`
      break
    case "division":
      right = integer([5, 9, 12][tier]) + 1
      correctAnswer = integer([6, 12, 20][tier])
      left = right * correctAnswer
      expression = `${left} ÷ ${right}`
      break
    case "exponent":
      left = integer([4, 6, 8][tier]) + 1
      right = integer(tier === 0 ? 1 : 2) + 1
      correctAnswer = left ** right
      expression = `${left}${right === 2 ? "²" : "³"}`
      break
    default:
      correctAnswer = left + right
      expression = `${left} + ${right}`
  }
  const choices = new Set([correctAnswer])
  const offsets = [-2, 1, 3, -1, 2, 5]
  const offset = Math.floor(random() * offsets.length)
  for (let index = 0; choices.size < 4; index++) {
    choices.add(Math.abs(correctAnswer + offsets[(index + offset) % offsets.length]))
  }
  const answers = [...choices]
  for (let index = answers.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[answers[index], answers[other]] = [answers[other], answers[index]]
  }
  return { left, right, category, expression, correctAnswer, answers }
}

export function createRun(category, difficulty, seed, daily = false) {
  const random = seededRandom(seed)
  const size = DIFFICULTIES.find((item) => item.id === difficulty)?.size ?? 7
  return Array.from({ length: 5 }, (_, index) => {
    const maze = generateMaze(size, random)
    return {
      question: createQuestion(daily ? REALMS[index].id : category, difficulty, random),
      maze,
      crystals: placeCrystals(maze, random),
    }
  })
}

export const starsForScore = (score) => (score >= 100 ? 3 : score >= 80 ? 2 : score >= 60 ? 1 : 0)
export const formatTime = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

const DAY_MS = 86400000
const previousDay = (key) =>
  new Date(Date.parse(`${key}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10)

/** Consecutive daily completions ending today or yesterday. */
export function dailyStreak(dates, today = dayKey()) {
  const set = new Set(dates)
  let cursor = set.has(today) ? today : previousDay(today)
  let streak = 0
  while (set.has(cursor)) {
    streak++
    cursor = previousDay(cursor)
  }
  return streak
}

export function longestDailyStreak(dates) {
  const set = new Set(dates)
  let best = 0
  for (const date of set) {
    if (set.has(previousDay(date))) continue
    let length = 0
    let cursor = date
    while (set.has(cursor)) {
      length++
      cursor = new Date(Date.parse(`${cursor}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10)
    }
    best = Math.max(best, length)
  }
  return best
}

/** @param {RunResult} result */
export function shareText(result) {
  const realm = REALMS.find((item) => item.id === result.category)
  const title = result.daily
    ? `Tantangan Harian ${result.date}`
    : `${realm?.name ?? result.category} · ${DIFFICULTIES.find((item) => item.id === result.difficulty)?.name ?? ""}`
  const squares = result.rounds.map((correct) => (correct ? "🟩" : "🟥")).join("")
  const stars = "⭐".repeat(starsForScore(result.score)) || "·"
  return [
    `Labirin Angka · ${title}`,
    `${squares} ${result.score}/100 ${stars}`,
    `⏱ ${formatTime(result.seconds)} · 💎 ${result.crystals} · +${result.xp} XP`,
  ].join("\n")
}

/** @typedef {{best: number, stars: number, runs: number}} RealmProgress */
/** @typedef {{id: string, category: string, difficulty: string, score: number, seconds: number, hints: number, bestStreak: number, crystals: number, rounds: boolean[], daily: boolean, date: string, xp: number}} RunResult */
/** @typedef {{name: string, xp: number, runs: number, correct: number, perfect: number, bestStreak: number, crystals: number, cleanRun: boolean, fogPerfect: boolean, dailyDates: string[], completedRuns: string[], realms: Record<string, RealmProgress>, lastResult: RunResult | null, sound: boolean, difficulty: string}} Profile */

/** @returns {Profile} */
export function emptyProfile() {
  return {
    name: "Penjelajah",
    xp: 0,
    runs: 0,
    correct: 0,
    perfect: 0,
    bestStreak: 0,
    crystals: 0,
    cleanRun: false,
    fogPerfect: false,
    dailyDates: [],
    completedRuns: [],
    realms: {},
    lastResult: null,
    sound: false,
    difficulty: "relaxed",
  }
}

const nonnegative = (value) => (Number.isFinite(value) ? Math.max(0, value) : 0)

/** @returns {Profile} */
export function readProfile(storage) {
  const fallback = emptyProfile()
  try {
    const saved = JSON.parse(storage.getItem("labirin-expedition-v1") || "null")
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      fallback.name = storage.getItem("math-game-react")?.trim().slice(0, 24) || fallback.name
      REALMS.forEach((realm) => {
        const best = Math.min(100, nonnegative(Number(storage.getItem(`math-game-hs-${realm.id}`))))
        if (best) fallback.realms[realm.id] = { best, stars: starsForScore(best), runs: 0 }
      })
      return fallback
    }
    /** @type {Record<string, RealmProgress>} */
    const realms = {}
    REALMS.forEach((realm) => {
      const previous = saved.realms?.[realm.id]
      if (previous && typeof previous === "object") {
        const best = Math.min(100, nonnegative(previous.best))
        realms[realm.id] = { best, stars: starsForScore(best), runs: nonnegative(previous.runs) }
      }
    })
    const stringList = (value) =>
      Array.isArray(value) ? value.filter((item) => typeof item === "string") : []
    const result = saved.lastResult
    const validResult =
      result &&
      typeof result.id === "string" &&
      REALMS.some((realm) => realm.id === result.category) &&
      DIFFICULTIES.some((item) => item.id === result.difficulty) &&
      ["score", "seconds", "hints", "bestStreak", "xp"].every(
        (key) => Number.isFinite(result[key]) && result[key] >= 0,
      ) &&
      result.score <= 100 &&
      typeof result.daily === "boolean" &&
      typeof result.date === "string"
    const rounds =
      validResult &&
      Array.isArray(result.rounds) &&
      result.rounds.length === 5 &&
      result.rounds.every((item) => typeof item === "boolean")
        ? result.rounds
        : validResult
          ? Array.from({ length: 5 }, (_, index) => index < result.score / 20)
          : []
    return {
      ...fallback,
      realms,
      name:
        typeof saved.name === "string" && saved.name.trim()
          ? saved.name.trim().slice(0, 24)
          : fallback.name,
      xp: nonnegative(saved.xp),
      runs: nonnegative(saved.runs),
      correct: nonnegative(saved.correct),
      perfect: nonnegative(saved.perfect),
      bestStreak: nonnegative(saved.bestStreak),
      crystals: nonnegative(saved.crystals),
      cleanRun: saved.cleanRun === true,
      fogPerfect: saved.fogPerfect === true,
      sound: saved.sound === true,
      dailyDates: stringList(saved.dailyDates),
      completedRuns: stringList(saved.completedRuns).slice(-100),
      difficulty: DIFFICULTIES.some((item) => item.id === saved.difficulty)
        ? saved.difficulty
        : "relaxed",
      lastResult: validResult
        ? { ...result, rounds, crystals: nonnegative(result.crystals) }
        : null,
    }
  } catch {
    return fallback
  }
}

/** @param {Profile} profile */
export function isUnlocked(profile, category) {
  const index = REALMS.findIndex((realm) => realm.id === category)
  return (
    index === 0 ||
    (index > 0 &&
      ((profile.realms[category]?.best ?? 0) > 0 ||
        (profile.realms[REALMS[index - 1].id]?.best ?? 0) >= 60))
  )
}

/** @param {Profile} profile @param {RunResult} result @returns {Profile} */
export function recordRun(profile, result) {
  if (profile.completedRuns.includes(result.id)) return profile
  const level = DIFFICULTIES.find((item) => item.id === result.difficulty)
  const multiplier = level?.multiplier ?? 1
  const dailyRewardAvailable = !profile.dailyDates.includes(result.date)
  const earned = Math.max(
    0,
    Math.round(
      (result.score + result.bestStreak * 5 + result.crystals * CRYSTAL_XP - result.hints * 10) *
        multiplier,
    ),
  )
  const xp = result.daily ? (dailyRewardAvailable ? earned + 50 : 0) : earned
  const previous = profile.realms[result.category] ?? { best: 0, stars: 0, runs: 0 }
  const best = Math.max(previous.best, result.score)
  return {
    ...profile,
    xp: profile.xp + xp,
    runs: profile.runs + 1,
    correct: profile.correct + result.score / 20,
    perfect: profile.perfect + (result.score === 100 ? 1 : 0),
    bestStreak: Math.max(profile.bestStreak, result.bestStreak),
    crystals: profile.crystals + result.crystals,
    cleanRun: profile.cleanRun || (result.score === 100 && result.hints === 0),
    fogPerfect: profile.fogPerfect || (result.score === 100 && level?.fog === true),
    completedRuns: [...profile.completedRuns, result.id].slice(-100),
    dailyDates:
      result.daily && dailyRewardAvailable
        ? [...profile.dailyDates, result.date]
        : profile.dailyDates,
    realms: result.daily
      ? profile.realms
      : {
          ...profile.realms,
          [result.category]: { best, stars: starsForScore(best), runs: previous.runs + 1 },
        },
    lastResult: { ...result, xp },
  }
}

/** @param {Profile} profile */
export function achievements(profile) {
  return [
    {
      id: "first",
      icon: "flag",
      name: "Langkah Pertama",
      description: "Selesaikan petualangan pertamamu.",
      unlocked: profile.runs > 0,
    },
    {
      id: "perfect",
      icon: "star",
      name: "Bintang Sempurna",
      description: "Jawab 5 soal dengan benar dalam satu perjalanan.",
      unlocked: profile.perfect > 0,
    },
    {
      id: "clean",
      icon: "compass",
      name: "Intuisi Penjelajah",
      description: "Raih skor 100 tanpa menggunakan petunjuk.",
      unlocked: profile.cleanRun,
    },
    {
      id: "daily",
      icon: "sun",
      name: "Pemburu Fajar",
      description: "Selesaikan satu tantangan harian.",
      unlocked: profile.dailyDates.length > 0,
    },
    {
      id: "all",
      icon: "crown",
      name: "Penjaga Lima Dunia",
      description: "Raih minimal satu bintang di semua dunia.",
      unlocked: REALMS.every((realm) => (profile.realms[realm.id]?.stars ?? 0) > 0),
    },
    {
      id: "veteran",
      icon: "mountain",
      name: "Tak Kenal Lelah",
      description: "Selesaikan 10 perjalanan.",
      unlocked: profile.runs >= 10,
    },
    {
      id: "crystals",
      icon: "gem",
      name: "Pemburu Kristal",
      description: "Kumpulkan 30 kristal dari jalan buntu labirin.",
      unlocked: profile.crystals >= 30,
    },
    {
      id: "streak",
      icon: "fire",
      name: "Api Fajar",
      description: "Selesaikan tantangan harian 3 hari berturut-turut.",
      unlocked: longestDailyStreak(profile.dailyDates) >= 3,
    },
    {
      id: "fog",
      icon: "cloud",
      name: "Penembus Kabut",
      description: "Raih tiga bintang pada kesulitan Ahli.",
      unlocked: profile.fogPerfect === true,
    },
  ]
}
