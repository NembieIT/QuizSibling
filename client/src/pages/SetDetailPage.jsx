import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteSet, getSet } from '../api/client.js'
import { Alert, Loading } from '../components/ui.jsx'
import { getBestScore } from '../utils/progress.js'

export default function SetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [set, setSet] = useState(null)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  const learnBest = getBestScore('learn', id)
  const testBest = getBestScore('test', id)

  useEffect(() => {
    getSet(id)
      .then(setSet)
      .catch(() => setError('Không tìm thấy bộ thẻ.'))
  }, [id])

  const handleDelete = async () => {
    try {
      await deleteSet(id)
      navigate('/')
    } catch {
      setError('Không thể xóa bộ thẻ.')
    }
  }

  if (error) return <Alert message={error} type="error" />
  if (!set) return <Loading />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{set.title}</h1>
          {set.description && <p className="text-slate-500 mt-1">{set.description}</p>}
          <p className="text-sm text-slate-400 mt-2">
            {set.terms.length} thuật ngữ · tạo {new Date(set.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/sets/${id}/learn`}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Học
          </Link>
          <Link
            to={`/sets/${id}/test`}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
          >
            Kiểm tra
          </Link>
          <Link
            to={`/sets/${id}/edit`}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300"
          >
            Sửa
          </Link>
          {confirming ? (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-red-600">Chắc chắn xóa?</span>
              <button
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              >
                Xóa
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-3 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {learnBest && (
        <p className="text-sm text-slate-500 mb-4">
          🏆 Học: điểm cao nhất {learnBest.correct}/{learnBest.total} ({learnBest.percent}%) ·{' '}
          {learnBest.date}
        </p>
      )}
      {testBest && (
        <p className="text-sm text-slate-500 mb-4">
          🏆 Kiểm tra: điểm cao nhất {testBest.correct}/{testBest.total} ({testBest.percent}%) ·{' '}
          {testBest.date}
        </p>
      )}

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {set.terms.map((t, i) => (
          <div key={i} className="flex items-start gap-4 p-4 hover:bg-slate-50">
            <span className="text-sm text-slate-400 font-medium w-8 shrink-0 pt-0.5">{i + 1}</span>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
              <div className="font-medium text-slate-800">{t.term}</div>
              <div className="text-slate-600">{t.definition}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}