-- KBee Manager Database Initialization
-- This file is executed when MySQL container starts for the first time

-- Create database if not exists (already created by environment variables)
USE kbee_manager;

-- Set character set to UTF-8 for Vietnamese support
ALTER DATABASE kbee_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- User creation is handled by MySQL environment variables
-- MYSQL_USER and MYSQL_PASSWORD are automatically used to create the user
-- No need to manually create user here

-- Create tables will be handled by Flask-SQLAlchemy
-- This file can be used for any additional database setup

-- Migration script for existing data (if any)
-- This will be executed after the application starts

-- Create indexes for better performance
-- These will be created after the tables are created by the application

-- Sample data (optional - can be removed in production)
-- INSERT INTO user (username, email, password_hash) VALUES 
-- ('admin', 'admin@kbee.com', 'scrypt:32768:8:1$...'); -- This will be created by the app
