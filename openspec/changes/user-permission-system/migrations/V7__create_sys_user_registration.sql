-- V7: 用户注册申请表 sys_user_registration
-- 用户提交注册申请，管理员审核后创建正式用户

CREATE TABLE IF NOT EXISTS sys_user_registration (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
    user_name VARCHAR(64) NOT NULL COMMENT '申请人姓名',
    login_name VARCHAR(64) NOT NULL COMMENT '申请登录名',
    password_hash VARCHAR(256) NOT NULL COMMENT 'bcrypt加密密码',
    real_name VARCHAR(128) DEFAULT NULL COMMENT '真实姓名',
    email VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
    apply_dept_id BIGINT DEFAULT NULL COMMENT '申请部门ID',
    status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'pending=待审核 approved=已通过 rejected=已拒绝',
    apply_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    approved_by BIGINT DEFAULT NULL COMMENT '审核人用户ID',
    approved_time DATETIME DEFAULT NULL COMMENT '审核时间',
    approved_dept_id BIGINT DEFAULT NULL COMMENT '审核分配的部门ID',
    reject_reason VARCHAR(512) DEFAULT NULL COMMENT '拒绝原因',

    UNIQUE KEY uk_login_name (login_name),
    INDEX idx_status (status),
    INDEX idx_apply_time (apply_time),

    CONSTRAINT fk_reg_apply_dept FOREIGN KEY (apply_dept_id) REFERENCES sys_dept(id) ON DELETE SET NULL,
    CONSTRAINT fk_reg_approved_by FOREIGN KEY (approved_by) REFERENCES sys_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_reg_approved_dept FOREIGN KEY (approved_dept_id) REFERENCES sys_dept(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户注册申请表';
