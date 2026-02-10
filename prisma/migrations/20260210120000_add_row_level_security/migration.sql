-- =============================================================================
-- Row Level Security (RLS) для multi-tenant изоляции по organizationId
-- =============================================================================
-- Стратегия:
--   1. Создаём роль app_user (без логина) — для использования через SET ROLE
--   2. Выдаём app_user права на все таблицы и последовательности
--   3. Включаем RLS на всех бизнес-таблицах с organizationId
--   4. Создаём политики, проверяющие current_setting('app.organization_id')
--
-- Миграции выполняются от имени владельца таблиц, который обходит RLS.
-- Приложение использует SET LOCAL ROLE app_user внутри транзакций.
-- =============================================================================

-- 1. Создаём роль app_user (если не существует)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN;
  END IF;
END $$;

-- Разрешаем текущему пользователю переключаться на app_user
GRANT app_user TO current_user;

-- 2. Выдаём права на схему и таблицы
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Права для будущих таблиц/последовательностей
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- =============================================================================
-- 3. Включаем RLS на бизнес-таблицах (21 таблица с organizationId)
-- =============================================================================

ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentLessonsBalanceHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PayCheck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentGroup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dismissed" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherGroup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherLesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MakeUp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UnprocessedPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentProduct" ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. Политики для app_user: изоляция по organizationId
-- =============================================================================
-- current_setting('app.organization_id', true) возвращает NULL если не задан.
-- NULLIF(..., '') обрабатывает пустую строку. Если значение NULL → условие false → 0 строк.

CREATE POLICY tenant_isolation ON "Student"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "StudentLessonsBalanceHistory"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Group"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "PayCheck"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Location"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Course"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "StudentGroup"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Dismissed"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "TeacherGroup"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "TeacherLesson"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Lesson"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Attendance"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "MakeUp"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Payment"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "UnprocessedPayment"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Cart"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "CartItem"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Category"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Product"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "Order"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);

CREATE POLICY tenant_isolation ON "PaymentProduct"
  AS PERMISSIVE FOR ALL TO app_user
  USING ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int)
  WITH CHECK ("organizationId" = NULLIF(current_setting('app.organization_id', true), '')::int);
