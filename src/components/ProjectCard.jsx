export default function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <h3>{project.name}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.5rem 0' }}>
        {(project.contributorDetails || []).map((c, i) => (
          <div className="project-tag" key={i}>
            {c.member_slug.charAt(0).toUpperCase() + c.member_slug.slice(1)}: {c.tag}
          </div>
        ))}
      </div>
      <p>{project.description}</p>
    </div>
  );
}
