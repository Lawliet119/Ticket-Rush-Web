import { useState } from 'react'
import { signupApi } from '../services/auth.api'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignUp() {
  const { fetchUser } = useAuth();
  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }
  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await signupApi(form)
      // Save token to localStorage and redirect to /home
      localStorage.setItem('accessToken', data.metadata.tokens.accessToken)
      localStorage.setItem('userId', data.metadata.user.id)
      
      await fetchUser();
      navigate('/home')
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Sign up failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</h2>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            name="name" placeholder="e.g. John Doe" value={form.name} onChange={onChange} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email" type="email" placeholder="email@vnu.edu.vn" value={form.email} onChange={onChange} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            name="password" type="password" placeholder="••••••••" value={form.password} onChange={onChange} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md shadow-violet-200 disabled:opacity-50">
          {loading ? 'Processing...' : 'Sign Up'}
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login now</Link>
        </p>
      </form>

      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
    </div>
  )
}