import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import { Proveedor } from './state/AppContext.jsx'
import App from './App.jsx'
import { params } from './lib/params.js'

if (params.font) document.documentElement.dataset.font = params.font
if (params.annotate) document.documentElement.dataset.anotado = '1'
if (params.freeze) document.documentElement.dataset.reduce = '1'

createRoot(document.getElementById('root')).render(
  <Proveedor>
    <App />
  </Proveedor>
)
