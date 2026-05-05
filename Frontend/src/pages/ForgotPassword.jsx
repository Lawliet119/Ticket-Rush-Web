import { useState } from 'react'
import { forgotPasswordApi } from '../services/auth.api'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMessage(''); setError('')
    try {
      const data = await forgotPasswordApi({ email })
      setMessage(data?.message || 'A recovery link has been sent to your email!')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Forgot Password?</h2>
      <p className="text-center text-gray-600 mb-6 text-sm">Enter your email and we'll send you a password reset link.</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email" placeholder="email@vnu.edu.vn" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 outline-none transition"
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md shadow-violet-200 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Request'}
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password? <Link to="/login" className="text-violet-600 font-semibold hover:underline">Back to Login</Link>
        </p>
      </form>

      {message && <div className="mt-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">{message}</div>}
      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
    </div>
  )
}