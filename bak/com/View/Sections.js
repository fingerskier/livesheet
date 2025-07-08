import {useEffect, useState} from 'react'
import Section from './Section'


export default function Sections({data}) {
  return <div>
    {data?.map((section, index) => 
      <Section key={index} data={section} />
    )}
  </div>
}