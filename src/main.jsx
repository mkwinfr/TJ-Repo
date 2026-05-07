import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Fonts bundled locally for offline support — no CDN dependency
import '@fontsource-variable/baloo-2'
import '@fontsource/bungee-inline'
import '@fontsource/chewy'
import '@fontsource/lilita-one'
import '@fontsource/titan-one'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
