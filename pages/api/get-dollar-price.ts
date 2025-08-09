import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import _ from 'lodash'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_PRICE_URL}`
    console.log('aqui')

    const response = await axios.get(apiUrl)
    const priceInfo = _.get(response.data, 'monitors.bcv', { price: 36.6 })

    res.status(200).send({ price: priceInfo?.price })
  } catch (err) {
    console.error('Error fetching dollar price:', err)
    res.status(500).send({ error: 'failed to fetch data' })
  }
}