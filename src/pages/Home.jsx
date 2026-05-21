import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import ProjectCard from '../components/ProjectCard';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const sliderRef = useRef(null);
  const currentRef = useRef(0);

  useEffect(() => { api('/projects').then(setProjects).catch(() => {}); }, []);

  useEffect(() => {
    if (!projects.length) return;
    const slides = [];
    for (let i = 0; i < projects.length; i += 3) slides.push(projects.slice(i, i + 3));
    const slider = sliderRef.current;
    if (!slider) return;
    slider.innerHTML = '';
    slides.forEach(slide => {
      const div = document.createElement('div');
      div.className = 'project-slide';
      div.innerHTML = slide.map(p => {
        const tags = (p.contributorDetails || []).map(c =>
          `<div class="project-tag">${c.member_slug.charAt(0).toUpperCase() + c.member_slug.slice(1)}: ${c.tag}</div>`
        ).join('');
        return `<div class="project-card"><h3>${p.name}</h3><div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin:0.5rem 0">${tags}</div><p>${p.description}</p></div>`;
      }).join('');
      slider.appendChild(div);
    });

    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    const update = () => { slider.style.transform = `translateX(-${currentRef.current * 100}%)`; };
    prev.onclick = () => { if (currentRef.current > 0) { currentRef.current--; update(); } };
    next.onclick = () => { if (currentRef.current < slides.length - 1) { currentRef.current++; update(); } };
  }, [projects]);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="badge">// intentional development</span>
          <h1>quiet, reliable<br />infrastructure.</h1>
          <p>Systems administration, automation, and full‑stack development &ndash; delivered with clarity and care.</p>
          <div className="hero-actions">
            <a href="#contact" className="btn primary">start a conversation &rarr;</a>
            <a href="#services" className="btn secondary">explore services</a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-number">6+</span><span className="stat-label">years collective experience</span></div>
          <div className="stat"><span className="stat-number">24/7</span><span className="stat-label">support &amp; monitoring</span></div>
        </div>
      </section>

      <section id="services" className="services">
        <h2>what we do</h2>
        <div className="services-grid">
          <ServiceCard icon="fa-terminal" title="Systems Administration" desc="Linux, Windows, Networking, Security, Automation, Monitoring, Troubleshooting" />
          <ServiceCard icon="fa-cubes" title="Pterodactyl Framework" desc="Wings, Node Balancing, Custom Addons, Custom Wings, Troubleshooting" />
          <ServiceCard icon="fab fa-node" title="NodeJS" desc="Discord.js, Express, Socket.io, routing-controllers, TypeScript" />
          <ServiceCard icon="fa-users" title="Human Resources" desc="Hiring, Training, Team Management, Conflict Resolution, Performance Management" />
          <ServiceCard icon="fa-headset" title="Customer Service" desc="Communication, Problem Solving, Empathy, Active Listening, Conflict Resolution" />
        </div>
      </section>

      <section id="projects" className="projects">
        <h2>recent projects</h2>
        <div className="projects-slider-container">
          <button className="slider-btn prev" id="prevBtn"><i className="fas fa-chevron-left" /></button>
          <div className="projects-slider" ref={sliderRef} />
          <button className="slider-btn next" id="nextBtn"><i className="fas fa-chevron-right" /></button>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="contact-card">
          <h2>join our community</h2>
          <p>Connect with us on Discord for support, updates, and collaboration.</p>
          <div className="discord-widget">
            <iframe src="https://discord.com/widget?id=1346553722611695637&theme=dark" width="350" height="500" allowtransparency="true" frameBorder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" />
          </div>
        </div>
      </section>
    </>
  );
}

function ServiceCard({ icon, title, desc }) {
  return (
    <div className="service-card">
      <i className={`fas ${icon} service-icon`} />
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
