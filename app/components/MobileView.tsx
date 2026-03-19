'use client';
import React from 'react';

// รับข้อมูล (Props) ที่ส่งมาจากหน้าหลัก
export default function MobileView({ pm25, aqiStatus, weatherData }: any) {
  return (
    <div style={{ padding: '10px', backgroundColor: '#fff7ed', minHeight: '100vh' }}>
      <h1 style={{ color: '#c2410c', fontSize: '20px' }}>📱 มุมมองสำหรับมือถือ</h1>
      <p style={{ fontSize: '14px' }}>พื้นที่ตรงนี้แคบ เดี๋ยวเราจะทำเมนูแบบกดแล้วเด้ง (Hamburger) และจัดกล่องข้อมูลให้เลื่อนขึ้นลงได้ครับ</p>
      
      {/* โชว์ข้อมูลทดสอบ */}
      <div style={{ marginTop: '20px', padding: '15px', background: 'white', border: '1px solid #fdba74', borderRadius: '12px' }}>
        <h2 style={{ margin: 0 }}>PM2.5: {pm25}</h2>
        <p>สถานะ: {aqiStatus}</p>
      </div>
    </div>
  );
}