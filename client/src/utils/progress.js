const KEY = 'quizletsibling'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

const fmtDate = () => new Date().toLocaleDateString('vi-VN')

export function addScore(kind, setId, score) {
  const all = read()
  const key = `${kind}Scores`
  all[key] = all[key] || {}
  all[key][setId] = all[key][setId] || []
  all[key][setId].push({ ...score, date: fmtDate() })
  write(all)
}

export function getScores(kind, setId) {
  const all = read()
  return (all[`${kind}Scores`] || {})[setId] || []
}

export function getBestScore(kind, setId) {
  const scores = getScores(kind, setId)
  if (scores.length === 0) return null
  return scores.reduce((best, s) => (s.percent > best.percent ? s : best), scores[0])
}