// ============================================
// PROJECTS DATA – edit this file to manage all projects
// ============================================

const projects = [
    // === Collaborative Projects ===
    {
        id: 1,
        name: "CreateNow",
        description: "Hosting and development company where we collaborated on customer support, marketing, and infrastructure.",
        contributors: ["kaido", "cam"],
        kaidoTags: ["Marketing & Support"],
        camTags: ["Systems Admin"],
        duration: {
            kaido: "Dec 2023 – May 2024",
            cam: "Dec 2023 – May 2024"
        }
    },
    {
        id: 2,
        name: "CloudyNodes",
        description: "Node hosting platform – combined efforts in system reliability and user assistance.",
        contributors: ["kaido", "cam"],
        kaidoTags: ["Customer Support"],
        camTags: ["Systems Admin"],
        duration: {
            kaido: "Nov 2024 – Jan 2025",
            cam: "Sep 2024 – Jan 2025"
        }
    },
    {
        id: 3,
        name: "MineStudio",
        description: "Minecraft hosting and services – managing teams, marketing campaigns, and technical development.",
        contributors: ["kaido", "cam"],
        kaidoTags: ["Marketing"],
        camTags: ["General Manager & Dev"],
        duration: {
            kaido: "Jan 2025 – Mar 2025",
            cam: "Dec 2024 – June 2025"
        }
    },
    {
        id: 4,
        name: "The Void Bot",
        description: "A multi‑purpose Discord bot used by thousands of servers – built and maintained together.",
        contributors: ["kaido", "cam"],
        kaidoTags: ["Discord.js Developer"],
        camTags: ["Developer"],
        duration: {
            kaido: "Finished",
            cam: "Finished"
        }
    },
    {
        id: 5,
        name: "Discord Mail",
        description: "Ticket system for Discord communities, with seamless support workflows.",
        contributors: ["kaido", "cam"],
        kaidoTags: ["Developer"],
        camTags: ["Systems Integration"],
        duration: {
            kaido: "Finished",
            cam: "Finished"
        }
    },

    // === Kaido Solo Projects ===
    {
        id: 6,
        name: "Alcove.dev",
        description: "This very site – crafted with a lofi aesthetic and powered by clean code.",
        contributors: ["kaido"],
        kaidoTags: ["Design & Frontend"],
        camTags: [],
        duration: {
            kaido: "Ongoing",
            cam:"Ongoing"
        }
    },
    {
        id: 7,
        name: "Magazine Covers & Logos",
        description: "Designed professional magazine covers and brand logos for various clients using Photoshop and Illustrator.",
        contributors: ["kaido"],
        kaidoTags: ["Graphic Design", "Branding"],
        camTags: [],
        duration: {
            kaido: "Ongoing"
        }
    },
    {
        id: 8,
        name: "Video Production",
        description: "Edited and produced promotional videos, tutorials, and short films with Premiere Pro.",
        contributors: ["kaido"],
        kaidoTags: ["Video Editing", "Premiere Pro"],
        camTags: [],
        duration: {
            kaido: "Ongoing"
        }
    },
    {
        id: 9,
        name: "Website Development (Freelance)",
        description: "Built responsive websites using Adobe Dreamweaver and custom HTML/CSS for various clients.",
        contributors: ["kaido"],
        kaidoTags: ["Web Design", "HTML/CSS", "Dreamweaver"],
        camTags: [],
        duration: {
            kaido: "2022–Present"
        }
    },
    {
        id: 10,
        name: "Presentations & Content",
        description: "Created visually engaging presentations and slide decks for business and educational use.",
        contributors: ["kaido"],
        kaidoTags: ["Presentation Design", "Google Slides", "PowerPoint"],
        camTags: [],
        duration: {
            kaido: "2022–Present"
        }
    },
    {
        id: 11,
        name: "Datapad (Discord Bot)",
        description: "Utility bot with data management and automation features for Discord communities.",
        contributors: ["kaido"],
        kaidoTags: ["Discord.js", "Automation"],
        camTags: [],
        duration: {
            kaido: "2025"
        }
    },

    // === Cam Solo Projects ===
    {
        id: 12,
        name: "Penguin Licensing",
        description: "License management bot for Discord communities.",
        contributors: ["cam"],
        kaidoTags: [],
        camTags: ["Discord Bot", "License System"],
        duration: {
            cam: "2025"
        }
    },
    {
        id: 13,
        name: "Atzin License System",
        description: "Advanced license verification and management bot.",
        contributors: ["cam"],
        kaidoTags: [],
        camTags: ["Discord Bot", "License System"],
        duration: {
            cam: "2025"
        }
    },
    {
        id: 14,
        name: "Cloud Licensing System",
        description: "Cloud-based license handling with automated checks.",
        contributors: ["cam"],
        kaidoTags: [],
        camTags: ["Discord Bot", "License System"],
        duration: {
            cam: "2025"
        }
    },
    {
        id: 15,
        name: "Discord Wemix Verification",
        description: "Custom verification system for Discord communities.",
        contributors: ["cam"],
        kaidoTags: [],
        camTags: ["Discord Bot", "Verification"],
        duration: {
            cam: "2025"
        }
    },
    {
        id: 16,
        name: "System Automation (Pterodactyl)",
        description: "Automated node balancing and Wings optimization for Pterodactyl panels.",
        contributors: ["cam"],
        kaidoTags: [],
        camTags: ["Pterodactyl", "Automation"],
        duration: {
            cam: "2024–Present"
        }
    },
    {
        id: 17,
        name: "Minestom GUI API",
        description: "GUI framework for Minestom servers.",
        contributors: ["cam"],
        kaidoTags: [],
        camTags: ["Minestom", "API Development"],
        duration: {
            cam: "2024"
        }
    },
    {
        id: 18,
        name: "Minestom Tubes / CraftingStore Hook",
        description: "Integration with CraftingStore for Minestom servers.",
        contributors: ["cam"],
        kaidoTags: [],
        camTags: ["Minestom", "Integration"],
        duration: {
            cam: "2024"
        }
    },
    {
        id: 19,
        name: "Control Center",
        description: "Minecraft plugin with extensive administration controls.",
        contributors: ["cam"],
        kaidoTags: [],
        camTags: ["Minecraft Plugin", "Administration"],
        duration: {
            cam: "2023–2024"
        }
    }
];

console.log("projects.js loaded, total projects:", projects.length);