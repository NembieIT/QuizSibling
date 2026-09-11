import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSets } from '../api/client.js'
import { Loading, Alert } from '../components/ui.jsx'

export default function HomePage() {
  const [sets, setSets] = useState(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    getSets()
      .then(setSets)
      .catch(() => setError('Không thể tải danh sách bộ thẻ. Hãy kiểm tra server.'))
  }, [])

  const filtered = useMemo(() => {
    if (!sets) return []
    const q = query.trim().toLowerCase()
    if (!q) return sets
    return sets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.terms.some(
          (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
        )
    )
  }, [sets, query])

  if (error) return <Alert message={error} type="error" />
  if (!sets) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Bộ thẻ</h1>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm theo tiêu đề hoặc từ..."
          className="w-72 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg mb-2">Chưa có bộ thẻ nào{query ? ' khớp với tìm kiếm' : ''}.</p>
          <Link to="/sets/new" className="text-blue-600 font-medium hover:underline">
            Tạo bộ thẻ đầu tiên →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((set) => (
            <Link
              key={set._id}
              to={`/sets/${set._id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-shadow"
            >
              <h2 className="font-semibold text-slate-800 mb-1 line-clamp-1">{set.title}</h2>
              {set.description && (
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{set.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{set.terms.length} thuật ngữ</span>
                <span>{new Date(set.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}