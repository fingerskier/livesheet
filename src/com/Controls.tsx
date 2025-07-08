import React from 'react'
import {StateButton} from 'ygdrassil'


export default function Controls() {
  return <>
    <StateButton to='songs'>All Songs</StateButton>
    <StateButton to='song-add'>Add Song</StateButton>
    <StateButton to='song-edit'>Edit Song</StateButton>
    <StateButton to='sets'>All Sets</StateButton>
    <StateButton to='set-add'>Add Set</StateButton>
    <StateButton to='set-edit'>Edit Set</StateButton>
    <StateButton to='live'>Live</StateButton>
    <StateButton to='settings'>Settings</StateButton>
  </>
}