import axios from 'axios'
import React, { useEffect, useState } from 'react'
import shuffleArray from 'shuffle-array'

function App() {
 const [question , setQuestion] = useState([])
 const [loading , setLoading] = useState(true)
 const [error , setError] = useState(false)
 const [index , setIndex] = useState(4)

  useEffect(()=>{
    axios('https://the-trivia-api.com/v2/questions')
    .then(res => {
      setQuestion(res.data)
      console.log(res.data);
      
    })
    .catch(err =>{
      setError(err)
    })
    .finally(()=>{
      setLoading(false)
    })
  } , [])

  return (

    <>
    {loading && <h1>Loading...</h1>}
    {error && <h1>Error Agya</h1>}
    {question && !loading &&(
       <div>
      <h1>Q{index + 1}: {question[index].question.text}</h1>
    </div> )}
    {shuffleArray([...question[index].incorrectAnswers , question[index].correctAnswer]).map((item , index) => {
      return(
        <div key={`option${index}`}>
          <input type="radio" name='question' value={item} ref={ el => item.current[index] = el} />
          
        </div>
      )
    })}
  
    </>
  )
}

export default App