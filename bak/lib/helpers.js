function isDigit(char) {
  return !isNaN(parseInt(char));
}


const filterPattern = str=>{
  const escapedFilter = str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const patternString = escapedFilter.split('').join('.*')
  return new RegExp(patternString, 'i')
}


export {
  filterPattern,
  isDigit,
}