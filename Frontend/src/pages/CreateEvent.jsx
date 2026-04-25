import { useState } from 'react'
import { createEventApi } from '../services/event.api'

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: '', artist: '', date: '', location: '', price: '', capacity: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMessage(''); setError('')
    try {
      const payload = { ...form, price: Number(form.price), capacity: Number(form.capacity) }
      const data = await createEventApi(payload)
      setMessage('Tạo sự kiện thành công!')
      setForm({ title: '', artist: '', date: '', location: '', price: '', capacity: '' })
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo sự kiện.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Tạo Sự Kiện Mới</h2>
        <p className="text-gray-600 text-sm mt-1">Điền thông tin để đăng tải sự kiện lên hệ thống TicketRush.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sự kiện</label>
            <input name="title" placeholder="VD: Summer Beats Festival 2026" value={form.title} onChange={onChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nghệ sĩ / Ban nhạc</label>
            <input name="artist" placeholder="VD: Various Artists" value={form.artist} onChange={onChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (YYYY-MM-DD HH:MM)</label>
            <input name="date" type="datetime-local" value={form.date} onChange={onChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm tổ chức</label>
            <input name="location" placeholder="VD: National Stadium, Hanoi" value={form.location} onChange={onChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé cơ bản (VNĐ)</label>
            <input name="price" type="number" placeholder="800000" value={form.price} onChange={onChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số ghế</label>
            <input name="capacity" type="number" placeholder="500" value={form.capacity} onChange={onChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md shadow-violet-200 disabled:opacity-50">
          {loading ? 'Đang tạo...' : 'Xuất bản sự kiện'}
        </button>
      </form>

      {message && <div className="mt-6 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">{message}</div>}
      {error && <div className="mt-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}
    </div>
  )
}