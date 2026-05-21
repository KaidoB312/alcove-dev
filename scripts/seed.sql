INSERT OR IGNORE INTO members (slug, name, role, bio, email, discord, experience_years) VALUES ('kaido', 'Kaido / Jay', 'Web Developer & General Manager', 'I''m a Web Developer and General Manager from the US. With almost 5 years of experience, I specialize in Web Design, Project Management, and Human Resources. My goal is to ensure all projects run as well as possible for my business and yours.', 'kaidob312@gmail.com', 'https://discord.gg/mSASEN8gmk', 5);

INSERT OR IGNORE INTO members (slug, name, role, bio, email, discord, experience_years) VALUES ('cams', 'Cam M', 'Systems Administrator & General Manager', 'I''m a Systems Administrator and General Manager from the US, passionate about my work. With over 5 years of experience in IT, I specialize in network administration, server management, and technical support. My goal is to ensure all systems run smoothly so your business can focus on what it does best.', 'cam@camyzed.dev', 'https://discord.com/users/cammyze', 5);

-- Kaido skills
INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (1, 'Systems Administration', 50, '["Linux","Windows","Networking"]');
INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (1, 'Adobe Creative Suite', 90, '["Photoshop","Illustrator","Premiere Pro"]');
INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (1, 'Web Development', 85, '["HTML/CSS","JavaScript","Responsive"]');
INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (1, 'Node.js', 65, '["Discord.js","Express"]');

-- Kaido certifications
INSERT OR IGNORE INTO member_certifications (member_id, cert_name) VALUES (1, 'Adobe Certified Content Creation and Marketing Using Adobe Express');
INSERT OR IGNORE INTO member_certifications (member_id, cert_name) VALUES (1, 'Adobe Certified Graphic Design and Illustration using Adobe Illustrator');
INSERT OR IGNORE INTO member_certifications (member_id, cert_name) VALUES (1, 'Adobe Certified Professional in Marketing Design');
INSERT OR IGNORE INTO member_certifications (member_id, cert_name) VALUES (1, 'Adobe Certified Professional in Web Design');
INSERT OR IGNORE INTO member_certifications (member_id, cert_name) VALUES (1, 'Adobe Certified Visual Design using Adobe Photoshop');
INSERT OR IGNORE INTO member_certifications (member_id, cert_name) VALUES (1, 'Adobe Certified Web Authoring using Adobe Dreamweaver');

-- Kaido offerings
INSERT OR IGNORE INTO member_offerings (member_id, title, description, icon) VALUES (1, 'Creative Design', 'Logos, branding, video production, and presentations that tell your story.', 'palette');
INSERT OR IGNORE INTO member_offerings (member_id, title, description, icon) VALUES (1, 'Web Development', 'Responsive, accessible websites built with modern HTML/CSS and JavaScript.', 'code');
INSERT OR IGNORE INTO member_offerings (member_id, title, description, icon) VALUES (1, 'Project Management', 'Keep projects on track, teams aligned, and goals achieved.', 'chalkboard-user');

-- Cam skills
INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (2, 'Systems Administration', 79, '["Linux","Windows","Networking","Security","Automation"]');
INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (2, 'Pterodactyl Framework', 90, '["Wings","Node Balancing","Custom Addons"]');
INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (2, 'NodeJS', 82, '["Discord.js","Express","Socket.io"]');
INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (2, 'Human Resources', 64, '["Hiring","Training","Team Management"]');
INSERT OR IGNORE INTO member_skills (member_id, skill_name, percent, tags) VALUES (2, 'Customer Service', 60, '["Communication","Problem Solving","Empathy"]');

-- Cam offerings
INSERT OR IGNORE INTO member_offerings (member_id, title, description, icon) VALUES (2, 'IT Management', 'Systems administration, monitoring, and automation for reliable infrastructure.', 'server');
INSERT OR IGNORE INTO member_offerings (member_id, title, description, icon) VALUES (2, 'Minecraft Hosting', 'Pterodactyl setup, custom Wings, node balancing, and plugin development.', 'cubes');
INSERT OR IGNORE INTO member_offerings (member_id, title, description, icon) VALUES (2, 'Team Leadership', 'Hiring, training, conflict resolution, and performance management.', 'users');

-- Projects
INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (1, 'CreateNow', 'Hosting and development company where we collaborated on customer support, marketing, and infrastructure.', '["Marketing","Support","Systems Admin"]', '{"kaido":"Dec 2023 – May 2024","cams":"Dec 2023 – May 2024"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (2, 'CloudyNodes', 'Node hosting platform – combined efforts in system reliability and user assistance.', '["Customer Support","Systems Admin"]', '{"kaido":"Nov 2024 – Jan 2025","cams":"Sep 2024 – Jan 2025"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (3, 'MineStudio', 'Minecraft hosting and services – managing teams, marketing campaigns, and technical development.', '["Marketing","Management","Development"]', '{"kaido":"Jan 2025 – Mar 2025","cams":"Dec 2024 – June 2025"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (4, 'The Void Bot', 'A multi‑purpose Discord bot used by thousands of servers – built and maintained together.', '["Discord.js","Node.js"]', '{"kaido":"Finished","cams":"Finished"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (5, 'Discord Mail', 'Ticket system for Discord communities, with seamless support workflows.', '["Discord.js","Node.js","Support"]', '{"kaido":"Finished","cams":"Finished"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (6, 'Alcove.dev', 'This very site – crafted with a lofi aesthetic and powered by clean code.', '["Web Design","Frontend"]', '{"kaido":"Ongoing"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (7, 'Magazine Covers & Logos', 'Designed professional magazine covers and brand logos for various clients using Photoshop and Illustrator.', '["Graphic Design","Branding"]', '{"kaido":"Ongoing"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (8, 'Video Production', 'Edited and produced promotional videos, tutorials, and short films with Premiere Pro.', '["Video Editing","Premiere Pro"]', '{"kaido":"Ongoing"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (9, 'Website Development (Freelance)', 'Built responsive websites using Adobe Dreamweaver and custom HTML/CSS for various clients.', '["Web Design","HTML/CSS","Dreamweaver"]', '{"kaido":"2022–Present"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (10, 'Presentations & Content', 'Created visually engaging presentations and slide decks for business and educational use.', '["Presentation Design","Google Slides","PowerPoint"]', '{"kaido":"2022–Present"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (11, 'Datapad (Discord Bot)', 'Utility bot with data management and automation features for Discord communities.', '["Discord.js","Automation"]', '{"kaido":"2025"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (12, 'Penguin Licensing', 'License management bot for Discord communities.', '["Discord Bot","License System"]', '{"cams":"2025"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (13, 'Atzin License System', 'Advanced license verification and management bot.', '["Discord Bot","License System"]', '{"cams":"2025"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (14, 'Cloud Licensing System', 'Cloud-based license handling with automated checks.', '["Discord Bot","License System"]', '{"cams":"2025"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (15, 'Discord Wemix Verification', 'Custom verification system for Discord communities.', '["Discord Bot","Verification"]', '{"cams":"2025"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (16, 'System Automation (Pterodactyl)', 'Automated node balancing and Wings optimization for Pterodactyl panels.', '["Pterodactyl","Automation"]', '{"cams":"2024–Present"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (17, 'Minestom GUI API', 'GUI framework for Minestom servers.', '["Minestom","API Development"]', '{"cams":"2024"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (18, 'Minestom Tubes / CraftingStore Hook', 'Integration with CraftingStore for Minestom servers.', '["Minestom","Integration"]', '{"cams":"2024"}');

INSERT OR IGNORE INTO projects (id, title, description, tags, duration) VALUES (19, 'Control Center', 'Minecraft plugin with extensive administration controls.', '["Minecraft Plugin","Administration"]', '{"cams":"2023–2024"}');

-- Project contributors
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (1, 1, 'Marketing & Support');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (1, 2, 'Systems Admin');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (2, 1, 'Customer Support');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (2, 2, 'Systems Admin');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (3, 1, 'Marketing');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (3, 2, 'General Manager & Dev');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (4, 1, 'Discord.js Developer');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (4, 2, 'Developer');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (5, 1, 'Developer');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (5, 2, 'Systems Integration');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (6, 1, 'Design & Frontend');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (7, 1, 'Graphic Design & Branding');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (8, 1, 'Video Production');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (9, 1, 'Web Development');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (10, 1, 'Presentation Design');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (11, 1, 'Discord Bot Developer');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (12, 2, 'Discord Bot Developer');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (13, 2, 'Discord Bot Developer');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (14, 2, 'Discord Bot Developer');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (15, 2, 'Discord Bot Developer');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (16, 2, 'Pterodactyl Automation');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (17, 2, 'Minestom Developer');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (18, 2, 'Minestom Developer');
INSERT OR IGNORE INTO project_contributors (project_id, member_id, role_tag) VALUES (19, 2, 'Plugin Developer');
