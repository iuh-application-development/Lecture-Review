-- Lecture Review Database Schema
-- Generated from models.py

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(150) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'Active',
    gender VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    avatar_url VARCHAR(300) DEFAULT 'images/uploads/default-avatar.jpg'
);

-- Notes table
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content JSON,
    color VARCHAR(20) DEFAULT 'note-green',
    tags JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    is_trashed BOOLEAN DEFAULT FALSE,
    deleted_at DATETIME,
    is_public BOOLEAN DEFAULT FALSE,
    disable BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Share Notes table
CREATE TABLE share_notes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    note_id INTEGER NOT NULL,
    sharer_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    shared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    can_edit BOOLEAN DEFAULT FALSE,
    message VARCHAR(200),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (sharer_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);

-- Comments table
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    note_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Warnings table
CREATE TABLE user_warnings (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    note_id INTEGER,
    admin_id INTEGER NOT NULL,
    reason VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (note_id) REFERENCES notes(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- User Notifications table
CREATE TABLE user_notifications (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    link VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for User Notifications table
CREATE INDEX idx_user_notifications_user_id_is_read ON user_notifications(user_id, is_read);
