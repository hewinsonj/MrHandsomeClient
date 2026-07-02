import apiUrl from '../apiConfig'
import axios from 'axios'

export const signUp = (credentials) =>
  axios({
    method: 'POST',
    url: apiUrl + '/sign-up',
    data: {
      credentials: {
        email: credentials.email,
        password: credentials.password,
        password_confirmation: credentials.passwordConfirmation,
      },
    },
  })

export const signIn = (credentials) =>
  axios({
    method: 'POST',
    url: apiUrl + '/sign-in',
    data: {
      credentials: {
        email: credentials.email,
        password: credentials.password,
      },
    },
  })

export const signOut = (user) =>
  axios({
    method: 'DELETE',
    url: apiUrl + '/sign-out',
    headers: { Authorization: `Token token=${user.token}` },
  })

export const changePassword = (passwords, user) =>
  axios({
    method: 'PATCH',
    url: apiUrl + '/change-password',
    headers: { Authorization: `Token token=${user.token}` },
    data: {
      passwords: {
        old: passwords.oldPassword,
        new: passwords.newPassword,
      },
    },
  })
