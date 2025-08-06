export async function getDollarPrice() {
  try {
    const res = await fetch('http://localhost:3000/api/get-dollar-price')
    if (!res.ok) throw new Error('Error al obtener el precio del dólar')
    const data = await res.json()
    return data.price
  } catch (error) {
    console.error('Error en getDollarPrice:', error)
    return null
  }
}
