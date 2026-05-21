import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Portfolio() {
  const [members, setMembers] = useState([]);

  useEffect(() => { api('/members').then(setMembers).catch(() => {}); }, []);

  return (
    <>
      <section className="hero" style={{ marginBottom: 0 }}>
        <div className="hero-content">
          <span className="badge">// meet the team</span>
          <h1>portfolio &amp;<br />resumes.</h1>
          <p>Get to know the people behind the code &ndash; their skills, experience, and projects.</p>
        </div>
      </section>
      <div className="portfolio-grid">
        {members.map(m => (
          <div className="portfolio-card" key={m.id}>
            <div className="portfolio-icon">
              <i className={`fas ${m.slug === 'kaido' ? 'fa-terminal' : m.slug === 'cams' ? 'fa-users' : 'fa-user'}`} />
            </div>
            <h2>{m.name}</h2>
            <p>{m.role}</p>
            <p>{(m.bio || '').substring(0, 120)}...</p>
            <Link to={`/${m.slug}`} className="portfolio-link">view resume &rarr;</Link>
          </div>
        ))}
      </div>
    </>
  );
}
