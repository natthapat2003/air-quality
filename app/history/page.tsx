'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; 
import Link from 'next/link';

import { 
    Wind, LayoutDashboard, History, Info, Clock, Lock, LogOut, 
    Download, Settings, Trash2, Search, Activity, TrendingUp, 
    TrendingDown, Database, MapPin, Edit3, FileSpreadsheet, Calendar, 
    Minus, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
    Eye, EyeOff, Save, X, Server
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

const ProStatCard = ({ icon, title, value, color }: any) => (
  <div style={{ 
      backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', 
      padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s', cursor: 'default' 
  }}
  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '700' }}>
          {icon}
          {title}
      </div>
      <div style={{ fontSize: '32px', fontWeight: '900', color: color }}>
          {value}
      </div>
  </div>
);

export default function HistoryPage() {
  const [allData, setAllData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // 🛑 เพิ่ม State โหลดข้อมูล
  
  const [filterType, setFilterType] = useState('day');
  const [dateInput, setDateInput] = useState('');
  const [monthInput, setMonthInput] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50; 
  
  const [clock, setClock] = useState("กำลังโหลดเวลา...");
  const [siteName, setSiteName] = useState("จุดตรวจวัดปัจจุบัน");
  const [nodeNames, setNodeNames] = useState<Record<string, string>>({});

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [tempSiteName, setTempSiteName] = useState("");
  const [hiddenNodes, setHiddenNodes] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchConfig = async () => {
      const { data: siteData } = await supabase.from('config').select('value').eq('key', 'site_name').single();
      if (siteData) {
          setSiteName(siteData.value);
          setTempSiteName(siteData.value);
      }
      
      const { data: hiddenData } = await supabase.from('config').select('value').eq('key', 'hidden_nodes').single();
      if (hiddenData && hiddenData.value) {
          try { setHiddenNodes(JSON.parse(hiddenData.value)); } catch(e) {}
      }
    };
    fetchConfig();
    const channel = supabase.channel('config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'config' }, () => {
        fetchConfig();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

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

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClock(`${now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} | ${now.toLocaleTimeString('th-TH')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🛑 อัปเกรดระบบดึงข้อมูลให้ทะลุลิมิต 1000 แถว (Chunking Fetch)
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingData(true);
      let allRecords: any[] = [];
      let from = 0;
      const step = 999; // ดึงทีละ 1000 แถว
      let isFetching = true;

      // วนลูปดึงจนกว่าข้อมูลจะหมด
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
              // ถ้าดึงมาได้น้อยกว่าที่ขอ แปลว่าข้อมูลหมดแล้ว
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
          const d = String(date.getDate()).padStart(2, '0');
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const y = date.getFullYear();
          const hh = String(date.getHours()).padStart(2, '0');
          const min = String(date.getMinutes()).padStart(2, '0');
          const ss = String(date.getSeconds()).padStart(2, '0');

          return {
            key: item.id,
            timestamp: `${d}/${m}/${y} ${hh}:${min}:${ss}`,
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
        fetchHistory(); // โหลดใหม่เมื่อมีข้อมูลเข้า
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []); 

  useEffect(() => {
    let result = allData;

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
  }, [allData, filterType, dateInput, monthInput, startDate, endDate]);

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

  const handleExportCSV = () => {
    if (filteredData.length === 0) { alert("ไม่มีข้อมูลที่จะ Export"); return; }
    let csvContent = "Date Time,PM2.5,Temperature,Humidity,Pressure,Lat,Lng,Node\n";
    filteredData.forEach(row => {
      const nodeName = row.deviceId ? (nodeNames[row.deviceId] || row.deviceId) : siteName;
      csvContent += `${row.timestamp},${row.pm25},${row.temperature},${row.humidity},${row.pressure || ''},${row.lat},${row.lng},${nodeName}\n`;
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `AirQuality_Report_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueIds = Array.from(new Set(allData.map(d => d.deviceId).filter(id => id)));

  const handleSaveSiteName = async () => {
      if (!tempSiteName.trim()) return;
      const { error } = await supabase.from('config').upsert({ key: 'site_name', value: tempSiteName.trim() });
      if (!error) {
          alert('✅ บันทึกชื่อสถานที่หลักเรียบร้อย');
          setSiteName(tempSiteName.trim());
      }
  };

  const handleSaveNodeName = async (deviceId: string) => {
      const inputElement = document.getElementById(`input-node-${deviceId}`) as HTMLInputElement;
      if (!inputElement || !inputElement.value.trim()) return;
      
      const newName = inputElement.value.trim();
      const { error } = await supabase.from('node_names').upsert({ device_id: deviceId, display_name: newName });
      if (!error) {
          alert(`✅ บันทึกชื่อ ${deviceId} เรียบร้อย`);
          setNodeNames(prev => ({...prev, [deviceId]: newName}));
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
    if(confirm("ยืนยันที่จะลบข้อมูลแถวนี้?")) {
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

  return (
    <>
      <nav className="navbar">
        <div className="brand">
            <div className="brand-icon">
                <Wind size={22} strokeWidth={2.5} />
            </div>
            <span>AQI Monitor <span style={{ color: '#3b82f6' }}>KSU</span></span>
        </div>

        <div className="nav-right">
            <div className="nav-links">
                <Link href="/" className="nav-item">
                    <LayoutDashboard size={16} strokeWidth={2.5} /> หน้าแรก
                </Link>
                <Link href="/history" className="nav-item active">
                    <History size={16} strokeWidth={2.5} /> ข้อมูลย้อนหลัง
                </Link>
                <Link href="/info" className="nav-item">
                    <Info size={16} strokeWidth={2.5} /> เกณฑ์คุณภาพอากาศ
                </Link>
            </div>
            
            <div className="nav-divider"></div>

            {!isAdmin ? (
                <Link href="/login" style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', 
                    padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569', 
                    borderRadius: '20px', fontWeight: '700', fontSize: '13.5px', textDecoration: 'none', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}>
                    <Lock size={16} strokeWidth={2.5} /> Admin Login
                </Link>
            ) : (
                <button onClick={handleLogout} style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', 
                    padding: '8px 16px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer',
                    borderRadius: '20px', fontWeight: '700', fontSize: '13.5px', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fecaca'; e.currentTarget.style.color = '#dc2626'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}>
                    <LogOut size={16} strokeWidth={2.5} /> ออกจากระบบ
                </button>
            )}

            <div id="live-clock" className="live-clock">
                <Clock size={16} strokeWidth={2.5} color="#64748b" />
                <span>{clock}</span>
            </div>
        </div>
      </nav>

      <div className="container">
        <div className="card" style={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', padding: '35px' }}>
            
            <div className="header-row" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '10px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                        <FileSpreadsheet size={24} strokeWidth={2} />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>ประวัติการตรวจวัด</h2>
                </div>

                <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', 
                    padding: '6px 16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}>
                    <Search size={16} color="#64748b" />
                    
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} 
                        style={{ border: 'none', background: 'transparent', fontWeight: '700', color: '#334155', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}>
                        <option value="day">รายวัน</option>
                        <option value="month">รายเดือน</option>
                        <option value="custom">กำหนดช่วงเวลา</option>
                        <option value="all">ทั้งหมด</option>
                    </select>

                    <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1', margin: '0 4px' }}></div>

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
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', color: '#0f172a', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }} />
                            <span style={{ color: '#94a3b8', fontWeight: '700' }}>ถึง</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', color: '#0f172a', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }} />
                        </div>
                    )}
                    {filterType === 'all' && (
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>แสดงข้อมูลทั้งหมด</div>
                    )}

                    <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', marginLeft: '4px' }}>
                        พบ {isLoadingData ? '...' : filteredData.length} รายการ
                    </div>
                </div>
                
                <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleExportCSV} className="btn-export" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                        <Download size={16} strokeWidth={2.5} /> Export CSV
                    </button>
                    {isAdmin && (
                        <>
                            <button onClick={() => setIsSettingsModalOpen(true)} className="btn-config" style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '8px 16px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }} onMouseOver={e=>{e.currentTarget.style.backgroundColor='#e2e8f0'; e.currentTarget.style.color='#0f172a'}} onMouseOut={e=>{e.currentTarget.style.backgroundColor='#f1f5f9'; e.currentTarget.style.color='#475569'}}>
                                <Settings size={16} strokeWidth={2.5} /> จัดการระบบเซนเซอร์
                            </button>
                            <button onClick={handleClearHistory} className="btn-clear" style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
                                <Trash2 size={16} strokeWidth={2.5} /> ล้างทั้งหมด
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="stats-grid">
                <ProStatCard 
                    icon={<Activity size={18} color="#64748b" />} 
                    title="ค่าเฉลี่ย PM2.5" 
                    value={stats.avg} 
                    color={Number(stats.avg) <= 50 ? '#10b981' : Number(stats.avg) <= 100 ? '#f59e0b' : '#ef4444'} 
                />
                <ProStatCard icon={<TrendingUp size={18} color="#ef4444" />} title="ค่าสูงสุด (Max)" value={stats.max === -Infinity ? '--' : stats.max} color="#ef4444" />
                <ProStatCard icon={<TrendingDown size={18} color="#10b981" />} title="ค่าต่ำสุด (Min)" value={stats.min === Infinity ? '--' : stats.min} color="#10b981" />
                <ProStatCard icon={<Database size={18} color="#3b82f6" />} title="จำนวนข้อมูล" value={isLoadingData ? 'กำลังโหลด...' : stats.count} color="#3b82f6" />
            </div>

            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Activity size={18} color="#64748b" />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#475569', margin: 0, letterSpacing: '0.2px' }}>
                        กราฟแท่งแสดงแนวโน้มฝุ่น PM2.5 
                        <span style={{ fontWeight: '400', color: '#94a3b8', marginLeft: '6px' }}>({filteredData.length} รายการ)</span>
                    </h3>
                </div>
                <div style={{ overflowX: 'auto', paddingBottom: '15px' }}>
                    <div style={{ height: '400px', minWidth: `${Math.max(800, filteredData.length * 15)}px` }}>
                        <Bar data={chartData} options={chartOptions as any} />
                    </div>
                </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ minWidth: '1000px', width: '100%', textAlign: 'left', borderCollapse: 'collapse', backgroundColor: '#ffffff' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                            <th 
                                onClick={() => handleSort('displayNo')} 
                                style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'displayNo' ? '#2563eb' : '#475569', fontWeight: '800', width: '80px', textAlign: 'center', backgroundColor: sortConfig?.key === 'displayNo' ? '#eff6ff' : '#f8fafc', transition: '0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = sortConfig?.key === 'displayNo' ? '#eff6ff' : '#f8fafc'}
                            >
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                    No. {renderSortIcon('displayNo')}
                                </div>
                            </th>
                            
                            <th 
                                onClick={() => handleSort('rawDate')} 
                                style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'rawDate' ? '#2563eb' : '#475569', fontWeight: '800', backgroundColor: sortConfig?.key === 'rawDate' ? '#eff6ff' : '#f8fafc', transition: '0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = sortConfig?.key === 'rawDate' ? '#eff6ff' : '#f8fafc'}
                            >
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    เวลาที่บันทึก {renderSortIcon('rawDate')}
                                </div>
                            </th>
                            
                            <th 
                                onClick={() => handleSort('pm25')} 
                                style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'pm25' ? '#2563eb' : '#475569', fontWeight: '800', backgroundColor: sortConfig?.key === 'pm25' ? '#eff6ff' : '#f8fafc', transition: '0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = sortConfig?.key === 'pm25' ? '#eff6ff' : '#f8fafc'}
                            >
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    PM2.5 & คุณภาพ <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>(µg/m³)</span> {renderSortIcon('pm25')}
                                </div>
                            </th>

                            <th 
                                onClick={() => handleSort('temperature')} 
                                style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'temperature' ? '#2563eb' : '#475569', fontWeight: '800', textAlign: 'center', backgroundColor: sortConfig?.key === 'temperature' ? '#eff6ff' : '#f8fafc', transition: '0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = sortConfig?.key === 'temperature' ? '#eff6ff' : '#f8fafc'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                                    อุณหภูมิ <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>(°C)</span> {renderSortIcon('temperature')}
                                </div>
                            </th>

                            <th 
                                onClick={() => handleSort('humidity')} 
                                style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'humidity' ? '#2563eb' : '#475569', fontWeight: '800', textAlign: 'center', backgroundColor: sortConfig?.key === 'humidity' ? '#eff6ff' : '#f8fafc', transition: '0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = sortConfig?.key === 'humidity' ? '#eff6ff' : '#f8fafc'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                                    ความชื้น <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>(%)</span> {renderSortIcon('humidity')}
                                </div>
                            </th>

                            <th 
                                onClick={() => handleSort('pressure')} 
                                style={{ cursor: 'pointer', padding: '16px', color: sortConfig?.key === 'pressure' ? '#2563eb' : '#475569', fontWeight: '800', textAlign: 'center', backgroundColor: sortConfig?.key === 'pressure' ? '#eff6ff' : '#f8fafc', transition: '0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = sortConfig?.key === 'pressure' ? '#eff6ff' : '#f8fafc'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                                    ความกดอากาศ <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>(hPa)</span> {renderSortIcon('pressure')}
                                </div>
                            </th>

                            <th style={{ padding: '16px', color: '#475569', fontWeight: '800', backgroundColor: '#f8fafc' }}>ตำแหน่งจุดวัด</th>
                            {isAdmin && <th style={{ padding: '16px', color: '#475569', fontWeight: '800', textAlign: 'center', backgroundColor: '#f8fafc' }}>จัดการ</th>}
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
                                const displayName = data.deviceId ? (nodeNames[data.deviceId] || data.deviceId) : siteName;
                                
                                let trendIcon = <span style={{ color: '#94a3b8', display: 'flex' }} title="คงที่"><Minus size={14} strokeWidth={3} /></span>;
                                if (data.trendDiff > 0) trendIcon = <span style={{ color: '#ef4444', display: 'flex' }} title={`เพิ่มขึ้น ${data.trendDiff} µg/m³`}><TrendingUp size={14} strokeWidth={3} /></span>;
                                else if (data.trendDiff < 0) trendIcon = <span style={{ color: '#10b981', display: 'flex' }} title={`ลดลง ${Math.abs(data.trendDiff)} µg/m³`}><TrendingDown size={14} strokeWidth={3} /></span>;

                                return (
                                    <tr key={data.key} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid #f1f5f9' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={{ padding: '16px', color: '#94a3b8', fontWeight: '700', textAlign: 'center' }}>{data.displayNo}</td>
                                        
                                        <td style={{ padding: '16px', fontWeight: '700', color: '#64748b' }}>{data.timestamp}</td>
                                        
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
                                                <span style={{ fontSize: '13.5px', fontWeight: '800', color: status.color, lineHeight: '1' }}>{status.text}</span>
                                            </div>
                                        </td>

                                        <td style={{ padding: '16px', color: '#0f172a', fontWeight: '700', fontSize: '15px', textAlign: 'center' }}>{data.temperature != null ? data.temperature.toFixed(0) : '-'}</td>
                                        <td style={{ padding: '16px', color: '#0f172a', fontWeight: '700', fontSize: '15px', textAlign: 'center' }}>{data.humidity != null ? data.humidity.toFixed(0) : '-'}</td>
                                        <td style={{ padding: '16px', color: '#0f172a', fontWeight: '700', fontSize: '15px', textAlign: 'center' }}>{data.pressure > 0 ? data.pressure.toFixed(1) : '-'}</td>
                                        
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <MapPin size={16} color="#3b82f6" />
                                                <span style={{ fontWeight: '700', color: '#3b82f6', fontSize: '14px' }}>
                                                    {displayName} 
                                                    {isAdmin && hiddenNodes.includes(data.deviceId) && <span style={{ color: '#ef4444', fontSize: '11px', marginLeft: '6px', fontWeight: '800' }}>(ถูกซ่อน)</span>}
                                                </span>
                                            </div>
                                        </td>

                                        {isAdmin && (
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <button 
                                                    className="btn-delete-row" 
                                                    onClick={() => handleDeleteRecord(data.key)}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px' }}
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
                
                {sortedData.length > 0 && !isLoadingData && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
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

      {isSettingsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '750px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px', color: '#2563eb' }}>
                            <Server size={24} strokeWidth={2.5} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>จัดการจุดตรวจวัด (Node Management)</h2>
                    </div>
                    <button onClick={() => setIsSettingsModalOpen(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: '0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#e2e8f0'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#f1f5f9'}>
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>ชื่อสถานที่หลัก (Main Site Name)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" value={tempSiteName} onChange={(e) => setTempSiteName(e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '700', fontSize: '15px', color: '#0f172a' }} />
                        <button onClick={handleSaveSiteName} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                            <Save size={16} strokeWidth={2.5} /> บันทึก
                        </button>
                    </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="#64748b" /> รายการเซนเซอร์ในระบบ
                </h3>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: '800', color: '#475569' }}>Device ID</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: '800', color: '#475569' }}>ตั้งชื่อให้เซนเซอร์</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: '800', color: '#475569', textAlign: 'center' }}>สถานะแผนที่</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: '800', color: '#ef4444', textAlign: 'center' }}>ล้างข้อมูล</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uniqueIds.map(id => (
                                <tr key={id as string} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', fontWeight: '800', color: '#64748b', fontSize: '14px' }}>{id}</td>
                                    
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input 
                                                type="text" 
                                                defaultValue={nodeNames[id as string] || id as string} 
                                                id={`input-node-${id}`}
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '700', fontSize: '14px', color: '#0f172a', outline: 'none' }} 
                                            />
                                            <button 
                                                title="บันทึกชื่อ"
                                                onClick={() => handleSaveNodeName(id as string)}
                                                style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }}
                                                onMouseOver={e=>e.currentTarget.style.backgroundColor='#dbeafe'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#eff6ff'}
                                            >
                                                <Save size={18} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                    
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleToggleHide(id as string)}
                                            style={{ 
                                                backgroundColor: hiddenNodes.includes(id as string) ? '#fef2f2' : '#f0fdf4', 
                                                color: hiddenNodes.includes(id as string) ? '#ef4444' : '#10b981', 
                                                border: `1px solid ${hiddenNodes.includes(id as string) ? '#fecaca' : '#bbf7d0'}`, 
                                                padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '13px', transition: 'all 0.2s', width: '110px', justifyContent: 'center'
                                            }}
                                            onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}
                                        >
                                            {hiddenNodes.includes(id as string) ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                                            {hiddenNodes.includes(id as string) ? 'ถูกซ่อน' : 'แสดงผล'}
                                        </button>
                                    </td>

                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleWipeNodeData(id as string)}
                                            style={{ backgroundColor: 'white', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '13px', transition: 'all 0.2s' }}
                                            onMouseOver={e=>{e.currentTarget.style.backgroundColor='#fef2f2'; e.currentTarget.style.transform='scale(1.05)'}} onMouseOut={e=>{e.currentTarget.style.backgroundColor='white'; e.currentTarget.style.transform='scale(1)'}}
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} /> ล้างข้อมูล
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
      `}} />
    </>
  );
}