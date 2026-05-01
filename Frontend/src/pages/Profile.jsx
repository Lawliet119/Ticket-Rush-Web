import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfileApi, updateProfileApi } from '../services/user.api';
import { User, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    date_of_birth: '',
    phone: '',
    avatar: null
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileApi();
        if (res.metadata) {
          setProfile(res.metadata);
          setFormData({
            full_name: res.metadata.full_name || '',
            gender: res.metadata.gender || '',
            date_of_birth: res.metadata.date_of_birth ? res.metadata.date_of_birth.split('T')[0] : '',
            phone: res.metadata.phone || '',
            avatar: null
          });
          setPreview(res.metadata.avatar_url);
        }
      } catch (err) {
        console.error('Lỗi khi tải hồ sơ:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      if (formData.full_name) data.append('full_name', formData.full_name);
      if (formData.gender) data.append('gender', formData.gender);
      if (formData.date_of_birth) data.append('date_of_birth', formData.date_of_birth);
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.avatar) data.append('avatar', formData.avatar);

      const res = await updateProfileApi(data);
      if (res.metadata) {
        setProfile(res.metadata);
        alert('Cập nhật hồ sơ thành công!');
        window.location.reload(); 
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật hồ sơ!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-bold text-gray-500">Đang tải hồ sơ...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4"
      >
        <h1 className="text-3xl font-black text-gray-900 mb-8">Hồ Sơ Của Tôi</h1>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          {/* Avatar Section */}
          <div className="w-full md:w-1/3 bg-gray-50 p-8 flex flex-col items-center border-r border-gray-100">
            <div className="relative group cursor-pointer mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full text-gray-400 p-4" />
                )}
              </div>
              <label className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold uppercase tracking-wider">Tải lên</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center">{profile?.full_name}</h2>
            <p className="text-gray-500 text-sm mt-1">{profile?.email}</p>
            {profile?.age > 0 && (
              <div className="mt-4 bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-semibold">
                {profile.age} tuổi
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="flex-1 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và Tên</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:bg-white transition">
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-md disabled:opacity-50">
                  {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
