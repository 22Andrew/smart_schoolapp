-- Create phone_calls table
CREATE TABLE IF NOT EXISTS phone_calls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    call_type VARCHAR(20) NOT NULL COMMENT 'Incoming or Outgoing',
    date DATE NOT NULL,
    follow_up_date DATE,
    call_duration INT COMMENT 'Duration in minutes',
    description VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Create indexes for better query performance
CREATE INDEX idx_phone_calls_date ON phone_calls(date DESC);
CREATE INDEX idx_phone_calls_call_type ON phone_calls(call_type);
CREATE INDEX idx_phone_calls_name ON phone_calls(name);
CREATE INDEX idx_phone_calls_phone ON phone_calls(phone);
CREATE INDEX idx_phone_calls_follow_up_date ON phone_calls(follow_up_date);
