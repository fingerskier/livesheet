import {useEffect, useState} from 'react'
import {useHREF} from '../../lib/HREFContext'
import {KEY} from '../../constants'
import useLocalStorage from '../../hook/useLocalStorage'


export default function View() {
  const {songID} = useHREF()
  const [songs] = useLocalStorage(KEY.SONGS, [])
  const [song, setSong] = useState({})
  
  
  useEffect(() => {
    console.log(songID, songs)
    if (songID) setSong(songs.find(song=>song.id===songID))
  }, [songID])
  

  useEffect(() => {
    console.log(song)
  }, [song])
  
  
  
  return <div>
    <pre>
      {JSON.stringify(song, null, 2)}
    </pre>
  </div>
}
