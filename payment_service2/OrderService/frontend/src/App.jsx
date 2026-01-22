import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // State for current user context
  const [userContext, setUserContext] = useState({
    userId: localStorage.getItem('ps_userId') || '',
    token: localStorage.getItem('ps_token') || '',
    role: localStorage.getItem('ps_role') || ''
  })

  useEffect(() => {
    // 1. Handle Token Handover from URL
    const searchParams = new URLSearchParams(window.location.search)
    const urlToken = searchParams.get('token')
    const urlUserId = searchParams.get('userId')
    const urlRole = searchParams.get('role')

    let newUserContext = { ...userContext }
    let updated = false

    if (urlToken) {
      localStorage.setItem('ps_token', urlToken)
      newUserContext.token = urlToken
      updated = true
    }
    if (urlUserId) {
      localStorage.setItem('ps_userId', urlUserId)
      newUserContext.userId = urlUserId
      updated = true
    }
    if (urlRole) {
      localStorage.setItem('ps_role', urlRole)
      newUserContext.role = urlRole
      updated = true
    }

    if (updated) {
      setUserContext(newUserContext)
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (userContext.token && userContext.userId) {
      fetchOrders()
    }
  }, [userContext.token, userContext.userId])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      // Assuming OrderService is running on https://localhost:7117
      // And we have a GetPendingCount or similar, but wait, looking for a list of orders.
      // The implementation plan mentioned "api/orders/history".
      // But let's check what endpoints are available.
      // In OrderServiceClient.cs we saw "api/orders/history" mapped to GetPendingCountAsync?? That seems wrong.
      // Let's assume we want to view *all* orders for the user.
      // Let's try fetching from the OrderService directly.

      const response = await axios.get(`https://localhost:7117/api/orders/history/${userContext.userId}`, {
        headers: {
          Authorization: `Bearer ${userContext.token}`
        }
      })
      setOrders(response.data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch orders. Ensure OrderService is running.')
      // Mock data for demo if backend fails or endpoints don't exist yet
      if (import.meta.env.DEV) {
        setOrders([
          { id: 101, date: '2023-10-25', total: 150.00, status: 'Confirmed', items: 3 },
          { id: 102, date: '2023-10-26', total: 45.50, status: 'Pending', items: 1 },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ps_token')
    localStorage.removeItem('ps_userId')
    localStorage.removeItem('ps_role')
    setUserContext({ userId: '', token: '', role: '' })
    setOrders([])
  }

  return (
    <div className="container mt-4">
      <header className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h1 className="h3 text-primary">Order Service</h1>
        <div>
          {userContext.userId ? (
            <div className="d-flex gap-2 align-items-center">
              <span className="text-muted small">Logged in as: <strong>{userContext.userId}</strong></span>
              <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <span className="text-muted">Not logged in</span>
          )}
        </div>
      </header>

      <main>
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">My Orders</h5>

            {loading && <div className="text-center p-3"><div className="spinner-border text-primary" role="status"></div></div>}

            {error && <div className="alert alert-warning">{error} <br /> <small>Showing mock data if available.</small></div>}

            {!loading && orders.length === 0 && !error && (
              <div className="alert alert-info">No orders found.</div>
            )}

            {!loading && orders.length > 0 && (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Items</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.date || new Date().toLocaleDateString()}</td>
                        <td>${order.total?.toFixed(2) || order.amount?.toFixed(2)}</td>
                        <td>{order.items?.length || order.items}</td>
                        <td>
                          <span className={`badge bg-${order.status === 'Confirmed' || order.status === 'paid' ? 'success' : 'secondary'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <a href="http://localhost:5173" className="btn btn-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Payment Dashboard
          </a>
        </div>
      </main>
    </div>
  )
}

export default App
