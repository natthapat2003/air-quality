'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase'; 
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import './mobile.css';

import { 
    Target, MapPin, X, Sparkles, Thermometer, Droplets, Gauge, CloudRain, 
    LayoutDashboard, History, Info, Activity, Clock, Wind, WifiOff, Loader,
    Layers, CheckCircle2, ChevronDown, Menu 
} from 'lucide-react'; 

// 🌟 อัปเดตเกณฑ์ PM2.5 (แบบไม่มีทศนิยม)
const getStatusColor = (pm25: number) => {
  if (pm25 <= 15) return '#0ea5e9'; 
  if (pm25 <= 25) return '#10b981'; 
  if (pm25 <= 37) return '#f59e0b'; 
  if (pm25 <= 75) return '#f97316'; 
  return '#ef4444'; 
};

const getStatusText = (pm25: number) => {
  if (pm25 <= 15) return 'ดีมาก';
  if (pm25 <= 25) return 'ดี';
  if (pm25 <= 37) return 'ปานกลาง';
  if (pm25 <= 75) return 'เริ่มมีผล';
  return 'มีผลกระทบ';
};

const getHealthAdvice = (pm25: number) => {
  if (pm25 <= 15) return "สามารถทำกิจกรรมกลางแจ้งได้ตามปกติ";
  if (pm25 <= 25) return "ทั่วไปทำกิจกรรมได้ปกติ / กลุ่มเสี่ยงเลี่ยงกิจกรรมที่ใช้แรงมาก";
  if (pm25 <= 37) return "ลดระยะเวลากิจกรรมที่ใช้แรงมาก สวมหน้ากากป้องกันฝุ่น";
  if (pm25 <= 75) return "หลีกเลี่ยงกิจกรรมกลางแจ้ง สวมหน้ากากป้องกันฝุ่นทุกครั้ง";
  return "อันตราย! งดกิจกรรมนอกอาคาร อยู่ในห้องปลอดฝุ่น";
};

const getAiBoxTheme = (pm25: number) => {
  if (pm25 <= 15) return { 
    bg: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)', 
    border: '#bae6fd', iconBg: '#0ea5e9', iconShadow: 'rgba(14, 165, 233, 0.3)', 
    titleColor: '#0369a1', strongColor: '#0284c7'
  };
  if (pm25 <= 25) return { 
    bg: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)', 
    border: '#bbf7d0', iconBg: '#10b981', iconShadow: 'rgba(16, 185, 129, 0.3)', 
    titleColor: '#047857', strongColor: '#059669'
  };
  if (pm25 <= 37) return { 
    bg: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)', 
    border: '#fde68a', iconBg: '#f59e0b', iconShadow: 'rgba(245, 158, 11, 0.3)', 
    titleColor: '#b45309', strongColor: '#d97706'
  };
  if (pm25 <= 75) return { 
    bg: 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 100%)', 
    border: '#fed7aa', iconBg: '#f97316', iconShadow: 'rgba(249, 115, 22, 0.3)', 
    titleColor: '#c2410c', strongColor: '#ea580c'
  };
  return { 
    bg: 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%)', 
    border: '#fecaca', iconBg: '#ef4444', iconShadow: 'rgba(239, 68, 68, 0.3)', 
    titleColor: '#b91c1c', strongColor: '#dc2626'
  };
};

const formatText = (text: string) => {
  if (!text) return "";
  return (
    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', lineHeight: '1.4', textAlign: 'center' }} className="responsive-title">
      {text.split('|').map((str, index, array) => (
        <span key={index}>
          {str.trim()}
          {index < array.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
};

const WeatherCard = ({ icon, label, value, unit }: any) => (
  <div className="weather-card" style={{ 
      backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', 
      padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s',
      boxSizing: 'border-box'
  }}
  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
    <div className="weather-card-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>
      {icon}
      {label}
    </div>
    <div className="weather-card-value" style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
      {value} <span className="unit-text">{unit}</span>
    </div>
  </div>
);

const LegendItem = ({ color, text }: { color: string, text: string }) => (
    <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
      <span style={{ fontSize: '14px', fontWeight: '800', color: '#475569', whiteSpace: 'nowrap' }}>{text}</span>
    </div>
);

const MAP_STYLES = {
    street: { name: 'แผนที่ถนน (Street)', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    satellite: { name: 'ดาวเทียม (Satellite)', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' }
};

export default function Home() {
  const [nodesData, setNodesData] = useState<Record<string, any>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string>("NODE_01");
  const [nodeNames, setNodeNames] = useState<Record<string, string>>({});
  
  const [siteName, setSiteName] = useState("กำลังโหลดชื่อ...");
  const [rainChance, setRainChance] = useState("--");
  const [hasInit, setHasInit] = useState(false); 
  const [isOnline, setIsOnline] = useState(false); 
  
  const [hiddenNodes, setHiddenNodes] = useState<string[]>([]);
  
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("คลิกที่จุดเพื่อเริ่มวิเคราะห์...");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [clock, setClock] = useState("กำลังโหลดเวลา...");

  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>('street');
  const [showMapMenu, setShowMapMenu] = useState(false);
  
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({}); 
  const leafletRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGeminiAnalysis = async (data: any) => {
    if (isAiLoading) return; 

    setIsAiLoading(true);
    setAiAnalysis("✨ กำลังใช้ AI วิเคราะห์ข้อมูลเชิงลึก...");
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pm25: data.pm25,
          temp: data.temperature,
          hum: data.humidity,
          pressure: data.pressure,
          siteName: nodeNames[data.device_id] || siteName
        }),
      });
      const result = await response.json();
      if (result.analysis) {
        setAiAnalysis(result.analysis);
      } else {
        setAiAnalysis("ไม่สามารถดึงข้อมูลวิเคราะห์ได้ในขณะนี้");
      }
    } catch (error) {
      setAiAnalysis("⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อกับ Gemini AI");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClock(`${now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} | ${now.toLocaleTimeString('th-TH')}`);
      
      if (now.getSeconds() % 5 === 0) {
          setRefreshTrigger(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRainForecast = async (lat: number, lng: number) => {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation_probability&forecast_days=1&timezone=auto`;
        const response = await fetch(url);
        const resData = await response.json();
        const currentHour = new Date().getHours();
        setRainChance(String(resData.hourly.precipitation_probability[currentHour]));
    } catch (error) {
        setRainChance("--");
    }
  };

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

  const updateNodeData = (newData: any) => {
      const id = newData.device_id || 'NODE_01'; 
      const displayTime = newData.created_at ? new Date(newData.created_at).toLocaleTimeString('th-TH') : new Date().toLocaleTimeString('th-TH');

      setNodesData(prev => ({
          ...prev,
          [id]: { ...newData, displayTime }
      }));

      setHasInit(true);
      setIsOnline(true);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsOnline(false), 90000);

      if (id === selectedNodeId) {
          fetchRainForecast(newData.lat || 16.4477, newData.lng || 103.5314);
      }
  };

  const fetchInitialData = async () => {
      const { data: configData } = await supabase.from('config').select('value').eq('key', 'site_name').single();
      if (configData) setSiteName(configData.value);
      else setSiteName("ระบบตรวจวัดคุณภาพอากาศ"); 

      const { data: hiddenData } = await supabase.from('config').select('value').eq('key', 'hidden_nodes').single();
      if (hiddenData) {
          try { setHiddenNodes(JSON.parse(hiddenData.value)); } catch(e) {}
      }

      await fetchNodeNames();

      const { data: sensorData } = await supabase.from('sensor_data').select('*').order('created_at', { ascending: false }).limit(50);
      
      if (sensorData && sensorData.length > 0) {
          const initialNodes: Record<string, any> = {};
          sensorData.forEach(row => {
              const id = row.device_id || 'NODE_01';
              if (!initialNodes[id]) { 
                  initialNodes[id] = { ...row, displayTime: new Date(row.created_at).toLocaleTimeString('th-TH') };
              }
          });
          setNodesData(initialNodes);
          
          const firstNodeId = Object.keys(initialNodes)[0];
          if (firstNodeId) {
              setSelectedNodeId(firstNodeId);
              fetchRainForecast(initialNodes[firstNodeId].lat || 16.4477, initialNodes[firstNodeId].lng || 103.5314);
          }
          
          setHasInit(true);
          const lastRecordTime = new Date(sensorData[0].created_at).getTime();
          const currentTime = new Date().getTime();
          const timeDiff = currentTime - lastRecordTime;

          if (timeDiff <= 90000) { 
              setIsOnline(true);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              timeoutRef.current = setTimeout(() => setIsOnline(false), 90000 - timeDiff); 
          } else {
              setIsOnline(false); 
          }

      } else {
          setHasInit(true);
          setIsOnline(false);
          fetchRainForecast(16.4477, 103.5314);
      }
  };

  useEffect(() => {
    import('leaflet').then((L) => {
        leafletRef.current = L;
        if (!mapRef.current) {
            mapRef.current = L.map("map", { zoomControl: false }).setView([16.4477, 103.5314], 16);
            tileLayerRef.current = L.tileLayer(MAP_STYLES[mapStyle].url, { maxZoom: 19 }).addTo(mapRef.current);
        }
        fetchInitialData();
    });

    const channel = supabase.channel('public:sensor_data')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data' }, (payload) => {
            updateNodeData(payload.new);
        })
        .subscribe();

    const channelConfig = supabase.channel('public:config_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'config' }, (payload) => {
            if (payload.new.key === 'hidden_nodes') {
                try { setHiddenNodes(JSON.parse(payload.new.value)); } catch(e) {}
            } else if (payload.new.key === 'site_name') {
                setSiteName(payload.new.value);
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(channelConfig);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (tileLayerRef.current) {
        tileLayerRef.current.setUrl(MAP_STYLES[mapStyle].url);
    }
  }, [mapStyle]);

  useEffect(() => {
      if (!mapRef.current || !leafletRef.current) return;
      Object.values(markersRef.current).forEach(m => mapRef.current.removeLayer(m));
      markersRef.current = {};

      Object.values(nodesData).forEach((node: any) => {
          const id = node.device_id || 'NODE_01';
          if (hiddenNodes.includes(id)) return;

          const nowMs = new Date().getTime();
          const isNodeOnline = node.created_at ? (nowMs - new Date(node.created_at).getTime()) <= 120000 : false;
          if (!isNodeOnline) return;

          const latlng: [number, number] = [node.lat || 16.4477, node.lng || 103.5314];
          const isSelected = id === selectedNodeId;

          const customIcon = leafletRef.current.divIcon({
              className: 'custom-pin',
              html: `<div class="aqi-marker" 
                          style="transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); background-color: ${getStatusColor(node.pm25 || 0)}; ${isSelected ? 'transform: scale(1.3); border: 3px solid #ffffff; box-shadow: 0 8px 20px rgba(0,0,0,0.5); z-index: 1000;' : 'border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);'}">
                          ${node.pm25 || 0}
                     </div>`
          });

          const marker = leafletRef.current.marker(latlng, { icon: customIcon }).addTo(mapRef.current);
          marker.on('click', (e: any) => {
              leafletRef.current.DomEvent.stopPropagation(e);
              setSelectedNodeId(id);
              setIsPanelVisible(true);
              mapRef.current.setView(latlng, 17, { animate: true });
              fetchRainForecast(latlng[0], latlng[1]);
              fetchGeminiAnalysis(node);
          });
          markersRef.current[id] = marker;
      });
  }, [nodesData, selectedNodeId, nodeNames, siteName, hiddenNodes, refreshTrigger]); 

  const currentData = nodesData[selectedNodeId] || { 
      pm25: 0, pm10: 0, temperature: 0, humidity: 0, pressure: 0, lat: 16.4477, displayTime: "--:--:--" 
  };
  
  const finalDisplayName = nodeNames[selectedNodeId] || siteName;
  const statusColor = getStatusColor(currentData.pm25);
  const aiTheme = getAiBoxTheme(currentData.pm25);

  const nowMs = new Date().getTime();
  const activeNodesCount = Object.values(nodesData).filter((node: any) => {
      if (!node.created_at) return true;
      return (nowMs - new Date(node.created_at).getTime()) <= 120000; 
  }).length;
  
  const totalNodesCount = Object.keys(nodesData).length;

  const toolButtonStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.8)', width: '48px', height: '48px',
    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', color: '#3b82f6', cursor: 'pointer',
    transition: 'all 0.2s ease', padding: 0
  };

  return (
    <>
      <nav className="navbar" style={{ position: 'relative', zIndex: 1006, boxSizing: 'border-box' }}>
          <div className="brand">
              <div className="brand-icon">
                  <Wind size={22} strokeWidth={2.5} />
              </div>
              <span className="brand-text">AQI Monitor <span style={{ color: '#3b82f6' }}>KSU</span></span>
          </div>

          <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="nav-links desktop-only">
                  <Link href="/" className="nav-item active">
                      <LayoutDashboard size={16} strokeWidth={2.5} /> <span>หน้าแรก</span>
                  </Link>
                  <Link href="/history" className="nav-item">
                      <History size={16} strokeWidth={2.5} /> <span>ข้อมูลย้อนหลัง</span>
                  </Link>
                  <Link href="/info" className="nav-item">
                      <Info size={16} strokeWidth={2.5} /> <span>เกณฑ์คุณภาพอากาศ</span>
                  </Link>
              </div>
              
              <div className="nav-divider desktop-only"></div> 
              
              <div style={{ position: 'relative' }}>
                  <div className="status-pill" onClick={() => setShowStatusMenu(!showStatusMenu)} style={{
                      display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                      padding: '6px 14px', borderRadius: '20px', transition: '0.2s',
                      backgroundColor: !hasInit ? '#fef3c7' : (isOnline ? '#dcfce7' : '#fef2f2'),
                      color: !hasInit ? '#d97706' : (isOnline ? '#16a34a' : '#dc2626'),
                      border: `1px solid ${!hasInit ? '#fde68a' : (isOnline ? '#bbf7d0' : '#fecaca')}`,
                      fontSize: '13px', fontWeight: '800'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                      {!hasInit ? <Loader size={14} className="spin-icon" /> : (isOnline ? <Activity size={14} strokeWidth={3} className="pulse-icon" /> : <WifiOff size={14} strokeWidth={3} />)}
                      <span className="status-text">
                          {!hasInit ? 'กำลังเชื่อม...' : (isOnline ? `ออนไลน์ ${activeNodesCount}/${totalNodesCount > 0 ? totalNodesCount : 1}` : 'ออฟไลน์')}
                      </span>
                      <ChevronDown size={14} className="desktop-only" style={{ marginLeft: '2px', opacity: 0.8 }} />
                  </div>

                  {showStatusMenu && (
                      <div className="status-dropdown" style={{
                          position: 'absolute', top: '100%', right: 0, marginTop: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '16px',
                          padding: '16px', width: '280px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', zIndex: 1002,
                          boxSizing: 'border-box'
                      }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Activity size={14} /> สถานะจุดตรวจวัดทั้งหมด
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {Object.values(nodesData).map((node: any) => {
                                  const id = node.device_id || 'NODE_01';
                                  const isNodeOnline = node.created_at ? (new Date().getTime() - new Date(node.created_at).getTime()) <= 120000 : false;
                                  const dName = nodeNames[id] || id;

                                  return (
                                      <div key={id} style={{ 
                                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', 
                                          backgroundColor: isNodeOnline ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', 
                                          border: `1px solid ${isNodeOnline ? '#bbf7d0' : '#fecaca'}` 
                                      }}>
                                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                              {dName.split('|')[0].trim()}
                                          </span>
                                          <span style={{ fontSize: '11px', fontWeight: '800', color: isNodeOnline ? '#10b981' : '#ef4444', backgroundColor: isNodeOnline ? '#dcfce7' : '#fee2e2', padding: '4px 8px', borderRadius: '8px' }}>
                                              {isNodeOnline ? 'ONLINE' : 'OFFLINE'}
                                          </span>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  )}
              </div>

              <div id="live-clock" className="live-clock desktop-only">
                  <Clock size={16} strokeWidth={2.5} color="#64748b" />
                  <span>{clock}</span>
              </div>

              <button 
                  className="mobile-menu-btn"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                  {isMobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
              </button>
          </div>

          {isMobileMenuOpen && (
              <div className="mobile-dropdown" style={{
                  position: 'absolute', top: '100%', left: 0, width: '100%', boxSizing: 'border-box',
                  backgroundColor: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)',
                  borderBottom: '1px solid #e2e8f0', padding: '15px 20px',
                  display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 1005,
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
              }}>
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2563eb', fontWeight: '700', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '12px', textDecoration: 'none' }}>
                      <LayoutDashboard size={18} strokeWidth={2.5} /> หน้าแรก
                  </Link>
                  <Link href="/history" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '700', padding: '12px', textDecoration: 'none' }}>
                      <History size={18} strokeWidth={2.5} /> ข้อมูลย้อนหลัง
                  </Link>
                  <Link href="/info" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '700', padding: '12px', textDecoration: 'none' }}>
                      <Info size={18} strokeWidth={2.5} /> เกณฑ์คุณภาพอากาศ
                  </Link>
              </div>
          )}
      </nav>

      <div className="map-toolbar" style={{
          position: 'absolute', 
          top: '100px', 
          left: '20px', 
          zIndex: 1000,
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px'
      }}>
          <button 
            title="กลับไปยังจุดตรวจวัดหลัก"
            onClick={() => { if (mapRef.current) mapRef.current.setView([16.4477, 103.5314], 16, { animate: true }); }}
            style={toolButtonStyle}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Target size={24} strokeWidth={2.5} />
          </button>

          <div style={{ position: 'relative' }}>
              <button 
                  title="เปลี่ยนรูปแบบแผนที่"
                  onClick={() => setShowMapMenu(!showMapMenu)}
                  style={{ ...toolButtonStyle, backgroundColor: showMapMenu ? '#f8fafc' : 'rgba(255,255,255,0.95)' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                  <Layers size={24} strokeWidth={2.5} />
              </button>
              
              {showMapMenu && (
                  <div className="map-layer-menu" style={{
                      position: 'absolute', left: '60px', top: '0',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
                      borderRadius: '16px', padding: '8px',
                      boxShadow: '0 10px 30px -5px rgba(0,0,0,0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      display: 'flex', flexDirection: 'column', gap: '4px', width: '200px',
                      boxSizing: 'border-box'
                  }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', padding: '6px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>รูปแบบแผนที่</div>
                      {Object.entries(MAP_STYLES).map(([key, style]) => (
                          <button
                              key={key}
                              onClick={() => { setMapStyle(key as keyof typeof MAP_STYLES); setShowMapMenu(false); }}
                              style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                  backgroundColor: mapStyle === key ? '#eff6ff' : 'transparent',
                                  color: mapStyle === key ? '#2563eb' : '#475569',
                                  fontWeight: '700', fontSize: '13px', transition: 'all 0.2s', textAlign: 'left'
                              }}
                              onMouseOver={(e) => { if(mapStyle !== key) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                              onMouseOut={(e) => { if(mapStyle !== key) e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                              {style.name}
                              {mapStyle === key && <CheckCircle2 size={16} strokeWidth={2.5} />}
                          </button>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {isPanelVisible && (
        <div className="info-panel" style={{ 
            width: '380px', 
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', 
            borderRadius: '24px', 
            padding: '24px', 
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.2)', 
            position: 'absolute', 
            top: '100px', 
            right: '20px', 
            zIndex: 1001, 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(20px)', 
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            maxHeight: 'calc(100vh - 140px)', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxSizing: 'border-box'
        }}>
            
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '-5px' }}>
                <button 
                    onClick={() => setIsPanelVisible(false)}
                    style={{ 
                        position: 'absolute', right: '0', top: '0',
                        backgroundColor: '#f1f5f9', border: 'none', width: '32px', height: '32px', 
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: '#64748b', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                >
                    <X size={16} strokeWidth={2.5} />
                </button>

                <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '16px', color: '#3b82f6', marginBottom: '12px', display: 'inline-flex', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.15)' }}>
                    <MapPin size={24} strokeWidth={2.5} />
                </div>
                
                <div style={{ width: '85%' }}>
                    {formatText(finalDisplayName)}
                </div>
            </div>

            <div className="pm-container" style={{ backgroundColor: '#f8fafc', borderRadius: '20px', padding: '24px 20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '800', marginBottom: '15px' }}>ปริมาณฝุ่น PM2.5</div>
                
                <div className="pm-circle" style={{ 
                    width: '130px', height: '130px', 
                    borderRadius: '50%', 
                    border: `12px solid ${statusColor}`, 
                    borderBottomColor: 'transparent', 
                    transform: 'rotate(45deg)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 10px 30px -5px ${statusColor}40`
                }}>
                    <div style={{ transform: 'rotate(-45deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5px' }}>
                        <span className="pm-value" style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{currentData.pm25}</span>
                        <span className="pm-unit" style={{ fontSize: '13px', color: '#64748b', fontWeight: '800', marginTop: '2px' }}>µg/m³</span>
                    </div>
                </div>

                <div className="status-badge" style={{ marginTop: '20px', backgroundColor: statusColor, color: '#fff', padding: '6px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px', boxShadow: `0 4px 15px ${statusColor}50` }}>
                    {getStatusText(currentData.pm25)}
                </div>

                <div style={{ marginTop: '15px', fontSize: '13px', color: '#475569', textAlign: 'center', fontWeight: '700', lineHeight: '1.5' }}>
                    {getHealthAdvice(currentData.pm25)}
                </div>
            </div>

            <div className="weather-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <WeatherCard icon={<Thermometer size={16} color="#ef4444" />} label="อุณหภูมิ" value={(currentData.temperature || 0).toFixed(0)} unit="°C" />
                <WeatherCard icon={<Droplets size={16} color="#3b82f6" />} label="ความชื้น" value={(currentData.humidity || 0).toFixed(0)} unit="%" />
                <WeatherCard icon={<Gauge size={16} color="#8b5cf6" />} label="ความกดอากาศ" value={currentData.pressure > 0 ? currentData.pressure.toFixed(1) : '-'} unit={ <span style={{fontSize: '11px'}}>hPa</span> } />
                <WeatherCard icon={<CloudRain size={16} color="#06b6d4" />} label="โอกาสฝน" value={rainChance} unit="%" />
            </div>

            <div className="ai-box" style={{ background: aiTheme.bg, borderRadius: '20px', padding: '20px', border: `1px solid ${aiTheme.border}`, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', transition: 'all 0.5s ease', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ background: aiTheme.iconBg, padding: '6px', borderRadius: '10px', color: 'white', boxShadow: `0 2px 10px ${aiTheme.iconShadow}`, transition: 'all 0.5s ease' }}>
                        <Sparkles size={16} strokeWidth={2.5} />
                    </div>
                    <span className="ai-title" style={{ fontSize: '15px', fontWeight: '800', color: aiTheme.titleColor, transition: 'all 0.5s ease' }}>AI วิเคราะห์สภาพอากาศ</span>
                </div>
                <div className="ai-content" style={{ fontSize: '13.5px', color: '#3f3f46', lineHeight: '1.7', fontWeight: '500', opacity: isAiLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                    <ReactMarkdown
                        components={{
                            strong: ({node, ...props}) => <strong style={{ 
                                display: 'block', color: aiTheme.strongColor, fontWeight: '900', fontSize: '14px',
                                marginTop: '12px', marginBottom: '4px', paddingBottom: '4px', borderBottom: `1px dashed ${aiTheme.border}` 
                            }} {...props} />,
                            p: ({node, ...props}) => <p style={{ marginBottom: '8px' }} {...props} />
                        }}
                    >
                        {aiAnalysis?.replace(/\*\*([^*]+):\*\*/g, '**$1**') || ""}
                    </ReactMarkdown>
                </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                อัปเดตล่าสุด: {currentData.displayTime}
            </div>
            
        </div>
      )}

      <div id="map"></div>

      {/* 🌟 ป้ายบอกสีแบบไม่มีทศนิยม (จำนวนเต็ม) */}
      <div className="map-legend" style={{
          position: 'absolute', bottom: '30px', left: '20px', zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '20px',
          padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
          boxSizing: 'border-box'
      }}>
          <LegendItem color="#0ea5e9" text="ดีมาก (0 - 15)" />
          <LegendItem color="#10b981" text="ดี (16 - 25)" />
          <LegendItem color="#f59e0b" text="ปานกลาง (26 - 37)" />
          <LegendItem color="#f97316" text="เริ่มมีผล (38 - 75)" />
          <LegendItem color="#ef4444" text="มีผลกระทบ (76+)" />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* ล็อคไม่ให้เว็บเลื่อนซ้ายขวาได้เด็ดขาด */
        html, body {
            overflow-x: hidden !important;
            max-width: 100vw !important;
        }

        /* ❌ ไม้ตาย: ซ่อนปุ่มซูมของ Leaflet แบบถาวร 100% ไม่ว่าจะหน้าจอไหนก็ตาม */
        .leaflet-control-zoom {
            display: none !important;
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
            
            /* 🌟 บังคับแสดงชื่อเว็บ AQI Monitor KSU บนมือถือ */
            .brand-text { 
                font-size: 16px !important; 
                white-space: nowrap !important; 
                display: inline-block !important; /* งัดกับ mobile.css เดิม */
            }

            .brand-icon { padding: 5px !important; border-radius: 8px !important; }
            .brand-icon svg { width: 16px !important; height: 16px !important; }
            
            /* ปุ่มสถานะออนไลน์ย่อขนาดลง */
            .status-pill { padding: 4px 8px !important; font-size: 11px !important; }
            .status-text { max-width: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; vertical-align: middle; }
            
            .status-dropdown { 
                position: fixed !important;
                top: 70px !important; 
                left: 50% !important;
                transform: translateX(-50%) !important;
                width: 92vw !important; 
                max-width: 350px !important;
            }

            /* ปุ่มบนแผนที่ขยับลงมาไม่ให้ชนเมนู */
            .map-toolbar { top: 85px !important; left: 10px !important; }
            .map-layer-menu { left: 55px !important; width: 180px !important; }

            /* 🌟 Bottom Sheet เด้งจากด้านล่างแบบเลื่อนได้ */
            .info-panel {
                position: fixed !important;
                top: auto !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                transform: none !important;
                width: 100% !important;
                max-width: 100% !important;
                max-height: 70vh !important; /* ปรับให้สูงขึ้นนิดนึง */
                overflow-y: auto !important; /* 🌟 สำคัญมาก: ทำให้เลื่อนนิ้วขึ้นลงได้ */
                border-radius: 24px 24px 0 0 !important;
                padding: 20px 20px 40px 20px !important; /* เพิ่มขอบล่างเผื่อตกขอบ */
                z-index: 1005 !important;
                box-shadow: 0 -10px 40px rgba(0,0,0,0.15) !important;
            }
            
            .responsive-title { font-size: 16px !important; }
            .pm-container { padding: 12px !important; }
            .pm-circle { width: 100px !important; height: 100px !important; border-width: 8px !important; }
            .pm-value { font-size: 36px !important; }
            .weather-grid { gap: 8px !important; }
            .weather-card { padding: 10px !important; }
            .weather-card-value { font-size: 18px !important; }
            .ai-box { padding: 15px !important; }
            
            /* แผงสี Legend จัดเรียงแนวนอนแบบกะทัดรัด */
            .map-legend {
                bottom: 15px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                width: 95vw !important;
                max-width: 400px !important;
                padding: 10px !important;
                flex-direction: row !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                gap: 6px 10px !important;
                border-radius: 16px !important;
                z-index: 999 !important; 
            }
            .legend-item { padding: 2px !important; width: auto !important; }
            .legend-item span { font-size: 11px !important; }
        }

        @media (min-width: 769px) {
            .mobile-menu-btn { display: none !important; }
            .mobile-dropdown { display: none !important; }
        }
      `}} />
    </>
  );
}