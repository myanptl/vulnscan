import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScanPage from './pages/ScanPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScanPage />} />
        <Route path="/results/:scanId" element={<ResultsPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
