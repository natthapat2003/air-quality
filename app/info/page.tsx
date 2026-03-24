'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

import {
  Wind, LayoutDashboard, History, Info, Clock, Lock, LogOut,
  BookOpen, ShieldCheck, AlertCircle, AlertTriangle, ShieldAlert,
  HeartPulse, Activity, CheckCircle2, Menu, X
} from 'lucide-react';

// ข้อมูลเกณฑ์คุณภาพอากาศ (อ้างอิงกรมอนามัย)
const aqiGuidelines = [
  {
    range: "0 - 15",
    status: "ดีมาก",
    color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd",
    icon: <HeartPulse size={28} color="#0ea5e9" />,
    adviceAll: ["สามารถทำกิจกรรมกลางแจ้งและการท่องเที่ยวได้ตามปกติ"],
    adviceRisk: ["ทำกิจกรรมได้ตามปกติ"]
  },
  {
    range: "16 - 25",
    status: "ดี",
    color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0",
    icon: <ShieldCheck size={28} color="#10b981" />,
    adviceAll: ["สามารถทำกิจกรรมกลางแจ้งได้ตามปกติ"],
    adviceRisk: ["ควรเลี่ยงการทำกิจกรรมที่ใช้แรงมาก", "สังเกตอาการตนเอง หากมีอาการผิดปกติควรลดกิจกรรมกลางแจ้ง"]
  },
  {
    range: "26 - 37",
    status: "ปานกลาง",
    color: "#f59e0b", bg: "#fffbeb", border: "#fde68a",
    icon: <AlertCircle size={28} color="#f59e0b" />,
    adviceAll: [
      "ลดระยะเวลาการทำกิจกรรมที่ใช้แรงมาก หรือการออกกำลังกายกลางแจ้ง",
      "สวมหน้ากากป้องกันฝุ่นละอองทุกครั้งเมื่ออยู่กลางแจ้ง",
      "หากมีอาการผิดปกติ เช่น ไอ หายใจลำบาก ให้รีบพบแพทย์"
    ],
    adviceRisk: [
      "ลดระยะเวลาการทำกิจกรรมที่ใช้แรงมาก หรือการออกกำลังกายกลางแจ้ง",
      "สวมหน้ากากป้องกันฝุ่นละอองทุกครั้งเมื่ออยู่กลางแจ้ง",
      "ผู้ที่มีโรคประจำตัวควรเตรียมยาให้พร้อม"
    ]
  },
  {
    range: "38 - 75",
    status: "เริ่มมีผลกระทบ",
    color: "#f97316", bg: "#fff7ed", border: "#fed7aa",
    icon: <AlertTriangle size={28} color="#f97316" />,
    adviceAll: [
      "หลีกเลี่ยงการออกกำลังกายกลางแจ้ง หรือการทำงานที่ใช้แรงมาก",
      "สวมหน้ากากป้องกันฝุ่นละออง (N95) ทุกครั้งเมื่ออยู่กลางแจ้ง",
      "หากมีอาการผิดปกติ ให้รีบพบแพทย์ทันที"
    ],
    adviceRisk: [
      "งดการทำกิจกรรมกลางแจ้งโดยเด็ดขาด",
      "อยู่ในอาคาร หรือห้องที่มีระบบฟอกอากาศ",
      "หากมีอาการผิดปกติ ให้รีบพบแพทย์ทันที"
    ]
  },
  {
    range: "76 ขึ้นไป",
    status: "มีผลกระทบต่อสุขภาพ",
    color: "#ef4444", bg: "#fef2f2", border: "#fecaca",
    icon: <ShieldAlert size={28} color="#ef4444" />,
    adviceAll: [
      "งดกิจกรรมนอกอาคาร และการออกกำลังกายกลางแจ้งทุกชนิด",
      "อยู่ในอาคาร หรือห้องปฏิบัติการที่ปลอดฝุ่น (Clean Room)",
      "สวมหน้ากาก N95 ตลอดเวลาหากมีความจำเป็นต้องออกนอกอาคาร",
      "หากมีอาการผิดปกติ ให้รีบไปพบแพทย์ทันที"
    ],
    adviceRisk: [
      "งดกิจกรรมนอกอาคารทุกชนิดโดยเด็ดขาด",
      "ควรอยู่ในห้องที่ปิดมิดชิดและมีเครื่องฟอกอากาศ",
      "เตรียมยาและอุปกรณ์ทางการแพทย์ให้พร้อมใช้งานเสมอ"
    ]
  }
];

export default function InfoPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [clock, setClock] = useState("กำลังโหลดเวลา...");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    const timer = setInterval(() => {
      const now = new Date();
      setClock(`${now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} | ${now.toLocaleTimeString('th-TH')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("ออกจากระบบเรียบร้อย");
    window.location.reload();
  };

  return (
    <>
      {/* 🌟 Navbar คงรูปแบบเดิมเพื่อความสม่ำเสมอ */}
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
                  <Link href="/history" className="nav-item">
                      <History size={16} strokeWidth={2.5} /> <span>ข้อมูลย้อนหลัง</span>
                  </Link>
                  <Link href="/info" className="nav-item active">
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

              <button 
                  className="mobile-menu-btn"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                  {isMobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
              </button>
          </div>

          {isMobileMenuOpen && (
              <div className="mobile-dropdown">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '700', padding: '12px', textDecoration: 'none' }}>
                      <LayoutDashboard size={18} strokeWidth={2.5} /> หน้าแรก
                  </Link>
                  <Link href="/history" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '700', padding: '12px', textDecoration: 'none' }}>
                      <History size={18} strokeWidth={2.5} /> ข้อมูลย้อนหลัง
                  </Link>
                  <Link href="/info" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2563eb', fontWeight: '700', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '12px', textDecoration: 'none' }}>
                      <Info size={18} strokeWidth={2.5} /> เกณฑ์คุณภาพอากาศ
                  </Link>
                  
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

      <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="card" style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          {/* Header Section */}
          <div style={{ padding: '40px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '14px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)' }}>
                <BookOpen size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>เกณฑ์การปฏิบัติตนตามระดับฝุ่น PM2.5</h1>
                <p style={{ fontSize: '15px', color: '#64748b', margin: '6px 0 0 0', fontWeight: '600' }}>คำแนะนำและข้อควรระวังด้านสุขภาพ อ้างอิงตามมาตรฐานของกรมอนามัย</p>
              </div>
            </div>
          </div>

          {/* Content Section (Cards instead of Table) */}
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }} className="info-content-padding">
            
            {aqiGuidelines.map((item, index) => (
              <div key={index} className="aqi-card" style={{ 
                display: 'flex', 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '20px', 
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}>
                {/* Left Side: Color & Range */}
                <div className="aqi-card-left" style={{ 
                  backgroundColor: item.bg, 
                  borderLeft: `8px solid ${item.color}`,
                  padding: '30px 20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '220px',
                  borderRight: '1px solid #e2e8f0'
                }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '50%', marginBottom: '12px', boxShadow: `0 4px 15px -5px ${item.color}60` }}>
                    {item.icon}
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{item.range}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginTop: '4px' }}>µg/m³</div>
                  
                  <div style={{ 
                    marginTop: '16px', 
                    backgroundColor: item.color, 
                    color: '#ffffff', 
                    padding: '6px 20px', 
                    borderRadius: '20px', 
                    fontSize: '14px', 
                    fontWeight: '800',
                    boxShadow: `0 4px 10px ${item.color}40`
                  }}>
                    {item.status}
                  </div>
                </div>

                {/* Right Side: Advice */}
                <div className="aqi-card-right" style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* ประชาชนทั่วไป */}
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px 0' }}>
                      <Activity size={18} color="#3b82f6" /> สำหรับประชาชนทั่วไป
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.adviceAll.map((text, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                          <CheckCircle2 size={16} color="#94a3b8" style={{ marginTop: '4px', flexShrink: 0 }} />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* เส้นกั้น */}
                  <div style={{ height: '1px', backgroundColor: '#f1f5f9', width: '100%' }}></div>

                  {/* กลุ่มเสี่ยง */}
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800', color: '#ef4444', margin: '0 0 12px 0' }}>
                      <AlertCircle size={18} color="#ef4444" /> สำหรับกลุ่มเสี่ยง <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>(เด็ก, ผู้สูงอายุ, หญิงตั้งครรภ์, ผู้ป่วย)</span>
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.adviceRisk.map((text, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                          <CheckCircle2 size={16} color="#fca5a5" style={{ marginTop: '4px', flexShrink: 0 }} />
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Hover Effect สำหรับการ์ด */
        .aqi-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1) !important;
            border-color: #cbd5e1 !important;
        }

        /* 📱 จัดการ Responsive สำหรับมือถือ */
        @media (max-width: 768px) {
            .desktop-only { display: none !important; }
            .mobile-menu-btn { 
                display: flex !important; align-items: center; justify-content: center; 
                background: #eff6ff; border: none; color: #2563eb; padding: 8px; 
                border-radius: 12px; cursor: pointer; transition: 0.2s;
            }
            .mobile-menu-btn:active { transform: scale(0.95); background: #dbeafe; }
            
            .navbar { padding: 10px 12px !important; height: 65px !important; }
            .nav-right { gap: 6px !important; }
            .brand { gap: 8px !important; }
            .brand-text { font-size: 16px !important; white-space: nowrap !important; display: inline-block !important; }
            .brand-icon { padding: 5px !important; border-radius: 8px !important; }
            .brand-icon svg { width: 16px !important; height: 16px !important; }
            
            .mobile-dropdown {
                position: absolute; top: 100%; left: 0; width: 100%; box-sizing: border-box;
                background-color: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px);
                border-bottom: 1px solid #e2e8f0; padding: 15px 20px;
                display: flex; flex-direction: column; gap: 10px; z-index: 1005;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            }

            .container { padding: 10px !important; }
            .info-content-padding { padding: 20px !important; }
            
            /* เปลี่ยนจากการเรียงแนวนอน เป็นเรียงแนวตั้งบนมือถือ */
            .aqi-card {
                flex-direction: column !important;
            }
            
            .aqi-card-left {
                border-right: none !important;
                border-bottom: 1px dashed #cbd5e1 !important;
                border-left: none !important;
                border-top: 8px solid var(--card-color) !important; /* ใช้สีขอบด้านบนแทน */
                padding: 25px 20px !important;
                min-width: 100% !important;
            }
            
            /* อิงสี border-top จากสีที่กำหนดไว้ใน style (React จัดการให้แล้วส่วนหนึ่ง แต่ต้องบังคับทิศทาง) */
            .aqi-card-left { border-left-width: 0 !important; border-top-width: 8px !important; border-top-style: solid !important; }
            
            .aqi-card-right {
                padding: 20px !important;
            }
            
            /* ลดขนาดฟอนต์บนมือถือนิดหน่อย */
            .aqi-card-right h4 { font-size: 15px !important; }
            .aqi-card-right li { font-size: 14px !important; }
        }

        @media (min-width: 769px) {
            .mobile-menu-btn { display: none !important; }
            .mobile-dropdown { display: none !important; }
        }
      `}} />
    </>
  );
}