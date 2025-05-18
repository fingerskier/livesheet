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
  const [html, setHtml] = useState(null)
  const [arrangement, setArrangement] = useState(null)
  const [arrangOpts, setArrangOpts] = useState(null)


  useEffect(() => {
    console.log('query',query)
    const thisItem = list.find(item => item.id === query.id)
    setData(thisItem)
  }, [query.id, showEdit])


  useEffect(()=>{
    console.debug('data',data)
    if (data?.raw) {
      const {html, arrangements} = songToHtml(data.raw)
      setArrangOpts(arrangements)
    }
  },[data])

  useEffect(()=>{
    if (arrangement) {
      const {html} = songToHtml(data.raw, arrangement)
      console.debug('html',html)
      setHtml(html)
    }
  }, [arrangement])

  
  return <div className={style.container}>
    <div className={style.controls}>
      <button onClick={() => setShowEdit(!showEdit)}>✏️</button>
      <button onClick={E=>{}}> 🔍 </button>
    </div>

    <div className={style.content}>
      <div>
        {showEdit && <Edit itemId={query.id} setShowEdit={setShowEdit} />}
      </div>
    
      <div>
        {data?.sections && <Sections data={data.sections} itemId={query.id} /> }

        {data && arrangOpts && <>
          <select onChange={e=>setArrangement(e.target.value)}>
            <option value=''>Select Arrangement</option>
            {arrangOpts?.map((arrangement, index) => (
              <option key={index} value={arrangement}>{arrangement}</option>
            ))}
          </select>
        </>}

        {html && arrangement && <>
          <div dangerouslySetInnerHTML={{__html: html}} />
        </>}
      </div>
    </div>
  </div>
}