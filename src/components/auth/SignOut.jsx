import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonGroup } from 'react-bootstrap'
import { signOut } from '../../api/auth'
import messages from '../shared/AutoDismissAlert/messages'

const SignOut = ({ msgAlert, clearUser, user }) => {
  const navigate = useNavigate()

  const onSignOut = () => {
    signOut(user)
      .finally(() => msgAlert({ heading: 'Signed Out', message: messages.signOutSuccess, variant: 'success' }))
      .finally(() => clearUser())
      .finally(() => navigate('/home'))
  }

  return (
    <div className='row'>
      <div className='col-sm-10 col-md-6 mx-auto mt-5'>
        <h2>Sign out?</h2>
        <small>We hate to see you go...</small>
        <br /><br />
        <ButtonGroup>
          <Button variant='danger' onClick={onSignOut}>Sign Out</Button>
          <Button variant='secondary' onClick={() => navigate('/home')}>Cancel</Button>
        </ButtonGroup>
      </div>
    </div>
  )
}

export default SignOut
