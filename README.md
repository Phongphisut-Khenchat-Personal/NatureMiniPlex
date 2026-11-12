# Nature MiniPlex

ระบบจองตั๋วหนังของ Nature MiniPlex มีสองฝั่ง ลูกค้าเลือกเรื่อง โรง รอบ และที่นั่งได้เอง พนักงานเข้าสู่ระบบเพื่อจัดการเรื่อง รอบฉาย และดูรายงาน

หน้าเว็บเป็น React กับ Material UI หลังบ้านเป็น ASP.NET Core Web API, Entity Framework Core และ SQL Server Express พนักงานอัปโหลดโปสเตอร์ได้ ไฟล์รูปอยู่ที่ `wwwroot/posters` และฐานข้อมูลเก็บแค่ชื่อไฟล์

โฟลเดอร์แยกตามชั้นที่แก้

- `frontend` คือหน้าเว็บ ลูกค้าอยู่ใน `src/pages/customer` พนักงานอยู่ใน `src/pages/admin`
- `src/NatureMiniPlex.Web` คือ API แยกเป็น `Controllers` `Services` `Models` `DTOs` และ `Data`
- `tests/NatureMiniPlex.Tests` คือเทสกติกา ใช้ฐานข้อมูลคนละก้อน
- `docs` คือเอกสารออกแบบ

## เปิดโปรแกรม

1. เปิด Docker Desktop
2. ที่โฟลเดอร์นี้ รัน `docker compose up -d` เพื่อเปิด SQL Server Express
3. รัน `dotnet tool restore` ครั้งแรก เพื่อใช้คำสั่ง migration
4. รัน `dotnet run --project src/NatureMiniPlex.Web --launch-profile http`
5. เปิดอีกเทอร์มินัลที่โฟลเดอร์ `frontend` แล้วรัน `npm install` ครั้งแรก จากนั้นรัน `npm run dev`
6. เปิดเว็บลูกค้าที่ http://localhost:5173
7. เปิด Swagger ที่ http://localhost:5274/swagger

ครั้งแรกที่เปิด API โปรแกรมสร้างตารางเองและใส่ข้อมูลตัวอย่างที่ฉายต่ออีก 21 วัน

พนักงานตัวอย่างใช้ชื่อ `admin` และรหัส `Admin@1234` จากปุ่มเข้าสู่ระบบบนหน้าเว็บ ลูกค้าไม่ต้องสมัครสมาชิก ใช้เบอร์โทร 10 หลักเป็นหลักฐานการจอง

รหัส `sa` ใน `docker-compose.yml` และ `appsettings.json` ใช้กับฐานข้อมูลในเครื่องนี้เท่านั้น

## ทดสอบกติกา

```text
dotnet test tests/NatureMiniPlex.Tests/NatureMiniPlex.Tests.csproj
```

เทสอยู่ใน `tests/NatureMiniPlex.Tests/BookingRuleTests.cs` และใช้ฐานข้อมูล `NatureMiniPlex_Test` คนละก้อนกับข้อมูลที่เปิดบนเว็บ

## อ่านต่อ

รายละเอียดการออกแบบ แผนภาพ และจุดที่อธิบายในการสัมภาษณ์อยู่ใน [docs/DESIGN.md](docs/DESIGN.md)
