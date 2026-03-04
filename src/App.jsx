import axios from 'axios'
import React, { useEffect, useState } from 'react'

function App() {
 const [question , setQuestion] = useState([])
 const [loading , setLoading] = useState(true)
 const [error , setError] = useState(false)
 const [index , setIndex] = useState(0)

  useEffect(()=>{
    axios('https://the-trivia-api.com/v2/questions')
    .then(res => {
      setQuestion(res.data)
      console.log(res.data);
      
    })
    .catch(err =>{
      setError(err)
    })
    .finally(load =>{
      setLoading(load)
    })
  } , [])

  return (
    <>
    {loading && <h1>Loading...</h1>}
    {error && <h1>Error Agya</h1>}
    {question && <div className='question' key={question.title}>
      <h1>{question[index].question.text}</h1>
      
      </div>}
    
    </>
  )
}

export default App