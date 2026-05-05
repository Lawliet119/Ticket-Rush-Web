import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Ticket, DollarSign, Calendar } from 'lucide-react';
import { getDashboardStatsApi } from '../../services/event.api'; 
import { io } from 'socket.io-client'; 

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [statsData, setStatsData] = useState({
    summary: { totalRevenue: 0, ticketsSold: 0, activeEvents: 0, totalCustomers: 0 },
    revenueChart: [],
    eventOccupancy: [],
    genderData: [],
    demographicsData: []
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboardStatsApi();
        if (res.metadata) {
          setStatsData(res.metadata);
        }
      } catch (err) {
        setError("Failed to load data. Make sure the backend API GET /dashboard/stats is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();

    const socket = io('http://localhost:3000');
    socket.on('dashboard_stats_updated', () => {
      fetchDashboard();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-500">Syncing system data...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-500">{error}</div>;

  const stats = [
    { title: 'Total Revenue', value: `${(statsData.summary?.totalRevenue || 0).toLocaleString('en-US')} $`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'Tickets Sold', value: statsData.summary?.ticketsSold || 0, icon: Ticket, color: 'bg-purple-500' },
    { title: 'Active Events', value: statsData.summary?.activeEvents || 0, icon: Calendar, color: 'bg-blue-500' },
    { title: 'Total Customers', value: statsData.summary?.totalCustomers || 0, icon: Users, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Live statistics from Database</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Revenue Chart</h2>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="text-sm border rounded px-3 py-1 outline-none font-medium">
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
            {statsData.revenueChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsData.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No revenue data yet</div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Ticket Sales Trend</h2>
            {statsData.revenueChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statsData.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="tickets" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No ticket sales data yet</div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Audience Age</h2>
            {statsData.demographicsData?.length > 0 && statsData.demographicsData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statsData.demographicsData} cx="50%" cy="50%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                    {statsData.demographicsData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">Not enough age data</div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Audience Gender</h2>
            {statsData.genderData?.length > 0 && statsData.genderData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statsData.genderData} cx="50%" cy="50%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                    {statsData.genderData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">Not enough gender data</div>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Event Occupancy Rate</h2>
            <div className="space-y-4">
              {!statsData.eventOccupancy || statsData.eventOccupancy.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-10">No events have been created yet.</p>
              ) : (
                statsData.eventOccupancy.map((event) => {
                  const percentage = event.total > 0 ? (event.occupancy / event.total) * 100 : 0;
                  return (
                    <div key={event.event}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium truncate pr-2 w-3/5" title={event.event}>{event.event}</span>
                        <span className="text-gray-600 shrink-0 font-bold">{event.occupancy}/{event.total} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}