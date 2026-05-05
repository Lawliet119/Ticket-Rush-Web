import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import EventForm from '../components/EventForm'
import { createEventApi } from '../services/event.api'

export default function CreateEvent() {
  const navigate = useNavigate()

  // State management for event form
  const [form, setForm] = useState({
    title: '',
    description: '',   // ✅ Thêm field còn thiếu
    venue: '',
    address: '',       // ✅ Thêm field còn thiếu
    event_date: '',
    sale_start_at: '',
    sale_end_at: '',
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // State management for zones
  const [zones, setZones] = useState([
    { name: '', rows: '', seats_per_row: '', price: '', color_hex: '#3B82F6' }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        setError(''); // Xóa lỗi nếu có
      } else {
        setError('Vui lòng chỉ tải lên file hình ảnh!');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        setError('');
      } else {
        setError('Vui lòng chỉ tải lên file hình ảnh!');
      }
    }
  };

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
    setLoading(true);
    setError('');

    // ==========================================
    // VALIDATION LIST
    // ==========================================
    if (!form.title.trim() || !form.venue.trim()) {
      setError('Tên sự kiện và địa điểm không được để trống!');
      setLoading(false); return;
    }

    const now = new Date();
    const eventDate = new Date(form.event_date);
    const saleStart = new Date(form.sale_start_at);
    const saleEnd = new Date(form.sale_end_at);

    if (saleStart < now) {
      setError('Thời gian mở bán vé không được ở trong quá khứ!');
      setLoading(false); return;
    }
    if (saleStart >= saleEnd) {
      setError('Thời gian kết thúc bán vé phải SAU thời gian mở bán!');
      setLoading(false); return;
    }
    if (saleStart >= eventDate) {
      setError('Phải mở bán vé TRƯỚC khi sự kiện diễn ra!');
      setLoading(false); return;
    }

    if (zones.length === 0) {
      setError('Phải có ít nhất 1 khu vực ghế!');
      setLoading(false); return;
    }

    const zoneNames = new Set();
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      const zName = z.name.trim();

      if (!zName) {
        setError(`Tên khu vực ở hàng thứ ${i + 1} không được để trống!`);
        setLoading(false); return;
      }
      if (Number(z.rows) <= 0 || Number(z.seats_per_row) <= 0) {
        setError(`Khu vực "${zName}" phải có ít nhất 1 hàng và 1 ghế!`);
        setLoading(false); return;
      }
      if (Number(z.price) < 0) {
        setError(`Giá vé khu vực "${zName}" không được âm!`);
        setLoading(false); return;
      }
      if (zoneNames.has(zName.toLowerCase())) {
        setError(`Tên khu vực "${zName}" bị trùng lặp!`);
        setLoading(false); return;
      }
      zoneNames.add(zName.toLowerCase());
    }

    // ==========================================
    // END OF VALIDATION
    // ==========================================

    try {
      // Create FormData to send file and JSON data together
      const formData = new FormData();
      
      // Add regular form fields
      Object.keys(form).forEach(key => {
        if (form[key]) {
          // Format dates to ISO strings before appending
          if (['event_date', 'sale_start_at', 'sale_end_at'].includes(key)) {
            formData.append(key, new Date(form[key]).toISOString());
          } else {
            formData.append(key, form[key]);
          }
        }
      });
      
      // Add formatted zones as a JSON string
      const formattedZones = zones.map(z => ({
        name: z.name,
        rows: Number(z.rows),
        seats_per_row: Number(z.seats_per_row),
        price: Number(z.price),
        color_hex: z.color_hex
      }));
      formData.append('zones', JSON.stringify(formattedZones));
      
      // Add banner file if selected
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      await createEventApi(formData);
      // Chuyển về trang quản lý event sau khi tạo thành công
      navigate('/admin/events');
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
          {/* Tên sự kiện */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Tên sự kiện <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handleFormChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>

          {/* Mô tả */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Mô tả sự kiện</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows={3}
              placeholder="Mô tả chi tiết về sự kiện..."
              className="w-full px-4 py-2 border rounded-lg resize-none"
            />
          </div>

          {/* Upload Banner */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Banner/Poster sự kiện</label>
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center w-full">
                {bannerPreview ? (
                  <div className="mb-4 relative inline-block">
                    <img src={bannerPreview} alt="Preview" className="mx-auto max-h-64 object-contain rounded-md" />
                    <button 
                      type="button" 
                      onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="py-4 cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                        <span>Nhấn để chọn ảnh</span>
                        <input id="file-upload" name="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">hoặc kéo thả vào đây</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF (Tối đa 5MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Địa điểm (tên sân/venue) */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Tên địa điểm (Venue) <span className="text-red-500">*</span></label>
            <input name="venue" value={form.venue} onChange={handleFormChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>

          {/* Địa chỉ cụ thể */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Địa chỉ cụ thể</label>
            <input
              name="address"
              value={form.address}
              onChange={handleFormChange}
              placeholder="Ví dụ: 22 Nguyễn Du, Quận 1, TP.HCM"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Thời gian */}
          <div>
            <label className="block text-sm font-medium mb-1">Thời gian diễn ra <span className="text-red-500">*</span></label>
            <input name="event_date" type="datetime-local" value={form.event_date} onChange={handleFormChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bắt đầu mở bán vé <span className="text-red-500">*</span></label>
            <input name="sale_start_at" type="datetime-local" value={form.sale_start_at} onChange={handleFormChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kết thúc bán vé <span className="text-red-500">*</span></label>
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

      {error && <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
    </div>
  );
}