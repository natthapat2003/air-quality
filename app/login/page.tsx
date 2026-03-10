'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase'; // เช็ค path ให้ตรงกับโปรเจกต์คุณด้วยนะครับ
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 🛑 Import ไฟล์ CSS สำหรับมือถือ
import '../mobile.css';

import { 
    Wind, Mail, Lock, ShieldCheck, ArrowLeft, Loader2, AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      setLoading(false);
    } else {
      router.push('/history');
    }
  };

  return (
    <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e2e8f0 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px' // 🛑 เพิ่ม Padding ป้องกันกล่องชนขอบจอในมือถือ
    }}>
        
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: '#bae6fd', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.6 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: '#c7d2fe', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.6 }}></div>

      {/* 🛑 ใส่ Class login-card เพื่อไปดักจับใน CSS ด้านล่าง */}
      <div className="login-card" style={{ 
          width: '100%', 
          maxWidth: '420px', 
          backgroundColor: 'rgba(255, 255, 255, 0.85)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px', 
          padding: '40px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          position: 'relative',
          zIndex: 10
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div className="login-icon-box" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '14px', borderRadius: '16px', color: 'white', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)' }}>
                    <ShieldCheck size={32} strokeWidth={2} />
                </div>
            </div>
            <h1 className="login-title" style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                เข้าสู่ระบบผู้ดูแล
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                <Wind size={16} color="#3b82f6" />
                <span>AQI Monitor <strong style={{ color: '#3b82f6' }}>KSU</strong></span>
            </div>
        </div>

        {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '700', marginBottom: '20px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
            </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '6px', marginLeft: '4px' }}>อีเมล (Email)</label>
              <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                      <Mail size={18} />
                  </div>
                  <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="login-input"
                      style={{ 
                          width: '100%', padding: '14px 16px 14px 44px', borderRadius: '14px', 
                          border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', 
                          color: '#0f172a', fontWeight: '600', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  />
              </div>
          </div>

          <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '6px', marginLeft: '4px' }}>รหัสผ่าน (Password)</label>
              <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                      <Lock size={18} />
                  </div>
                  <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="login-input"
                      style={{ 
                          width: '100%', padding: '14px 16px 14px 44px', borderRadius: '14px', 
                          border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '15px', 
                          color: '#0f172a', fontWeight: '600', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  />
              </div>
          </div>

          <button 
              type="submit" 
              disabled={loading}
              className="login-btn"
              style={{ 
                  marginTop: '10px', width: '100%', padding: '16px', borderRadius: '14px', 
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                  color: 'white', fontSize: '16px', fontWeight: '800', border: 'none', 
                  cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
              }}
              onMouseOver={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(0)'; }}
          >
              {loading ? <Loader2 size={20} className="spin-icon" /> : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <Link href="/" style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '6px', 
                color: '#64748b', fontSize: '14px', fontWeight: '700', textDecoration: 'none', transition: '0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}>
                <ArrowLeft size={16} /> กลับหน้าหลัก
            </Link>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }

        /* 🛑 ปรับขนาดกล่อง Login ให้เล็กลงเมื่อเปิดในมือถือ */
        @media (max-width: 768px) {
            .login-card {
                padding: 30px 24px !important;
                border-radius: 20px !important;
            }
            .login-title {
                font-size: 22px !important;
            }
            .login-input {
                padding-top: 12px !important;
                padding-bottom: 12px !important;
                font-size: 14px !important;
            }
            .login-btn {
                padding: 14px !important;
                font-size: 15px !important;
            }
            .login-icon-box {
                padding: 12px !important;
            }
            .login-icon-box svg {
                width: 26px !important;
                height: 26px !important;
            }
        }
      `}} />
    </div>
  );
}