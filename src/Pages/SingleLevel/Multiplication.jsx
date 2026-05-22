import MazeLevelGame from "../../Components/MazeLevelGame"
import { generateMazeAnswers } from "../../Components/mazeHelpers"
import "../SingleLevel/SingleLevel.css"
import { useLayoutEffect } from "react"

function Multiplication() {
  useLayoutEffect(() => {
    document.body.classList = []
    document.body.classList.add("purple")
  }, [])

  return (
    <MazeLevelGame
      levelName="multiplication"
      bodyClass="purple"
      themeColor="#00e5ff"
      createQuestion={() => {
        const left = Math.ceil(Math.random() * 6)
        const right = Math.ceil(Math.random() * 7)
        const correctAnswer = left * right

        return {
          correctAnswer,
          answers: generateMazeAnswers(correctAnswer, [
            correctAnswer + 3,
            correctAnswer * 2,
            correctAnswer + 5,
            correctAnswer - 1 > 0 ? correctAnswer - 1 : correctAnswer + 7,
          ]),
          renderQuestion: () => <>{left} × {right} = ?</>,
        }
      }}
      renderQuestion={(question) => question.renderQuestion()}
    />
  )
}

export default Multiplication