import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import { createPaymentIntent } from '../../api/shop'
import messages from '../shared/AutoDismissAlert/messages'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const CheckoutForm = ({ msgAlert, product }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/' },
    })

    if (error) {
      msgAlert({ heading: 'Payment Failed', message: error.message, variant: 'danger' })
      setLoading(false)
    } else {
      msgAlert({ heading: 'Order Placed!', message: messages.orderSuccess, variant: 'success' })
      navigate('/')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className='mb-4' />
      <Button variant='primary' type='submit' disabled={!stripe || loading}>
        {loading ? <Spinner size='sm' /> : `Pay $${(product.price / 100).toFixed(2)}`}
      </Button>
    </form>
  )
}

const Checkout = ({ msgAlert, user }) => {
  const { state } = useLocation()
  const product = state?.product
  const navigate = useNavigate()
  const [clientSecret, setClientSecret] = useState(null)

  useEffect(() => {
    if (!product) { navigate('/shop'); return }
    createPaymentIntent([{ id: product._id, quantity: 1 }], user)
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch(() => msgAlert({ heading: 'Error', message: 'Could not start checkout.', variant: 'danger' }))
  }, [])

  if (!clientSecret) return (
    <div className='container py-5 text-center'>
      <Spinner />
    </div>
  )

  return (
    <div className='container py-5' style={{ maxWidth: '540px' }}>
      <h2 className='mb-2'>Checkout</h2>
      <p className='mb-4 text-muted'>{product?.name} — ${(product?.price / 100).toFixed(2)}</p>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm msgAlert={msgAlert} product={product} />
      </Elements>
    </div>
  )
}

export default Checkout
