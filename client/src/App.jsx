import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'
import AuthenticationPage from './pages/AuthenticationPage'
import ProtectedRoute from './components/HOC/ProtectedRoute'

function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/chat'
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path='/auth' element={<AuthenticationPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
