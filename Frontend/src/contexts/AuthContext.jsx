import { createContext, useContext, useEffect, useState } from 'react'
import { getMeApi } from '../services/auth.api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    setLoading(true);
    try {
      // BƯỚC BẢO VỆ CHỐNG SPAM BACKEND:
      // Kiểm tra xem trình duyệt có token chưa. Nếu không có, gán user = null và dẹp luôn, KHÔNG GỌI API NỮA!
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setLoading(false);
        return; 
      }

      // Nếu có token mới được phép gọi xuống BE
      const res = await getMeApi();
      setUser(res.metadata);
    } catch (error) {
      // Nếu token hết hạn hoặc sai (Lỗi 401), xóa sạch dữ liệu cũ
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Khi app khởi động, tự động gọi fetchUser để kiểm tra xem người dùng đã đăng nhập chưa
  useEffect(() => {
    fetchUser();
  }, []); 

  return (
    <AuthContext.Provider value={{ user, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)