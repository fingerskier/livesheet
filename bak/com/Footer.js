import React from 'react'
import Data from './Data'
import Icon from 'unicode-icons'


export default function Footer() {
  return <footer>
    livesheet &copy; fingerskier 2024
    
    <a href="#list">{Icon.BOOK}</a>
    <a href="#set">{Icon.GEAR}</a>
    <Data />
  </footer>
}