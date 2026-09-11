import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid place-items-center w-8 h-8 rounded bg-blue-600 text-white font-bold">
              Q
            </span>
            <span className="font-bold text-lg text-slate-800">QuizletSibling</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              to="/sets/new"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              + Tạo bộ thẻ
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
        QuizletSibling — Xây dựng bằng React + Node.js + MongoDB
      </footer>
    </div>
  )
}