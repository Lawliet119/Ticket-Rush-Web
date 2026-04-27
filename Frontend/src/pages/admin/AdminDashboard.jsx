import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Ticket, DollarSign, Calendar } from 'lucide-react';

const revenueData = [
  { date: 'Mon', revenue: 45000000, tickets: 28 },
  { date: 'Tue', revenue: 52000000, tickets: 34 },
  { date: 'Wed', revenue: 38000000, tickets: 22 },
  { date: 'Thu', revenue: 67000000, tickets: 41 },
  { date: 'Fri', revenue: 89000000, tickets: 58 },
  { date: 'Sat', revenue: 125000000, tickets: 82 },
  { date: 'Sun', revenue: 98000000, tickets: 61 },
];

const demographicsData = [
  { name: '18-24', value: 35 },
  { name: '25-34', value: 42 },
  { name: '35-44', value: 18 },
  { name: '45+', value: 5 },
];

const genderData = [
  { name: 'Nam', value: 58 },
  { name: 'Nữ', value: 40 },
  { name: 'Khác', value: 2 },
];

const eventOccupancy = [
  { event: 'Summer Beats', occupancy: 64, total: 450 },
  { event: 'Rock Night', occupancy: 48, total: 300 },
  { event: 'Jazz Stars', occupancy: 56, total: 200 },
];

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  const stats = [
    { title: 'Tổng Doanh Thu', value: '514,000,000 ₫', change: '+12.5%', icon: DollarSign, color: 'bg-green-500' },
    { title: 'Vé Đã Bán', value: '326', change: '+8.2%', icon: Ticket, color: 'bg-purple-500' },
    { title: 'Sự Kiện Đang Chạy', value: '3', change: '+1', icon: Calendar, color: 'bg-blue-500' },
    { title: 'Tổng Khách Hàng', value: '1,247', change: '+18.3%', icon: Users, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Thống kê dữ liệu thời gian thực</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Biểu Đồ Doanh Thu</h2>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="text-sm border rounded px-3 py-1 outline-none">
                <option value="7d">7 Ngày qua</option>
                <option value="30d">30 Ngày qua</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Xu Hướng Bán Vé</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tickets" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3 Cột Biểu Đồ Tròn */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Độ Tuổi</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={demographicsData} cx="50%" cy="50%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                  {demographicsData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Giới Tính</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                  {genderData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Tỷ Lệ Lấp Đầy Sự Kiện</h2>
            <div className="space-y-4">
              {eventOccupancy.map((event) => {
                const percentage = (event.occupancy / event.total) * 100;
                return (
                  <div key={event.event}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{event.event}</span>
                      <span className="text-gray-600">{event.occupancy}/{event.total} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}