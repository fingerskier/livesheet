import React, { useRef } from 'react'
import { getItem } from '../../hook/useLocalStorage'
import Icon from 'unicode-icons'

export default function Data() {
  const fileInput = useRef(null)

  const downloadData = () => {
    const data = {}
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      try {
        data[key] = JSON.parse(window.localStorage.getItem(key))
      } catch (err) {
        data[key] = window.localStorage.getItem(key)
      }
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const mergeArraysById = (current = [], incoming = []) => {
    const result = [...current]
    incoming.forEach(item => {
      const index = result.findIndex(i => i.id === item.id)
      if (index > -1) {
        result[index] = { ...result[index], ...item }
      } else {
        result.push(item)
      }
    })
    return result
  }

  const setItemAndNotify = (key, value) => {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(
      new CustomEvent('localStorageUpdate', { detail: { key, newValue: value } })
    )
  }

  const mergeData = incoming => {
    Object.entries(incoming).forEach(([key, value]) => {
      try {
        const current = getItem(key)
        let merged = value
        if (Array.isArray(current) && Array.isArray(value)) {
          merged = mergeArraysById(current, value)
        }
        setItemAndNotify(key, merged)
      } catch (err) {
        setItemAndNotify(key, value)
      }
    })
  }

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const incoming = JSON.parse(evt.target.result)
        mergeData(incoming)
      } catch (err) {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <button onClick={downloadData}>{Icon.FLOPPY_DISK}</button>
      <input
        type="file"
        accept="application/json"
        ref={fileInput}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button onClick={() => fileInput.current?.click()}>{Icon.UPLOAD}</button>
    </>
  )
}
