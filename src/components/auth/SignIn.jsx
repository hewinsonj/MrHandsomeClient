import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { signIn } from '../../api/auth'
import messages from '../shared/AutoDismissAlert/messages'

const SignIn = ({ msgAlert, setUser }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const onSignIn = (e) => {
    e.preventDefault()
    signIn({ email, password })
      .then((res) => setUser(res.data.user))
      .then(() => msgAlert({ heading: 'Signed In', message: messages.signInSuccess, variant: 'success' }))
      .then(() => navigate('/'))
      .catch((err) => {
        setEmail('')
        setPassword('')
        msgAlert({ heading: 'Sign In Failed: ' + err.message, message: messages.signInFailure, variant: 'danger' })
      })
  }

  return (
    <div className='row'>
      <div className='col-sm-10 col-md-6 mx-auto mt-5'>
        <h3>Sign In</h3>
        <Form onSubmit={onSignIn}>
          <Form.Group controlId='email' className='mb-3'>
            <Form.Label>Email</Form.Label>
            <Form.Control required type='email' value={email} placeholder='Enter email' onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group controlId='password' className='mb-3'>
            <Form.Label>Password</Form.Label>
            <Form.Control required type='password' value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Button variant='primary' type='submit'>Sign In</Button>
        </Form>
      </div>
    </div>
  )
}

export default SignIn
