CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_content BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_name ON templates(name);

COMMENT ON TABLE templates IS 'Хранение DOCX шаблонов для протоколов';
COMMENT ON COLUMN templates.file_content IS 'Бинарное содержимое DOCX файла';
