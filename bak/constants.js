const KEY = {
  ADD: 'ADD',
  APP: 'APP',
  CHORDSET: 'CHORDSET',
  CHORDS: 'CHORDS',
  EDIT: 'EDIT',
  LIST: 'LIST',
  LYRICS: 'LYRICS',
  MAIN: 'MAIN',
  PROGRAM: 'PROGRAM',
  QUERY: 'QUERY',
  SELECTION: 'SELECTION',
  SET: 'SET',
  SETS: 'SETS',
  SONG: 'SONG',
  SONGS: 'SONGS',
  VIEW: 'VIEW',
}

const STATE = {
  LIST: 'list',
  ADD: 'add',
  EDIT: 'edit',
  PROGRAM: 'program',
  SET: 'set',
  VIEW: 'view',
}


const VIEWS = {
  APP: {
    PROGRAM: {
      ADD: KEY.ADD,
      EDIT: KEY.EDIT,
      LIST: KEY.LIST,
      VIEW: KEY.VIEW,
    },
    
    SONG: {
      ADD: KEY.ADD,
      EDIT: KEY.EDIT,
      LIST: KEY.LIST,
      VIEW: KEY.VIEW,
    },
    
    SPEECH: {
      LIST: KEY.LIST,
      ADD: KEY.ADD,
      EDIT: KEY.EDIT,
    },
  }
}


const addPathFunction = (obj, path = []) => {
  return new Proxy(obj, {
    get(target, property) {
      if (property === 'path') {
        return path
      }
      const value = target[property]
      if (typeof value === 'object' && value !== null) {
        return addPathFunction(value, path.concat(property))
      }
      return {
        value,
        path: path.concat(property)
      }
    }
  })
}

const VIEW = addPathFunction(VIEWS)


export {
  KEY,
  STATE,
  VIEW,
}