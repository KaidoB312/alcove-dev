import { useState, useEffect } from 'react';
import { api } from '../api';
import ProjectCard from '../components/ProjectCard';

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => { api('/projects').then(setProjects).catch(() => {}); }, []);

  return (
    <>
      <section className="hero" style={{ marginBottom: 0 }}>
        <div className="hero-content">
          <span className="badge">// our work</span>
          <h1>projects.</h1>
          <p>A selection of the things we've built, together and individually.</p>
        </div>
      </section>
      <div className="projects-grid">
        {projects.length > 0
          ? projects.map(p => <ProjectCard project={p} key={p.id} />)
          : <p>No projects yet.</p>
        }
      </div>
    </>
  );
}
