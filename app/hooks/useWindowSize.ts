'use client';
import { useState, useEffect } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 1200, 
    height: 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // ดึงขนาดจอครั้งแรกตอนเปิดเว็บ
    handleResize();
    
    // คอยดักจับเวลาผู้ใช้ย่อ/ขยายหน้าจอ
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}