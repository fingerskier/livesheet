import React from 'react'

export default function RelationGraph({characters = []}) {
  const radius = 100
  const center = {x: radius + 20, y: radius + 20}

  const positions = {}
  const angleStep = (Math.PI * 2) / Math.max(characters.length, 1)
  characters.forEach((c, i) => {
    const angle = i * angleStep
    const x = center.x + radius * Math.cos(angle)
    const y = center.y + radius * Math.sin(angle)
    positions[c.id] = {x, y}
  })

  return (
    <svg width={center.x * 2} height={center.y * 2}>
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#333" />
        </marker>
      </defs>
      {characters.map(c => (
        <g key={c.id}>
          <circle cx={positions[c.id].x} cy={positions[c.id].y} r="15" fill="lightblue" />
          <text x={positions[c.id].x} y={positions[c.id].y} textAnchor="middle" dy=".3em" fontSize="10">
            {c.name}
          </text>
        </g>
      ))}
      {characters.flatMap(c =>
        Object.entries(c.relations || {}).map(([label, targetId], i) => {
          const from = positions[c.id]
          const to = positions[targetId]
          if (!from || !to) return null
          return (
            <g key={c.id + label + i}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#333" markerEnd="url(#arrow)" />
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2}
                textAnchor="middle"
                fontSize="8"
                fill="black"
              >
                {label}
              </text>
            </g>
          )
        })
      )}
    </svg>
  )
}
