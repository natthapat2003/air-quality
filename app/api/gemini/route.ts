import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("1. ข้อมูลที่ได้รับจากหน้าเว็บ:", body);
    
    // ดึงคีย์จากไฟล์ .env.local
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY; 

    if (!apiKey) {
        console.error("🔥 หา API Key ไม่เจอ!");
        return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
const prompt = `
คุณคือผู้เชี่ยวชาญด้านอุตุนิยมวิทยาและสุขภาพ 
จงวิเคราะห์สภาพอากาศและคาดการณ์แนวโน้มจากค่าเซนเซอร์ ณ ${body.siteName}:
- ฝุ่น PM2.5: ${body.pm25} µg/m³
- อุณหภูมิ: ${body.temp} °C
- ความชื้นสัมพัทธ์: ${body.hum} %
- ความกดอากาศ: ${body.pressure} hPa
- โอกาสเกิดฝน: ${body.rainChance}%

ข้อกำหนดสำคัญ (ต้องปฏิบัติตามอย่างเคร่งครัด):
1. **ห้ามมีคำลงท้าย "ครับ" หรือ "ค่ะ" โดยเด็ดขาด** (รวมถึงการเขียนแบบ "ครับ/ค่ะ" ก็ห้าม)
2. **ห้ามใช้จุดทศนิยม** ให้แสดงผลเป็นตัวเลขจำนวนเต็มเท่านั้น
3. **ใช้สัญลักษณ์ "%"** แทนการเขียนว่า "เปอร์เซ็นต์"
4. เนื้อหาต้องกระชับ ตรงประเด็น ไม่ต้องมีคำเกริ่นนำทักทาย
5. **ให้วิเคราะห์พยากรณ์แนวโน้มสภาพอากาศและฝุ่นล่วงหน้า 3-6 ชั่วโมง** เพิ่มเข้าไปด้วย

รูปแบบการตอบ (Markdown):
**สรุปสภาพอากาศปัจจุบัน:** อธิบายสั้นๆ เกี่ยวกับสภาวะอากาศในตอนนี้
**พยากรณ์โอกาสเกิดฝน:** วิเคราะห์แนวโน้มจากโอกาสฝน ${body.rainChance}% และความกดอากาศ
**พยากรณ์แนวโน้มล่วงหน้า:** ประเมินทิศทางของฝุ่น PM2.5 และสภาพอากาศในอีก 3-6 ชั่วโมงข้างหน้าจากข้อมูลที่มี
**คำแนะนำด้านสุขภาพและการใช้ชีวิต:** ให้คำแนะนำที่เหมาะสมกับค่าฝุ่น ${body.pm25} สภาพอากาศ และแนวโน้มที่กำลังจะเกิดขึ้น
`;

    console.log("2. กำลังส่งข้อมูลไปหา Google Gemini 2.5 Flash...");
    
    // สั่งให้ AI ประมวลผล
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("✅ 3. วิเคราะห์สำเร็จ ส่งกลับไปที่หน้าเว็บ!");
    
    return NextResponse.json({ analysis: text });

  } catch (error: any) {
    console.error("🔥 Error จาก SDK:", error.message || error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}