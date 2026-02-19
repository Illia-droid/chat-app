import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

function ProtectedRoute ({ children }) {
  const { isLoggedIn } = useAuthStore()
  console.log('isLoggedIn', isLoggedIn)

  return isLoggedIn ? children : <Navigate to='/auth' replace />
}
export default ProtectedRoute
