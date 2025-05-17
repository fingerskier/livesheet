import {useEffect, useState} from 'react'
import Edit from '../Edit'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, STATE} from '../../constants'
import Sections from './Sections'
import songToHtml from '../../lib/SongToHtml'

import style from './View.module.css'

export default function View() {
  const [list] = useLocalStorage(KEY.LIST, [])
  const [state] = useLocalStorage(KEY.VIEW)
  const [query] = useLocalStorage(KEY.QUERY)
  const [showEdit, setShowEdit] = useState(false)
  
  const [data, setData] = useState(null)


  useEffect(() => {
    console.log('query',query)
    const thisItem = list.find(item => item.id === query.id)
    setData(thisItem)
  }, [query.id, showEdit])

  
  return <div className={style.container}>
    <div className={style.controls}>
      <button onClick={() => setShowEdit(!showEdit)}> ✏️ </button>
      <button onClick={E=>{}}> 🔍 </button>
    </div>

    <div className={style.content}>
      <div>
        {showEdit && <Edit itemId={query.id} setShowEdit={setShowEdit} />}
      </div>
    
      <div>
        {data?.sections && <Sections data={data.sections} itemId={query.id} /> }

        {data?.raw && <div dangerouslySetInnerHTML={{__html: songToHtml(data.raw)}} />}
      </div>
    </div>
  </div>
}