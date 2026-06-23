import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminApp from './AdminApp.jsx'

const isAdmin = window.location.pathname.startsWith('/admin')

ReactDOM.createRoot(document.getElementById('root')).render(
  isAdmin ? <AdminApp /> : <App />
)
