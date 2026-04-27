import { useState } from 'react'
import { createEventApi } from '../services/event.api'

export default function CreateEvent() {
  // State management for event form
  const [form, setForm] = useState({
    title: '',
    venue: '',
    event_date: '',
    sale_start_at: '',
    sale_end_at: '',
  });

  // State management for zones
  const [zones, setZones] = useState([
    { name: '', rows: '', seats_per_row: '', price: '', color_hex: '#3B82F6' }
  ]);

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleZoneChange = (index, e) => {
    const updatedZones = [...zones];
    updatedZones[index][e.target.name] = e.target.value;
    setZones(updatedZones);
  };

  const addZone = () => {
    setZones([...zones, { name: '', rows: '', seats_per_row: '', price: '', color_hex: '#3B82F6' }]);
  };

  const removeZone = (index) => {
    const updatedZones = zones.filter((_, i) => i !== index);
    setZones(updatedZones);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setError('');

    try {
      // Chuẩn bị payload với định dạng phù hợp cho API
      const payload = {
        ...form,
        
        event_date: new Date(form.event_date).toISOString(),
        sale_start_at: new Date(form.sale_start_at).toISOString(),
        sale_end_at: new Date(form.sale_end_at).toISOString(),
        zones: zones.map(z => ({
          name: z.name,
          rows: Number(z.rows),
          seats_per_row: Number(z.seats_per_row),
          price: Number(z.price),
          color_hex: z.color_hex
        }))
      };


      await createEventApi(payload);
      setMessage('Tạo sự kiện và sơ đồ ghế thành công!');
      // Reset form
      setForm({ title: '', venue: '', event_date: '', sale_start_at: '', sale_end_at: '' });
      setZones([{ name: '', rows: '', seats_per_row: '', price: '', color_hex: '#3B82F6' }]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo sự kiện.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Tạo Sự Kiện Mới</h2>
      
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Phần 1: Thông tin chung */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Tên sự kiện</label>
            <input name="title" value={form.title} onChange={handleFormChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Địa điểm (Venue)</label>
            <input name="venue" value={form.venue} onChange={handleFormChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Thời gian diễn ra</label>
            <input name="event_date" type="datetime-local" value={form.event_date} onChange={handleFormChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bắt đầu mở bán vé</label>
            <input name="sale_start_at" type="datetime-local" value={form.sale_start_at} onChange={handleFormChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kết thúc bán vé</label>
            <input name="sale_end_at" type="datetime-local" value={form.sale_end_at} onChange={handleFormChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
        </div>

        {/* Phần 2: Cấu hình Khu vực ghế (Zones) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Cấu hình Sơ đồ ghế (Zones)</h3>
            <button type="button" onClick={addZone} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
              + Thêm Khu Vực
            </button>
          </div>

          {zones.map((zone, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 items-end bg-violet-50 p-4 rounded-lg mb-4 border border-violet-100 relative">
              {zones.length > 1 && (
                <button type="button" onClick={() => removeZone(index)} className="absolute top-2 right-3 text-red-500 font-bold hover:text-red-700">X</button>
              )}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên khu (VD: VIP, ZONE A)</label>
                <input name="name" value={zone.name} onChange={(e) => handleZoneChange(index, e)} required className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Số hàng</label>
                <input name="rows" type="number" min="1" value={zone.rows} onChange={(e) => handleZoneChange(index, e)} required className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Ghế/hàng</label>
                <input name="seats_per_row" type="number" min="1" value={zone.seats_per_row} onChange={(e) => handleZoneChange(index, e)} required className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Giá vé (VNĐ)</label>
                <input name="price" type="number" min="0" value={zone.price} onChange={(e) => handleZoneChange(index, e)} required className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Màu hiển thị</label>
                <input name="color_hex" type="color" value={zone.color_hex} onChange={(e) => handleZoneChange(index, e)} required className="w-full h-[42px] p-1 border rounded-md cursor-pointer" />
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50">
          {loading ? 'Đang khởi tạo ma trận ghế...' : 'Lưu Sự Kiện & Tạo Sơ Đồ'}
        </button>
      </form>

      {message && <div className="mt-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">{message}</div>}
      {error && <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
    </div>
  );
}