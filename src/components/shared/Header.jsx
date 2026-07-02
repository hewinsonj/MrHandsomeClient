import React from 'react'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { Link } from 'react-router-dom'

const linkStyle = { color: 'white', textDecoration: 'none' }

const authenticatedOptions = (
  <>
    <Nav.Item>
      <Link to='/change-password' style={linkStyle}>Change Password</Link>
    </Nav.Item>
    <Nav.Item>
      <Link to='/sign-out' style={linkStyle}>Sign Out</Link>
    </Nav.Item>
  </>
)

const unauthenticatedOptions = (
  <>
    <Nav.Item>
      <Link to='/sign-up' style={linkStyle}>Sign Up</Link>
    </Nav.Item>
    <Nav.Item>
      <Link to='/sign-in' style={linkStyle}>Sign In</Link>
    </Nav.Item>
  </>
)

const alwaysOptions = (
  <>
    <Nav.Item>
      <Link to='/' style={linkStyle}>Home</Link>
    </Nav.Item>
    <Nav.Item>
      <Link to='/shop' style={linkStyle}>Shop</Link>
    </Nav.Item>
  </>
)

const Header = ({ user }) => (
  <Navbar bg='dark' variant='dark' expand='md' style={{ position: 'relative', zIndex: 10 }}>
    <Navbar.Brand>
      <Link to='/' style={{ ...linkStyle, fontWeight: 'bold', letterSpacing: '0.1em' }}>
        MR. HANDSOME
      </Link>
    </Navbar.Brand>
    <Navbar.Toggle aria-controls='basic-navbar-nav' />
    <Navbar.Collapse id='basic-navbar-nav'>
      <Nav className='ms-auto align-items-center gap-3'>
        {user && <span className='navbar-text'>{user.email}</span>}
        {alwaysOptions}
        {user ? authenticatedOptions : unauthenticatedOptions}
      </Nav>
    </Navbar.Collapse>
  </Navbar>
)

export default Header
