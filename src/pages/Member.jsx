import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import ProjectCard from '../components/ProjectCard';

export default function Member() {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api(`/member/${slug}`).then(setData).catch(() => setData(null));
  }, [slug]);

  if (!data) return <div className="hero" style={{ textAlign: 'center', margin: '4rem 0' }}><h1>Loading...</h1></div>;

  const { member: m, projects } = data;
  if (!m) return <div className="hero" style={{ textAlign: 'center', margin: '4rem 0' }}><h1>404</h1><p>Member not found.</p></div>;

  document.title = `${m.name} \u00b7 Alcove`;

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="badge">// {m.role}</span>
          <h1>{m.name}</h1>
          <p>{m.bio}</p>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-number">{m.experience_years || '5+'}</span><span className="stat-label">years experience</span></div>
          <div className="stat"><span className="stat-number">Skills</span><span className="stat-label">expertise</span></div>
        </div>
      </section>

      <div className="resume-section">
        <h2>about me</h2>
        <p>{m.bio}</p>
      </div>
      <hr />

      <div className="resume-section">
        <h2>core competencies</h2>
        <div className="grid-2col">
          {(m.skills || []).map((s, i) => (
            <div className="skill-item" key={i}>
              <span className="skill-name">{s.name}</span>
              <div className="skill-bar">
                <div className="skill-progress" style={{ width: `${s.percent || 0}%` }} />
              </div>
              {(s.tags || []).length > 0 && (
                <div className="skill-tags">{s.tags.map((t, j) => <span className="tag" key={j}>{t}</span>)}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {(m.certifications || []).length > 0 && (
        <>
          <div className="resume-section">
            <h2>certifications</h2>
            <div className="skill-tags">{m.certifications.map((c, i) => <span className="tag" key={i}>{c}</span>)}</div>
          </div>
          <hr />
        </>
      )}

      <div className="resume-section">
        <h2>what I offer</h2>
        <div className="services-grid">
          {(m.offerings || []).map((o, i) => (
            <div className="service-card" key={i}>
              <i className={`fas fa-${o.icon || 'server'} service-icon`} />
              <h3>{o.title}</h3>
              <p>{o.desc || o.description || ''}</p>
            </div>
          ))}
        </div>
      </div>
      <hr />

      <div className="resume-section">
        <h2>portfolio</h2>
        <div className="projects-grid">
          {projects.length > 0
            ? projects.map(p => <ProjectCard project={p} key={p.id} />)
            : <p>No projects yet.</p>
          }
        </div>
      </div>
      <hr />

      <div className="contact-card" style={{ marginTop: 0 }}>
        <h2>get in touch</h2>
        <p>Feel free to reach out for collaborations or opportunities.</p>
        <div className="contact-links">
          {m.email && <a href={`mailto:${m.email}`}><i className="fas fa-envelope" /> {m.email}</a>}
          {m.discord && <a href={m.discord} target="_blank" rel="noreferrer"><i className="fab fa-discord" /> Discord</a>}
        </div>
      </div>
    </>
  );
}
