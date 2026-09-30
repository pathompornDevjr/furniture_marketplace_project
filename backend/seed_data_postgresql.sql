-- =========================================================================
-- PostgreSQL Database Seed Script
-- Project: Furniture Marketplace
-- Contains: Roles, Admin User, Categories, Promotions, Products, Images, Pivot
-- =========================================================================

-- Enable transaction
BEGIN;

-- 1. Insert Roles (tb_role)
INSERT INTO "tb_role" ("role_id", "role_name", "role_status", "role_des", "createdAt", "updatedAt")
VALUES 
  (1, 'Admin', 'active', 'ผู้ดูแลระบบสูงสุด', NOW(), NOW()),
  (2, 'Customer', 'active', 'ลูกค้าและสมาชิกทั่วไป', NOW(), NOW())
ON CONFLICT ("role_id") DO UPDATE SET
  "role_name" = EXCLUDED."role_name",
  "role_status" = EXCLUDED."role_status",
  "role_des" = EXCLUDED."role_des",
  "updatedAt" = NOW();

-- 2. Insert Admin User (tb_user)
-- Default Password: admin123
INSERT INTO "tb_user" (
  "user_id", "user_name", "password", "profile", "title_type", "first_name", "last_name", 
  "gender", "birth_date", "tel", "email", "address", "ctn_status", "remark", 
  "bank_number", "bank_name", "bank_owner", "allowed", "roleId", "createdAt", "updatedAt"
) VALUES (
  1,
  'admin',
  '$2b$10$LGekvSw.Ve/z3j2TlwArBufAjA6v3WyTAoBzaIamnFgozKdTjNIES',
  NULL,
  'นาย',
  'Admin',
  'System',
  'ชาย',
  '1995-01-01',
  '0812345678',
  'admin@furniture.local',
  'กรุงเทพมหานคร',
  'active',
  NULL,
  NULL,
  NULL,
  NULL,
  TRUE,
  1,
  NOW(),
  NOW()
)
ON CONFLICT ("user_name") DO UPDATE SET
  "password" = EXCLUDED."password",
  "roleId" = 1,
  "allowed" = TRUE,
  "ctn_status" = 'active',
  "updatedAt" = NOW();

-- 3. Insert Categories (tb_category)
INSERT INTO "tb_category" ("id", "name", "img", "remark", "status", "createdAt", "updatedAt")
VALUES (1, 'ชั้นวางของ', 'furniture_minimalist_shelf.jpg', '', '1', '2026-09-29T13:01:34.849Z', '2026-09-29T18:04:33.622Z')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "img" = EXCLUDED."img",
  "remark" = EXCLUDED."remark",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_category" ("id", "name", "img", "remark", "status", "createdAt", "updatedAt")
VALUES (2, 'เตียงนอน', 'furniture_bed_teak.jpg', '', '1', '2026-09-29T13:02:37.217Z', '2026-09-29T18:04:33.632Z')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "img" = EXCLUDED."img",
  "remark" = EXCLUDED."remark",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_category" ("id", "name", "img", "remark", "status", "createdAt", "updatedAt")
VALUES (3, 'โซฟา', 'furniture_sofa_nordic.jpg', '', '1', '2026-09-29T13:03:08.254Z', '2026-09-29T18:04:33.638Z')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "img" = EXCLUDED."img",
  "remark" = EXCLUDED."remark",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_category" ("id", "name", "img", "remark", "status", "createdAt", "updatedAt")
VALUES (4, 'โต๊ะทำงาน', 'furniture_smart_desk.jpg', '', '1', '2026-09-29T13:03:40.768Z', '2026-09-29T18:04:33.644Z')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "img" = EXCLUDED."img",
  "remark" = EXCLUDED."remark",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_category" ("id", "name", "img", "remark", "status", "createdAt", "updatedAt")
VALUES (5, 'เก้าอี้', 'furniture_ergonomic_chair.jpg', '', '1', '2026-09-29T13:04:09.005Z', '2026-09-29T18:04:33.649Z')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "img" = EXCLUDED."img",
  "remark" = EXCLUDED."remark",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_category" ("id", "name", "img", "remark", "status", "createdAt", "updatedAt")
VALUES (6, 'ตู้เสื้อผ้าและตู้เก็บของ', 'furniture_wardrobe_grand_luxe.jpg', 'ตู้เสื้อผ้า ตู้ข้างเตียง และตู้เก็บของอเนกประสงค์คุณภาพสูง', '1', '2026-09-29T14:15:53.346Z', '2026-09-29T18:04:33.653Z')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "img" = EXCLUDED."img",
  "remark" = EXCLUDED."remark",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_category" ("id", "name", "img", "remark", "status", "createdAt", "updatedAt")
VALUES (7, 'โต๊ะรับประทานอาหาร', 'furniture_dining_carrara_marble.jpg', 'ชุดโต๊ะอาหารและเก้าอี้รับประทานอาหารดีไซน์ทันสมัย', '1', '2026-09-29T14:15:53.423Z', '2026-09-29T18:04:33.658Z')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "img" = EXCLUDED."img",
  "remark" = EXCLUDED."remark",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_category" ("id", "name", "img", "remark", "status", "createdAt", "updatedAt")
VALUES (8, 'โคมไฟและของตกแต่งบ้าน', 'furniture_sol_floor_lamp.jpg', 'โคมไฟตั้งพื้น โคมไฟตั้งโต๊ะ และอุปกรณ์ตกแต่งบ้านสไตล์มินิมอล', '1', '2026-09-29T14:15:53.429Z', '2026-09-29T18:04:33.662Z')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "img" = EXCLUDED."img",
  "remark" = EXCLUDED."remark",
  "status" = EXCLUDED."status",
  "updatedAt" = EXCLUDED."updatedAt";

-- 4. Insert Promotions (tb_promotion)
INSERT INTO "tb_promotion" ("id", "name", "description", "discount", "start_date", "end_date", "createdAt", "updatedAt")
VALUES (1, 'ลดแรงต้อนรับปลายฝน', '', '5', '2026-09-29T17:00:00.000Z', '2026-10-29T17:00:00.000Z', '2026-09-30T04:12:18.829Z', '2026-09-30T04:12:18.829Z')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "discount" = EXCLUDED."discount",
  "start_date" = EXCLUDED."start_date",
  "end_date" = EXCLUDED."end_date",
  "updatedAt" = EXCLUDED."updatedAt";

-- 5. Insert Products (tb_product)
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  1, 'โซฟาผ้า 3 ที่นั่ง รุ่น Nordic Cozy', 14900, 300, 25, 'เทาอ่อน, ครีม', 'W210 x D85 x H80 cm',
  'โซฟาเบาะผ้าคุณภาพพรีเมียม ระบายอากาศได้ดี โครงสร้างไม้เนื้อแข็ง แข็งแรงทนทาน นั่งสบาย รองรับสรีระได้เป็นอย่างดี', 18, 'ตัว', 1, '2026-09-29T14:15:53.455Z', '2026-09-30T04:12:18.891Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  2, 'เตียงนอนไม้สักแท้ 6 ฟุต King Size รุ่น Royal Teak', 25900, 500, 15, 'ไม้สักธรรมชาติ', '190 x 215 x 110 cm',
  'เตียงนอนไม้สักแท้ 100% ลวดลายไม้ธรรมชาติ ดีไซน์หัวเตียงโมเดิร์น แข็งแกร่ง รองรับน้ำหนักได้มากกว่า 500 กก. ปลอดปลวกและมอด', 24, 'หลัง', NULL, '2026-09-29T14:15:53.495Z', '2026-09-29T14:15:53.495Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  3, 'โต๊ะทำงานปรับระดับไฟฟ้า Ergonomic Smart Desk', 12900, 250, 30, 'ท็อปไม้วอลนัท ขาดำ', '140 x 70 x 70-120 cm',
  'โต๊ะทำงานเพื่อสุขภาพปรับระดับความสูงด้วยระบบมอเตอร์คู่ เงียบและนุ่มนวล พร้อมระบบบันทึกความสูง 4 ระดับ และช่องเก็บสายไฟเรียบร้อย', 32, 'ตัว', 1, '2026-09-29T14:15:53.510Z', '2026-09-30T04:12:18.891Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  4, 'เก้าอี้เพื่อสุขภาพ Ergonomic Mesh Chair รุ่น ComfortPro', 6900, 150, 40, 'ดำคลาสสิก', '65 x 65 x 115-125 cm',
  'เก้าอี้สำนักงานผ้าตาข่ายระบายอากาศ รองรับเอวและกระดูกสันหลังส่วนล่าง ปรับระดับที่วางแขนและที่รองศีรษะได้ 3 มิติ ลดอาการออฟฟิศซินโดรม', 45, 'ตัว', NULL, '2026-09-29T14:15:53.517Z', '2026-09-29T14:15:53.517Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  5, 'ชั้นวางของอเนกประสงค์ 5 ชั้น สไตล์มินิมอล ลอฟท์', 3590, 120, 35, 'ไม้โอ๊ค โครงเหล็กดำ', '80 x 30 x 160 cm',
  'ชั้นวางหนังสือและของโชว์ โครงเหล็กเคลือบสีกันสนิม แผ่นชั้นไม้ MDF เกรด E1 แข็งแรง รับน้ำหนักได้ชั้นละ 25 กก.', 28, 'ตัว', NULL, '2026-09-29T14:15:53.524Z', '2026-09-29T14:15:53.524Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  6, 'ตู้เสื้อผ้าบานเลื่อน 4 ประตู กระจกเงา รุ่น Grand Luxe', 18500, 400, 12, 'ขาวมุก / กระจกเทา', '180 x 60 x 210 cm',
  'ตู้เสื้อผ้าขนาดใหญ่บานเลื่อนประหยัดพื้นที่ ภายในมีราวแขวนเสื้อ ราวแขวนกางเกง ลิ้นชักพร้อมกุญแจล็อก และไฟ LED อัตโนมัติ', 14, 'ตู้', NULL, '2026-09-29T14:15:53.531Z', '2026-09-29T14:15:53.531Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  7, 'ชุดโต๊ะรับประทานอาหารหินอ่อน 6 ที่นั่ง รุ่น Carrara Elegance', 28900, 450, 10, 'ท็อปหินอ่อนสีขาว ขาสีทองแชมเปญ', '160 x 90 x 75 cm',
  'ชุดโต๊ะอาหารท็อปหินอ่อนแท้ผิวเงา ทนความร้อนและรอยขีดข่วน พร้อมเก้าอี้เบาะหนังนุ่มสบาย 6 ตัว ดีไซน์เรียบหรูระดับพรีเมียม', 16, 'ชุด', NULL, '2026-09-29T14:15:53.540Z', '2026-09-29T14:15:53.540Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  8, 'โคมไฟตั้งพื้นดีไซน์อาร์ตสแกนดิเนเวียน รุ่น Sol Lamp', 2490, 80, 50, 'ดำด้าน / ทองเหลือง', 'ฐาน 28 cm สูง 155 cm',
  'โคมไฟตั้งพื้นปรับทิศทางแสงได้ แสง Warm White นุ่มนวลสบายตา สร้างบรรยากาศอบอุ่นในห้องนั่งเล่นและห้องนอน ควบคุมด้วยสวิตช์เท้าเหยียบ', 22, 'ตัว', NULL, '2026-09-29T14:15:53.550Z', '2026-09-29T14:15:53.550Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  9, 'โซฟาเบดปรับนอน 2 ที่นั่ง รุ่น Compact Relax', 8900, 250, 20, 'น้ำเงินคราม', 'W150 x D90 x H85 cm',
  'โซฟาเบดมัลติฟังก์ชัน ปรับเอนได้ 3 ระดับ เปลี่ยนเป็นเตียงนอนได้ง่ายดายใน 5 วินาที เบาะฟองน้ำความหนาแน่นสูง ไม่ยุบตัว', 30, 'ตัว', NULL, '2026-09-29T14:15:53.557Z', '2026-09-29T14:15:53.557Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  10, 'เก้าอี้พักผ่อนปรับเอนพร้อมที่วางเท้า Recliner Armchair', 9500, 200, 18, 'น้ำตาลคาราเมล', '85 x 90 x 100 cm',
  'เก้าอี้อาร์มแชร์ปรับเอนนอนได้ 160 องศา พร้อมที่วางเท้าพับเก็บได้ เบาะนุ่มหุ้มหนัง PU เกรดพรีเมียม นุ่มสบาย ผ่อนคลายกล้ามเนื้อ', 19, 'ตัว', NULL, '2026-09-29T14:15:53.563Z', '2026-09-29T14:15:53.563Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  11, 'โต๊ะเครื่องแป้งสไตล์โมเดิร์น พร้อมกระจกไฟ LED สัมผัส', 7500, 180, 22, 'ขาว / ขาสีทอง', '100 x 45 x 135 cm',
  'โต๊ะเครื่องแป้งมาพร้อมกระจกไฟ LED ปรับแสงได้ 3 สี (Warm, Cool, White) ลิ้นชักแบ่งช่องเก็บเครื่องสำอางอย่างเป็นสัดส่วน พร้อมเก้าอี้สตูลเข้าชุด', 21, 'ชุด', NULL, '2026-09-29T14:15:53.571Z', '2026-09-29T14:15:53.571Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO "tb_product" (
  "pro_id", "pro_name", "pro_price", "freight", "pro_number", "pro_color", "pro_size", 
  "pro_details", "sell_count", "unit", "promotion_id", "createdAt", "updatedAt"
) VALUES (
  12, 'ตู้โชว์กระจกนิรภัย 4 ชั้น กรอบอลูมิเนียมพรีเมียม', 11200, 280, 16, 'ดำด้าน / กระจกใสพิเศษ', '80 x 40 x 180 cm',
  'ตู้โชว์กระจกนิรภัยเทมเปอร์กลาสรอบด้าน ปลอดภัย แข็งแรง พร้อมไฟดาวน์ไลท์ส่องสว่าง เหมาะสำหรับวางของสะสม ฟิกเกอร์ และของตกแต่งชิ้นโปรด', 15, 'ตู้', NULL, '2026-09-29T14:15:53.578Z', '2026-09-29T14:15:53.578Z'
)
ON CONFLICT ("pro_id") DO UPDATE SET
  "pro_name" = EXCLUDED."pro_name",
  "pro_price" = EXCLUDED."pro_price",
  "freight" = EXCLUDED."freight",
  "pro_number" = EXCLUDED."pro_number",
  "pro_color" = EXCLUDED."pro_color",
  "pro_size" = EXCLUDED."pro_size",
  "pro_details" = EXCLUDED."pro_details",
  "sell_count" = EXCLUDED."sell_count",
  "unit" = EXCLUDED."unit",
  "promotion_id" = EXCLUDED."promotion_id",
  "updatedAt" = EXCLUDED."updatedAt";

-- 6. Insert Product Images (tb_pro_img)
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (1, 'furniture_sofa_nordic.jpg', 1)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (2, 'furniture_bed_teak.jpg', 2)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (3, 'furniture_smart_desk.jpg', 3)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (4, 'furniture_ergonomic_chair.jpg', 4)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (5, 'furniture_minimalist_shelf.jpg', 5)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (6, 'furniture_wardrobe_grand_luxe.jpg', 6)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (7, 'furniture_dining_carrara_marble.jpg', 7)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (8, 'furniture_sol_floor_lamp.jpg', 8)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (9, 'furniture_sofa_bed.jpg', 9)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (10, 'furniture_recliner_armchair.jpg', 10)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (11, 'furniture_vanity_table.jpg', 11)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";
INSERT INTO "tb_pro_img" ("id", "url", "tb_productPro_id")
VALUES (12, 'furniture_glass_cabinet.jpg', 12)
ON CONFLICT ("id") DO UPDATE SET
  "url" = EXCLUDED."url",
  "tb_productPro_id" = EXCLUDED."tb_productPro_id";

-- 7. Insert Product Categories Relation (_ProductCategories)
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (3, 1)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (2, 2)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (4, 3)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (5, 4)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (1, 5)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (6, 6)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (7, 7)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (8, 8)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (3, 9)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (5, 10)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (6, 11)
ON CONFLICT ("A", "B") DO NOTHING;
INSERT INTO "_ProductCategories" ("A", "B")
VALUES (1, 12)
ON CONFLICT ("A", "B") DO NOTHING;

-- 8. Reset Auto-Increment Sequences in PostgreSQL
SELECT setval(pg_get_serial_sequence('"tb_role"', 'role_id'), COALESCE((SELECT MAX("role_id") FROM "tb_role"), 1));
SELECT setval(pg_get_serial_sequence('"tb_user"', 'user_id'), COALESCE((SELECT MAX("user_id") FROM "tb_user"), 1));
SELECT setval(pg_get_serial_sequence('"tb_category"', 'id'), COALESCE((SELECT MAX("id") FROM "tb_category"), 1));
SELECT setval(pg_get_serial_sequence('"tb_promotion"', 'id'), COALESCE((SELECT MAX("id") FROM "tb_promotion"), 1));
SELECT setval(pg_get_serial_sequence('"tb_product"', 'pro_id'), COALESCE((SELECT MAX("pro_id") FROM "tb_product"), 1));
SELECT setval(pg_get_serial_sequence('"tb_pro_img"', 'id'), COALESCE((SELECT MAX("id") FROM "tb_pro_img"), 1));

COMMIT;
