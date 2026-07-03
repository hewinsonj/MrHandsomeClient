import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

import AutoDismissAlert from './components/shared/AutoDismissAlert/AutoDismissAlert'
import RequireAuth from './components/shared/RequireAuth'
import BackgroundScene from './components/scene/BackgroundScene'
// import GoldFrame from './components/scene/GoldFrame' // gold frame disabled for now — re-enable with the render + index.css block
import Home from './components/Home'
import SignUp from './components/auth/SignUp'
import SignIn from './components/auth/SignIn'
import SignOut from './components/auth/SignOut'
import ChangePassword from './components/auth/ChangePassword'
import Shop from './components/shop/Shop'
import Checkout from './components/shop/Checkout'

const App = () => {
  const [user, setUser] = useState(null)
  const [msgAlerts, setMsgAlerts] = useState([])

  const clearUser = () => setUser(null)

  const deleteAlert = (id) => {
    setMsgAlerts((prev) => prev.filter((msg) => msg.id !== id))
  }

  const msgAlert = ({ heading, message, variant }) => {
    const id = uuid()
    setMsgAlerts([{ heading, message, variant, id }])
  }

  return (
    <>
      <BackgroundScene />
      {/* <GoldFrame /> */}

      <Routes>
        <Route path='/' element={<Home msgAlert={msgAlert} user={user} />} />
        <Route path='/shop' element={<Shop msgAlert={msgAlert} user={user} />} />
        <Route
          path='/checkout'
          element={
            <RequireAuth user={user}>
              <Checkout msgAlert={msgAlert} user={user} />
            </RequireAuth>
          }
        />
        <Route path='/sign-up' element={<SignUp msgAlert={msgAlert} setUser={setUser} />} />
        <Route path='/sign-in' element={<SignIn msgAlert={msgAlert} setUser={setUser} />} />
        <Route
          path='/sign-out'
          element={
            <RequireAuth user={user}>
              <SignOut msgAlert={msgAlert} clearUser={clearUser} user={user} />
            </RequireAuth>
          }
        />
        <Route
          path='/change-password'
          element={
            <RequireAuth user={user}>
              <ChangePassword msgAlert={msgAlert} user={user} />
            </RequireAuth>
          }
        />
      </Routes>
      {msgAlerts.map((alert) => (
        <AutoDismissAlert
          key={alert.id}
          heading={alert.heading}
          variant={alert.variant}
          message={alert.message}
          id={alert.id}
          deleteAlert={deleteAlert}
        />
      ))}
    </>
  )
}

export default App
