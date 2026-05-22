import MazeLevelGame from "../../Components/MazeLevelGame"
import { generateMazeAnswers } from "../../Components/mazeHelpers"
import "../SingleLevel/SingleLevel.css"
import { useLayoutEffect } from "react"

function Addition() {
  useLayoutEffect(() => {
    document.body.classList = []
    document.body.classList.add("red")
  }, [])

  return (
    <MazeLevelGame
      levelName="addition"
      bodyClass="red"
      themeColor="#00e5ff"
      createQuestion={() => {
        const left = Math.ceil(Math.random() * 20)
        const right = Math.ceil(Math.random() * 10)
        const correctAnswer = left + right

        return {
          correctAnswer,
          answers: generateMazeAnswers(correctAnswer, [
            correctAnswer + 3,
            correctAnswer * 2,
            correctAnswer + 5,
            correctAnswer - 1 > 0 ? correctAnswer - 1 : correctAnswer + 7,
          ]),
          renderQuestion: () => <>{left} + {right} = ?</>,
        }
      }}
      renderQuestion={(question) => question.renderQuestion()}
    />
  )
}

export default Addition