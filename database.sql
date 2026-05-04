-- Members table
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    bio TEXT,
    email VARCHAR(100),
    discord VARCHAR(100),
    experience_years INT DEFAULT NULL,
    profile_pic VARCHAR(200) DEFAULT NULL,
    github VARCHAR(100) DEFAULT NULL,
    twitter VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    tags JSON,
    duration JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_title (title)
);

-- Member Skills
CREATE TABLE IF NOT EXISTS member_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    percent INT DEFAULT NULL,
    tags JSON,
    UNIQUE KEY unique_member_skill (member_id, skill_name),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Member Certifications
CREATE TABLE IF NOT EXISTS member_certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    cert_name VARCHAR(200) NOT NULL,
    UNIQUE KEY unique_member_cert (member_id, cert_name),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Member Offerings
CREATE TABLE IF NOT EXISTS member_offerings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Project Contributors
CREATE TABLE IF NOT EXISTS project_contributors (
    project_id INT NOT NULL,
    member_id INT NOT NULL,
    role_tag VARCHAR(100),
    PRIMARY KEY (project_id, member_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_member_skills_member_id ON member_skills(member_id);
CREATE INDEX idx_member_certs_member_id ON member_certifications(member_id);
CREATE INDEX idx_member_offerings_member_id ON member_offerings(member_id);
CREATE INDEX idx_project_contributors_project_id ON project_contributors(project_id);
CREATE INDEX idx_project_contributors_member_id ON project_contributors(member_id);