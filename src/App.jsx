import React, { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

import AutoDismissAlert from './components/shared/AutoDismissAlert/AutoDismissAlert'
import RequireAuth from './components/shared/RequireAuth'
import BackgroundScene from './components/scene/BackgroundScene'
// import GoldFrame from './components/scene/GoldFrame' // gold frame disabled for now — re-enable with the render + index.css block
import CurtainIntro from './components/CurtainIntro'
import Splash from './components/Splash'
import Home from './components/Home'
import AudioPlayer from './components/AudioPlayer'
import Wordmark from './components/Wordmark'
import SignUp from './components/auth/SignUp'
import SignIn from './components/auth/SignIn'
import SignOut from './components/auth/SignOut'
import ChangePassword from './components/auth/ChangePassword'
import Shop from './components/shop/Shop'
import Checkout from './components/shop/Checkout'

const App = () => {
  const [user, setUser] = useState(null)
  const [msgAlerts, setMsgAlerts] = useState([])
  // The curtain intro lives on '/'. The scene "runs" (camera moves, curtains
  // open) once "look" is pressed — or immediately on any other route, so deep
  // links aren't frozen at the closed curtains.
  const [introStarted, setIntroStarted] = useState(false)
  const location = useLocation()
  const running = introStarted || location.pathname !== '/'

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
      <BackgroundScene running={running} />
      {/* <GoldFrame /> */}
      <AudioPlayer />
      <Wordmark />

      <Routes>
        <Route path='/' element={<CurtainIntro started={introStarted} onLook={() => setIntroStarted(true)} />} />
        <Route path='/welcome' element={<Splash />} />
        <Route path='/home' element={<Home msgAlert={msgAlert} user={user} />} />
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
