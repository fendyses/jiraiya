-- ============================================================================
-- NILAMS production - PUU Monitoring + Final Draft Assessment
-- Target : nilams @ antartika.uitm.edu.my (MariaDB 10.11), table prefix tbl_
-- When   : BEFORE deploying branch puu_monitoring
-- Re-run : safe. Every statement is IF NOT EXISTS / NOT EXISTS / INSERT IGNORE
-- Scope  : no existing row or column is changed or removed
-- Account: needs CREATE, ALTER, INDEX and INSERT on nilams
-- After  : on the app server run  php artisan permission:cache-reset
-- ============================================================================

-- Step 1 - Final Draft Assessment columns
ALTER TABLE `tbl_vetting_documents`
    ADD COLUMN IF NOT EXISTS `risk_classification`
        VARCHAR(20) NULL AFTER `pic_comment`,
    ADD COLUMN IF NOT EXISTS `document_compliance_status`
        VARCHAR(50) NULL AFTER `risk_classification`;


-- Step 2 - SLA configuration table
CREATE TABLE IF NOT EXISTS `tbl_puu_sla_configs` (
    `id`         BIGINT(20) UNSIGNED  NOT NULL AUTO_INCREMENT,
    `key`        VARCHAR(50)          NOT NULL,
    `value`      SMALLINT(5) UNSIGNED NOT NULL,
    `label`      VARCHAR(150)         NOT NULL,
    `updated_by` BIGINT(20) UNSIGNED  NULL DEFAULT NULL,
    `created_at` TIMESTAMP            NULL DEFAULT NULL,
    `updated_at` TIMESTAMP            NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `tbl_puu_sla_configs_key_unique` (`key`),
    KEY `tbl_puu_sla_configs_updated_by_foreign` (`updated_by`),
    CONSTRAINT `tbl_puu_sla_configs_updated_by_foreign`
        FOREIGN KEY (`updated_by`) REFERENCES `tbl_users` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

INSERT INTO `tbl_puu_sla_configs`
    (`key`, `value`, `label`, `updated_by`, `created_at`, `updated_at`)
VALUES
('assignment_sla_days', 14,
 'SLA 1 - max working days for the Legal Advisor to assign a Drafter/Vetter',
 NULL, NOW(), NOW()),
('feedback_sla_days', 21,
 'SLA 2 - max working days for a Drafter/Vetter to return feedback to the PIC',
 NULL, NOW(), NOW()),
('rag_green_max', 6,
 'Assignment cycle - maximum working days classified as On track',
 NULL, NOW(), NOW()),
('rag_amber_max', 10,
 'Assignment cycle - maximum working days classified as Due soon',
 NULL, NOW(), NOW()),
('rag_watch_at', 11,
 'Assignment cycle - first working day classified as Critical',
 NULL, NOW(), NOW()),
('vetting_on_track_max', 10,
 'Vetting cycle - maximum working days classified as On track',
 NULL, NOW(), NOW()),
('vetting_due_soon_max', 14,
 'Vetting cycle - maximum working days classified as Due soon',
 NULL, NOW(), NOW()),
('stale_after_working_days', 90,
 'Working days after which an open cycle counts as abandoned, not late',
 NULL, NOW(), NOW()),
('pic_on_track_max', 8,
 'PIC turn - maximum working days with the PIC classified as On track',
 NULL, NOW(), NOW()),
('pic_due_soon_max', 15,
 'PIC turn - maximum working days with the PIC classified as Due soon',
 NULL, NOW(), NOW()),
('pic_turn_sla_days', 21,
 'PIC turn - working days with the PIC after which the document counts as overdue',
 NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    -- Only the description is refreshed. Values are edited by PUU in
    -- Parameter Setup -> PUU Monitoring and must survive a re-run.
    `label` = VALUES(`label`);


-- Step 3 - PIC reminder email history table
CREATE TABLE IF NOT EXISTS `tbl_puu_pic_reminder_logs` (
    `id`             BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `application_id` BIGINT(20) UNSIGNED NOT NULL,
    `kind`           VARCHAR(20)         NOT NULL DEFAULT 'return',
    `sent_by`        BIGINT(20) UNSIGNED NOT NULL,
    `recipients`     TEXT                NOT NULL,
    `sent_at`        TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `tbl_puu_pic_reminder_logs_application_sent_idx`
        (`application_id`, `sent_at`),
    KEY `tbl_puu_pic_reminder_logs_sent_by_foreign` (`sent_by`),
    CONSTRAINT `tbl_puu_pic_reminder_logs_application_foreign`
        FOREIGN KEY (`application_id`) REFERENCES `tbl_applications` (`id`),
    CONSTRAINT `tbl_puu_pic_reminder_logs_sent_by_foreign`
        FOREIGN KEY (`sent_by`) REFERENCES `tbl_users` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


-- Step 4 - Indexes on existing log tables
CREATE INDEX IF NOT EXISTS `tbl_asl_cycle_idx`
    ON `tbl_application_status_logs`
       (`application_id`, `application_status_id`, `created_at`)
    ALGORITHM = INPLACE LOCK = NONE;

CREATE INDEX IF NOT EXISTS `tbl_adsl_cycle_idx`
    ON `tbl_application_document_status_logs`
       (`application_id`, `document_status_id`, `created_at`)
    ALGORITHM = INPLACE LOCK = NONE;


-- Step 5 - Permissions
INSERT INTO `tbl_permissions` (`name`, `guard_name`, `created_at`, `updated_at`)
SELECT requested.`name`, 'web', NOW(), NOW()
FROM (
              SELECT 'view_selfmonitorings'       AS `name`
    UNION ALL SELECT 'view_assignmentmonitorings'
    UNION ALL SELECT 'view_managementmonitorings'
    UNION ALL SELECT 'view_puureports'
    UNION ALL SELECT 'export_puureports'
) AS requested
WHERE NOT EXISTS (
    SELECT 1 FROM `tbl_permissions` existing
    WHERE existing.`name` = requested.`name`
      AND existing.`guard_name` = 'web'
);


-- Step 6 - Role grants
INSERT IGNORE INTO `tbl_role_has_permissions` (`permission_id`, `role_id`)
SELECT p.`permission_id`, r.`id`
FROM (
    SELECT MIN(`id`) AS `permission_id`, `name`
    FROM `tbl_permissions`
    WHERE `guard_name` = 'web'
      AND `name` IN ('view_selfmonitorings', 'view_assignmentmonitorings',
                     'view_managementmonitorings', 'view_puureports',
                     'export_puureports')
    GROUP BY `name`
) AS p
JOIN `tbl_roles` r ON r.`guard_name` = 'web'
WHERE (r.`name` IN ('Admin', 'Assistant Superadmin', 'Legal Advisor')
       AND p.`name` IN ('view_assignmentmonitorings', 'view_managementmonitorings',
                        'view_puureports', 'export_puureports'))
   OR (r.`name` = 'Drafter/Vetter'
       AND p.`name` IN ('view_selfmonitorings', 'view_puureports'));


-- ============================================================================
-- Verification
-- ============================================================================
-- SHOW COLUMNS FROM tbl_vetting_documents
--  WHERE Field IN ('risk_classification', 'document_compliance_status');   -- 2 rows
--
-- SHOW TABLES LIKE 'tbl_puu_%';        -- tbl_puu_pic_reminder_logs, tbl_puu_sla_configs
--
-- SELECT COUNT(*) FROM tbl_puu_sla_configs;                              -- 11
--
-- SHOW INDEX FROM tbl_application_status_logs
--  WHERE Key_name = 'tbl_asl_cycle_idx';                                 -- 3 rows
-- SHOW INDEX FROM tbl_application_document_status_logs
--  WHERE Key_name = 'tbl_adsl_cycle_idx';                                -- 3 rows
--
-- SELECT r.name AS role, p.name AS permission
--   FROM tbl_role_has_permissions rp
--   JOIN tbl_roles r       ON r.id = rp.role_id
--   JOIN tbl_permissions p ON p.id = rp.permission_id
--  WHERE p.name IN ('view_selfmonitorings', 'view_assignmentmonitorings',
--                   'view_managementmonitorings', 'view_puureports',
--                   'export_puureports')
--  ORDER BY r.name, p.name;                                              -- 14 rows

-- ============================================================================
-- Rollback (commented out)
-- ============================================================================
-- Only if the release has to be withdrawn. Run in this order.
-- DELETE rp FROM tbl_role_has_permissions rp
--   JOIN tbl_permissions p ON p.id = rp.permission_id
--  WHERE p.guard_name = 'web'
--    AND p.name IN ('view_selfmonitorings', 'view_assignmentmonitorings',
--                   'view_managementmonitorings', 'view_puureports',
--                   'export_puureports');
-- DELETE FROM tbl_permissions
--  WHERE guard_name = 'web'
--    AND name IN ('view_selfmonitorings', 'view_assignmentmonitorings',
--                 'view_managementmonitorings', 'view_puureports',
--                 'export_puureports');
-- DROP INDEX tbl_asl_cycle_idx  ON tbl_application_status_logs;
-- DROP INDEX tbl_adsl_cycle_idx ON tbl_application_document_status_logs;
-- DROP TABLE IF EXISTS tbl_puu_pic_reminder_logs;
-- DROP TABLE IF EXISTS tbl_puu_sla_configs;
-- Removes any final draft assessments saved since go-live:
-- ALTER TABLE tbl_vetting_documents
--     DROP COLUMN IF EXISTS document_compliance_status,
--     DROP COLUMN IF EXISTS risk_classification;
