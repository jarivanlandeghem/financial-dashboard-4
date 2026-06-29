import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'liquidify-react/styles'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/inter/900.css'
import './index.css'
import './styles/liquid-glass.css'
import App from './App.jsx'
import { initSquircles } from './utils/squircleInit'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize the superellipse squircle engine after first paint
setTimeout(initSquircles, 0)
