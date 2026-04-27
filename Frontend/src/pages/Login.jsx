import { useState } from 'react'
import { loginApi } from '../services/auth.api' 
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
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
      console.log('Đăng nhập thành công:', data)

      localStorage.setItem('accessToken', data.metadata.tokens.accessToken) 
      localStorage.setItem('userId', data.metadata.user.id) 
      localStorage.setItem('role', data.metadata.user.role)
      
      navigate('/home') 
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Đăng nhập</h2>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <Link to="/forgot-password" name="forgot" className="text-sm text-indigo-600 hover:underline">Quên mật khẩu?</Link>
          </div>
          <input
            name="password" type="password" placeholder="••••••••"
            value={form.password} onChange={onChange} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50">
          {loading ? 'Đang xác thực...' : 'Đăng nhập'}
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Chưa có tài khoản? <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Đăng ký ngay</Link>
        </p>
      </form>

      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
    </div>
  )
}