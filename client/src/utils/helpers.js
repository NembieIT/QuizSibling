const DELIMITERS = ['\t', '|', ':', ';']

const CJK_RUN = /^[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF]+/

export function parseTextToTerms(text) {
  const terms = []
  const lines = text.split('\n')
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    let term, definition
    const cjk = line.match(CJK_RUN)

    if (cjk && cjk[0].length < line.length) {
      term = cjk[0]
      definition = line.slice(cjk[0].length)
    } else {
      let splitIdx = -1
      for (const d of DELIMITERS) {
        const idx = line.indexOf(d)
        if (idx !== -1) {
          splitIdx = idx
          break
        }
      }
      if (splitIdx === -1) continue
      term = line.slice(0, splitIdx)
      definition = line.slice(splitIdx + 1)
    }

    term = term.trim()
    definition = definition.trim()
    if (term && definition) terms.push({ term, definition })
  }
  return terms
}

export function parseJsonToTerms(text) {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('JSON phải là một mảng')
  return data.map((item, i) => {
    if (typeof item !== 'object' || item === null) throw new Error(`Phần tử ${i + 1} không hợp lệ`)
    const term = String(item.term ?? '').trim()
    const definition = String(item.definition ?? '').trim()
    if (!term || !definition) throw new Error(`Phần tử ${i + 1} thiếu term hoặc definition`)
    return { term, definition }
  })
}

export function normalizeAnswer(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.?!,]/g, '')
}

export function isAnswerCorrect(userAnswer, correctAnswer, threshold = 0.8) {
  const a = normalizeAnswer(userAnswer)
  const b = normalizeAnswer(correctAnswer)
  if (!a) return false
  if (a === b) return true
  const longer = a.length >= b.length ? a : b
  const shorter = a.length >= b.length ? b : a
  if (longer.length < 4) return a.includes(b) || b.includes(a)
  let matched = 0
  for (const word of shorter.split(' ')) {
    if (longer.includes(word)) matched += word.length
  }
  return matched / longer.length >= threshold
}

export function isAnswerLenient(userAnswer, correctAnswer) {
  const a = normalizeAnswer(userAnswer)
  const b = normalizeAnswer(correctAnswer)
  if (!a) return false
  if (a === b) return true
  if (a.length >= 3 && b.includes(a)) return true
  if (b.length >= 3 && a.includes(b)) return true
  const tokensA = a.split(' ').filter((t) => t.length > 1)
  const tokensB = b.split(' ').filter((t) => t.length > 1)
  for (const token of tokensA) {
    if (b.includes(token)) return true
  }
  for (const token of tokensB) {
    if (a.includes(token)) return true
  }
  return false
}

export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}