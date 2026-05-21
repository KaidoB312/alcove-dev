CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    bio TEXT,
    email TEXT,
    discord TEXT,
    experience_years INTEGER DEFAULT NULL,
    profile_pic TEXT DEFAULT NULL,
    github TEXT DEFAULT NULL,
    twitter TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    description TEXT,
    tags TEXT,
    duration TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS member_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    skill_name TEXT NOT NULL,
    percent INTEGER DEFAULT NULL,
    tags TEXT,
    UNIQUE(member_id, skill_name),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    cert_name TEXT NOT NULL,
    UNIQUE(member_id, cert_name),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_offerings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_contributors (
    project_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    role_tag TEXT,
    PRIMARY KEY (project_id, member_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_member_skills_member_id ON member_skills(member_id);
CREATE INDEX IF NOT EXISTS idx_member_certs_member_id ON member_certifications(member_id);
CREATE INDEX IF NOT EXISTS idx_member_offerings_member_id ON member_offerings(member_id);
CREATE INDEX IF NOT EXISTS idx_project_contributors_project_id ON project_contributors(project_id);
CREATE INDEX IF NOT EXISTS idx_project_contributors_member_id ON project_contributors(member_id);
