import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { signUp, signIn } from '../../api/auth'
import messages from '../shared/AutoDismissAlert/messages'

const SignUp = ({ msgAlert, setUser }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const navigate = useNavigate()

  const onSignUp = (e) => {
    e.preventDefault()
    const credentials = { email, password, passwordConfirmation }
    signUp(credentials)
      .then(() => signIn(credentials))
      .then((res) => setUser(res.data.user))
      .then(() => msgAlert({ heading: 'Registered!', message: messages.signUpSuccess, variant: 'success' }))
      .then(() => navigate('/'))
      .catch((err) => {
        setEmail('')
        setPassword('')
        setPasswordConfirmation('')
        msgAlert({ heading: 'Sign Up Failed: ' + err.message, message: messages.signUpFailure, variant: 'danger' })
      })
  }

  return (
    <div className='row'>
      <div className='col-sm-10 col-md-6 mx-auto mt-5'>
        <h3>Sign Up</h3>
        <Form onSubmit={onSignUp}>
          <Form.Group controlId='email' className='mb-3'>
            <Form.Label>Email</Form.Label>
            <Form.Control required type='email' value={email} placeholder='Enter email' onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group controlId='password' className='mb-3'>
            <Form.Label>Password</Form.Label>
            <Form.Control required type='password' value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Form.Group controlId='passwordConfirmation' className='mb-3'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control required type='password' value={passwordConfirmation} placeholder='Confirm Password' onChange={(e) => setPasswordConfirmation(e.target.value)} />
          </Form.Group>
          <Button variant='primary' type='submit'>Sign Up</Button>
        </Form>
      </div>
    </div>
  )
}

export default SignUp
