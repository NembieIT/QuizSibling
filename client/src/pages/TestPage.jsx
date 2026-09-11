import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSet } from '../api/client.js'
import { Alert, Loading } from '../components/ui.jsx'
import { isAnswerCorrect, shuffle } from '../utils/helpers.js'
import { addScore, getScores } from '../utils/progress.js'

const round = (n) => Math.round(n)

export default function TestPage() {
  const { id } = useParams()
  const [set, setSet] = useState(null)
  const [error, setError] = useState('')
  const [numQuestions, setNumQuestions] = useState(10)
  const [types, setTypes] = useState({ mcq: true, written: true })
  const [started, setStarted] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [history] = useState(() => {
    const s = getScores('test', id)
    return s.map((x) => `${x.date}: ${x.correct}/${x.total} (${x.percent}%)`).join(' · ')
  })

  useEffect(() => {
    getSet(id)
      .then(setSet)
      .catch(() => setError('Không thể tải bộ thẻ.'))
  }, [id])

  const total = set?.terms?.length || 0
  const canMcq = total >= 4

  const buildQuestions = () => {
    const count = Math.min(Math.max(1, numQuestions), total)
    const availableTypes = Object.entries(types)
      .filter(([k, v]) => v && (k !== 'mcq' || canMcq))
      .map(([k]) => k)
    if (availableTypes.length === 0) return

    const order = shuffle(set.terms.map((_, i) => i)).slice(0, count)
    const qs = order.map((index) => {
      const type = availableTypes[Math.floor(Math.random() * availableTypes.length)]
      const correct = set.terms[index].definition
      let options = []
      if (type === 'mcq') {
        const distractors = shuffle(
          set.terms
            .map((t, i) => ({ def: t.definition, idx: i }))
            .filter((d) => d.idx !== index && d.def !== correct)
        )
          .slice(0, 3)
          .map((d) => d.def)
        while (distractors.length < 3) distractors.push('Không có đáp án (trống)')
        options = shuffle([correct, ...distractors])
      }
      return { index, type, options, correct }
    })
    setQuestions(qs)
    setStarted(true)
    setCurrentIdx(0)
    setAnswers({})
    setSubmitted(false)
  }

  const countCorrect = (next) =>
    questions.filter((q, i) =>
      q.type === 'written' ? isAnswerCorrect(next[i], q.correct) : next[i] === q.correct
    ).length

  const handleAnswer = (questionIdx, value) => {
    const next = { ...answers, [questionIdx]: value }
    setAnswers(next)
    if (questionIdx < questions.length - 1) {
      setCurrentIdx(questionIdx + 1)
    } else {
      const correct = countCorrect(next)
      setSubmitted(true)
      addScore('test', id, {
        correct,
        total: questions.length,
        percent: round((correct / questions.length) * 100),
      })
    }
  }

  if (error) return <Alert message={error} type="error" />
  if (!set) return <Loading />

  if (!started) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 mb-4">Kiểm tra: {set.title}</h1>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Số câu hỏi</span>
            <input
              type="number"
              min={1}
              max={total}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-400">Tối đa {total} câu</span>
          </label>
          <div>
            <span className="text-sm font-semibold text-slate-700 block mb-2">Dạng câu hỏi</span>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={types.mcq}
                  disabled={!canMcq}
                  onChange={(e) => setTypes((t) => ({ ...t, mcq: e.target.checked }))}
                  className="accent-blue-600"
                />
                Trắc nghiệm (nhiều lựa chọn)
                {!canMcq && <span className="text-xs text-slate-400">— cần ≥ 4 thẻ</span>}
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={types.written}
                  onChange={(e) => setTypes((t) => ({ ...t, written: e.target.checked }))}
                  className="accent-blue-600"
                />
                Tự luận (nhập đáp án)
              </label>
            </div>
          </div>
          {history && <p className="text-xs text-slate-400">Lịch sử: {history}</p>}
          <button
            onClick={buildQuestions}
            disabled={!Object.entries(types).filter(([k, v]) => v && (k !== 'mcq' || canMcq)).length}
            className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            Bắt đầu kiểm tra
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    const correctCount = countCorrect(answers)
    const score = round((correctCount / questions.length) * 100)
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{score >= 80 ? '🎉' : score >= 50 ? '💪' : '📚'}</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            {correctCount}/{questions.length} đúng — {score}%
          </h1>
          <p className="text-slate-500 mb-4">Kết quả kiểm tra của bạn</p>
          <Link
            to={`/sets/${id}`}
            className="px-5 py-2.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
          >
            Về bộ thẻ
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {questions.map((q, i) => {
            const ok =
              q.type === 'written'
                ? isAnswerCorrect(answers[i], q.correct)
                : answers[i] === q.correct
            return (
              <div key={i} className="p-4 flex gap-3">
                <span
                  className={`text-lg shrink-0 ${ok ? 'text-green-600' : 'text-red-500'}`}
                >
                  {ok ? '✓' : '✗'}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 break-words">{set.terms[q.index].term}</p>
                  {!ok && (
                    <p className="text-sm text-red-600 mt-1">
                      Bạn trả lời: {answers[i] ? `"${answers[i]}"` : '(bỏ trống)'}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 mt-1">Đáp án: {q.correct}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const question = questions[currentIdx]
  if (!question) return <Loading />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between text-sm text-slate-500 mb-3">
        <span>Kiểm tra: {set.title}</span>
        <span>
          Câu {currentIdx + 1}/{questions.length}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-6">
        <div
          className="h-full bg-purple-600 transition-all duration-300"
          style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <p className="text-sm text-slate-400 font-medium mb-3">
          {question.type === 'mcq' ? 'TRẮC NGHIỆM' : 'TỰ LUẬN'}
        </p>
        <p className="text-2xl font-bold text-slate-800 mb-6 break-words">
          {set.terms[question.index].term}
        </p>

        {question.type === 'mcq' ? (
          <div className="space-y-2">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(currentIdx, opt)}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (answers[currentIdx]?.trim()) handleAnswer(currentIdx, answers[currentIdx].trim())
            }}
            className="space-y-3"
          >
            <input
              type="text"
              autoFocus
              value={answers[currentIdx] || ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [currentIdx]: e.target.value }))}
              placeholder="Nhập đáp án..."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!answers[currentIdx]?.trim()}
              className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              {currentIdx === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}