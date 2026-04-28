import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { resetPasswordApi } from '../services/auth.api'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp')
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      await resetPasswordApi(token, { password })
      setMessage('Đặt lại mật khẩu thành công! Bạn sẽ được chuyển hướng về trang đăng nhập.')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Đã có lỗi xảy ra. Token có thể đã hết hạn.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Đặt lại mật khẩu</h2>
      <p className="text-center text-gray-600 mb-6 text-sm">Nhập mật khẩu mới cho tài khoản của bạn.</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <input
            type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
          <input
            type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 outline-none transition"
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md shadow-violet-200 disabled:opacity-50">
          {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link to="/login" className="text-violet-600 font-semibold hover:underline">Quay lại đăng nhập</Link>
        </p>
      </form>

      {message && <div className="mt-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">{message}</div>}
      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
    </div>
  )
}
