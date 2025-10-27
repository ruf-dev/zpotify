-- +goose Up
-- +goose StatementBegin
ALTER TABLE user_settings
    ALTER COLUMN user_tg_id SET NOT NULL;

ALTER TABLE user_permissions
    ALTER COLUMN user_tg_id SET NOT NULL;

ALTER TABLE user_permissions
    ALTER COLUMN can_upload DROP DEFAULT,
    ALTER COLUMN can_upload TYPE BOOLEAN USING (
        CASE
            WHEN can_upload = B'1' THEN true
            ELSE false
            END
        ),
    ALTER COLUMN can_upload SET DEFAULT false,

    ALTER COLUMN early_access DROP DEFAULT,
    ALTER COLUMN early_access TYPE BOOLEAN USING (
        CASE
            WHEN early_access = B'1' THEN true
            ELSE false
            END
        ),
    ALTER COLUMN early_access SET DEFAULT false,

    ALTER COLUMN can_delete DROP DEFAULT,
    ALTER COLUMN can_delete TYPE BOOLEAN USING (
        CASE
            WHEN can_delete = B'1' THEN true
            ELSE false
            END
        ),
    ALTER COLUMN can_delete SET DEFAULT false
;
ALTER TABLE user_permissions
    ALTER COLUMN early_access SET NOT NULL,
    ALTER COLUMN can_delete SET NOT NULL;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
