import { useState } from 'react'
import { loginApi } from '../services/auth.api' 
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { fetchUser } = useAuth(); 
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await loginApi(form)
      console.log('Login successful:', data)

      localStorage.setItem('accessToken', data.metadata.tokens.accessToken) 
      localStorage.setItem('userId', data.metadata.user.id) 
      
      await fetchUser();
      navigate('/home') 
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email" type="email" placeholder="email@vnu.edu.vn"
            value={form.email} onChange={onChange} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>

        <div>
          <div className="flex justify-between">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Link to="/forgot-password" name="forgot" className="text-sm text-indigo-600 hover:underline">Forgot password?</Link>
          </div>
          <input
            name="password" type="password" placeholder="••••••••"
            value={form.password} onChange={onChange} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50">
          {loading ? 'Authenticating...' : 'Login'}
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account? <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up now</Link>
        </p>
      </form>

      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
    </div>
  )
}