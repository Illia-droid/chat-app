// src/components/Navbar.jsx
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

function Header () {
  const { user, isLoggedIn, logout } = useAuthStore()
  console.log(user)

  return (
    <nav
      style={{
        padding: '12px 24px',
        background: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div>
        <Link
          to='/'
          style={{
            fontWeight: 'bold',
            fontSize: '1.4rem',
            textDecoration: 'none',
            color: '#333'
          }}
        >
          Home
        </Link>
        <Link
          to='/chat'
          style={{
            fontWeight: 'bold',
            fontSize: '1.4rem',
            textDecoration: 'none',
            color: '#333'
          }}
        >
          Chat
        </Link>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        {isLoggedIn ? (
          <>
            {/* Показываем displayName в углу */}
            <div
              style={{
                background: '#e9ecef',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.95rem'
              }}
            >
              <Link to={`/user/${user?.id}`}>
                👤 {user?.displayName || 'Пользователь'}
              </Link>
            </div>

            <button
              onClick={logout}
              style={{
                padding: '6px 12px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Выйти
            </button>
          </>
        ) : (
          <Link
            to='/auth'
            style={{
              padding: '6px 12px',
              background: '#007bff',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            Войти / Зарегистрироваться
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Header
