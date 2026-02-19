import React from 'react'
import { useParams } from 'react-router-dom'
import { useUserProfile } from '../../api/userQueries'
import styles from './UserCard.module.scss'

const UserCard = () => {
  const { id } = useParams()
  const { data, isLoading, isError } = useUserProfile(id)

  if (isLoading) return <div className={styles.state}>Loading...</div>
  if (isError) return <div className={styles.state}>Error loading user</div>

  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        {data?.displayName?.charAt(0).toUpperCase()}
      </div>

      <div className={styles.info}>
        <h2 className={styles.name}>{data?.displayName}</h2>

        <div className={styles.row}>
          <span className={styles.label}>Email:</span>
          <span>{data?.email}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>First name:</span>
          <span>{data?.firstName}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Last name:</span>
          <span>{data?.lastName}</span>
        </div>

        <div className={styles.id}>User ID: {data?.id}</div>
      </div>
    </div>
  )
}

export default UserCard
