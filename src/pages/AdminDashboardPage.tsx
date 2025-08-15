import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  MessageSquare, 
  ShoppingBag,
  ArrowUpRight,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react'; // Changed DollarSign to IndianRupee
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/admin/AdminLayout';

const AdminDashboardPage = () => {
  const { projects, inquiries, orders } = useProjects();
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Year');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  
  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const newInquiries = inquiries.length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  
  // Format currency in Indian Rupees
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Generate chart data with realistic monthly progression
  const generateMonthlyData = (timeframe) => {
    const baseData = Array.from({ length: 12 }, (_, i) => {
      const baseAmount = Math.floor(Math.random() * 50000 * (i + 1) / 4);
      return {
        month: i,
        amount: baseAmount,
        orders: Math.floor(baseAmount / 15000) + Math.floor(Math.random() * 5),
        growth: i > 0 ? ((baseAmount - (baseAmount * 0.8)) / (baseAmount * 0.8)) * 100 : 0
      };
    });
    
    return baseData;
  };

  const monthlyData = generateMonthlyData(selectedTimeframe);
  const maxRevenue = Math.max(...monthlyData.map(d => d.amount));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate total and average for the period
  const totalPeriodRevenue = monthlyData.reduce((sum, data) => sum + data.amount, 0);
  const averageMonthlyRevenue = totalPeriodRevenue / 12;
  const currentMonth = new Date().getMonth();
  const currentMonthGrowth = monthlyData[currentMonth]?.growth || 0;

  const timeframeOptions = [
    'This Year',
    'Last Year', 
    'Last 6 Months',
    'Last 3 Months'
  ];

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-8 dark:bg-gray-900 min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200">
            Welcome back, {user?.name || user?.email.split('@')[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here's your business overview for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        {/* Stats Cards Grid - visually distinct accent colors for each metric */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-700 dark:text-blue-300" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Projects</p>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-200">{projects.length}</h3>
                <span className="text-xs text-blue-600 dark:text-blue-400">Active listings</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-100 to-amber-300 dark:from-amber-900 dark:to-amber-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-amber-700 dark:text-amber-300" />
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">New Inquiries</p>
                <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-200">{newInquiries}</h3>
                <span className="text-xs text-amber-600 dark:text-amber-400">Requires response</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-purple-300 dark:from-purple-900 dark:to-purple-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-purple-700 dark:text-purple-300" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Pending Orders</p>
                <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-200">{pendingOrders}</h3>
                <span className="text-xs text-purple-600 dark:text-purple-400">Waiting fulfillment</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <IndianRupee className="h-8 w-8 text-green-700 dark:text-green-300" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</p>
                <h3 className="text-2xl font-bold text-green-900 dark:text-green-200">{formatINR(totalRevenue)}</h3>
                <span className="text-xs text-green-600 dark:text-green-400">From {orders.length} orders</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts and Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Enhanced Revenue Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <div className="flex items-center mb-4 sm:mb-0">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">
                  Revenue Overview (₹)
                </h3>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative min-w-[170px] w-full md:w-auto">
                  <button
                    type="button"
                    className="pl-4 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 w-full flex items-center justify-between focus:ring-2 focus:ring-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-900 dark:text-slate-200 font-medium"
                    onClick={() => setShowTimeframeDropdown((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={showTimeframeDropdown ? 'true' : 'false'}
                    id="timeframeFilterDropdown"
                  >
                    <span className="flex items-center">
                      <Filter className="h-5 w-5 text-slate-400 mr-2" />
                      <span className="text-blue-600 font-bold">
                        {selectedTimeframe}
                      </span>
                    </span>
                    <span className="flex items-center ml-2">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </span>
                  </button>
                  {showTimeframeDropdown && (
                    <ul
                      className="absolute left-0 mt-2 min-w-full z-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg py-1"
                      role="listbox"
                      aria-labelledby="timeframeFilterDropdown"
                      tabIndex={-1}
                    >
                      {timeframeOptions.map(option => (
                        <li
                          key={option}
                          role="option"
                          aria-selected={selectedTimeframe === option ? 'true' : 'false'}
                          tabIndex={0}
                          onClick={() => { setSelectedTimeframe(option); setShowTimeframeDropdown(false); }}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setSelectedTimeframe(option); setShowTimeframeDropdown(false); } }}
                          className={`cursor-pointer px-8 py-2 flex items-center transition-colors duration-150 ${selectedTimeframe === option ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'}`}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Revenue</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-200">
                      {formatINR(totalPeriodRevenue)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-700 dark:text-blue-300" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Monthly Avg</p>
                    <p className="text-xl font-bold text-green-900 dark:text-green-200">
                      {formatINR(averageMonthlyRevenue)}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-700 dark:text-green-300" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-purple-300 dark:from-purple-900 dark:to-purple-700 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Growth</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-200 flex items-center">
                      {currentMonthGrowth >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(currentMonthGrowth).toFixed(1)}%
                    </p>
                  </div>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    currentMonthGrowth >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {currentMonthGrowth >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-700 dark:text-green-300" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-700 dark:text-red-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Chart */}
            <div className="h-64 flex items-end space-x-1 bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 rounded-lg p-4 shadow-sm">
              {monthlyData.map((data, index) => {
                const percentage = (data.amount / maxRevenue) * 100;
                const isHovered = hoveredMonth === index;
                const isCurrentMonth = index === currentMonth;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center relative group">
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-2 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10 whitespace-nowrap">
                        <div className="font-medium">{months[index]} 2025</div>
                        <div>Revenue: {formatINR(data.amount)}</div>
                        <div>Orders: {data.orders}</div>
                        <div>Growth: {data.growth.toFixed(1)}%</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                      </div>
                    )}
                    
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 cursor-pointer ${
                        isCurrentMonth 
                          ? 'bg-gradient-to-t from-blue-600 to-blue-400' 
                          : isHovered 
                            ? 'bg-gradient-to-t from-blue-500 to-blue-300' 
                            : 'bg-gradient-to-t from-blue-500 to-blue-400'
                      } ${isHovered ? 'shadow-lg transform scale-105' : ''}`}
                      style={{ height: `${Math.max(percentage, 2)}%` }}
                      onMouseEnter={() => setHoveredMonth(index)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      title={`${months[index]}: ${formatINR(data.amount)}`}
                    />
                    
                    <div className={`text-xs mt-2 transition-colors duration-200 ${
                      isCurrentMonth 
                        ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                        : isHovered 
                          ? 'text-slate-700 dark:text-slate-300' 
                          : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {months[index]}
                    </div>
                    
                    {/* Current month indicator */}
                    {isCurrentMonth && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-blue-700 dark:text-blue-300">Monthly Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                <span className="text-blue-900 dark:text-blue-200 font-semibold">Current Month</span>
              </div>
            </div>
          </div>
          
          {/* Recent Inquiries with accent color */}
          <div className="bg-gradient-to-r from-amber-100 to-amber-300 dark:from-amber-900 dark:to-amber-700 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 text-amber-700 dark:text-amber-300 mr-2" />
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">Recent Inquiries</h3>
              </div>
              <Link 
                to="/admin/project-requests"
                className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {inquiries.slice(0, 3).map((inquiry) => (
                <InquiryItem key={inquiry.id} inquiry={inquiry} />
              ))}
              {inquiries.length === 0 && (
                <div className="text-center text-amber-600 dark:text-amber-300 py-4">
                  No inquiries yet
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Links Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <QuickLink 
            to="/admin/projects"
            title="Manage Projects"
            description="Add, edit, or remove projects"
            icon={<Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            bgColor="blue"
          />
          
          <QuickLink 
            to="/admin/project-requests"
            title="Project Requests"
            description="Review and manage project requests"
            icon={<MessageSquare className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
            bgColor="amber"
          />
          
          <QuickLink 
            to="/admin/orders"
            title="Manage Orders"
            description="Track and fulfill project orders"
            icon={<ShoppingBag className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
            bgColor="purple"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

// Reusable Stats Card Component
const StatsCard = ({ title, value, icon, trend, description, bgColor }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-200">{value}</h3>
      </div>
      <div className={`p-2 bg-${bgColor}-50 dark:bg-${bgColor}-900 rounded-lg`}>
        {icon}
      </div>
    </div>
    <div className={`mt-2 text-xs text-${trend === 'positive' ? 'green' : bgColor}-600 dark:text-${trend === 'positive' ? 'green' : bgColor}-400 flex items-center`}>
      {trend === 'positive' && <ArrowUpRight className="h-3 w-3 mr-1" />}
      <span>{description}</span>
    </div>
  </div>
);

// Reusable Inquiry Item Component
const InquiryItem = ({ inquiry }) => (
  <div className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
    <div className="flex justify-between">
      <p className="font-medium text-slate-900 dark:text-slate-200">{inquiry.name}</p>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {new Date(inquiry.created_at || inquiry.date || Date.now()).toLocaleDateString('en-IN')}
      </span>
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{inquiry.projectType} Project</p>
    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{inquiry.message}</p>
  </div>
);

// Reusable Quick Link Component
const QuickLink = ({ to, title, description, icon, bgColor }) => (
  <Link 
    to={to}
    className={`bg-gradient-to-r from-${bgColor}-100 to-${bgColor}-300 dark:from-${bgColor}-900 dark:to-${bgColor}-700 rounded-lg shadow-sm p-6 flex items-center hover:shadow-lg transition-shadow duration-200`}
  >
    <div className={`p-3 bg-${bgColor}-50 dark:bg-${bgColor}-900 rounded-lg mr-4`}>
      {icon}
    </div>
    <div>
      <h3 className={`font-semibold text-${bgColor}-900 dark:text-${bgColor}-200`}>{title}</h3>
      <p className={`text-sm text-${bgColor}-700 dark:text-${bgColor}-300`}>{description}</p>
    </div>
  </Link>
);

export default AdminDashboardPage;