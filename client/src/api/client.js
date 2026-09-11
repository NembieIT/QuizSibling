import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export const getSets = () => api.get('/api/sets').then((r) => r.data)
export const getSet = (id) => api.get(`/api/sets/${id}`).then((r) => r.data)
export const createSet = (data) => api.post('/api/sets', data).then((r) => r.data)
export const updateSet = (id, data) => api.put(`/api/sets/${id}`, data).then((r) => r.data)
export const deleteSet = (id) => api.delete(`/api/sets/${id}`).then((r) => r.data)

export default api