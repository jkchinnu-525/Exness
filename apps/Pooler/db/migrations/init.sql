

CREATE TABLE CANDLE_TABLE (
    time TIMESTAMPTZ NOT NULL,
    symbol TEXT NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    high DECIMAL(20, 8),
    low DECIMAL(20, 8),
    open DECIMAL(20, 8),
    close DECIMAL(20, 8)
);

SELECT create_hypertable('CANDLE_TABLE', 'time');
CREATE INDEX idx_candle_symbol ON CANDLE_TABLE(symbol, time DESC);
CREATE INDEX idx_candle_time ON CANDLE_TABLE(time DESC);