import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { DarkModeProvider } from './context/DarkModeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ModelTab from './pages/ModelTab'
import Evaluation from './pages/Evaluation'
import AutoencoderEvaluation from './pages/AutoencoderEvaluation'
import DiffusionEvaluation from './pages/DiffusionEvaluation'
import TransformerMetrics from './pages/TransformerMetrics'
import GANMetrics from './pages/GANMetrics'
import Comparison from './pages/Comparison'
import GDPR from './pages/GDPR'

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/model/:modelName" element={<ModelTab />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/autoencoder-evaluation" element={<AutoencoderEvaluation />} />
            <Route path="/diffusion-evaluation" element={<DiffusionEvaluation />} />
            <Route path="/transformer-metrics" element={<TransformerMetrics />} />
            <Route path="/gan-metrics" element={<GANMetrics />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/gdpr" element={<GDPR />} />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: '',
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-text)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
    </DarkModeProvider>
  )
}

export default App
