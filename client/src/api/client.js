import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export const getSets = () => api.get('/sets').then((r) => r.data)
export const getSet = (id) => api.get(`/sets/${id}`).then((r) => r.data)
export const createSet = (data) => api.post('/sets', data).then((r) => r.data)
export const updateSet = (id, data) => api.put(`/sets/${id}`, data).then((r) => r.data)
export const deleteSet = (id) => api.delete(`/sets/${id}`).then((r) => r.data)

export default api