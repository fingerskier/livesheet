import {useState} from 'react'
import useURL from '../hook/useURL'


export default function Header() {
  const {state, query} = useURL()
  const [debug, setDebug] = useState(false)
  
  return <header>
    <h1>
      LiveSheet
      <button onClick={() => setDebug(!debug)}>?</button>
    </h1>
    
    {debug && <>
      State: {state} Query: {JSON.stringify(query)}
    </>}
  </header>
}