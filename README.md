<p align="center">
  <img alt="หน้าแรก Nature MiniPlex" src="docs/screenshots/home.png" width="880">
</p>

<h1 align="center">Nature MiniPlex</h1>

<p align="center">
  ระบบจองตั๋วหนังสองโรง · ลูกค้าจองด้วยเบอร์โทร · พนักงานจัดรอบและดูรายงาน
</p>

<p align="center">
  <img alt=".NET 10" src="https://img.shields.io/badge/.NET-10-512BD4?style=flat-square&logo=dotnet&logoColor=white">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white">
  <img alt="Material UI" src="https://img.shields.io/badge/Material%20UI-111111?style=flat-square&logo=mui&logoColor=ff6d00">
  <img alt="SQL Server Express" src="https://img.shields.io/badge/SQL%20Server-Express-CC2927?style=flat-square&logo=microsoftsqlserver&logoColor=white">
</p>

## สรุปตามโจทย์

<table>
  <tr>
    <th align="left" width="56%">ตามที่กำหนด</th>
    <th align="left" width="44%">เพิ่มเอง</th>
  </tr>
  <tr>
    <td valign="top">
      <ul>
        <li>✅ ศรีราชา 6 ที่นั่ง เรียง A–C สองแถว และบางแสน 12 ที่นั่ง เรียง A–D สามแถว</li>
        <li>✅ เพิ่ม แก้ไข ยกเลิกเรื่องได้ พร้อมวันเริ่มและวันสิ้นสุด</li>
        <li>✅ รอบฉายต้องอยู่ในช่วงของเรื่อง และจัดต่างกันได้ในแต่ละวัน</li>
        <li>✅ ไม่เกิน 3 รอบต่อโรงต่อวัน เวลา 10:00, 13:00, 16:00, 20:00</li>
        <li>✅ จองด้วยหนึ่งเบอร์ ได้ 1–4 ที่นั่ง ข้ามรอบและข้ามเรื่องได้</li>
        <li>✅ ที่นั่งหนึ่งของรอบหนึ่งจองได้ครั้งเดียว</li>
        <li>✅ ยกเลิกได้เฉพาะที่นั่งของเบอร์นั้น</li>
        <li>✅ ยืนยันเริ่มฉายแล้ว จองและยกเลิกไม่ได้</li>
        <li>✅ รายงานเป็นข้อมูล ณ เวลาที่เปิดดู</li>
        <li>✅ .NET + SQL Server Express และอธิบายงานออกแบบไว้ใน <a href="docs/DESIGN.md">docs/DESIGN.md</a></li>
      </ul>
    </td>
    <td valign="top">
      <ul>
        <li>✅ หน้าลูกค้าแยกจากหลังบ้านพนักงาน</li>
        <li>✅ อัปโหลดโปสเตอร์ และติ๊กเรื่องแนะนำ</li>
        <li>✅ เพิ่มโรงตามสองผัง และปิดที่นั่งซ่อม</li>
        <li>✅ รหัสการจอง และเข้าสู่ระบบพนักงาน</li>
        <li>✅ เทสล็อกกติกาไว้</li>
      </ul>
      <br>
      <b>ตีความไว้สองจุด</b>
      <br><br>
      แต่ละโรงมีอย่างน้อย 1 รอบต่อวัน — ระบบกันแค่ไม่ให้เกิน 3 รอบในวันที่เพิ่มรอบ ไม่ได้สร้างรอบให้ทุกวันข้างหน้า
      <br><br>
      วันที่ในตัวอย่างเป็นปี 2553 — ใช้เป็นชื่อเรื่องกับช่วงเวลา ข้อมูลจริงนับจากวันที่เปิดโปรแกรม และมีรอบห้าวันแรก วันละ 3 รอบ
    </td>
  </tr>
</table>

<p align="center">
  <a href="docs/DESIGN.md">
    <img alt="เปิด docs/DESIGN.md" src="https://img.shields.io/badge/%E0%B9%80%E0%B8%9B%E0%B8%B4%E0%B8%94%20DESIGN.md-%E0%B8%81%E0%B8%8E%E0%B8%B4%E0%B8%81%E0%B8%B2%20%C2%B7%20%E0%B8%95%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%87%20%C2%B7%20%E0%B8%A5%E0%B8%B3%E0%B8%94%E0%B8%B1%E0%B8%9A%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%97%E0%B8%B3%E0%B8%87%E0%B8%B2%E0%B8%99%20%C2%B7%20%E0%B8%88%E0%B8%B8%E0%B8%94%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%8B%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B9%89%E0%B8%AD%E0%B8%99-ff6d00?style=for-the-badge">
  </a>
</p>

<p align="center">
  รายละเอียดทั้งหมดอยู่ใน <a href="docs/DESIGN.md"><b>docs/DESIGN.md</b></a>
</p>

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/seats.png" alt="ลูกค้าเลือกที่นั่ง"></td>
    <td width="50%"><img src="docs/screenshots/dashboard.png" alt="แดชบอร์ดพนักงาน"></td>
  </tr>
  <tr>
    <td align="center"><b>ลูกค้าเลือกที่นั่ง</b><br>ขอบส้มว่าง · ส้มทึบคือที่เลือก · เทาคือจองแล้ว</td>
    <td align="center"><b>พนักงานดูวันนี้</b><br>จำนวนที่นั่ง รอบฉาย และรายการจองล่าสุด</td>
  </tr>
</table>

## รันในเครื่อง

ใช้ .NET SDK 10, Node.js 20 ขึ้นไป และ Docker Desktop เปิด Docker ก่อน แล้วรันจากโฟลเดอร์ที่มี `docker-compose.yml`

<table>
  <tr>
    <td width="33%" valign="top" align="center"><b>1 · ฐานข้อมูล</b></td>
    <td width="33%" valign="top" align="center"><b>2 · API</b></td>
    <td width="34%" valign="top" align="center"><b>3 · หน้าเว็บ</b></td>
  </tr>
  <tr>
    <td valign="top"><code>docker compose up -d</code></td>
    <td valign="top"><code>dotnet run --project src/NatureMiniPlex.Web --launch-profile http</code></td>
    <td valign="top">
      <code>cd frontend</code><br>
      <code>npm install</code><br>
      <code>npm run dev</code>
    </td>
  </tr>
</table>

| เปิด | ที่ |
|---|---|
| เว็บ | http://localhost:5173 |
| พนักงาน | `admin` / `Admin@1234` |
| เบอร์ตัวอย่าง | `0891111111` |
| Swagger | http://localhost:5274/swagger |

ครั้งแรกที่เปิด API โปรแกรมสร้างโรงศรีราชา โรงบางแสน และรอบห้าวันแรกให้เอง โปสเตอร์อัปโหลดจากเมนูจัดการภาพยนตร์ รหัสใน repo ใช้เปิดเครื่องพัฒนาเท่านั้น

หน้าเว็บไม่ขึ้น ให้เช็กว่า API อยู่ที่พอร์ต `5274` และ Vite อยู่ที่ `5173` พอร์ต `1433` ถูกใช้แล้ว ให้เปลี่ยนทั้งใน `docker-compose.yml` และ `appsettings.json`

## โครงโค้ด

```text
frontend/                    หน้าเว็บ   pages/customer และ pages/admin
src/NatureMiniPlex.Web/      API        Controllers → Services → Data
tests/NatureMiniPlex.Tests/  เทสกติกา   ใช้ฐานคนละก้อน
```

<p align="center">
  <a href="docs/DESIGN.md">
    <img alt="เปิด docs/DESIGN.md" src="https://img.shields.io/badge/%E0%B9%80%E0%B8%9B%E0%B8%B4%E0%B8%94%20DESIGN.md-%E0%B8%81%E0%B8%8E%E0%B8%B4%E0%B8%81%E0%B8%B2%20%C2%B7%20%E0%B8%95%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%87%20%C2%B7%20%E0%B8%A5%E0%B8%B3%E0%B8%94%E0%B8%B1%E0%B8%9A%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%97%E0%B8%B3%E0%B8%87%E0%B8%B2%E0%B8%99%20%C2%B7%20%E0%B8%88%E0%B8%B8%E0%B8%94%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%8B%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B9%89%E0%B8%AD%E0%B8%99-ff6d00?style=for-the-badge">
  </a>
</p>

```bash
dotnet test tests/NatureMiniPlex.Tests/NatureMiniPlex.Tests.csproj
```
