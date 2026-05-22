export function generateMazeAnswers(correctAnswer, distractors = []) {
  // Filter out any distractors that are equal to the correct answer
  const uniqueDistractors = []
  for (const val of distractors) {
    if (val !== correctAnswer && !uniqueDistractors.includes(val)) {
      uniqueDistractors.push(val)
    }
  }

  // If we don't have enough distractors, generate unique ones
  let salt = 1
  while (uniqueDistractors.length < 3) {
    const fallback = typeof correctAnswer === "number"
      ? correctAnswer + salt * 7
      : `${correctAnswer}-${salt}`
    salt++
    if (fallback !== correctAnswer && !uniqueDistractors.includes(fallback)) {
      uniqueDistractors.push(fallback)
    }
  }

  // Prepare the 4 unique choices with correct answer placed randomly
  const answers = [null, null, null, null]
  const correctIndex = Math.floor(Math.random() * 4)
  answers[correctIndex] = correctAnswer

  let distractorIdx = 0
  for (let i = 0; i < 4; i++) {
    if (i !== correctIndex) {
      answers[i] = uniqueDistractors[distractorIdx]
      distractorIdx++
    }
  }

  return answers
}