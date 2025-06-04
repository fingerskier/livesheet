import React from 'react'
import RelationGraph from './RelationGraph'

export default function Select({characters = []}) {
  return (
    <div>
      <h3>Character Relations</h3>
      <RelationGraph characters={characters} />
    </div>
  )
}
