import MazeLevelGame from "../../Components/MazeLevelGame"
import { generateMazeAnswers } from "../../Components/mazeHelpers"
import "../SingleLevel/SingleLevel.css"
import { useLayoutEffect } from "react"

function Division() {
  useLayoutEffect(() => {
    document.body.classList = []
    document.body.classList.add("green")
  }, [])

  return (
    <MazeLevelGame
      levelName="division"
      bodyClass="green"
      themeColor="#00e5ff"
      createQuestion={() => {
        const left = Math.ceil(Math.random() * 15) * 2
        const right = (Math.floor(Math.random() * 5) + 1) * 2
        const correctAnswer = parseFloat((left / right).toFixed(1))

        return {
          correctAnswer,
          answers: generateMazeAnswers(correctAnswer, [
            parseFloat((correctAnswer + 1.5).toFixed(1)),
            parseFloat((correctAnswer + 2).toFixed(1)),
            parseFloat((correctAnswer + 3).toFixed(1)),
            parseFloat((correctAnswer + 0.5).toFixed(1)),
          ]),
          renderQuestion: () => <>{left} / {right} = ?</>,
        }
      }}
      renderQuestion={(question) => question.renderQuestion()}
    />
  )
}

export default Division