// src/pages/AuthPage.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import api from '../../utils/api'
import useAuthStore from '../../store/authStore'

const loginSchema = yup.object({
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  password: yup
    .string()
    .min(6, 'Минимум 6 символов')
    .required('Пароль обязателен')
})

const registerSchema = yup.object({
  firstName: yup.string().required('Имя обязательно'),
  lastName: yup.string().required('Фамилия обязательна'),
  displayName: yup.string().required('Display name обязателен'),
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  password: yup
    .string()
    .min(6, 'Минимум 6 символов')
    .required('Пароль обязателен')
})

const LoginForm = ({ onSubmit, switchToRegister }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema)
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ maxWidth: '400px', margin: '0 auto' }}
    >
      <div style={{ marginBottom: '16px' }}>
        <input
          type='email'
          placeholder='Email'
          {...register('email')}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.email ? '1px solid red' : '1px solid #ccc'
          }}
        />
        {errors.email && (
          <p style={{ color: 'red', fontSize: '12px' }}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type='password'
          placeholder='Пароль'
          {...register('password')}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.password ? '1px solid red' : '1px solid #ccc'
          }}
        />
        {errors.password && (
          <p style={{ color: 'red', fontSize: '12px' }}>
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type='submit'
        style={{
          width: '100%',
          padding: '10px',
          background: '#007bff',
          color: 'white',
          border: 'none'
        }}
      >
        Войти
      </button>

      <p style={{ textAlign: 'center', marginTop: '16px' }}>
        Нет аккаунта?{' '}
        <button
          type='button'
          onClick={switchToRegister}
          style={{ color: '#007bff', background: 'none', border: 'none' }}
        >
          Зарегистрироваться
        </button>
      </p>
    </form>
  )
}

const RegisterForm = ({ onSubmit, switchToLogin }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(registerSchema)
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ maxWidth: '400px', margin: '0 auto' }}
    >
      <div style={{ marginBottom: '16px' }}>
        <input
          type='text'
          placeholder='Имя'
          {...register('firstName')}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.firstName ? '1px solid red' : '1px solid #ccc'
          }}
        />
        {errors.firstName && (
          <p style={{ color: 'red', fontSize: '12px' }}>
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type='text'
          placeholder='Фамилия'
          {...register('lastName')}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.lastName ? '1px solid red' : '1px solid #ccc'
          }}
        />
        {errors.lastName && (
          <p style={{ color: 'red', fontSize: '12px' }}>
            {errors.lastName.message}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type='text'
          placeholder='Display name'
          {...register('displayName')}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.displayName ? '1px solid red' : '1px solid #ccc'
          }}
        />
        {errors.displayName && (
          <p style={{ color: 'red', fontSize: '12px' }}>
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type='email'
          placeholder='Email'
          {...register('email')}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.email ? '1px solid red' : '1px solid #ccc'
          }}
        />
        {errors.email && (
          <p style={{ color: 'red', fontSize: '12px' }}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type='password'
          placeholder='Пароль'
          {...register('password')}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.password ? '1px solid red' : '1px solid #ccc'
          }}
        />
        {errors.password && (
          <p style={{ color: 'red', fontSize: '12px' }}>
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type='submit'
        style={{
          width: '100%',
          padding: '10px',
          background: '#007bff',
          color: 'white',
          border: 'none'
        }}
      >
        Зарегистрироваться
      </button>

      <p style={{ textAlign: 'center', marginTop: '16px' }}>
        Уже есть аккаунт?{' '}
        <button
          type='button'
          onClick={switchToLogin}
          style={{ color: '#007bff', background: 'none', border: 'none' }}
        >
          Войти
        </button>
      </p>
    </form>
  )
}

const AuthenticationPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const { login, register: registerUser } = useAuthStore()

  const handleSubmit = async data => {
    const endpoint = isLogin ? 'user/login' : 'user/registration'
    console.log('data--->', data)

    console.log('endpoint--->', endpoint)

    try {
      const res = await api.post(endpoint, data)
      console.log('res.data(ответ апи) ---->', res)

      // Сохраняем в zustand
      if (isLogin) {
        login(res.data)
      } else {
        registerUser(res.data)
      }

      alert('Успех! Теперь вы можете перейти в чат')
      navigate('/')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ошибка на сервере'
      alert(errorMessage)
    }
  }

  const switchForm = () => setIsLogin(!isLogin)

  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '100px auto',
        padding: '32px',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>
        {isLogin ? 'Вход' : 'Регистрация'}
      </h1>

      {isLogin ? (
        <LoginForm onSubmit={handleSubmit} switchToRegister={switchForm} />
      ) : (
        <RegisterForm onSubmit={handleSubmit} switchToLogin={switchForm} />
      )}
    </div>
  )
}

export default AuthenticationPage
