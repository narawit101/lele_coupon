-- ==============================================================================
-- LELE' Ticket - Initial Admin Seed Script (PostgreSQL)
-- ==============================================================================
-- ใช้งานสำหรับ: Production Initialization (Supabase SQL Editor, Neon, pgAdmin, psql)
--
-- ข้อมูลเริ่มต้น:
--   Email:               dev@system.lele.com
--   Name:                Developer
--   Initial Password:    lele@coupon1234
--   Role:                DEV
--   MustChangePassword:  true (บังคับเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก)
-- ==============================================================================


INSERT INTO "Admin" (
    "id",
    "email",
    "name",
    "avatarUrl",
    "passwordHash",
    "role",
    "mustChangePassword",
    "createdAt",
    "updatedAt"
)
VALUES (
    'admin_' || substr(md5(random()::text), 1, 20),
    'dev@system.lele.com',
    'Developer',
    NULL,
    '$2b$10$oBgTzkb9KDLH8g1OaDb/te05KU.4d7D9A59YAk98mHKSECHgX2iHO',
    'DEV',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "passwordHash" = EXCLUDED."passwordHash",
    "role" = EXCLUDED."role",
    "mustChangePassword" = EXCLUDED."mustChangePassword",
    "updatedAt" = CURRENT_TIMESTAMP;
