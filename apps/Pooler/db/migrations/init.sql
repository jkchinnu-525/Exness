

CREATE TABLE CANDLE_TABLE (
    time TIMESTAMPTZ NOT NULL,
    symbol TEXT NOT NULL,
    price BIGINT NOT NULL,
    high BIGINT,
    low BIGINT,
    open BIGINT,
    close BIGINT
);

SELECT create_hypertable('CANDLE_TABLE', 'time');
CREATE INDEX idx_candle_symbol ON CANDLE_TABLE(symbol, time DESC);
CREATE INDEX idx_candle_time ON CANDLE_TABLE(time DESC);