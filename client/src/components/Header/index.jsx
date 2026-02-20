import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import styles from './Header.module.scss'

function Header() {
  const { user, isLoggedIn, logout } = useAuthStore()

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link to='/' className={styles.logo}>Home</Link>
      </div>

      <div className={styles.right}>
        {isLoggedIn ? (
          <div className={styles.userMenu}>
            <Link to={`/user/${user?.id}`} className={styles.userTrigger}>
              <div className={styles.avatar}>
                {user?.displayName?.charAt(0).toUpperCase()}
              </div>
              <span>{user?.displayName || 'Пользователь'}</span>
            </Link>

            <div className={styles.dropdown}>
              <Link to='/chat' className={styles.item}>💬 Чаты</Link>
              <Link to={`/user/${user?.id}`} className={styles.item}>👤 Профиль</Link>

              <button onClick={logout} className={styles.logout}>
                🚪 Выйти
              </button>
            </div>
          </div>
        ) : (
          <Link to='/auth' className={styles.authBtn}>
            Войти / Зарегистрироваться
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Header
