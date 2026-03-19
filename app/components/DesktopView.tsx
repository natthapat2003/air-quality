'use client';
import React from 'react';

// รับข้อมูล (Props) ที่ส่งมาจากหน้าหลัก
export default function DesktopView({ pm25, aqiStatus, weatherData }: any) {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ color: '#0f172a' }}>🖥️ มุมมองสำหรับคอมพิวเตอร์</h1>
      <p>พื้นที่นี้กว้างขวาง เดี๋ยวเราจะเอาแถบเมนูแบบเต็มๆ และแผนที่ใหญ่ๆ มาวางตรงนี้ครับ</p>
      
      {/* โชว์ข้อมูลทดสอบ */}
      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '12px' }}>
        <p>ค่าฝุ่นปัจจุบัน: {pm25} µg/m³</p>
        <p>สถานะ: {aqiStatus}</p>
      </div>
    </div>
  );
}