// Helper: escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Render project cards from an array of projects
function renderProjectCards(projectsArray) {
    return projectsArray.map(proj => `
        <div class="project-card">
            <h3>${escapeHtml(proj.name)}</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.5rem 0;">
                ${proj.contributors.map(contributor => {
                    const tags = proj[contributor + 'Tags'] || [];
                    return tags.map(tag => `<div class="project-tag">${escapeHtml(contributor.charAt(0).toUpperCase() + contributor.slice(1))}: ${escapeHtml(tag)}</div>`).join('');
                }).join('')}
            </div>
            <p>${escapeHtml(proj.description)}</p>
        </div>
    `).join('');
}

// Initialize the project slider
function initSlider(projectsData) {
    const sliderContainer = document.getElementById('projectsSlider');
    if (!sliderContainer) return;

    // Group projects into slides of 3
    const slides = [];
    for (let i = 0; i < projectsData.length; i += 3) {
        slides.push(projectsData.slice(i, i + 3));
    }

    sliderContainer.innerHTML = slides.map(slide => `
        <div class="project-slide">
            ${renderProjectCards(slide)}
        </div>
    `).join('');

    let currentSlide = 0;
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    function updateSlider() {
        sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlider();
            }
        };
    }
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (currentSlide < slides.length - 1) {
                currentSlide++;
                updateSlider();
            }
        };
    }
}

// Wait for DOM and the global projects array
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.projects !== 'undefined' && Array.isArray(window.projects)) {
        initSlider(window.projects);
    } else {
        console.warn('No projects data found for slider');
    }
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const body = document.body;

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        body.classList.toggle('menu-open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            body.classList.remove('menu-open');
        });
    });
}