import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize appearance mode theme from localStorage
const savedTheme = localStorage.getItem('af_theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark-theme');
} else {
  document.documentElement.classList.remove('dark-theme');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
