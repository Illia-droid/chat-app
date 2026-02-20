import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useUpdateUser, useUserProfile } from '../../api/userQueries'
import useAuthStore from '../../store/authStore'
import styles from './UserCard.module.scss'
import FileUploader from '../FileUploader'

const UserCard = () => {
  const { id } = useParams()
  const { user: authUser, setUser } = useAuthStore()

  const isOwnProfile = authUser?.id === Number(id)

  const { data: fetchedUser, isLoading } = useUserProfile(
    isOwnProfile ? null : id
  )

  const user = isOwnProfile ? authUser : fetchedUser

  const updateUser = useUpdateUser()
  const [isEdit, setIsEdit] = useState(false)

  if (!user || isLoading) {
    return <div className={styles.state}>Loading user...</div>
  }

  const handleChange = e => {
    const { name, value } = e.target
    setUser({ ...authUser, [name]: value })
  }

  const handleSave = () => {
    const { id, displayName, firstName, lastName } = authUser
    updateUser.mutate(
      { id, payload: { displayName, firstName, lastName } },
      {
        onSuccess: () => setIsEdit(false)
      }
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user.displayName?.charAt(0).toUpperCase()}
        </div>
     
        {isOwnProfile && <FileUploader />}

        <div>
          <h2 className={styles.name}>{user.displayName}</h2>
          <div className={styles.subtitle}>
            {isOwnProfile ? 'Your profile' : 'User profile'}
          </div>
        </div>
      </div>

      {isOwnProfile && isEdit ? (
        <div className={styles.form}>
          <div className={styles.field}>
            <label>Display name</label>
            <input
              name='displayName'
              value={authUser.displayName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input value={authUser.email} disabled />
          </div>

          <div className={styles.field}>
            <label>First name</label>
            <input
              name='firstName'
              value={authUser.firstName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label>Last name</label>
            <input
              name='lastName'
              value={authUser.lastName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.save}
              onClick={handleSave}
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? 'Saving...' : 'Save'}
            </button>
            <button className={styles.cancel} onClick={() => setIsEdit(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.label}>Email</td>
                <td>{user.email}</td>
              </tr>
              <tr>
                <td className={styles.label}>First name</td>
                <td>{user.firstName}</td>
              </tr>
              <tr>
                <td className={styles.label}>Last name</td>
                <td>{user.lastName}</td>
              </tr>
              <tr>
                <td className={styles.label}>User ID</td>
                <td>{user.id}</td>
              </tr>
            </tbody>
          </table>

          {isOwnProfile && (
            <button className={styles.edit} onClick={() => setIsEdit(true)}>
              Edit profile
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default UserCard
