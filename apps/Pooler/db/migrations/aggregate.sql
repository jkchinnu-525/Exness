CREATE MATERIALIZED VIEW candles_30s
WITH (timescaledb.continuous, timescaledb.materialized_only=false)
AS SELECT
    time_bucket('30 seconds', time) AS bucket,
    symbol,
    FIRST(price, time) AS open,
    MAX(price) AS high,
    MIN(price) AS low,
    LAST(price, time) AS close
FROM CANDLE_TABLE
GROUP BY bucket, symbol;

CREATE MATERIALIZED VIEW candles_1m
WITH (timescaledb.continuous, timescaledb.materialized_only=false)
AS SELECT
    time_bucket('1 minute', time) AS bucket,
    symbol,
    FIRST(price, time) AS open,
    MAX(price) AS high,
    MIN(price) AS low,
    LAST(price, time) AS close
FROM CANDLE_TABLE
GROUP BY bucket, symbol;

CREATE MATERIALIZED VIEW candles_5m
WITH (timescaledb.continuous, timescaledb.materialized_only=false)
AS SELECT
    time_bucket('5 minutes', bucket) AS bucket,
    symbol,
    FIRST(open, bucket) AS open,
    MAX(high) AS high,
    MIN(low) AS low,
    LAST(close, bucket) AS close
FROM candles_1m
GROUP BY time_bucket('5 minutes', bucket), symbol;

CREATE MATERIALIZED VIEW candles_1h
WITH (timescaledb.continuous, timescaledb.materialized_only=false)
AS SELECT
    time_bucket('1 hour', bucket) AS bucket,
    symbol,
    FIRST(open, bucket) AS open,
    MAX(high) AS high,
    MIN(low) AS low,
    LAST(close, bucket) AS close
FROM candles_5m
GROUP BY time_bucket('1 hour', bucket), symbol;

SELECT add_continuous_aggregate_policy('candles_30s',
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '30 seconds',
    schedule_interval => INTERVAL '30 seconds'
);

SELECT add_continuous_aggregate_policy('candles_1m',
    start_offset => INTERVAL '2 hours', 
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute');

SELECT add_continuous_aggregate_policy('candles_5m',
    start_offset => INTERVAL '6 hours',
    end_offset => INTERVAL '5 minutes', 
    schedule_interval => INTERVAL '5 minutes');

SELECT add_continuous_aggregate_policy('candles_1h',
    start_offset => INTERVAL '24 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');