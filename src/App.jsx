import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import shuffleArray from 'shuffle-array'

function App() {
  const [question, setQuestion] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [index, setIndex] = useState(4)
  const [result , setResult] = useState(false)
  const [marks , setMarks] = useState(0)
  const input = useRef([]);
  useEffect(() => {
    axios('https://the-trivia-api.com/v2/questions')
      .then(res => {
        setQuestion(res.data)
        console.log(res.data);

      })
      .catch(err => {
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
  const nextQuestion = () => {
    const selectedOption = input.current.find(item => item && item.checked);
    console.log(selectedOption.value);
    console.log(question[index].correctAnswer);
    {question[index].correctAnswer === selectedOption.value ? setMarks(marks + 10) : marks
      index < 9 ? setIndex(index + 1) : setResult(true)
    }
    if ( index === question.length - 1) {
      setResult(true)
    }
    
    
    
  }

  return (

    <>
      {loading && <h1>Loading...</h1>}
      {error && <h1>Error Agya</h1>}
      {result && (
        <div>
          <h1>Final Result</h1>
          <h1>Result: {marks}</h1>
        </div>
      )}
      {question && !result && !loading && (
        <div className='question'>
          <h1>Q{index + 1}: {question[index].question.text}</h1>
        
       {shuffleArray([...question[index].incorrectAnswers, question[index].correctAnswer]).map((item,indx) => {
            return (
              <div key={`option${indx}`}>
                <input 
                type="radio"
                 name='question'
                 value={item} ref={el => input.current[indx] = el} />
                <label htmlFor={indx}>{item}</label>

              </div>
            )
          })}
          <br /> <br />
          <button onClick={nextQuestion}>Next</button>
          </div>)}

    </>
  )
}

export default App