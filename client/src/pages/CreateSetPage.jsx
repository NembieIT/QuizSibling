import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createSet, getSet, updateSet } from '../api/client.js'
import { Alert, Loading } from '../components/ui.jsx'
import { parseJsonToTerms, parseTextToTerms } from '../utils/helpers.js'

const TABS = [
  { id: 'manual', label: 'Thủ công' },
  { id: 'text', label: 'Dán văn bản' },
  { id: 'json', label: 'JSON' },
]

const SAMPLE_TEXT = `悪\tÁC, Ố (Hung ác, độc ác; tăng ố) | Bộ TÂM | On: アク、オ | Kun: わる-い
安\tAN (An bình, an ổn) | Bộ MIÊN | On: アン | Kun: やす-い
以\tDĨ (Dĩ tiền, dĩ vãng) | Bộ NHÂN | On: イ`

export default function CreateSetPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [terms, setTerms] = useState([{ term: '', definition: '' }])
  const [tab, setTab] = useState('manual')
  const [text, setText] = useState(SAMPLE_TEXT)
  const [json, setJson] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!id) return
    getSet(id)
      .then((set) => {
        setTitle(set.title)
        setDescription(set.description || '')
        setTerms(set.terms.map((t) => ({ term: t.term, definition: t.definition })))
      })
      .catch(() => setError('Không thể tải bộ thẻ để sửa.'))
      .finally(() => setLoading(false))
  }, [id])

  const updateTerm = (i, field, value) => {
    setTerms((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)))
  }

  const addTerm = () => setTerms((prev) => [...prev, { term: '', definition: '' }])
  const removeTerm = (i) => setTerms((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)))

  const onTextChange = (v) => {
    setText(v)
    const parsed = parseTextToTerms(v)
    if (parsed.length > 0) {
      setTerms(parsed)
      setError('')
    }
  }

  const onJsonChange = (v) => {
    setJson(v)
    if (!v.trim()) return
    try {
      const parsed = parseJsonToTerms(v)
      if (parsed.length > 0) {
        setTerms(parsed)
        setError('')
      }
    } catch {
      /* chưa hoàn chỉnh khi đang gõ — xử lý khi submit/import */
    }
  }

  const importText = () => {
    const parsed = parseTextToTerms(text)
    if (parsed.length === 0) return setError('Không tìm thấy cặp câu hỏi/đáp án hợp lệ trong văn bản.')
    setTerms(parsed)
    setNotice(`Đã nhập ${parsed.length} thẻ.`)
    setError('')
  }

  const importJson = () => {
    try {
      const parsed = parseJsonToTerms(json)
      setTerms(parsed)
      setNotice(`Đã import ${parsed.length} thẻ từ JSON.`)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    let cleanTerms
    if (tab === 'text') {
      cleanTerms = parseTextToTerms(text)
      if (cleanTerms.length === 0)
        return setError('Không tìm thấy cặp câu hỏi/đáp án hợp lệ trong văn bản đã dán.')
      setTerms(cleanTerms)
    } else if (tab === 'json') {
      try {
        cleanTerms = parseJsonToTerms(json)
      } catch (err) {
        return setError(err.message)
      }
      setTerms(cleanTerms)
    } else {
      cleanTerms = terms
        .map((t) => ({ term: t.term.trim(), definition: t.definition.trim() }))
        .filter((t) => t.term && t.definition)
    }

    if (!title.trim()) return setError('Vui lòng nhập tiêu đề bộ thẻ.')
    if (cleanTerms.length === 0) return setError('Bộ thẻ cần ít nhất một cặp câu hỏi/đáp án.')

    try {
      setSubmitting(true)
      const payload = { title: title.trim(), description: description.trim(), terms: cleanTerms }
      const saved = isEdit ? await updateSet(id, payload) : await createSet(payload)
      navigate(`/sets/${saved._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu bộ thẻ. Hãy thử lại.')
      setSubmitting(false)
    }
  }

  if (loading) return <Loading text="Đang tải bộ thẻ..." />

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        {isEdit ? 'Sửa bộ thẻ' : 'Tạo bộ thẻ mới'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Từ vựng tiếng Anh"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Mô tả ngắn về bộ thẻ (tùy chọn)"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex gap-2 mb-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'manual' && (
            <div className="space-y-3">
              {terms.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={t.term}
                    onChange={(e) => updateTerm(i, 'term', e.target.value)}
                    placeholder="Câu hỏi / thuật ngữ"
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={t.definition}
                    onChange={(e) => updateTerm(i, 'definition', e.target.value)}
                    placeholder="Đáp án / định nghĩa"
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeTerm(i)}
                    disabled={terms.length === 1}
                    className="px-3 rounded-lg text-slate-400 hover:text-red-500 disabled:opacity-30 text-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTerm}
                className="px-4 py-2 rounded-lg border border-dashed border-slate-300 text-sm text-blue-600 hover:bg-blue-50 font-medium"
              >
                + Thêm thẻ
              </button>
            </div>
          )}

          {tab === 'text' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Tự nhận dạng: dòng bắt đầu bằng chữ <b>kanji</b> → câu hỏi là chữ đó, đáp án là phần
                còn lại. Nếu không, tách theo dấu <b>Tab</b>, <b>:</b>, <b>|</b> hoặc <b>;</b>.
              </p>
              <textarea
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                rows={8}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={importText}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Nhập nhanh
              </button>
            </div>
          )}

          {tab === 'json' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Dán mảng JSON: <span className="font-mono">[{{"term":"...", "definition":"..."}}]</span>
              </p>
              <textarea
                value={json}
                onChange={(e) => onJsonChange(e.target.value)}
                rows={6}
                placeholder={'[{"term": "hello", "definition": "xin chào"}]'}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={importJson}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Import JSON
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Alert message={error} type="error" />
          <Alert message={notice} type="success" />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo bộ thẻ'}
          </button>
        </div>
      </form>
    </div>
  )
}