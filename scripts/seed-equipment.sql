-- นำเข้ารายการครุภัณฑ์ตัวอย่าง 12 รายการ
START TRANSACTION;

INSERT INTO equipment_categories (name, code, created_at, updated_at)
VALUES
('คอมพิวเตอร์', 'CAT-COM', NOW(), NOW()),
('อุปกรณ์กีฬา', 'CAT-SPORT', NOW(), NOW()),
('เฟอร์นิเจอร์', 'CAT-FURN', NOW(), NOW()),
('อุปกรณ์วิทยาศาสตร์', 'CAT-SCI', NOW(), NOW()),
('สื่อการสอน', 'CAT-EDU', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

INSERT INTO equipment_locations (name, created_at, updated_at)
VALUES
('ห้อง Lab คอมพิวเตอร์', NOW(), NOW()),
('ห้องพัสดุ', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

INSERT INTO equipment (code, name, equipment_category_id, equipment_location_id, quantity, unit, status, `condition`, created_at, updated_at)
SELECT x.code, x.name, c.id, l.id, 1, 'ชิ้น', 'available', 'good', NOW(), NOW()
FROM (
  SELECT 'EQ-0001' code, 'คอมพิวเตอร์ตั้งโต๊ะ' name, 'คอมพิวเตอร์' category, 'ห้อง Lab คอมพิวเตอร์' location UNION ALL
  SELECT 'EQ-0002', 'โน้ตบุ๊ค', 'คอมพิวเตอร์', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0003', 'เครื่องพิมพ์', 'คอมพิวเตอร์', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0004', 'ลูกฟุตบอล', 'อุปกรณ์กีฬา', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0005', 'โต๊ะเรียน', 'เฟอร์นิเจอร์', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0006', 'เก้าอี้นักเรียน', 'เฟอร์นิเจอร์', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0007', 'กล้องจุลทรรศน์', 'อุปกรณ์วิทยาศาสตร์', 'ห้อง Lab คอมพิวเตอร์' UNION ALL
  SELECT 'EQ-0008', 'ชุดทดลองไฟฟ้า', 'อุปกรณ์วิทยาศาสตร์', 'ห้อง Lab คอมพิวเตอร์' UNION ALL
  SELECT 'EQ-0009', 'โปรเจกเตอร์', 'สื่อการสอน', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0010', 'กระดานไวท์บอร์ด', 'สื่อการสอน', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0011', 'คอมพิวเตอร์ตั้งโต๊ะ', 'คอมพิวเตอร์', 'ห้อง Lab คอมพิวเตอร์' UNION ALL
  SELECT 'EQ-0012', 'โน้ตบุ๊ค', 'คอมพิวเตอร์', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0013', 'เครื่องพิมพ์', 'คอมพิวเตอร์', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0014', 'ลูกฟุตบอล', 'อุปกรณ์กีฬา', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0015', 'โต๊ะเรียน', 'เฟอร์นิเจอร์', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0016', 'เก้าอี้นักเรียน', 'เฟอร์นิเจอร์', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0017', 'กล้องจุลทรรศน์', 'อุปกรณ์วิทยาศาสตร์', 'ห้อง Lab คอมพิวเตอร์' UNION ALL
  SELECT 'EQ-0018', 'ชุดทดลองไฟฟ้า', 'อุปกรณ์วิทยาศาสตร์', 'ห้อง Lab คอมพิวเตอร์' UNION ALL
  SELECT 'EQ-0019', 'โปรเจกเตอร์', 'สื่อการสอน', 'ห้องพัสดุ' UNION ALL
  SELECT 'EQ-0020', 'กระดานไวท์บอร์ด', 'สื่อการสอน', 'ห้องพัสดุ'
) x
JOIN equipment_categories c ON c.name = x.category
JOIN equipment_locations l ON l.name = x.location
LEFT JOIN equipment existing ON existing.code = x.code
WHERE existing.id IS NULL;

COMMIT;
