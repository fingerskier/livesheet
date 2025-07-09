import Dexie from 'dexie'
import type { Table } from 'dexie'
import dexieCloud, { type DexieCloudOptions } from 'dexie-cloud-addon'
import dexieConfig from '../../dexie-cloud.json' assert { type: 'json' }


export type Song = {
  id: string      // UUID v4
  name: string
  text: string
}

export type Set = {
  id: string      // UUID v4
  name: string
  date: number   // Unix ms
  songs: Song[]   // list of song IDs
}


const schema = {
  version: 1,
  stores: {
    sets: '&id, name, date, songs',
    songs: '&id, name, text',
  }
}


class AppDB extends Dexie {
  sets!: Table<Set, string>
  songs!: Table<Song, string>

  constructor () {
    super('dexie-browser', {
      addons: [dexieCloud],
      autoOpen: false
    })

    this.version(schema.version).stores(schema.stores)
  }
}

export const db = new AppDB()



export async function initDb () {
  db.cloud.configure(dexieConfig)
  await db.open()
}

declare global {
  interface Window { db: AppDB }
}

if (typeof window !== 'undefined') {
  window.db = db // for devtools
}


export async function login (hints?: { email?: string }) {
  await initDb()
  await db.cloud.login(hints)
}

export async function logout () {
  await db.cloud.logout()
  db.close()
}