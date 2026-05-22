import MazeLevelGame from "../../Components/MazeLevelGame"
import { generateMazeAnswers } from "../../Components/mazeHelpers"
import "../SingleLevel/SingleLevel.css"
import { useLayoutEffect } from "react"

function Subtraction() {
  useLayoutEffect(() => {
    document.body.classList = []
    document.body.classList.add("blue")
  }, [])

  return (
    <MazeLevelGame
      levelName="subtraction"
      bodyClass="blue"
      themeColor="#00e5ff"
      createQuestion={() => {
        const left = Math.ceil(Math.random() * 24)
        const right = Math.ceil(Math.random() * 10)
        const correctAnswer = left - right

        return {
          correctAnswer,
          answers: generateMazeAnswers(correctAnswer, [
            correctAnswer + 3,
            correctAnswer + 1,
            correctAnswer + 5,
            correctAnswer - 1,
          ]),
          renderQuestion: () => <>{left} - {right} = ?</>,
        }
      }}
      renderQuestion={(question) => question.renderQuestion()}
    />
  )
}

export default Subtraction