import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import CreateSetPage from './pages/CreateSetPage.jsx'
import SetDetailPage from './pages/SetDetailPage.jsx'
import LearnPage from './pages/LearnPage.jsx'
import TestPage from './pages/TestPage.jsx'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sets/new" element={<CreateSetPage />} />
        <Route path="/sets/:id/edit" element={<CreateSetPage />} />
        <Route path="/sets/:id" element={<SetDetailPage />} />
        <Route path="/sets/:id/learn" element={<LearnPage />} />
        <Route path="/sets/:id/test" element={<TestPage />} />
      </Routes>
    </Layout>
  )
}

export default App