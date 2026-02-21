import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { registerSW } from 'virtual:pwa-register'
registerSW()

// Debug: expose Razorpay key at startup to confirm build-time env injection
console.log('Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);