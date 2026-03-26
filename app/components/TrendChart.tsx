'use client'; 

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';

const PARAMS = [
  { key: 'pm25',        label: 'ฝุ่น PM2.5',      color: '#ef4444' }, 
  { key: 'temperature', label: 'อุณหภูมิ',        color: '#f59e0b' }, 
  { key: 'humidity',    label: 'ความชื้น',        color: '#3b82f6' }, 
  { key: 'pressure',    label: 'ความกดอากาศ',     color: '#8b5cf6' }, 
];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'12px',
      padding:'12px 16px', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.1)', fontSize:'13px',
    }}>
      <div style={{ color:'#64748b', marginBottom:'6px', fontWeight:600, display:'flex', alignItems:'center', gap:'6px' }}>
        <Clock size={14}/> {label}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, fontWeight: 800, fontSize: '18px' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({ data }: { data: any[] }) {
  const [selParam, setSelParam] = useState('pm25');
  const activeParam = PARAMS.find(p => p.key === selParam) || PARAMS[0];

  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>กำลังโหลดข้อมูลกราฟ...</div>;
  }

  // 🌟 จุดสำคัญ: คำนวณความกว้างของกราฟอัตโนมัติ (ให้พื้นที่ 20px ต่อ 1 ข้อมูล)
  // ถ้าข้อมูลน้อยกว่า 30 ตัว จะกำหนดขั้นต่ำไว้ที่ 600px เพื่อไม่ให้กราฟหดสั้นเกินไป
  const chartMinWidth = Math.max(600, data.length * 20);

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#334155' }}>แนวโน้มข้อมูลย้อนหลัง</h3>
        <select 
          value={selParam} 
          onChange={(e) => setSelParam(e.target.value)}
          style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', outline: 'none' }}
        >
          {PARAMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      {/* 🌟 สร้างกล่องครอบกราฟ ให้มีแถบเลื่อนซ้ายขวาได้ (overflow-x: auto) */}
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px', WebkitOverflowScrolling: 'touch' }}>
        {/* 🌟 ใส่ความกว้างที่คำนวณไว้ด้านบนให้กับตัวกราฟ */}
        <div style={{ height: '300px', minWidth: `${chartMinWidth}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeParam.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={activeParam.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey={selParam} stroke={activeParam.color} fill="url(#colorValue)" strokeWidth={3} dot={false} name={activeParam.label} activeDot={{ r: 6, fill: activeParam.color, stroke: '#fff', strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}