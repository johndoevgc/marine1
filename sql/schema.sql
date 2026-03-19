-- =============================================
-- VGC Maritime Cyber System - Database Schema
-- Azure SQL Database
-- =============================================

-- Vessels table: stores GPS tracking data for monitored vessels
CREATE TABLE Vessels (
    id          INT PRIMARY KEY,
    name        NVARCHAR(100)   NOT NULL,
    type        NVARCHAR(50)    NOT NULL,
    flag        NVARCHAR(10)    NOT NULL,
    status      NVARCHAR(20)    NOT NULL DEFAULT 'active',
    speed       NVARCHAR(20)    NOT NULL,
    heading     NVARCHAR(10)    NOT NULL,
    mmsi        NVARCHAR(20)    NOT NULL UNIQUE,
    lat         FLOAT           NOT NULL,
    lon         FLOAT           NOT NULL,
    updated_at  DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Compliance items table: stores cybersecurity compliance checklist
CREATE TABLE ComplianceItems (
    id          NVARCHAR(10)    PRIMARY KEY,
    category    NVARCHAR(100)   NOT NULL,
    label       NVARCHAR(255)   NOT NULL,
    done        BIT             NOT NULL DEFAULT 0,
    updated_at  DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Threat distribution table: stores analytics threat categories
CREATE TABLE ThreatDistribution (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    category    NVARCHAR(100)   NOT NULL,
    percentage  INT             NOT NULL,
    updated_at  DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Security score table: stores overall security scores
CREATE TABLE SecurityScore (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    score           INT             NOT NULL,
    threat_level    NVARCHAR(20)    NOT NULL,
    recorded_at     DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Indexes for common queries
CREATE INDEX IX_Vessels_Status ON Vessels(status);
CREATE INDEX IX_ComplianceItems_Category ON ComplianceItems(category);
CREATE INDEX IX_SecurityScore_RecordedAt ON SecurityScore(recorded_at DESC);
