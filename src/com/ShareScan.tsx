import {useEffect, useRef, useState} from 'react'
import {db, type Song} from '@/lib/db'

export default function ShareScan() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let stream: MediaStream
    let active = true

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        if ('BarcodeDetector' in window) {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
          async function scan() {
            if (!active || !videoRef.current) return
            try {
              const codes = await detector.detect(videoRef.current)
              if (codes.length) {
                const raw = codes[0].rawValue
                if (raw) {
                  active = false
                  try {
                    const song: Song = JSON.parse(raw)
                    await db.open()
                    await db.songs.put(song)
                    setMessage(`Added song: ${song.name}`)
                  } catch {
                    setMessage('Invalid QR code')
                  }
                  stream.getTracks().forEach(t => t.stop())
                  return
                }
              }
            } catch {
              // ignore
            }
            requestAnimationFrame(scan)
          }
          requestAnimationFrame(scan)
        } else {
          setMessage('Barcode detector not supported')
        }
      } catch {
        setMessage('Camera unavailable')
      }
    }
    start()
    return () => {
      active = false
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  return <div>
    <h2>Scan Song</h2>
    <video ref={videoRef} className='qr-video' />
    {message && <p>{message}</p>}
  </div>
}
