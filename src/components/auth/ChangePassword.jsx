import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { changePassword } from '../../api/auth'
import messages from '../shared/AutoDismissAlert/messages'

const ChangePassword = ({ msgAlert, user }) => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const navigate = useNavigate()

  const onChangePassword = (e) => {
    e.preventDefault()
    changePassword({ oldPassword, newPassword }, user)
      .then(() => msgAlert({ heading: 'Password Changed', message: messages.changePasswordSuccess, variant: 'success' }))
      .then(() => navigate('/'))
      .catch((err) => {
        setOldPassword('')
        setNewPassword('')
        msgAlert({ heading: 'Failed: ' + err.message, message: messages.changePasswordFailure, variant: 'danger' })
      })
  }

  return (
    <div className='row'>
      <div className='col-sm-10 col-md-6 mx-auto mt-5'>
        <h3>Change Password</h3>
        <Form onSubmit={onChangePassword}>
          <Form.Group controlId='oldPassword' className='mb-3'>
            <Form.Label>Old Password</Form.Label>
            <Form.Control required type='password' value={oldPassword} placeholder='Old Password' onChange={(e) => setOldPassword(e.target.value)} />
          </Form.Group>
          <Form.Group controlId='newPassword' className='mb-3'>
            <Form.Label>New Password</Form.Label>
            <Form.Control required type='password' value={newPassword} placeholder='New Password' onChange={(e) => setNewPassword(e.target.value)} />
          </Form.Group>
          <Button variant='primary' type='submit'>Update Password</Button>
        </Form>
      </div>
    </div>
  )
}

export default ChangePassword
