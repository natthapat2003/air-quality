'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 🛑 Import ไฟล์ CSS สำหรับมือถือ
import '../mobile.css';

// 🛑 นำเข้าไอคอน (เอาไอคอน Lock และ LogOut ออกแล้ว)
import { 
    Wind, LayoutDashboard, History, Info as InfoIcon, Clock, BookOpen 
} from 'lucide-react';

export default function InfoPage() {
  const [clock, setClock] = useState("กำลังโหลดเวลา...");

  // ฟังก์ชันนาฬิกา
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClock(`${now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} | ${now.toLocaleTimeString('th-TH')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="brand">
            <div className="brand-icon">
                <Wind size={22} strokeWidth={2.5} />
            </div>
            {/* 🛑 ใส่ Class brand-text เพื่อซ่อนในมือถือ */}
            <span className="brand-text">AQI Monitor <span style={{ color: '#3b82f6' }}>KSU</span></span>
        </div>

        <div className="nav-right">
            <div className="nav-links">
                {/* 🛑 ใส่ <span> ครอบข้อความ เพื่อให้ CSS สั่งซ่อน/ย่อได้ */}
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
            
            <div className="nav-divider"></div>

            <div id="live-clock" className="live-clock">
                <Clock size={16} strokeWidth={2.5} color="#64748b" />
                <span>{clock}</span>
            </div>
        </div>
      </nav>

      <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="card" style={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', padding: '35px', backgroundColor: '#ffffff' }}>
            
            <div className="header-row" style={{ width: '100%', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', textAlign: 'left' }}>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '10px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                    <BookOpen size={24} strokeWidth={2} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>เกณฑ์ดัชนีคุณภาพอากาศของประเทศไทย</h2>
            </div>
            
            {/* 🛑 เปลี่ยน overflow: 'hidden' เป็น overflowX: 'auto' เพื่อให้ตารางเลื่อนซ้ายขวาได้ในมือถือ */}
            <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflowX: 'auto' }}>
                <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '20px 24px', color: '#475569', fontWeight: '800', width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>ช่วงค่า AQI</th>
                            <th style={{ padding: '20px 24px', color: '#475569', fontWeight: '800', width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>คุณภาพอากาศ</th>
                            <th style={{ padding: '20px 24px', color: '#475569', fontWeight: '800', width: '65%', textAlign: 'left' }}>ข้อแนะนำในการปฏิบัติตน</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* ดีมาก */}
                        <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '24px', fontWeight: '900', color: '#0f172a', fontSize: '18px', textAlign: 'center' }}>0 - 25</td>
                            <td style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '6px 14px', borderRadius: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9', boxShadow: '0 0 8px #0ea5e9' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0ea5e9', whiteSpace: 'nowrap' }}>ดีมาก</span>
                                </div>
                            </td>
                            <td style={{ padding: '24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                                <span style={{ fontWeight: '800', color: '#0f172a' }}>ประชาชนทุกคน</span> สามารถดำเนินชีวิตได้ตามปกติ
                            </td>
                        </tr>

                        {/* ดี */}
                        <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '24px', fontWeight: '900', color: '#0f172a', fontSize: '18px', textAlign: 'center' }}>26 - 50</td>
                            <td style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#10b981', whiteSpace: 'nowrap' }}>ดี</span>
                                </div>
                            </td>
                            <td style={{ padding: '24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '800', color: '#0f172a' }}>ประชาชนทั่วไป</span> สามารถทำกิจกรรมกลางแจ้งได้ตามปกติ
                                </div>
                                <div>
                                    <span style={{ fontWeight: '800', color: '#ef4444' }}>ประชาชนกลุ่มเสี่ยง</span> ควรสังเกตอาการผิดปกติ เช่น ไอ หายใจลำบาก ระคายเคืองตา
                                </div>
                            </td>
                        </tr>

                        {/* ปานกลาง */}
                        <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '24px', fontWeight: '900', color: '#0f172a', fontSize: '18px', textAlign: 'center' }}>51 - 100</td>
                            <td style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#f59e0b', whiteSpace: 'nowrap' }}>ปานกลาง</span>
                                </div>
                            </td>
                            <td style={{ padding: '24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '4px' }}>ประชาชนทั่วไป</span> 
                                    ลดระยะเวลาการทำกิจกรรมหรือการออกกำลังกายกลางแจ้งที่ใช้แรงมาก
                                </div>
                                <div>
                                    <span style={{ fontWeight: '800', color: '#ef4444', display: 'block', marginBottom: '4px' }}>ประชาชนกลุ่มเสี่ยง</span>
                                    <ul style={{ margin: '0', paddingLeft: '24px', listStyleType: 'disc', color: '#475569' }}>
                                        <li style={{ marginBottom: '6px' }}>ใช้อุปกรณ์ป้องกันตนเอง เช่น หน้ากากป้องกัน PM2.5 ทุกครั้งที่ออกนอกอาคาร</li>
                                        <li style={{ marginBottom: '6px' }}>ลดระยะเวลาการทำกิจกรรมกลางแจ้งที่ใช้แรงมาก</li>
                                        <li>หากมีอาการผิดปกติให้รีบปรึกษาแพทย์</li>
                                    </ul>
                                </div>
                            </td>
                        </tr>

                        {/* เริ่มมีผลกระทบ */}
                        <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '24px', fontWeight: '900', color: '#0f172a', fontSize: '18px', textAlign: 'center' }}>101 - 200</td>
                            <td style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '6px 14px', borderRadius: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316', boxShadow: '0 0 8px #f97316' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#f97316', whiteSpace: 'nowrap' }}>เริ่มมีผลกระทบ</span>
                                </div>
                            </td>
                            <td style={{ padding: '24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '4px' }}>ประชาชนทั่วไป</span>
                                    <ul style={{ margin: '0', paddingLeft: '24px', listStyleType: 'disc', color: '#475569' }}>
                                        <li style={{ marginBottom: '6px' }}>ใช้อุปกรณ์ป้องกันตนเอง เช่น หน้ากากป้องกัน PM2.5</li>
                                        <li style={{ marginBottom: '6px' }}>จำกัดระยะเวลาการทำกิจกรรมกลางแจ้ง</li>
                                        <li>ควรสังเกตอาการผิดปกติ</li>
                                    </ul>
                                </div>
                                <div>
                                    <span style={{ fontWeight: '800', color: '#ef4444', display: 'block', marginBottom: '4px' }}>ประชาชนกลุ่มเสี่ยง</span>
                                    <ul style={{ margin: '0', paddingLeft: '24px', listStyleType: 'disc', color: '#475569' }}>
                                        <li style={{ marginBottom: '6px' }}>เลี่ยงการทำกิจกรรมหรือออกกำลังกายกลางแจ้งที่ใช้แรงมาก</li>
                                        <li>ปฏิบัติตามคำแนะนำของแพทย์อย่างเคร่งครัด</li>
                                    </ul>
                                </div>
                            </td>
                        </tr>

                        {/* มีผลกระทบ */}
                        <tr style={{ transition: 'background-color 0.2s', backgroundColor: '#fef2f2' }}>
                            <td style={{ padding: '24px', fontWeight: '900', color: '#ef4444', fontSize: '18px', textAlign: 'center' }}>201 ขึ้นไป</td>
                            <td style={{ padding: '24px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></div>
                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#ef4444', whiteSpace: 'nowrap' }}>มีผลกระทบ</span>
                                </div>
                            </td>
                            <td style={{ padding: '24px', color: '#475569', fontSize: '15px', lineHeight: '1.6', textAlign: 'left' }}>
                                <div>
                                    <span style={{ fontWeight: '900', color: '#ef4444', display: 'block', marginBottom: '4px', fontSize: '16px' }}>ประชาชนทุกคน ⚠️</span>
                                    <ul style={{ margin: '0', paddingLeft: '24px', listStyleType: 'disc', color: '#0f172a', fontWeight: '600' }}>
                                        <li style={{ marginBottom: '6px' }}>งดกิจกรรมกลางแจ้งทุกชนิด</li>
                                        <li style={{ marginBottom: '6px' }}>หากจำเป็นต้องออกนอกอาคาร ให้สวมหน้ากากป้องกัน PM2.5 ตลอดเวลา</li>
                                        <li style={{ marginBottom: '6px' }}>หากมีอาการผิดปกติให้รีบไปพบแพทย์</li>
                                        <li>ผู้ที่มีโรคประจำตัว ควรอยู่ในพื้นที่ปลอดภัย (Safe Zone) เตรียมยาและอุปกรณ์ให้พร้อม</li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div style={{ marginTop: '24px', fontSize: '13px', fontWeight: '600', color: '#94a3b8', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                <InfoIcon size={14} />
                * ข้อมูลอ้างอิงจาก กรมควบคุมมลพิษ (Pollution Control Department)
            </div>
        </div>
      </div>
    </>
  );
}