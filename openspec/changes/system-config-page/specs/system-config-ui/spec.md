## ADDED Requirements

### Requirement: System config page layout

The system SHALL render a page at `/admin/system-config` with:
- Breadcrumb: `系统管理 > 系统配置`
- Page title: `系统配置` with subtitle
- 5 horizontal tabs: 品牌信息, 记忆管理, 安全设置, 通知设置, 高级设置
- Bottom action bar with Reset and Save buttons

### Requirement: Brand info tab (backend integrated)

The brand info tab SHALL display:
- Current logo preview (96×96px with dashed border)
- Upload area for new logo (drag & drop or click)
- Product name fields (Chinese and English)
- Slogan field
- Save button triggers `PUT /api/v1/system-config/brand`
- Upload triggers `POST /api/v1/system-config/logo`

#### Scenario: Upload new logo
- **WHEN** user drags an image onto upload area
- **THEN** system validates file format (SVG, PNG, JPG) and size
- **AND** preview updates to show new logo
- **AND** save persists the change

#### Scenario: Edit product name and slogan
- **WHEN** user modifies product name or slogan fields
- **AND** clicks Save
- **THEN** system calls `PUT /api/v1/system-config/brand` with new values
- **AND** shows success toast on completion

### Requirement: Memory management tab (frontend mock)

The memory management tab SHALL display 4 statistic cards, distillation strategy controls, memory type toggles, and action buttons, all using mock frontend state.

### Requirement: Security settings tab (frontend mock)

The security settings tab SHALL display password policy, session security, and data security controls, all using mock frontend state.

### Requirement: Notification settings tab (frontend mock)

The notification settings tab SHALL display SMTP configuration form and notification scene toggles, all using mock frontend state.

### Requirement: Advanced settings tab (frontend mock)

The advanced settings tab SHALL display system maintenance action buttons and system information display, all using mock frontend state.