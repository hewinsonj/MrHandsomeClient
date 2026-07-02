import apiUrl from '../apiConfig'
import axios from 'axios'

export const getProducts = () =>
  axios({ method: 'GET', url: apiUrl + '/products' })

export const getProduct = (id) =>
  axios({ method: 'GET', url: `${apiUrl}/products/${id}` })

export const createPaymentIntent = (items, user) =>
  axios({
    method: 'POST',
    url: apiUrl + '/payments/create-intent',
    headers: { Authorization: `Token token=${user.token}` },
    data: { items },
  })

export const getOrders = (user) =>
  axios({
    method: 'GET',
    url: apiUrl + '/orders',
    headers: { Authorization: `Token token=${user.token}` },
  })
