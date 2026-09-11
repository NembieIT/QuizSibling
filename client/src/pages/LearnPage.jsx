import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getSet } from '../api/client.js'
import { Alert, Loading } from '../components/ui.jsx'
import { shuffle } from '../utils/helpers.js'
import { addScore, getScores } from '../utils/progress.js'

const MASTERY_LEVEL = 4
const DONT_KNOW = '__dont_know__'
const LEVEL_COLORS = ['bg-slate-200', 'bg-sky-300', 'bg-blue-400', 'bg-indigo-500', 'bg-green-500']

const buildOptions = (set, index) => {
  if (!set) return []
  const correct = set.terms[index].definition
  const distractors = shuffle(
    set.terms
      .filter((t, i) => i !== index && t.definition !== correct)
      .map((t) => t.definition)
  ).slice(0, 3)
  return shuffle([correct, ...distractors])
}

export default function LearnPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [set, setSet] = useState(null)
  const [error, setError] = useState('')
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [levels, setLevels] = useState({})
  const [options, setOptions] = useState([])
  const [phase, setPhase] = useState('choose')
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [doneCount, setDoneCount] = useState(0)
  const [known, setKnown] = useState(0)
  const [wrongSet, setWrongSet] = useState(() => new Set())
  const [finished, setFinished] = useState(false)
  const [history] = useState(() => {
    const s = getScores('learn', id)
    return s.map((x) => `${x.date}: ${x.correct}/${x.total} (${x.percent}%)`).join(' · ')
  })

  const total = set?.terms?.length || 0

  useEffect(() => {
    getSet(id)
      .then((s) => {
        setSet(s)
        const order = shuffle(s.terms.map((_, i) => i))
        setQueue(order.slice(1))
        setCurrent(order[0])
        setLevels(Object.fromEntries(s.terms.map((_, i) => [i, 0])))
        setOptions(buildOptions(s, order[0]))
      })
      .catch(() => setError('Không thể tải bộ thẻ.'))
  }, [id])

  const currentTerm = current !== null ? set?.terms[current] : null
  const progressTotal = total * MASTERY_LEVEL
  const progressSum = Object.values(levels).reduce((a, b) => a + b, 0)
  const percent = progressTotal ? Math.round((progressSum / progressTotal) * 100) : 0
  const currentLevel = current !== null ? levels[current] || 0 : 0

  const continueForNext = (nextQueue) => {
    if (nextQueue.length === 0) return
    const next = nextQueue[0]
    setCurrent(next)
    setQueue(nextQueue.slice(1))
    setOptions(buildOptions(set, next))
    setPhase('choose')
    setSelected(null)
    setResult(null)
  }

  const handleChoose = (option) => {
    if (phase !== 'choose' || currentTerm === null) return
    const isCorrect = option !== DONT_KNOW && option === currentTerm.definition
    setSelected(option)
    setResult(isCorrect ? 'correct' : 'wrong')
    setPhase('feedback')
  }

  const handleContinue = () => {
    if (result === null || currentTerm === null) return
    const nq = [...queue]
    const nextLevel = currentLevel + 1

    if (result === 'wrong') {
      const nw = new Set(wrongSet)
      nw.add(current)
      setWrongSet(nw)
      setLevels((lv) => ({ ...lv, [current]: 0 }))
      nq.splice(Math.min(1, nq.length), 0, current)
      continueForNext(nq)
      return
    }

    setLevels((lv) => ({ ...lv, [current]: nextLevel }))

    if (nextLevel >= MASTERY_LEVEL) {
      const nextKnown = known + (wrongSet.has(current) ? 0 : 1)
      if (nq.length === 0) {
        addScore('learn', id, {
          correct: nextKnown,
          total,
          percent: Math.round((nextKnown / total) * 100),
        })
        setKnown(nextKnown)
        setDoneCount(doneCount + 1)
        setFinished(true)
        return
      }
      setKnown(nextKnown)
      setDoneCount(doneCount + 1)
    } else {
      nq.push(current)
    }
    continueForNext(nq)
  }

  if (error) return <Alert message={error} type="error" />
  if (!set) return <Loading />

  if (finished) {
    const score = Math.round((known / total) * 100)
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="text-6xl mb-4">{score >= 80 ? '🎉' : score >= 50 ? '💪' : '📚'}</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Hoàn thành!</h1>
        <p className="text-slate-500 mb-6">
          Bạn nắm vững <b className="text-slate-800">{total}/{total}</b> thẻ. Trả lời đúng {known}/{total}{' '}
          thẻ ngay từ đầu ({score}%).
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(0)}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Học lại
          </button>
          <Link
            to={`/sets/${id}`}
            className="px-5 py-2.5 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
          >
            Về bộ thẻ
          </Link>
        </div>
        {history && <p className="text-xs text-slate-400 mt-6">Lịch sử: {history}</p>}
      </div>
    )
  }

  const optionClass = (opt) => {
    const base =
      'w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors'
    if (phase === 'choose') {
      return `${base} border-slate-300 text-slate-700 hover:border-blue-500 hover:bg-blue-50`
    }
    if (opt === currentTerm.definition) {
      return `${base} border-green-500 bg-green-50 text-green-700 font-semibold`
    }
    if (opt === selected) {
      return `${base} border-red-400 bg-red-50 text-red-700`
    }
    return `${base} border-slate-200 text-slate-400 opacity-60`
  }

  const feedbackClass =
    result === 'correct'
      ? 'border-green-400 animate-qs-pop'
      : result === 'wrong'
        ? 'border-red-400 animate-qs-shake'
        : ''

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span className="truncate pr-4">{set.title}</span>
          <span className="shrink-0">
            {percent}% · {doneCount}/{total} nắm vững
          </span>
        </div>
        <div className="flex gap-1">
          {set.terms.map((t, i) => {
            const lv = levels[i] || 0
            return (
              <div
                key={i}
                className="h-3 flex-1 rounded-full overflow-hidden bg-slate-200"
                title={`${t.term}: mức ${lv}/${MASTERY_LEVEL}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${LEVEL_COLORS[lv]}`}
                  style={{ width: `${(lv / MASTERY_LEVEL) * 100}%` }}
                />
              </div>
            )
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Mỗi thẻ có {MASTERY_LEVEL} mức. Đúng tăng mức; sai hoặc chọn "Bạn không biết" làm thẻ quay
          lại từ đầu.
        </p>
      </div>

      <div
        key={`${current}-${currentLevel}-${phase}`}
        className={`bg-white rounded-2xl border-2 p-8 shadow-sm animate-qs-enter ${feedbackClass}`}
      >
        <p className="text-sm text-slate-400 font-medium mb-3">THUẬT NGỮ</p>
        <div className="flex items-start justify-between gap-4 mb-6">
          <p className="text-3xl font-bold text-slate-800 break-words">{currentTerm.term}</p>
          <span className="shrink-0 text-xs font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-1">
            Mức {currentLevel}/{MASTERY_LEVEL}
          </span>
        </div>

        {phase === 'choose' ? (
          <div className="space-y-3">
            {options.map((opt) => (
              <button key={opt} onClick={() => handleChoose(opt)} className={optionClass(opt)}>
                {opt}
              </button>
            ))}
            <button
              onClick={() => handleChoose(DONT_KNOW)}
              className="w-full px-4 py-2.5 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              🤔 Bạn không biết
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                result === 'correct'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {result === 'correct'
                ? nextLevelText(currentLevel)
                : `✗ Sai. Đáp án đúng: ${currentTerm.definition}`}
            </div>
            {options.map((opt) => (
              <div
                key={opt}
                className={`px-4 py-3 rounded-lg border text-sm font-medium ${optionClass(opt)}`}
              >
                {opt}
                {opt === currentTerm.definition && ' ✓'}
                {phase === 'feedback' && opt === selected && opt !== currentTerm.definition && ' ✗'}
              </div>
            ))}
            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              {result === 'wrong' ? 'Thử lại (thẻ sẽ lặp lại)' : 'Tiếp tục'}
            </button>
          </div>
        )}
      </div>
    </div>
  )

  function nextLevelText(lv) {
    const nl = lv + 1
    return nl >= MASTERY_LEVEL
      ? `✨ Đúng! Thẻ đạt mức ${nl}/${MASTERY_LEVEL} — đã nắm vững.`
      : `✓ Đúng! (mức ${nl}/${MASTERY_LEVEL})`
  }
}