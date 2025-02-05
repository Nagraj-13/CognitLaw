import { useState } from 'react'

import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom' // Import Routes
import LandingPage from './app/page'
import LawbotChat from './components/ChatInterface'
import Dashboard from './components/Dashboard'


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes> {/* Wrap your Route components with Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<LawbotChat />} />
          <Route path='/dashboard' element={<Dashboard/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
