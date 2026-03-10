import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("1. ข้อมูลที่ได้รับจากหน้าเว็บ:", body);
    
    const apiKey = "AIzaSyD4QxCVUN8GajoWozbnA-bcxJLfCWOi_YY";

    //const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `วิเคราะห์ฝุ่น PM2.5 ที่สถานี ${body.siteName}: ค่าฝุ่น ${body.pm25} µg/m³, อุณหภูมิ ${body.temp}°C, ความชื้น ${body.hum}%, ความกดอากาศ ${body.pressure} hPa. ขอคำวิเคราะห์ 1 ประโยค และคำแนะนำสุขภาพ 1 ประโยค ภาษาไทย`;

    console.log("2. กำลังส่งข้อมูลไปหา Google Gemini...");
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("3. Google Error:", JSON.stringify(data, null, 2));
        return NextResponse.json({ error: "Google API Error" }, { status: response.status });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "วิเคราะห์ข้อมูลไม่ได้";
    console.log("3. วิเคราะห์สำเร็จ ส่งกลับไปที่หน้าเว็บ!");
    
    return NextResponse.json({ analysis: text });

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}