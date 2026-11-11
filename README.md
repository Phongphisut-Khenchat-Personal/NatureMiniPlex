# Nature MiniPlex

ระบบจองตั๋วของพนักงานขายตั๋ว สำหรับโรงหนัง 2 สาขา ใช้ ASP.NET Core MVC, Entity Framework Core และ SQL Server Express

## เปิดโปรแกรม

1. เปิด Docker Desktop
2. ที่โฟลเดอร์นี้ รัน `docker compose up -d` เพื่อเปิด SQL Server Express
3. รัน `dotnet tool restore` ครั้งแรก เพื่อใช้คำสั่ง migration
4. รัน `dotnet run --project src/NatureMiniPlex.Web --launch-profile http`
5. เปิด http://localhost:5274

ครั้งแรกที่เปิดเว็บ โปรแกรมสร้างตารางเองและใส่ข้อมูลตัวอย่างของวันนี้กับพรุ่งนี้

รหัส `sa` ใน `docker-compose.yml` และ `appsettings.json` ใช้กับฐานข้อมูลในเครื่องนี้เท่านั้น

## ทดสอบกติกา

```text
dotnet test tests/NatureMiniPlex.Tests/NatureMiniPlex.Tests.csproj
```

เทสอยู่ใน `tests/NatureMiniPlex.Tests/BookingRuleTests.cs` และใช้ฐานข้อมูล `NatureMiniPlex_Test` คนละก้อนกับข้อมูลที่เปิดบนเว็บ

## อ่านต่อ

รายละเอียดการออกแบบ แผนภาพ และจุดที่อธิบายในการสัมภาษณ์อยู่ใน [docs/DESIGN.md](docs/DESIGN.md)
