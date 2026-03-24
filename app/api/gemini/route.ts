import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("1. ข้อมูลที่ได้รับจากหน้าเว็บ:", body);
    
    const apiKey = "AIzaSyCvqgHMNcJHqD50bHXZFZEOYUOloEV8Cow";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const prompt = `
คุณคือผู้เชี่ยวชาญด้านอุตุนิยมวิทยาและสุขภาพ 
จงวิเคราะห์สภาพอากาศและคาดการณ์แนวโน้มจากค่าเซนเซอร์ที่วัดได้จริง ณ ${body.siteName} ต่อไปนี้:

- ฝุ่น PM2.5: ${body.pm25} µg/m³
- อุณหภูมิ: ${body.temp} °C
- ความชื้นสัมพัทธ์: ${body.hum} %
- ความกดอากาศ: ${body.pressure} hPa
- โอกาสเกิดฝน: ${body.rainChance} %

ข้อกำหนดในการวิเคราะห์และตอบคำถาม (จัดรูปแบบด้วย Markdown ให้สวยงามอ่านง่าย):
**สรุปสภาพอากาศปัจจุบัน:** อธิบายภาพรวมสั้นๆ ว่าอากาศตอนนี้เป็นอย่างไร โดยดูจากอุณหภูมิและความชื้นสัมพัทธ์
**พยากรณ์โอกาสเกิดฝน:** ให้อธิบายความน่าจะเป็นของฝนโดยอ้างอิงจากตัวเลข "โอกาสเกิดฝน" เป็นหลัก หากโอกาสฝนน้อยแต่ความชื้นสูง ให้แนะนำว่าเป็นสภาวะอากาศปิดหรืออาจมีหมอก/ฝุ่นสะสม
**คำแนะนำด้านสุขภาพและการใช้ชีวิต:** ให้คำแนะนำที่สอดคล้องกับค่าฝุ่น PM2.5 และโอกาสเกิดฝนอย่างสมเหตุสมผล

ขอให้ใช้ภาษาที่เป็นกันเอง สุภาพ กระชับ และอ่านเข้าใจง่าย
`;

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