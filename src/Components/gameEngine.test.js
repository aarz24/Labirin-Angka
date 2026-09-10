import test from "node:test"
import assert from "node:assert/strict"
import {
  achievements,
  canMove,
  createQuestion,
  createRun,
  CRYSTALS_PER_MAZE,
  dailyStreak,
  dayKey,
  DIFFICULTIES,
  DIRECTIONS,
  emptyProfile,
  findPath,
  generateMaze,
  getExits,
  isUnlocked,
  longestDailyStreak,
  placeCrystals,
  rankForXp,
  RANKS,
  readProfile,
  REALMS,
  recordRun,
  sameCell,
  seededRandom,
  shareText,
  starsForScore,
} from "./gameEngine.js"

test("all cells are connected, walls reciprocal, and every exit is a leaf", () => {
  for (const size of [5, 7, 9, 11, 25]) {
    for (let seed = 0; seed < 30; seed++) {
      const grid = generateMaze(size, seededRandom(`${size}-${seed}`))
      const center = { r: Math.floor(size / 2), c: Math.floor(size / 2) }
      const exits = getExits(size)
      let passages = 0
      const reached = new Set()
      const queue = [center]
      for (let index = 0; index < queue.length; index++) {
        const current = queue[index]
        const key = `${current.r},${current.c}`
        if (reached.has(key)) continue
        reached.add(key)
        for (const direction of DIRECTIONS) {
          const next = { r: current.r + direction.dr, c: current.c + direction.dc }
          if (canMove(grid, current, next)) queue.push(next)
        }
      }
      assert.equal(reached.size, size * size)
      grid.forEach((row, r) =>
        row.forEach((cell, c) => {
          DIRECTIONS.forEach((direction) => {
            const next = { r: r + direction.dr, c: c + direction.dc }
            if (next.r >= 0 && next.c >= 0 && next.r < size && next.c < size) {
              assert.equal(cell[direction.wall], grid[next.r][next.c][direction.opposite])
              if (!cell[direction.wall]) passages++
            } else assert.equal(cell[direction.wall], true)
          })
        }),
      )
      assert.equal(passages / 2, size * size - 1)
      for (const exit of exits) {
        assert.equal(
          DIRECTIONS.filter((direction) => !grid[exit.r][exit.c][direction.wall]).length,
          1,
        )
        const path = findPath(grid, center, exit)
        assert.ok(path.length > 1)
        assert.deepEqual(path.at(-1), exit)
        for (const point of path.slice(1, -1)) {
          assert.ok(!exits.some((other) => sameCell(point, other)))
        }
      }
    }
  }
})

test("crystals sit in dead ends away from the start and every exit, deterministically", () => {
  for (const size of [7, 9, 11]) {
    for (let seed = 0; seed < 20; seed++) {
      const grid = generateMaze(size, seededRandom(`${size}-${seed}`))
      const crystals = placeCrystals(grid, seededRandom(`crystal-${seed}`))
      assert.equal(crystals.length, CRYSTALS_PER_MAZE)
      assert.equal(new Set(crystals.map((cell) => `${cell.r},${cell.c}`)).size, crystals.length)
      const middle = Math.floor(size / 2)
      for (const cell of crystals) {
        assert.ok(!sameCell(cell, { r: middle, c: middle }))
        assert.ok(!getExits(size).some((exit) => sameCell(exit, cell)))
        assert.equal(
          DIRECTIONS.filter((direction) => !grid[cell.r][cell.c][direction.wall]).length,
          1,
        )
      }
      assert.deepEqual(crystals, placeCrystals(grid, seededRandom(`crystal-${seed}`)))
    }
  }
  assert.ok(createRun("addition", "relaxed", "seed").every((round) => round.crystals.length === 3))
})

test("movement cannot jump walls, teleport, or leave the board", () => {
  const grid = generateMaze(7, seededRandom("movement"))
  const start = { r: 3, c: 3 }
  assert.equal(canMove(grid, start, { r: 3, c: 5 }), false)
  assert.equal(canMove(grid, start, { r: 2, c: 2 }), false)
  assert.equal(canMove(grid, start, { r: -1, c: 3 }), false)
  for (const direction of DIRECTIONS) {
    const target = { r: start.r + direction.dr, c: start.c + direction.dc }
    assert.equal(canMove(grid, start, target), !grid[3][3][direction.wall])
  }
  for (const size of [0, 4, 6, 26, 7.5]) assert.throws(() => generateMaze(size), RangeError)
})

test("questions have exact arithmetic and four distinct nonnegative integer choices", () => {
  const operations = {
    addition: (left, right) => left + right,
    subtraction: (left, right) => left - right,
    multiplication: (left, right) => left * right,
    division: (left, right) => left / right,
    exponent: (left, right) => left ** right,
  }
  for (const realm of REALMS) {
    for (const difficulty of DIFFICULTIES) {
      const random = seededRandom(`${realm.id}-${difficulty.id}`)
      for (let sample = 0; sample < 150; sample++) {
        const question = createQuestion(realm.id, difficulty.id, random)
        assert.equal(question.correctAnswer, operations[realm.id](question.left, question.right))
        assert.equal(new Set(question.answers).size, 4)
        assert.equal(
          question.answers.filter((answer) => answer === question.correctAnswer).length,
          1,
        )
        assert.ok(question.answers.every((answer) => Number.isInteger(answer) && answer >= 0))
      }
    }
  }
})

test("daily runs are deterministic and cover every operation", () => {
  const run = createRun("addition", "adventure", "daily-v1-2026-09-10", true)
  assert.deepEqual(run, createRun("exponent", "adventure", "daily-v1-2026-09-10", true))
  assert.deepEqual(
    run.map((round) => round.question.category),
    REALMS.map((realm) => realm.id),
  )
  assert.ok(run.every((round) => round.maze.length === 9))
  assert.notDeepEqual(run, createRun("addition", "adventure", "daily-v1-2026-09-11", true))
  assert.equal(dayKey(new Date("2026-09-10T23:59:59-05:00")), "2026-09-11")
})

function result(overrides = {}) {
  return {
    id: "test-run",
    category: "addition",
    difficulty: "relaxed",
    score: 100,
    seconds: 80,
    hints: 0,
    bestStreak: 5,
    crystals: 0,
    rounds: [true, true, true, true, true],
    daily: false,
    date: "2026-09-10",
    xp: 0,
    ...overrides,
  }
}

test("progression awards stars, unlocks worlds, preserves bests, and ignores duplicate completion", () => {
  const initial = emptyProfile()
  assert.ok(isUnlocked(initial, "addition"))
  assert.ok(!isUnlocked(initial, "subtraction"))
  assert.ok(!isUnlocked(initial, "not-a-world"))
  const first = recordRun(initial, result({ score: 60, bestStreak: 3 }))
  assert.equal(first.realms.addition.stars, 1)
  assert.equal(first.xp, 75)
  assert.ok(isUnlocked(first, "subtraction"))
  assert.ok(!isUnlocked(first, "multiplication"))
  assert.equal(recordRun(first, result()), first)
  const second = recordRun(first, result({ id: "second", score: 20, bestStreak: 1 }))
  assert.equal(second.realms.addition.best, 60)
  assert.equal(second.realms.addition.runs, 2)
  assert.equal(second.runs, 2)
  assert.equal(second.correct, 4)
  assert.equal(initial.runs, 0)
  assert.deepEqual([0, 40, 60, 80, 100].map(starsForScore), [0, 0, 1, 2, 3])
})

test("XP respects difficulty and hints, never turns negative, and daily reward is once per UTC date", () => {
  const first = recordRun(
    emptyProfile(),
    result({ daily: true, difficulty: "adventure", hints: 1 }),
  )
  assert.equal(first.lastResult.xp, 223)
  assert.equal(first.xp, 223)
  assert.deepEqual(first.realms, {})
  assert.deepEqual(first.dailyDates, ["2026-09-10"])
  const repeat = recordRun(first, result({ id: "repeat", daily: true }))
  assert.equal(repeat.xp, first.xp)
  assert.equal(repeat.lastResult.xp, 0)
  const nextDay = recordRun(repeat, result({ id: "tomorrow", daily: true, date: "2026-09-11" }))
  assert.equal(nextDay.xp, repeat.xp + 175)
  const wrong = recordRun(emptyProfile(), result({ score: 0, hints: 5, bestStreak: 0 }))
  assert.equal(wrong.xp, 0)
  assert.equal(wrong.realms.addition.stars, 0)
  const shiny = recordRun(emptyProfile(), result({ crystals: 4, difficulty: "expert" }))
  assert.equal(shiny.xp, (100 + 25 + 12) * 2)
  assert.equal(shiny.crystals, 4)
  assert.equal(shiny.fogPerfect, true)
  assert.equal(recordRun(emptyProfile(), result({ crystals: 4 })).fogPerfect, false)
})

test("ranks advance with XP and report progress toward the next title", () => {
  assert.deepEqual(rankForXp(0), { level: 1, name: "Pemula", current: 0, next: 200, progress: 0 })
  assert.equal(rankForXp(199).level, 1)
  assert.equal(rankForXp(200).name, "Penjelajah")
  assert.equal(rankForXp(400).progress, 0.5)
  const top = rankForXp(1e9)
  assert.equal(top.level, RANKS.length)
  assert.equal(top.next, null)
  assert.equal(top.progress, 1)
  assert.equal(rankForXp(NaN).level, 1)
  assert.equal(rankForXp(-50).level, 1)
})

test("daily streaks count consecutive UTC dates and survive a missed today", () => {
  const dates = ["2026-09-06", "2026-09-08", "2026-09-09", "2026-09-10"]
  assert.equal(dailyStreak(dates, "2026-09-10"), 3)
  assert.equal(dailyStreak(dates, "2026-09-11"), 3)
  assert.equal(dailyStreak(dates, "2026-09-12"), 0)
  assert.equal(dailyStreak([], "2026-09-12"), 0)
  assert.equal(longestDailyStreak(dates), 3)
  assert.equal(longestDailyStreak(["2026-12-31", "2027-01-01"]), 2)
  assert.equal(longestDailyStreak([]), 0)
  const profile = { ...emptyProfile(), dailyDates: dates }
  assert.ok(achievements(profile).find((badge) => badge.id === "streak").unlocked)
})

test("share text summarises a run in three lines with one square per gate", () => {
  const text = shareText({
    ...result({ score: 80, rounds: [true, true, false, true, true], crystals: 2, xp: 120 }),
    seconds: 151,
  })
  const lines = text.split("\n")
  assert.equal(lines.length, 3)
  assert.equal(lines[0], "Labirin Angka · Hutan Awal · Santai")
  assert.equal(lines[1], "🟩🟩🟥🟩🟩 80/100 ⭐⭐")
  assert.equal(lines[2], "⏱ 2:31 · 💎 2 · +120 XP")
  assert.match(
    shareText(result({ daily: true, score: 0, rounds: Array(5).fill(false), xp: 0 })),
    /^Labirin Angka · Tantangan Harian 2026-09-10\n🟥{5} 0\/100 ·\n/u,
  )
})

test("achievements reflect completed play, not just earned XP", () => {
  assert.ok(achievements(emptyProfile()).every((badge) => !badge.unlocked))
  const perfect = recordRun(emptyProfile(), result())
  assert.deepEqual(
    achievements(perfect)
      .filter((badge) => badge.unlocked)
      .map((badge) => badge.id),
    ["first", "perfect", "clean"],
  )
  const helped = recordRun(emptyProfile(), result({ hints: 1 }))
  assert.equal(achievements(helped).find((badge) => badge.id === "clean").unlocked, false)
})

test("storage loads legacy scores and recovers safely from damaged or unavailable storage", () => {
  const storage = (values) => ({ getItem: (key) => values[key] ?? null })
  const legacy = readProfile(
    storage({ "math-game-react": "Naufal", "math-game-hs-addition": "100" }),
  )
  assert.equal(legacy.name, "Naufal")
  assert.equal(legacy.realms.addition.best, 100)
  assert.ok(isUnlocked(legacy, "subtraction"))
  for (const value of ["broken", "null", "42", "[]"]) {
    assert.doesNotThrow(() => readProfile(storage({ "labirin-expedition-v1": value })))
  }
  assert.deepEqual(
    readProfile({
      getItem: () => {
        throw new Error("Blocked")
      },
    }),
    emptyProfile(),
  )
  const corrupted = readProfile(
    storage({
      "labirin-expedition-v1": JSON.stringify({
        name: 42,
        xp: -100,
        runs: "bad",
        realms: { addition: { best: 1000 }, division: null },
        dailyDates: [null, {}, "2026-09-10"],
        difficulty: "impossible",
        lastResult: { score: "bad" },
      }),
    }),
  )
  assert.equal(corrupted.name, "Penjelajah")
  assert.equal(corrupted.xp, 0)
  assert.equal(corrupted.runs, 0)
  assert.equal(corrupted.realms.addition.best, 100)
  assert.equal(corrupted.difficulty, "relaxed")
  assert.equal(corrupted.lastResult, null)
  assert.deepEqual(corrupted.dailyDates, ["2026-09-10"])
  const legacyResult = { ...result({ score: 60 }) }
  delete legacyResult.rounds
  delete legacyResult.crystals
  const upgraded = readProfile(
    storage({ "labirin-expedition-v1": JSON.stringify({ lastResult: legacyResult }) }),
  )
  assert.deepEqual(upgraded.lastResult.rounds, [true, true, true, false, false])
  assert.equal(upgraded.lastResult.crystals, 0)
  assert.equal(upgraded.crystals, 0)
})

test("completed results survive reload without awarding a second reward", () => {
  const saved = recordRun(emptyProfile(), result())
  const loaded = readProfile({
    getItem: (key) => (key === "labirin-expedition-v1" ? JSON.stringify(saved) : null),
  })
  assert.deepEqual(loaded, saved)
  assert.equal(recordRun(loaded, result()).xp, saved.xp)
})
