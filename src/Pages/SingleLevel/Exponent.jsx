import MazeLevelGame from "../../Components/MazeLevelGame"
import { generateMazeAnswers } from "../../Components/mazeHelpers"
import "../SingleLevel/SingleLevel.css"
import { useLayoutEffect } from "react"

function Exponent() {
  useLayoutEffect(() => {
    document.body.classList = []
    document.body.classList.add("orange")
  }, [])

  return (
    <MazeLevelGame
      levelName="exponent"
      bodyClass="orange"
      themeColor="#00e5ff"
      createQuestion={() => {
        const base = Math.floor(Math.random() * 4) + 2
        const power = Math.floor(Math.random() * 2) + 2
        const correctAnswer = Math.pow(base, power)

        return {
          correctAnswer,
          answers: generateMazeAnswers(correctAnswer, [
            correctAnswer + 3,
            correctAnswer * 2,
            correctAnswer + 5,
            correctAnswer - 1 > 0 ? correctAnswer - 1 : correctAnswer + 7,
          ]),
          renderQuestion: () => <>{base}<sup>{power}</sup> = ?</>,
        }
      }}
      renderQuestion={(question) => question.renderQuestion()}
    />
  )
}

export default Exponent
