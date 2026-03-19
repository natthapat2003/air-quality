'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

import {
  Wind, LayoutDashboard, History, Info, Clock, Lock, LogOut,
  Download, Settings, Trash2, Search, Activity, TrendingUp,
  TrendingDown, Database, MapPin, X, Server, ArrowUpDown, ArrowUp, ArrowDown,
  Eye, EyeOff, Save, FileSpreadsheet, Calendar, ChevronLeft, ChevronRight, Minus, Menu
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ==========================================
// Components
// ==========================================
const ProStatCard = ({ icon, title, value, color }: any) => (
  <div className="stat-card"
    style={{
      backgroundColor: '#ffffff',
      border: '1px solid #f1f5f9',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>
      {icon}
      {title}
    </div>
    <div style={{ fontSize: '28px', fontWeight: '900', color: color, lineHeight: '1' }}>
      {value}
    </div>
  </div>
);

// ==========================================
// Main Page Component
// ==========================================
export default function HistoryPage() {
  // ---------------- State ----------------
  const [allData, setAllData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Filters
  const [selectedNodeFilter, setSelectedNodeFilter] = useState('all');
  const [filterType, setFilterType] = useState('day');
  const [dateInput, setDateInput] = useState('');
  const [monthInput, setMonthInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Table & Pagination
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // System & Misc
  const [clock, setClock] = useState("กำลังโหลดเวลา...");
  const [nodeNames, setNodeNames] = useState<Record<string, string>>({});
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [hiddenNodes, setHiddenNodes] = useState<string[]>([]);
  
  // Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ---------------- Effects ----------------
  // Auth Check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    };
    checkSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  // Fetch Config (Hidden Nodes)
  useEffect(() => {
    const fetchConfig = async () => {
      const { data: hiddenData } = await supabase.from('config').select('value').eq('key', 'hidden_nodes').single();
      if (hiddenData && hiddenData.value) {
        try { setHiddenNodes(JSON.parse(hiddenData.value)); } catch (e) { }
      }
    };
    fetchConfig();
    const channel = supabase.channel('config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'config' }, () => {
        fetchConfig();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fetch Node Names
  const fetchNodeNames = async () => {
    const { data } = await supabase.from('node_names').select('*');
    if (data) {
      const namesMap: Record<string, string> = {};
      data.forEach((row: any) => {
        namesMap[row.device_id] = row.display_name;
      });
      setNodeNames(namesMap);
    }
  };
  useEffect(() => { fetchNodeNames(); }, []);

  // Default Dates
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setDateInput(todayStr);
    setStartDate(todayStr);
    setEndDate(todayStr);
  }, []);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClock(`${now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} | ${now.toLocaleTimeString('th-TH')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Sensor Data (History)
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingData(true);
      let allRecords: any[] = [];
      let from = 0;
      const step = 999;
      let isFetching = true;

      while (isFetching) {
        const { data, error } = await supabase
          .from('sensor_data')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + step);

        if (error) {
          console.error('Error fetching data:', error);
          break;
        }

        if (data && data.length > 0) {
          allRecords = [...allRecords, ...data];
          from += step + 1;
          if (data.length <= step) {
            isFetching = false;
          }
        } else {
          isFetching = false;
        }
      }

      if (allRecords.length > 0) {
        const formattedData = allRecords.map((item) => {
          const date = new Date(item.created_at);

          const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Bangkok',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });

          const thaiTimeStr = formatter.format(date).replace(',', '');

          return {
            key: item.id,
            timestamp: thaiTimeStr,
            rawDate: date.getTime(),
            pm25: item.pm25,
            temperature: item.temperature,
            humidity: item.humidity,
            pressure: item.pressure,
            lat: item.lat,
            lng: item.lng,
            deviceId: item.device_id
          };
        });
        setAllData(formattedData);
      }
      setIsLoadingData(false);
    };

    fetchHistory();

    const channel = supabase.channel('sensor_data_history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sensor_data' }, () => {
        fetchHistory();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Process Filters
  useEffect(() => {
    let result = allData;

    // 1. Filter by Date
    if (filterType === 'day' && dateInput) {
      const [y, m, d] = dateInput.split('-');
      const searchStr = `${d}/${m}/${y}`;
      result = result.filter(item => item.timestamp && item.timestamp.startsWith(searchStr));
    } else if (filterType === 'month' && monthInput) {
      const [y, m] = monthInput.split('-');
      const searchStr = `/${m}/${y}`;
      result = result.filter(item => item.timestamp && item.timestamp.includes(searchStr));
    } else if (filterType === 'custom' && startDate && endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      result = result.filter(item => item.rawDate >= start && item.rawDate <= end);
    }

    // 2. Filter by Node
    if (selectedNodeFilter !== 'all') {
      result = result.filter(item => item.deviceId === selectedNodeFilter);
    }

    const resultProcessed = result.map((item, index) => {
      let trendDiff = 0;
      if (index < result.length - 1) {
        trendDiff = item.pm25 - result[index + 1].pm25;
      }
      return {
        ...item,
        displayNo: result.length - index,
        trendDiff
      };
    });

    setFilteredData(resultProcessed);
    setCurrentPage(1);
  }, [allData, filterType, dateInput, monthInput, startDate, endDate, selectedNodeFilter]);

  // ---------------- Helpers & Logic ----------------
  const getStats = () => {
    if (filteredData.length === 0) return { avg: '--', max: '--', min: '--', count: 0 };
    let sum = 0, maxVal = -Infinity, minVal = Infinity;
    filteredData.forEach(d => {
      const val = parseFloat(d.pm25 || 0);
      sum += val;
      if (val > maxVal) maxVal = val;
      if (val < minVal) minVal = val;
    });
    return {
      avg: (sum / filteredData.length).toFixed(1),
      max: maxVal,
      min: minVal,
      count: filteredData.length
    };
  };
  const stats = getStats();

  const getAQIStatus = (pm25: number) => {
    if (pm25 <= 25) return { text: "ดีมาก", color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' };
    if (pm25 <= 50) return { text: "ดี", color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0' };
    if (pm25 <= 100) return { text: "ปานกลาง", color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' };
    if (pm25 <= 200) return { text: "เริ่มมีผล", color: '#f97316', bg: '#fff7ed', border: '#fed7aa' };
    return { text: "มีผลกระทบ", color: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    let valA = a[key];
    let valB = b[key];

    if (valA == null) valA = -Infinity;
    if (valB == null) valB = -Infinity;

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentTableData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const renderSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown size={14} color="#cbd5e1" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={16} color="#2563eb" strokeWidth={3} />
      : <ArrowDown size={16} color="#2563eb" strokeWidth={3} />;
  };

  // Chart Setup
  const chartDataReversed = [...filteredData].reverse();
  const chartData = {
    labels: chartDataReversed.map(d => d.timestamp ? d.timestamp.split(' ')[1] : '-'),
    datasets: [
      {
        label: 'ค่าฝุ่น PM2.5 (µg/m³)',
        data: chartDataReversed.map(d => d.pm25),
        backgroundColor: chartDataReversed.map(d => {
          const v = d.pm25 || 0;
          if (v <= 25) return 'rgba(14, 165, 233, 0.85)';
          if (v <= 50) return 'rgba(16, 185, 129, 0.85)';
          if (v <= 100) return 'rgba(245, 158, 11, 0.85)';
          if (v <= 200) return 'rgba(249, 115, 22, 0.85)';
          return 'rgba(239, 68, 68, 0.85)';
        }),
        borderRadius: 4,
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Sarabun', size: 13 },
        bodyFont: { family: 'Sarabun', size: 14, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 200,
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Sarabun' }, color: '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Sarabun' },
          color: '#64748b',
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) { alert("ไม่มีข้อมูลที่จะ Export"); return; }
    let csvContent = "Date Time,PM2.5,Temperature,Humidity,Pressure,Lat,Lng,Node\n";
    filteredData.forEach(row => {
      const nodeName = row.deviceId ? (nodeNames[row.deviceId] || row.deviceId) : "Unknown Node";
      csvContent += `${row.timestamp},${row.pm25},${row.temperature},${row.humidity},${row.pressure || ''},${row.lat},${row.lng},${nodeName}\n`;
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `AirQuality_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueIds = Array.from(new Set(allData.map(d => d.deviceId).filter(id => id)));

  // Admin Actions
  const handleSaveNodeName = async (deviceId: string) => {
    const inputElement = document.getElementById(`input-node-${deviceId}`) as HTMLInputElement;
    if (!inputElement || !inputElement.value.trim()) return;

    const newName = inputElement.value.trim();
    const { error } = await supabase.from('node_names').upsert({ device_id: deviceId, display_name: newName });
    if (!error) {
      alert(`✅ บันทึกชื่อ ${deviceId} เรียบร้อย`);
      setNodeNames(prev => ({ ...prev, [deviceId]: newName }));
    }
  };

  const handleToggleHide = async (deviceId: string) => {
    let newHidden = [...hiddenNodes];
    if (newHidden.includes(deviceId)) {
      newHidden = newHidden.filter(id => id !== deviceId);
    } else {
      newHidden.push(deviceId);
    }
    setHiddenNodes(newHidden);
    await supabase.from('config').upsert({ key: 'hidden_nodes', value: JSON.stringify(newHidden) });
  };

  const handleWipeNodeData = async (deviceId: string) => {
    if (confirm(`⚠️ ยืนยันการลบข้อมูลทั้งหมดของ [ ${deviceId} ] หรือไม่?\n\n(การกระทำนี้จะลบข้อมูลประวัติของเซนเซอร์ตัวนี้ทิ้งอย่างถาวร)`)) {
      const { error } = await supabase.from('sensor_data').delete().eq('device_id', deviceId);
      if (!error) {
        alert(`✅ ลบข้อมูลทั้งหมดของ ${deviceId} เรียบร้อยแล้ว`);
        setAllData(prev => prev.filter(d => d.deviceId !== deviceId));
      } else {
        alert("ลบข้อมูลไม่สำเร็จ: " + error.message);
      }
    }
  };

  const handleDeleteRecord = async (key: string) => {
    if (confirm("ยืนยันที่จะลบข้อมูลแถวนี้?")) {
      const { error } = await supabase.from('sensor_data').delete().eq('id', key);
      if (!error) setAllData(prev => prev.filter(d => d.key !== key));
    }
  };

  const handleClearHistory = async () => {
    if (confirm("⚠️ ยืนยันการลบประวัติทั้งหมดในระบบ?\n(ข้อมูลจะหายไปถาวร)")) {
      const { error } = await supabase.from('sensor_data').delete().neq('id', 0);
      if (!error) { alert("✅ ลบข้อมูลเรียบร้อยแล้ว"); setAllData([]); }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("ออกจากระบบเรียบร้อย");
    window.location.reload();
  };

  // ==========================================
  // Render
  // ==========================================
  return (
    <>
      {/* ---------------- Navbar (อัปเกรดให้เหมือนหน้าแรก) ---------------- */}
      <nav className="navbar" style={{ position: 'relative', zIndex: 1006, boxSizing: 'border-box' }}>
          <div className="brand">
              <div className="brand-icon">
                  <Wind size={22} strokeWidth={2.5} />
              </div>
              <span className="brand-text">AQI Monitor <span style={{ color: '#3b82f6' }}>KSU</span></span>
          </div>

          <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="nav-links desktop-only">
                  <Link href="/" className="nav-item">
                      <LayoutDashboard size={16} strokeWidth={2.5} /> <span>หน้าแรก</span>
                  </Link>
                  <Link href="/history" className="nav-item active">
                      <History size={16} strokeWidth={2.5} /> <span>ข้อมูลย้อนหลัง</span>
                  </Link>
                  <Link href="/info" className="nav-item">
                      <Info size={16} strokeWidth={2.5} /> <span>เกณฑ์คุณภาพอากาศ</span>
                  </Link>
              </div>
              
              <div className="nav-divider desktop-only"></div> 

              {!isAdmin ? (
                <Link href="/login" className="desktop-only" style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569',
                  borderRadius: '20px', fontWeight: '700', fontSize: '13.5px', textDecoration: 'none', transition: 'all 0.2s'
                }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}>
                  <Lock size={16} strokeWidth={2.5} /> Admin Login
                </Link>
              ) : (
                <button onClick={handleLogout} className="desktop-only" style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer',
                  borderRadius: '20px', fontWeight: '700', fontSize: '13.5px', transition: 'all 0.2s'
                }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fecaca'; e.currentTarget.style.color = '#dc2626'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}>
                  <LogOut size={16} strokeWidth={2.5} /> ออกจากระบบ
                </button>
              )}

              <div id="live-clock" className="live-clock desktop-only">
                  <Clock size={16} strokeWidth={2.5} color="#64748b" />
                  <span>{clock}</span>
              </div>

              {/* ปุ่ม Hamburger สำหรับมือถือ */}
              <button 
                  className="mobile-menu-btn"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                  {isMobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
              </button>
          </div>

          {/* เมนูที่กางลงมาบนมือถือ */}
          {isMobileMenuOpen && (
              <div className="mobile-dropdown">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '700', padding: '12px', textDecoration: 'none' }}>
                      <LayoutDashboard size={18} strokeWidth={2.5} /> หน้าแรก
                  </Link>
                  <Link href="/history" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2563eb', fontWeight: '700', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '12px', textDecoration: 'none' }}>
                      <History size={18} strokeWidth={2.5} /> ข้อมูลย้อนหลัง
                  </Link>
                  <Link href="/info" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '700', padding: '12px', textDecoration: 'none' }}>
                      <Info size={18} strokeWidth={2.5} /> เกณฑ์คุณภาพอากาศ
                  </Link>
                  
                  {/* ปุ่ม Admin สำหรับมือถือ */}
                  <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '5px 0' }}></div>
                  {!isAdmin ? (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '700', padding: '12px', textDecoration: 'none' }}>
                        <Lock size={18} strokeWidth={2.5} /> Admin Login
                    </Link>
                  ) : (
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontWeight: '700', padding: '12px', textDecoration: 'none', background: 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit', fontSize: '15px' }}>
                        <LogOut size={18} strokeWidth={2.5} /> ออกจากระบบ
                    </button>
                  )}
              </div>
          )}
      </nav>

      {/* ---------------- Main Content ---------------- */}
      <div className="container">
        <div className="card" style={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', padding: '35px', boxSizing: 'border-box' }}>

          <div className="header-row" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '10px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                <FileSpreadsheet size={24} strokeWidth={2} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>ประวัติการตรวจวัด</h2>
            </div>

            <div className="filter-group" style={{
              display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px',
              padding: '6px 16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <Search size={16} color="#64748b" className="desktop-only" />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#3b82f6" />
                <select
                  value={selectedNodeFilter}
                  onChange={(e) => setSelectedNodeFilter(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontWeight: '700', color: '#0f172a', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', maxWidth: '150px' }}
                >
                  <option value="all">ทุกจุดตรวจวัด</option>
                  {uniqueIds.map(id => (
                    <option key={id as string} value={id as string}>
                      {nodeNames[id as string] ? nodeNames[id as string].split('|')[0].trim() : id as string}
                    </option>
                  ))}
                </select>
              </div>

              <div className="desktop-only" style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 4px' }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontWeight: '700', color: '#334155', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}>
                  <option value="day">รายวัน</option>
                  <option value="month">รายเดือน</option>
                  <option value="custom">ช่วงเวลา</option>
                  <option value="all">ทั้งหมด</option>
                </select>

                <div className="desktop-only" style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 4px' }}></div>

                {filterType === 'day' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#3b82f6" />
                    <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', color: '#0f172a', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }} />
                  </div>
                )}
                {filterType === 'month' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#3b82f6" />
                    <input type="month" value={monthInput} onChange={e => setMonthInput(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', color: '#0f172a', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }} />
                  </div>
                )}
                {filterType === 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#3b82f6" />
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', color: '#0f172a', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', width: '110px' }} />
                    <span style={{ color: '#94a3b8', fontWeight: '700' }}>ถึง</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', color: '#0f172a', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', width: '110px' }} />
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', marginLeft: 'auto' }}>
                พบ {isLoadingData ? '...' : filteredData.length} รายการ
              </div>
            </div>

            <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleExportCSV} className="btn-export" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                <Download size={16} strokeWidth={2.5} /> Export CSV
              </button>
              {isAdmin && (
                <>
                  <button onClick={() => setIsSettingsModalOpen(true)} className="btn-config" style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '8px 16px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a' }} onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}>
                    <Settings size={16} strokeWidth={2.5} /> จัดการระบบเซนเซอร์
                  </button>
                  <button onClick={handleClearHistory} className="btn-clear" style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
                    <Trash2 size={16} strokeWidth={2.5} /> ล้างทั้งหมด
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <ProStatCard
              icon={<Activity size={18} color="#64748b" />}
              title="ค่าเฉลี่ย PM2.5"
              value={stats.avg}
              color={Number(stats.avg) <= 50 ? '#10b981' : Number(stats.avg) <= 100 ? '#f59e0b' : '#ef4444'}
            />
            <ProStatCard icon={<TrendingUp size={18} color="#ef4444" />} title="ค่าสูงสุด (Max)" value={stats.max === -Infinity ? '--' : stats.max} color="#ef4444" />
            <ProStatCard icon={<TrendingDown size={18} color="#10b981" />} title="ค่าต่ำสุด (Min)" value={stats.min === Infinity ? '--' : stats.min} color="#10b981" />
            <ProStatCard icon={<Database size={18} color="#3b82f6" />} title="จำนวนข้อมูล" value={isLoadingData ? '...' : stats.count} color="#3b82f6" />
          </div>

          {/* ---------------- Chart ---------------- */}
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Activity size={18} color="#64748b" />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#475569', margin: 0, letterSpacing: '0.2px' }}>
                กราฟแท่งแสดงแนวโน้มฝุ่น PM2.5
                <span style={{ fontWeight: '600', color: '#94a3b8', marginLeft: '6px' }}>({filteredData.length} รายการ)</span>
              </h3>
            </div>
            <div style={{ overflowX: 'auto', paddingBottom: '15px', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ height: '350px', minWidth: `${Math.max(600, filteredData.length * 15)}px` }}>
                <Bar data={chartData} options={chartOptions as any} />
              </div>
            </div>
          </div>

          {/* ---------------- Table ---------------- */}
          <div className="table-responsive" style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ minWidth: '900px', width: '100%', textAlign: 'left', borderCollapse: 'collapse', backgroundColor: '#ffffff' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th
                    onClick={() => handleSort('displayNo')}
                    style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'displayNo' ? '#2563eb' : '#475569', fontWeight: '800', width: '70px', textAlign: 'center', backgroundColor: sortConfig?.key === 'displayNo' ? '#eff6ff' : '#f8fafc', transition: '0.2s', whiteSpace: 'nowrap' }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                      No. {renderSortIcon('displayNo')}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('rawDate')}
                    style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'rawDate' ? '#2563eb' : '#475569', fontWeight: '800', backgroundColor: sortConfig?.key === 'rawDate' ? '#eff6ff' : '#f8fafc', transition: '0.2s', whiteSpace: 'nowrap' }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      เวลาที่บันทึก {renderSortIcon('rawDate')}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('pm25')}
                    style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'pm25' ? '#2563eb' : '#475569', fontWeight: '800', backgroundColor: sortConfig?.key === 'pm25' ? '#eff6ff' : '#f8fafc', transition: '0.2s', whiteSpace: 'nowrap' }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      PM2.5 & คุณภาพ <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>(µg/m³)</span> {renderSortIcon('pm25')}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('temperature')}
                    style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'temperature' ? '#2563eb' : '#475569', fontWeight: '800', textAlign: 'center', backgroundColor: sortConfig?.key === 'temperature' ? '#eff6ff' : '#f8fafc', transition: '0.2s', whiteSpace: 'nowrap' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                      อุณหภูมิ <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>(°C)</span> {renderSortIcon('temperature')}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('humidity')}
                    style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'humidity' ? '#2563eb' : '#475569', fontWeight: '800', textAlign: 'center', backgroundColor: sortConfig?.key === 'humidity' ? '#eff6ff' : '#f8fafc', transition: '0.2s', whiteSpace: 'nowrap' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                      ความชื้น <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>(%)</span> {renderSortIcon('humidity')}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('pressure')}
                    style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'pressure' ? '#2563eb' : '#475569', fontWeight: '800', textAlign: 'center', backgroundColor: sortConfig?.key === 'pressure' ? '#eff6ff' : '#f8fafc', transition: '0.2s', whiteSpace: 'nowrap' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                      ความกดอากาศ <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>(hPa)</span> {renderSortIcon('pressure')}
                    </div>
                  </th>

                  <th style={{ padding: '16px', color: '#475569', fontWeight: '800', backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>ตำแหน่งจุดวัด</th>
                  {isAdmin && <th style={{ padding: '16px', color: '#475569', fontWeight: '800', textAlign: 'center', backgroundColor: '#f8fafc', whiteSpace: 'nowrap' }}>จัดการ</th>}
                </tr>
              </thead>
              <tbody>
                {isLoadingData ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                      <div className="spin-icon" style={{ display: 'inline-block', marginBottom: '10px' }}><Activity size={40} color="#3b82f6" /></div>
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>กำลังโหลดข้อมูลทั้งหมด...</div>
                    </td>
                  </tr>
                ) : currentTableData.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                      <Database size={40} strokeWidth={1} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                      <div style={{ fontSize: '16px', fontWeight: '600' }}>ไม่พบข้อมูลในช่วงเวลานี้</div>
                    </td>
                  </tr>
                ) : (
                  currentTableData.map((data) => {
                    const status = getAQIStatus(data.pm25);
                    const displayName = data.deviceId ? (nodeNames[data.deviceId] || data.deviceId) : 'Unknown Node';

                    let trendIcon = <span style={{ color: '#94a3b8', display: 'flex' }} title="คงที่"><Minus size={14} strokeWidth={3} /></span>;
                    if (data.trendDiff > 0) trendIcon = <span style={{ color: '#ef4444', display: 'flex' }} title={`เพิ่มขึ้น ${data.trendDiff} µg/m³`}><TrendingUp size={14} strokeWidth={3} /></span>;
                    else if (data.trendDiff < 0) trendIcon = <span style={{ color: '#10b981', display: 'flex' }} title={`ลดลง ${Math.abs(data.trendDiff)} µg/m³`}><TrendingDown size={14} strokeWidth={3} /></span>;

                    return (
                      <tr key={data.key} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid #f1f5f9' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '16px', color: '#94a3b8', fontWeight: '700', textAlign: 'center' }}>{data.displayNo}</td>

                        <td style={{ padding: '16px', fontWeight: '700', color: '#64748b', whiteSpace: 'nowrap' }}>{data.timestamp}</td>

                        <td style={{ padding: '16px' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            backgroundColor: status.bg, border: `1px solid ${status.border}`, padding: '6px 14px', borderRadius: '12px'
                          }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.color, boxShadow: `0 0 8px ${status.color}` }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{data.pm25}</span>
                              {trendIcon}
                            </div>
                            <div style={{ width: '1px', height: '14px', backgroundColor: status.border }}></div>
                            <span style={{ fontSize: '13.5px', fontWeight: '800', color: status.color, lineHeight: '1', whiteSpace: 'nowrap' }}>{status.text}</span>
                          </div>
                        </td>

                        <td style={{ padding: '16px', color: '#0f172a', fontWeight: '700', fontSize: '15px', textAlign: 'center' }}>{data.temperature != null ? data.temperature.toFixed(0) : '-'}</td>
                        <td style={{ padding: '16px', color: '#0f172a', fontWeight: '700', fontSize: '15px', textAlign: 'center' }}>{data.humidity != null ? data.humidity.toFixed(0) : '-'}</td>
                        <td style={{ padding: '16px', color: '#0f172a', fontWeight: '700', fontSize: '15px', textAlign: 'center' }}>{data.pressure > 0 ? data.pressure.toFixed(1) : '-'}</td>

                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MapPin size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              {displayName.split('|').map((str: string, index: number) => (
                                <span key={index} style={{ fontWeight: '700', color: '#3b82f6', fontSize: '14px', lineHeight: '1.4', whiteSpace: 'nowrap' }}>
                                  {str.trim()}
                                </span>
                              ))}
                              {isAdmin && hiddenNodes.includes(data.deviceId) && (
                                <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '800', marginTop: '2px' }}>(ถูกซ่อน)</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {isAdmin && (
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <button
                              className="btn-delete-row"
                              onClick={() => handleDeleteRecord(data.key)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} /> ลบ
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* ---------------- Pagination ---------------- */}
            {sortedData.length > 0 && !isLoadingData && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
                  แสดง {startIndex + 1} ถึง {Math.min(startIndex + rowsPerPage, sortedData.length)} จากทั้งหมด {sortedData.length} รายการ
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: currentPage === 1 ? '#f1f5f9' : 'white', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', padding: '0 8px' }}>
                    หน้า {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: currentPage === totalPages ? '#f1f5f9' : 'white', color: currentPage === totalPages ? '#94a3b8' : '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Global Styles & Mobile CSS ---------------- */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }

        /* สำหรับหน้าจอมือถือ (ความกว้างไม่เกิน 768px) */
        @media (max-width: 768px) {
            .desktop-only { display: none !important; }
            .mobile-menu-btn { 
                display: flex !important; 
                align-items: center; 
                justify-content: center; 
                background: #eff6ff; 
                border: none; 
                color: #2563eb; 
                padding: 8px; 
                border-radius: 12px; 
                cursor: pointer; 
                transition: 0.2s;
            }
            .mobile-menu-btn:active { transform: scale(0.95); background: #dbeafe; }
            
            /* Navbar ย่อส่วนและดึงให้ชื่อเว็บอยู่ครบ */
            .navbar { padding: 10px 12px !important; height: 65px !important; }
            .nav-right { gap: 6px !important; }
            .brand { gap: 8px !important; }
            
            /* บังคับแสดงชื่อเว็บ AQI Monitor KSU บนมือถือ */
            .brand-text { 
                font-size: 16px !important; 
                white-space: nowrap !important; 
                display: inline-block !important; 
            }

            .brand-icon { padding: 5px !important; border-radius: 8px !important; }
            .brand-icon svg { width: 16px !important; height: 16px !important; }
            
            .mobile-dropdown {
                position: absolute; top: 100%; left: 0; width: 100%; box-sizing: border-box;
                background-color: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px);
                border-bottom: 1px solid #e2e8f0; padding: 15px 20px;
                display: flex; flex-direction: column; gap: 10px; z-index: 1005;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            }

            /* จัดการส่วน Filter และปุ่มต่างๆ ให้เป็นระเบียบขึ้นบนจอมือถือ */
            .container { padding: 10px !important; }
            .card { padding: 20px 15px !important; }
            .header-row {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 15px !important;
            }
            .filter-group {
                justify-content: space-between !important;
                padding: 10px 12px !important;
            }
            .action-buttons {
                width: 100%;
            }
            .btn-export, .btn-config, .btn-clear {
                flex: 1;
                justify-content: center;
                padding: 10px !important;
            }
            
            /* จัดกล่องสถิติให้เป็น 2 คอลัมน์ ไม่ให้เรียงยาวเป็นแถวเดียว */
            .stats-grid {
                grid-template-columns: 1fr 1fr !important;
                gap: 10px !important;
            }
            .stat-card {
                padding: 15px !important;
                gap: 8px !important;
            }
            .stat-card > div:last-child {
                font-size: 22px !important; /* ลดขนาดตัวเลขสถิติลงนิดนึง */
            }
        }

        @media (min-width: 769px) {
            .mobile-menu-btn { display: none !important; }
            .mobile-dropdown { display: none !important; }
        }
      `}} />
    </>
  );
}