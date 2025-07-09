import {useEffect} from 'react'
import {useStateMachine} from 'ygdrassil'


/**
 * 
 */
export default function Song() {
  const {query} = useStateMachine()
  
  
  useEffect(() => {
    if (query.id) {
      // load the song from Dexie
    }
  }, [query.id])
  

  return (
    <div>Song</div>
  )
}