module.exports = {
  /**
   * Transform git timestamp to unix timestamp
   */
  timestamp: a => +a * 1000,

  /**
   * Transform parents string to a clean array
   */
  parents: a => a.split(' ').filter(b => b),

  /**
   * Transform refs string to a clean array
   */
  refs: a => a.replace(/[\(\)]/g, '')
    .replace('->', ',')
    .split(', ')
    .map(a => a.trim())
    .filter(a => a)
};