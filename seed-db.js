// seed-db.js – Populate database with initial members and projects
const mysql = require('mysql2/promise');
require('dotenv').config();

const membersData = [
    {
        slug: 'kaido',
        name: 'Kaido / Jay',
        role: 'Web Developer & General Manager',
        bio: 'I\'m a Web Developer and General Manager from the US. With almost 5 years of experience, I specialize in Web Design, Project Management, and Human Resources. My goal is to ensure all projects run as well as possible for my business and yours.',
        email: 'kaidob312@gmail.com',
        discord: 'https://discord.gg/mSASEN8gmk',
        experience_years: 5,
        skills: [
            { name: 'Systems Administration', percent: 50, tags: ['Linux', 'Windows', 'Networking'] },
            { name: 'Adobe Creative Suite', percent: 90, tags: ['Photoshop', 'Illustrator', 'Premiere Pro'] },
            { name: 'Web Development', percent: 85, tags: ['HTML/CSS', 'JavaScript', 'Responsive'] },
            { name: 'Node.js', percent: 65, tags: ['Discord.js', 'Express'] }
        ],
        certifications: [
            'Adobe Certified Content Creation and Marketing Using Adobe Express',
            'Adobe Certified Graphic Design and Illustration using Adobe Illustrator',
            'Adobe Certified Professional in Marketing Design',
            'Adobe Certified Professional in Web Design',
            'Adobe Certified Visual Design using Adobe Photoshop',
            'Adobe Certified Web Authoring using Adobe Dreamweaver'
        ],
        offerings: [
            { title: 'Creative Design', desc: 'Logos, branding, video production, and presentations that tell your story.', icon: 'palette' },
            { title: 'Web Development', desc: 'Responsive, accessible websites built with modern HTML/CSS and JavaScript.', icon: 'code' },
            { title: 'Project Management', desc: 'Keep projects on track, teams aligned, and goals achieved.', icon: 'chalkboard-user' }
        ]
    },
    {
        slug: 'cams',
        name: 'Cam M',
        role: 'Systems Administrator & General Manager',
        bio: 'I\'m a Systems Administrator and General Manager from the US, passionate about my work. With over 5 years of experience in IT, I specialize in network administration, server management, and technical support. My goal is to ensure all systems run smoothly so your business can focus on what it does best.',
        email: 'cam@camyzed.dev',
        discord: 'https://discord.com/users/cammyze',
        experience_years: 5,
        skills: [
            { name: 'Systems Administration', percent: 79, tags: ['Linux', 'Windows', 'Networking', 'Security', 'Automation'] },
            { name: 'Pterodactyl Framework', percent: 90, tags: ['Wings', 'Node Balancing', 'Custom Addons'] },
            { name: 'NodeJS', percent: 82, tags: ['Discord.js', 'Express', 'Socket.io'] },
            { name: 'Human Resources', percent: 64, tags: ['Hiring', 'Training', 'Team Management'] },
            { name: 'Customer Service', percent: 60, tags: ['Communication', 'Problem Solving', 'Empathy'] }
        ],
        certifications: [],
        offerings: [
            { title: 'IT Management', desc: 'Systems administration, monitoring, and automation for reliable infrastructure.', icon: 'server' },
            { title: 'Minecraft Hosting', desc: 'Pterodactyl setup, custom Wings, node balancing, and plugin development.', icon: 'cubes' },
            { title: 'Team Leadership', desc: 'Hiring, training, conflict resolution, and performance management.', icon: 'users' }
        ]
    }
];

const projectsData = [
    {
        title: 'CreateNow',
        description: 'Hosting and development company where we collaborated on customer support, marketing, and infrastructure.',
        tags: ['Marketing', 'Support', 'Systems Admin'],
        duration: { kaido: 'Dec 2023 – May 2024', cams: 'Dec 2023 – May 2024' },
        contributors: [
            { member_slug: 'kaido', tag: 'Marketing & Support' },
            { member_slug: 'cams', tag: 'Systems Admin' }
        ]
    },
    {
        title: 'CloudyNodes',
        description: 'Node hosting platform – combined efforts in system reliability and user assistance.',
        tags: ['Customer Support', 'Systems Admin'],
        duration: { kaido: 'Nov 2024 – Jan 2025', cams: 'Sep 2024 – Jan 2025' },
        contributors: [
            { member_slug: 'kaido', tag: 'Customer Support' },
            { member_slug: 'cams', tag: 'Systems Admin' }
        ]
    },
    {
        title: 'MineStudio',
        description: 'Minecraft hosting and services – managing teams, marketing campaigns, and technical development.',
        tags: ['Marketing', 'Management', 'Development'],
        duration: { kaido: 'Jan 2025 – Mar 2025', cams: 'Dec 2024 – June 2025' },
        contributors: [
            { member_slug: 'kaido', tag: 'Marketing' },
            { member_slug: 'cams', tag: 'General Manager & Dev' }
        ]
    },
    {
        title: 'The Void Bot',
        description: 'A multi‑purpose Discord bot used by thousands of servers – built and maintained together.',
        tags: ['Discord.js', 'Node.js'],
        duration: { kaido: 'Finished', cams: 'Finished' },
        contributors: [
            { member_slug: 'kaido', tag: 'Discord.js Developer' },
            { member_slug: 'cams', tag: 'Developer' }
        ]
    },
    {
        title: 'Discord Mail',
        description: 'Ticket system for Discord communities, with seamless support workflows.',
        tags: ['Discord.js', 'Node.js', 'Support'],
        duration: { kaido: 'Finished', cams: 'Finished' },
        contributors: [
            { member_slug: 'kaido', tag: 'Developer' },
            { member_slug: 'cams', tag: 'Systems Integration' }
        ]
    },
    {
        title: 'Alcove.dev',
        description: 'This very site – crafted with a lofi aesthetic and powered by clean code.',
        tags: ['Web Design', 'Frontend'],
        duration: { kaido: 'Ongoing' },
        contributors: [{ member_slug: 'kaido', tag: 'Design & Frontend' }]
    },
    {
        title: 'Magazine Covers & Logos',
        description: 'Designed professional magazine covers and brand logos for various clients using Photoshop and Illustrator.',
        tags: ['Graphic Design', 'Branding'],
        duration: { kaido: 'Ongoing' },
        contributors: [{ member_slug: 'kaido', tag: 'Graphic Design & Branding' }]
    },
    {
        title: 'Video Production',
        description: 'Edited and produced promotional videos, tutorials, and short films with Premiere Pro.',
        tags: ['Video Editing', 'Premiere Pro'],
        duration: { kaido: 'Ongoing' },
        contributors: [{ member_slug: 'kaido', tag: 'Video Production' }]
    },
    {
        title: 'Website Development (Freelance)',
        description: 'Built responsive websites using Adobe Dreamweaver and custom HTML/CSS for various clients.',
        tags: ['Web Design', 'HTML/CSS', 'Dreamweaver'],
        duration: { kaido: '2022–Present' },
        contributors: [{ member_slug: 'kaido', tag: 'Web Development' }]
    },
    {
        title: 'Presentations & Content',
        description: 'Created visually engaging presentations and slide decks for business and educational use.',
        tags: ['Presentation Design', 'Google Slides', 'PowerPoint'],
        duration: { kaido: '2022–Present' },
        contributors: [{ member_slug: 'kaido', tag: 'Presentation Design' }]
    },
    {
        title: 'Datapad (Discord Bot)',
        description: 'Utility bot with data management and automation features for Discord communities.',
        tags: ['Discord.js', 'Automation'],
        duration: { kaido: '2025' },
        contributors: [{ member_slug: 'kaido', tag: 'Discord Bot Developer' }]
    },
    {
        title: 'Penguin Licensing',
        description: 'License management bot for Discord communities.',
        tags: ['Discord Bot', 'License System'],
        duration: { cams: '2025' },
        contributors: [{ member_slug: 'cams', tag: 'Discord Bot Developer' }]
    },
    {
        title: 'Atzin License System',
        description: 'Advanced license verification and management bot.',
        tags: ['Discord Bot', 'License System'],
        duration: { cams: '2025' },
        contributors: [{ member_slug: 'cams', tag: 'Discord Bot Developer' }]
    },
    {
        title: 'Cloud Licensing System',
        description: 'Cloud-based license handling with automated checks.',
        tags: ['Discord Bot', 'License System'],
        duration: { cams: '2025' },
        contributors: [{ member_slug: 'cams', tag: 'Discord Bot Developer' }]
    },
    {
        title: 'Discord Wemix Verification',
        description: 'Custom verification system for Discord communities.',
        tags: ['Discord Bot', 'Verification'],
        duration: { cams: '2025' },
        contributors: [{ member_slug: 'cams', tag: 'Discord Bot Developer' }]
    },
    {
        title: 'System Automation (Pterodactyl)',
        description: 'Automated node balancing and Wings optimization for Pterodactyl panels.',
        tags: ['Pterodactyl', 'Automation'],
        duration: { cams: '2024–Present' },
        contributors: [{ member_slug: 'cams', tag: 'Pterodactyl Automation' }]
    },
    {
        title: 'Minestom GUI API',
        description: 'GUI framework for Minestom servers.',
        tags: ['Minestom', 'API Development'],
        duration: { cams: '2024' },
        contributors: [{ member_slug: 'cams', tag: 'Minestom Developer' }]
    },
    {
        title: 'Minestom Tubes / CraftingStore Hook',
        description: 'Integration with CraftingStore for Minestom servers.',
        tags: ['Minestom', 'Integration'],
        duration: { cams: '2024' },
        contributors: [{ member_slug: 'cams', tag: 'Minestom Developer' }]
    },
    {
        title: 'Control Center',
        description: 'Minecraft plugin with extensive administration controls.',
        tags: ['Minecraft Plugin', 'Administration'],
        duration: { cams: '2023–2024' },
        contributors: [{ member_slug: 'cams', tag: 'Plugin Developer' }]
    }
];

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: false, // we'll run single queries
    });

    console.log('Seeding database...');

    // Ensure member_skills etc tables exist (we'll assume they do; if not, you can create them first)
    // We'll proceed with inserts.

    for (const member of membersData) {
        // Insert member if not exists (by slug)
        const [existing] = await connection.query('SELECT id FROM members WHERE slug = ?', [member.slug]);
        let memberId;
        if (existing.length) {
            memberId = existing[0].id;
            console.log(`Member ${member.slug} already exists, updating...`);
            await connection.query(
                `UPDATE members SET name=?, role=?, bio=?, email=?, discord=?, experience_years=? WHERE id=?`,
                [member.name, member.role, member.bio, member.email, member.discord, member.experience_years, memberId]
            );
        } else {
            const [result] = await connection.query(
                `INSERT INTO members (slug, name, role, bio, email, discord, experience_years) VALUES (?,?,?,?,?,?,?)`,
                [member.slug, member.name, member.role, member.bio, member.email, member.discord, member.experience_years]
            );
            memberId = result.insertId;
            console.log(`Inserted member ${member.slug}`);
        }

        // Clear existing related data to avoid duplicates
        await connection.query('DELETE FROM member_skills WHERE member_id = ?', [memberId]);
        await connection.query('DELETE FROM member_certifications WHERE member_id = ?', [memberId]);
        await connection.query('DELETE FROM member_offerings WHERE member_id = ?', [memberId]);

        // Insert skills
        for (const skill of member.skills) {
            await connection.query(
                `INSERT INTO member_skills (member_id, skill_name, percent, tags) VALUES (?, ?, ?, ?)`,
                [memberId, skill.name, skill.percent || null, JSON.stringify(skill.tags || [])]
            );
        }

        // Insert certifications
        for (const cert of member.certifications) {
            await connection.query(
                `INSERT INTO member_certifications (member_id, cert_name) VALUES (?, ?)`,
                [memberId, cert]
            );
        }

        // Insert offerings
        for (const offering of member.offerings) {
            await connection.query(
                `INSERT INTO member_offerings (member_id, title, description, icon) VALUES (?, ?, ?, ?)`,
                [memberId, offering.title, offering.desc, offering.icon]
            );
        }
    }

    for (const proj of projectsData) {
        // Insert project if not exists (by title)
        const [existing] = await connection.query('SELECT id FROM projects WHERE title = ?', [proj.title]);
        let projectId;
        if (existing.length) {
            projectId = existing[0].id;
            console.log(`Project ${proj.title} already exists, updating...`);
            await connection.query(
                `UPDATE projects SET description=?, tags=?, duration=? WHERE id=?`,
                [proj.description, JSON.stringify(proj.tags), JSON.stringify(proj.duration), projectId]
            );
        } else {
            const [result] = await connection.query(
                `INSERT INTO projects (title, description, tags, duration) VALUES (?, ?, ?, ?)`,
                [proj.title, proj.description, JSON.stringify(proj.tags), JSON.stringify(proj.duration)]
            );
            projectId = result.insertId;
            console.log(`Inserted project ${proj.title}`);
        }

        // Clear existing contributors
        await connection.query('DELETE FROM project_contributors WHERE project_id = ?', [projectId]);

        // Insert contributors
        for (const contrib of proj.contributors) {
            const [memberRows] = await connection.query('SELECT id FROM members WHERE slug = ?', [contrib.member_slug]);
            if (memberRows.length) {
                await connection.query(
                    `INSERT INTO project_contributors (project_id, member_id, role_tag) VALUES (?, ?, ?)`,
                    [projectId, memberRows[0].id, contrib.tag]
                );
            } else {
                console.warn(`Member ${contrib.member_slug} not found for project ${proj.title}`);
            }
        }
    }

    console.log('Seeding complete.');
    await connection.end();
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});