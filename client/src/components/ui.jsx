export function Loading({ text = 'Đang tải...' }) {
  return <div className="text-center text-slate-500 py-10">{text}</div>
}

export function Alert({ message, type }) {
  if (!message) return null
  const styles =
    type === 'error'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-green-50 text-green-700 border-green-200'
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${styles}`}>{message}</div>
  )
}

export function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
      {children}
    </span>
  )
}