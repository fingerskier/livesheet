import {useEffect, useState} from 'react'


export default function Section({data, index, onChange}) {
  const [texts, setTexts] = useState([])
  
  
  useEffect(()=>{
    if (data?.text) {
      const texts = data.text.split('\n')
      setTexts(texts)
    }
  }, [data.text])
  
  
  return <div>
      <li>
        <label>
          Name:
          <input
            value={data.name}
            onChange={e=>{
              const name = e.target.value
              onChange(data.map((data, J)=>
                index===J ? {...data, name} : data
              ))
            }}
          />
        </label>
        
        <br />
        
        <label>
          Chords:
          <input
            value={data.chords}
            onChange={e=>{
              const chords = e.target.value
              onChange(data.map((data, J)=>
                index===J ? {...data, chords} : data
              ))
            }}
          />
        </label>
        
        <br />
        
        <label>
          Text:
          <textarea
            value={data.text}
            onChange={e=>{
              const text = e.target.value
              onChange(data.map((data, J)=>
                index===J ? {...data, text} : data
              ))
            }}
          />
        </label>
      </li>
  </div>
}
