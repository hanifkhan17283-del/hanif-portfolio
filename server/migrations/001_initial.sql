CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_login_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY admin_users_email_uq (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  project_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'unread',
  email_status VARCHAR(10) NOT NULL DEFAULT 'pending',
  email_error VARCHAR(32) NULL,
  email_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  email_sent_at DATETIME(3) NULL,
  submission_key VARCHAR(80) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  read_at DATETIME(3) NULL,
  replied_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY contact_messages_submission_key_uq (submission_key),
  KEY contact_messages_created_at_idx (created_at),
  KEY contact_messages_status_idx (status, created_at),
  KEY contact_messages_email_status_idx (email_status, created_at),
  KEY contact_messages_project_type_idx (project_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_sessions (
  sid VARCHAR(128) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  sess MEDIUMTEXT NOT NULL,
  PRIMARY KEY (sid),
  KEY admin_sessions_expires_at_idx (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
