import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { getProducts } from '../../api/shop'

const Shop = ({ msgAlert, user }) => {
  const [products, setProducts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data.products))
      .catch(() => msgAlert({ heading: 'Error', message: 'Could not load products.', variant: 'danger' }))
  }, [])

  const handleBuy = (product) => {
    if (!user) {
      navigate('/sign-in')
      return
    }
    navigate('/checkout', { state: { product } })
  }

  return (
    <div className='container py-5' style={{ position: 'relative', zIndex: 1 }}>
      <h2 className='mb-4'>Shop</h2>
      <Row xs={1} md={2} lg={3} className='g-4'>
        {products.map((product) => (
          <Col key={product._id}>
            <Card bg='dark' text='white' className='h-100'>
              {product.imageUrl && (
                <Card.Img variant='top' src={product.imageUrl} alt={product.name} style={{ objectFit: 'cover', height: '200px' }} />
              )}
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <Card.Text>
                  <strong>${(product.price / 100).toFixed(2)}</strong>
                  {product.type === 'digital' && <span className='ms-2 badge bg-info'>Digital Download</span>}
                  {product.type === 'physical' && <span className='ms-2 badge bg-warning text-dark'>CD / Physical</span>}
                </Card.Text>
                <Button variant='outline-light' onClick={() => handleBuy(product)}>
                  {user ? 'Buy Now' : 'Sign In to Buy'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
        {products.length === 0 && (
          <Col>
            <p style={{ opacity: 0.5 }}>No products yet. Check back soon.</p>
          </Col>
        )}
      </Row>
    </div>
  )
}

export default Shop
