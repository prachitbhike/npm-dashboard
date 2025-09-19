-- NPM Dashboard Database Schema

-- Table to store tracked packages
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    homepage VARCHAR(512),
    repository_url VARCHAR(512),
    latest_version VARCHAR(50),
    license VARCHAR(100),
    keywords TEXT[], -- Array of keywords
    maintainers JSONB, -- Store maintainer info as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Table to store daily download statistics
CREATE TABLE package_downloads (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    downloads INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(package_id, date)
);

-- Table to store weekly aggregated data for faster queries
CREATE TABLE package_weekly_stats (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    week_start DATE NOT NULL, -- Monday of the week
    total_downloads BIGINT NOT NULL,
    avg_daily_downloads INTEGER NOT NULL,
    growth_rate DECIMAL(10,4), -- Week-over-week growth rate
    velocity DECIMAL(10,4), -- Rate of change in growth
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(package_id, week_start)
);

-- Table to store growth analysis results
CREATE TABLE package_growth_analysis (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    growth_score DECIMAL(10,4), -- Combined growth metric
    acceleration DECIMAL(10,4), -- Download acceleration
    trend_direction VARCHAR(20), -- 'accelerating', 'decelerating', 'stable'
    is_high_growth BOOLEAN DEFAULT false,
    weekly_growth_rate DECIMAL(10,4),
    monthly_growth_rate DECIMAL(10,4),
    volatility DECIMAL(10,4), -- Download volatility measure
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(package_id, analysis_date)
);

-- Table to track alerts and notifications
CREATE TABLE growth_alerts (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'high_growth', 'acceleration', 'new_trend'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
    message TEXT NOT NULL,
    data JSONB, -- Store additional alert data
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_packages_name ON packages(name);
CREATE INDEX idx_package_downloads_package_date ON package_downloads(package_id, date DESC);
CREATE INDEX idx_package_weekly_stats_package_week ON package_weekly_stats(package_id, week_start DESC);
CREATE INDEX idx_package_growth_analysis_package_date ON package_growth_analysis(package_id, analysis_date DESC);
CREATE INDEX idx_package_growth_analysis_high_growth ON package_growth_analysis(is_high_growth, growth_score DESC);
CREATE INDEX idx_growth_alerts_unread ON growth_alerts(is_read, created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View for package summary with latest stats
CREATE VIEW package_summary AS
SELECT
    p.id,
    p.name,
    p.description,
    p.latest_version,
    p.created_at as tracked_since,
    ws.total_downloads as last_week_downloads,
    ws.growth_rate as weekly_growth_rate,
    ga.growth_score,
    ga.trend_direction,
    ga.is_high_growth,
    (SELECT COUNT(*) FROM package_downloads pd WHERE pd.package_id = p.id) as days_tracked
FROM packages p
LEFT JOIN package_weekly_stats ws ON ws.package_id = p.id
    AND ws.week_start = (
        SELECT MAX(week_start)
        FROM package_weekly_stats
        WHERE package_id = p.id
    )
LEFT JOIN package_growth_analysis ga ON ga.package_id = p.id
    AND ga.analysis_date = (
        SELECT MAX(analysis_date)
        FROM package_growth_analysis
        WHERE package_id = p.id
    )
WHERE p.is_active = true
ORDER BY ga.growth_score DESC NULLS LAST;

-- View for trending packages (high growth in last 30 days)
CREATE VIEW trending_packages AS
SELECT
    p.name,
    p.description,
    AVG(ga.growth_score) as avg_growth_score,
    AVG(ga.weekly_growth_rate) as avg_weekly_growth,
    COUNT(CASE WHEN ga.is_high_growth THEN 1 END) as high_growth_days,
    MAX(ws.total_downloads) as peak_weekly_downloads
FROM packages p
JOIN package_growth_analysis ga ON ga.package_id = p.id
LEFT JOIN package_weekly_stats ws ON ws.package_id = p.id
WHERE ga.analysis_date >= CURRENT_DATE - INTERVAL '30 days'
    AND p.is_active = true
GROUP BY p.id, p.name, p.description
HAVING AVG(ga.growth_score) > 0.5 -- Threshold for trending
ORDER BY avg_growth_score DESC, avg_weekly_growth DESC;