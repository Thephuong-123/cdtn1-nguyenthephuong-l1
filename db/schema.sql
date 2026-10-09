CREATE TABLE app_user (
    user_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL
);

CREATE TABLE customer (
    customer_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(150),
    address VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_customer_created_by
        FOREIGN KEY (created_by)
        REFERENCES app_user(user_id)
);

CREATE TABLE duplicate_candidate (
    candidate_id BIGSERIAL PRIMARY KEY,
    customer_id_1 BIGINT NOT NULL,
    customer_id_2 BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by BIGINT,

    CONSTRAINT fk_duplicate_customer_1
        FOREIGN KEY (customer_id_1)
        REFERENCES customer(customer_id),

    CONSTRAINT fk_duplicate_customer_2
        FOREIGN KEY (customer_id_2)
        REFERENCES customer(customer_id),

    CONSTRAINT fk_duplicate_reviewed_by
        FOREIGN KEY (reviewed_by)
        REFERENCES app_user(user_id),

    CONSTRAINT chk_duplicate_different_customer
        CHECK (customer_id_1 <> customer_id_2)
);

CREATE TABLE customer_merge (
    merge_id BIGSERIAL PRIMARY KEY,
    primary_customer_id BIGINT NOT NULL,
    duplicate_customer_id BIGINT NOT NULL,
    merged_by BIGINT NOT NULL,
    merged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_merge_primary_customer
        FOREIGN KEY (primary_customer_id)
        REFERENCES customer(customer_id),

    CONSTRAINT fk_merge_duplicate_customer
        FOREIGN KEY (duplicate_customer_id)
        REFERENCES customer(customer_id),

    CONSTRAINT fk_merge_user
        FOREIGN KEY (merged_by)
        REFERENCES app_user(user_id),

    CONSTRAINT chk_merge_different_customer
        CHECK (primary_customer_id <> duplicate_customer_id)
);

CREATE INDEX idx_duplicate_status
ON duplicate_candidate(status);

CREATE INDEX idx_duplicate_customer_1
ON duplicate_candidate(customer_id_1);

CREATE INDEX idx_duplicate_customer_2
ON duplicate_candidate(customer_id_2);

CREATE INDEX idx_merge_primary_customer
ON customer_merge(primary_customer_id);

CREATE INDEX idx_merge_duplicate_customer
ON customer_merge(duplicate_customer_id);