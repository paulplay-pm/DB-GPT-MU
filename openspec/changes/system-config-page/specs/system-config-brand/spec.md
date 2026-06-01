## ADDED Requirements

### Requirement: Brand configuration storage

The system SHALL store brand configuration in a `SystemConfig` database table with fields: `logo_url`, `product_name_zh`, `product_name_en`, `slogan`.

### Requirement: Get brand configuration API

The system SHALL provide a `GET /api/v1/system-config/brand` endpoint that returns the current brand configuration as JSON.

### Requirement: Update brand configuration API

The system SHALL provide a `PUT /api/v1/system-config/brand` endpoint that accepts JSON body with the fields to update and persists them to the database.

### Requirement: Upload logo API

The system SHALL provide a `POST /api/v1/system-config/logo` endpoint that accepts file upload and returns the stored file path/URL.

#### Scenario: Get brand config when empty
- **WHEN** client calls `GET /api/v1/system-config/brand` with no existing config
- **THEN** system returns default values: `product_name_zh: "DB-GPT"`, `product_name_en: "DB-GPT"`, `slogan: "开口问数，预见洞察"`, `logo_url: null`

#### Scenario: Update brand config
- **WHEN** client calls `PUT /api/v1/system-config/brand` with `{"product_name_zh": "MyApp", "slogan": "Hello"}`
- **THEN** system persists the changes and returns the updated config

#### Scenario: Upload logo file
- **WHEN** client uploads an image file via `POST /api/v1/system-config/logo`
- **THEN** system stores the file and returns `{"logo_url": "/uploads/logos/xxx.png"}`

### Requirement: Admin only access

The system SHALL only allow users with admin role to access the system config API endpoints.