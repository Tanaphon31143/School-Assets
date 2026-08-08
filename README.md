# ระบบจัดการครุภัณฑ์โรงเรียน

ระบบ School Equipment / Asset Management สำหรับจัดการครุภัณฑ์ การยืม–คืน การแจ้งซ่อม การแจ้งเตือน รายงาน และ QR Code

## เทคโนโลยี

- Laravel 11 และ PHP 8.2+
- SQLite สำหรับ development หรือ MySQL สำหรับ production
- Laravel Breeze + Blade + Tailwind CSS + Alpine.js
- Spatie Laravel Permission และ Activity Log
- Laravel Excel, DomPDF และ Simple QR Code

## ติดตั้ง

```bash
composer install
npm.cmd install
copy .env.example .env
php artisan key:generate
```

ตั้งค่า `.env` ให้ตรงกับฐานข้อมูลที่ต้องการ แล้วรัน:

```bash
php artisan migrate --seed
npm.cmd run build
php artisan storage:link
```

### ใช้ MySQL สำหรับ Production

สร้างฐานข้อมูลก่อน แล้วแก้ `.env` ดังนี้:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=school_assets
DB_USERNAME=root
DB_PASSWORD=รหัสผ่านของ MySQL
```

จากนั้นรัน `php artisan migrate --seed` บนฐานข้อมูลใหม่ โปรเจกต์จะไม่ย้ายหรือลบ SQLite เดิมโดยอัตโนมัติ

## เริ่มใช้งาน

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

เปิด [http://127.0.0.1:8000](http://127.0.0.1:8000)

สำหรับระบบแจ้งเตือน overdue ให้เปิดอีก terminal:

```bash
php artisan schedule:work
```

## บัญชีทดสอบ

รหัสผ่านทุกบัญชีคือ `password`

| Role | Email |
|---|---|
| Admin | admin@example.com |
| Teacher | teacher@example.com |
| Student | student@example.com |

## Google Login

สร้าง OAuth Client ใน Google Cloud Console แล้วเพิ่ม Authorized redirect URI:

```text
http://127.0.0.1:8000/auth/google/callback
```

จากนั้นใส่ค่าลงใน `.env`:

```dotenv
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

หากยังไม่ใส่ค่า ระบบจะแสดงข้อความแจ้งเตือนและยังสามารถใช้ Login ด้วยอีเมล/รหัสผ่านได้ตามปกติ

## URL หลัก

- `/login` — เข้าสู่ระบบ
- `/dashboard` — Dashboard ตาม Role
- `/equipment` — รายการครุภัณฑ์
- `/borrowings` — ระบบยืม–คืน
- `/maintenance` — แจ้งซ่อม
- `/notifications` — การแจ้งเตือน
- `/reports` — รายงานและ Export
- `/admin/equipment` — จัดการครุภัณฑ์
- `/admin/categories` — จัดการประเภท
- `/admin/locations` — จัดการสถานที่
- `/admin/users` — จัดการผู้ใช้งานและ Role

## ทดสอบ

```bash
php artisan test
```

## หมายเหตุ PHP GD

QR Code และ PhpSpreadsheet บางฟังก์ชันต้องใช้ PHP extension `gd` หากใช้ XAMPP ให้เปิดบรรทัด `extension=gd` ใน `C:\xampp\php\php.ini` แล้ว restart PHP/เว็บเซิร์ฟเวอร์
