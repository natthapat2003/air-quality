'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '../mobile.css';

import { 
    Wind, LayoutDashboard, History, Info as InfoIcon, Clock, BookOpen, Menu, X
} from 'lucide-react';

export default function InfoPage() {
  const [clock, setClock] = useState("กำลังโหลดเวลา...");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClock(`${now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} | ${now.toLocaleTimeString('th-TH')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
                <Link href="/" className="nav-item">
                    <LayoutDashboard size={16} strokeWidth={2.5} /> <span>หน้าแรก</span>
                </Link>
                <Link href="/history" className="nav-item">
                    <History size={16} strokeWidth={2.5} /> <span>ข้อมูลย้อนหลัง</span>
                </Link>
                <Link href="/info" className="nav-item active">
                    <InfoIcon size={16} strokeWidth={2.5} /> <span>เกณฑ์คุณภาพอากาศ</span>
                </Link>
            </div>
            
            <div className="nav-divider desktop-only"></div>

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
                    <InfoIcon size={18} strokeWidth={2.5} /> เกณฑ์คุณภาพอากาศ
                </Link>
            </div>
        )}
      </nav>

      <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="card" style={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', padding: '35px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
            
            <div className="header-row" style={{ width: '100%', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', textAlign: 'left' }}>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '10px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                    <BookOpen size={24} strokeWidth={2} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>เกณฑ์การปฏิบัติตนตามระดับค่าสีฝุ่น PM2.5</h2>
            </div>
            
            <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '20px 24px', color: '#475569', fontWeight: '800', width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>ปริมาณฝุ่น PM2.5<br/><span style={{fontSize: '13px', fontWeight: '600'}}>(µg/m³)</span></th>
                            <th style={{ padding: '20px 24px', color: '#475569', fontWeight: '800', width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>คุณภาพอากาศ</th>
                            <th style={{ padding: '20px 24px', color: '#475569', fontWeight: '800', width: '65%', textAlign: 'left' }}>การปฏิบัติตน (อ้างอิงกรมอนามัย)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 🌟 อัปเดตเกณฑ์เป็นจำนวนเต็มทั้งหมด */}
                        {/* ดีมาก */}
                        <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '24px', fontWeight: '900', color: '#0f172a', fontSize: '18px', textAlign: 'center', whiteSpace: 'nowrap' }}>0 - 15</td>
                            <td style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '6px 14px', borderRadius: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9', boxShadow: '0 0 8px #0ea5e9' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0ea5e9', whiteSpace: 'nowrap' }}>ดีมาก</span>
                                </div>
                            </td>
                            <td style={{ padding: '24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                                <span style={{ fontWeight: '800', color: '#0f172a' }}>ประชาชนทุกคน และ กลุ่มเสี่ยง</span>
                                <ul style={{ margin: '0', paddingLeft: '24px', listStyleType: 'disc', color: '#475569' }}>
                                    <li>ทำกิจกรรมได้ตามปกติ</li>
                                </ul>
                            </td>
                        </tr>

                        {/* ดี */}
                        <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '24px', fontWeight: '900', color: '#0f172a', fontSize: '18px', textAlign: 'center', whiteSpace: 'nowrap' }}>16 - 25</td>
                            <td style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#10b981', whiteSpace: 'nowrap' }}>ดี</span>
                                </div>
                            </td>
                            <td style={{ padding: '24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '800', color: '#0f172a' }}>ประชาชนทุกคน</span> ทำกิจกรรมได้ตามปกติ
                                </div>
                                <div>
                                    <span style={{ fontWeight: '800', color: '#ef4444' }}>กลุ่มเสี่ยง</span> เลี่ยงการทำกิจกรรมที่ใช้แรงมาก และสังเกตอาการตนเอง
                                </div>
                            </td>
                        </tr>

                        {/* ปานกลาง */}
                        <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '24px', fontWeight: '900', color: '#0f172a', fontSize: '18px', textAlign: 'center', whiteSpace: 'nowrap' }}>26 - 37</td>
                            <td style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#f59e0b', whiteSpace: 'nowrap' }}>ปานกลาง</span>
                                </div>
                            </td>
                            <td style={{ padding: '24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '4px' }}>ประชาชนทุกคน และ กลุ่มเสี่ยง</span>
                                    <ul style={{ margin: '0', paddingLeft: '24px', listStyleType: 'disc', color: '#475569' }}>
                                        <li style={{ marginBottom: '6px' }}>ลดระยะเวลาการทำกิจกรรมที่ใช้แรงมาก / การออกกำลังกายกลางแจ้ง</li>
                                        <li style={{ marginBottom: '6px' }}>สวมหน้ากากป้องกันฝุ่นละอองทุกครั้งเมื่ออยู่กลางแจ้ง</li>
                                        <li>หากมีอาการผิดปกติ ให้รีบพบแพทย์</li>
                                    </ul>
                                </div>
                            </td>
                        </tr>

                        {/* เริ่มมีผลกระทบ */}
                        <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '24px', fontWeight: '900', color: '#0f172a', fontSize: '18px', textAlign: 'center', whiteSpace: 'nowrap' }}>38 - 75</td>
                            <td style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '6px 14px', borderRadius: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316', boxShadow: '0 0 8px #f97316' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#f97316', whiteSpace: 'nowrap' }}>เริ่มมีผลกระทบ</span>
                                </div>
                            </td>
                            <td style={{ padding: '24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '4px' }}>ประชาชนทุกคน</span>
                                    <ul style={{ margin: '0', paddingLeft: '24px', listStyleType: 'disc', color: '#475569' }}>
                                        <li style={{ marginBottom: '6px' }}>หลีกเลี่ยงการออกกำลังกายกลางแจ้ง / การทำงานที่ใช้แรงมาก</li>
                                        <li style={{ marginBottom: '6px' }}>สวมหน้ากากป้องกันฝุ่นละอองทุกครั้งเมื่ออยู่กลางแจ้ง</li>
                                        <li>หากมีอาการผิดปกติ ให้รีบพบแพทย์</li>
                                    </ul>
                                </div>
                                <div>
                                    <span style={{ fontWeight: '800', color: '#ef4444', display: 'block', marginBottom: '4px' }}>กลุ่มเสี่ยง</span>
                                    <ul style={{ margin: '0', paddingLeft: '24px', listStyleType: 'disc', color: '#475569' }}>
                                        <li>หลีกเลี่ยงการทำกิจกรรมนอกอาคาร และควรเฝ้าระวังตนเอง</li>
                                    </ul>
                                </div>
                            </td>
                        </tr>

                        {/* มีผลกระทบ */}
                        <tr style={{ transition: 'background-color 0.2s', backgroundColor: '#fef2f2' }}>
                            <td style={{ padding: '24px', fontWeight: '900', color: '#ef4444', fontSize: '18px', textAlign: 'center', whiteSpace: 'nowrap' }}>76 ขึ้นไป</td>
                            <td style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#ef4444', whiteSpace: 'nowrap' }}>มีผลกระทบ</span>
                                </div>
                            </td>
                            <td style={{ padding: '24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                                <div>
                                    <span style={{ fontWeight: '900', color: '#ef4444', display: 'block', marginBottom: '4px', fontSize: '16px' }}>ประชาชนทุกคน และ กลุ่มเสี่ยง ⚠️</span>
                                    <ul style={{ margin: '0', paddingLeft: '24px', listStyleType: 'disc', color: '#0f172a', fontWeight: '600' }}>
                                        <li style={{ marginBottom: '6px' }}>งดทำกิจกรรมนอกอาคาร และการออกกำลังกายกลางแจ้ง</li>
                                        <li style={{ marginBottom: '6px' }}>ให้อยู่ในห้องปลอดฝุ่น และสวมหน้ากากกันฝุ่นทุกครั้ง</li>
                                        <li style={{ marginBottom: '6px' }}>หากมีอาการผิดปกติ ให้รีบพบแพทย์</li>
                                        <li>ผู้ที่มีโรคประจำตัวเตรียมยาและอุปกรณ์ที่จำเป็นให้พร้อม รวมถึงปฏิบัติตามคำแนะนำทางการแพทย์</li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div style={{ marginTop: '24px', fontSize: '13px', fontWeight: '600', color: '#94a3b8', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                <InfoIcon size={14} />
                * อ้างอิงตามเกณฑ์กรมอนามัย (Department of Health) ปรับค่ามาตรฐานใหม่
            </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
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

            .container { padding: 15px !important; }
            .card { padding: 20px 15px !important; }
            .header-row h2 { font-size: 17px !important; }

            th, td { padding: 15px 12px !important; }
        }

        @media (min-width: 769px) {
            .mobile-menu-btn { display: none !important; }
            .mobile-dropdown { display: none !important; }
        }
      `}} />
    </>
  );
}