function e(s){if(!s)return'';return s.replace(/[&<>]/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;' })[m])}

async function api(path){const r=await fetch('/api'+path);if(!r.ok)throw new Error('API error: '+r.status);return r.json()}

function renderProjectCards(projects){
  return projects.map(p=>`
    <div class="project-card">
      <h3>${e(p.name)}</h3>
      <div style="display:flex;flex-wrap:wrap;gap:.3rem;margin:.5rem 0">
        ${(p.contributorDetails||[]).map(c=>`<div class="project-tag">${e(c.member_slug.charAt(0).toUpperCase()+c.member_slug.slice(1))}: ${e(c.tag)}</div>`).join('')}
      </div>
      <p>${e(p.description)}</p>
    </div>
  `).join('')
}

function initSlider(projectsData){
  const slider=document.getElementById('projectsSlider');
  if(!slider)return;
  const slides=[];
  for(let i=0;i<projectsData.length;i+=3)slides.push(projectsData.slice(i,i+3));
  slider.innerHTML=slides.map(s=>'<div class="project-slide">'+renderProjectCards(s)+'</div>').join('');
  let current=0;
  const prev=document.getElementById('prevBtn'),next=document.getElementById('nextBtn');
  function update(){slider.style.transform='translateX(-'+current*100+'%)'}
  if(prev)prev.onclick=()=>{if(current>0){current--;update()}};
  if(next)next.onclick=()=>{if(current<slides.length-1){current++;update()}};
}

async function renderHome(){
  const main=document.getElementById('page-content');
  if(!main)return;
  main.innerHTML=`
<section class="hero">
  <div class="hero-content">
    <span class="badge">// intentional development</span>
    <h1>quiet, reliable<br>infrastructure.</h1>
    <p>Systems administration, automation, and full‑stack development – delivered with clarity and care.</p>
    <div class="hero-actions">
      <a href="#contact" class="btn primary">start a conversation →</a>
      <a href="#services" class="btn secondary">explore services</a>
    </div>
  </div>
  <div class="hero-stats">
    <div class="stat"><span class="stat-number">6+</span><span class="stat-label">years collective experience</span></div>
    <div class="stat"><span class="stat-number">24/7</span><span class="stat-label">support & monitoring</span></div>
  </div>
</section>
<section id="services" class="services">
  <h2>what we do</h2>
  <div class="services-grid">
    <div class="service-card"><i class="fas fa-terminal service-icon"></i><h3>Systems Administration</h3><p>Linux, Windows, Networking, Security, Automation, Monitoring, Troubleshooting</p></div>
    <div class="service-card"><i class="fas fa-cubes service-icon"></i><h3>Pterodactyl Framework</h3><p>Wings, Node Balancing, Custom Addons, Custom Wings, Troubleshooting</p></div>
    <div class="service-card"><i class="fab fa-node service-icon"></i><h3>NodeJS</h3><p>Discord.js, Express, Socket.io, routing-controllers, TypeScript</p></div>
    <div class="service-card"><i class="fas fa-users service-icon"></i><h3>Human Resources</h3><p>Hiring, Training, Team Management, Conflict Resolution, Performance Management</p></div>
    <div class="service-card"><i class="fas fa-headset service-icon"></i><h3>Customer Service</h3><p>Communication, Problem Solving, Empathy, Active Listening, Conflict Resolution</p></div>
  </div>
</section>
<section id="projects" class="projects">
  <h2>recent projects</h2>
  <div class="projects-slider-container">
    <button class="slider-btn prev" id="prevBtn"><i class="fas fa-chevron-left"></i></button>
    <div class="projects-slider" id="projectsSlider"></div>
    <button class="slider-btn next" id="nextBtn"><i class="fas fa-chevron-right"></i></button>
  </div>
</section>
<section id="contact" class="contact">
  <div class="contact-card">
    <h2>join our community</h2>
    <p>Connect with us on Discord for support, updates, and collaboration.</p>
    <div class="discord-widget">
      <iframe src="https://discord.com/widget?id=1346553722611695637&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
    </div>
  </div>
</section>`;
  try{
    const projects=await api('/projects');
    initSlider(projects);
  }catch(err){console.warn('Could not load projects',err)}
}

async function renderPortfolio(){
  const main=document.getElementById('page-content');
  if(!main)return;
  main.innerHTML=`
<section class="hero" style="margin-bottom:0">
  <div class="hero-content">
    <span class="badge">// meet the team</span>
    <h1>portfolio &<br>resumes.</h1>
    <p>Get to know the people behind the code – their skills, experience, and projects.</p>
  </div>
</section>
<div class="portfolio-grid" id="portfolioGrid"></div>`;
  try{
    const members=await api('/members');
    const grid=document.getElementById('portfolioGrid');
    grid.innerHTML=members.map(m=>`
      <div class="portfolio-card">
        <div class="portfolio-icon"><i class="fas ${m.slug==='kaido'?'fa-terminal':m.slug==='cams'?'fa-users':'fa-user'}"></i></div>
        <h2>${e(m.name)}</h2>
        <p>${e(m.role||'')}</p>
        <p>${e((m.bio||'').substring(0,120))}...</p>
        <a href="/${e(m.slug)}" class="portfolio-link">view resume →</a>
      </div>
    `).join('');
  }catch(err){console.warn('Could not load portfolio',err)}
}

async function renderProjects(){
  const main=document.getElementById('page-content');
  if(!main)return;
  main.innerHTML=`
<section class="hero" style="margin-bottom:0">
  <div class="hero-content">
    <span class="badge">// our work</span>
    <h1>projects.</h1>
    <p>A selection of the things we've built, together and individually.</p>
  </div>
</section>
<div class="projects-grid" id="projectsGrid"></div>`;
  try{
    const projects=await api('/projects');
    const grid=document.getElementById('projectsGrid');
    grid.innerHTML=renderProjectCards(projects);
  }catch(err){console.warn('Could not load projects',err)}
}

async function renderMember(slug){
  const main=document.getElementById('member-content');
  if(!main)return;
  try{
    const data=await api('/member/'+slug);
    const m=data.member;
    const projects=data.projects;
    document.title=m.name+' · Alcove';
    main.innerHTML=`
<section class="hero">
  <div class="hero-content">
    <span class="badge">// ${e(m.role||'')}</span>
    <h1>${e(m.name)}</h1>
    <p>${e(m.bio||'')}</p>
  </div>
  <div class="hero-stats">
    <div class="stat"><span class="stat-number">${m.experience_years||'5+'}</span><span class="stat-label">years experience</span></div>
    <div class="stat"><span class="stat-number">Skills</span><span class="stat-label">expertise</span></div>
  </div>
</section>
<div class="resume-section">
  <h2>about me</h2>
  <p>${e(m.bio||'')}</p>
</div>
<hr>
<div class="resume-section">
  <h2>core competencies</h2>
  <div class="grid-2col">
    ${(m.skills||[]).map(s=>`
      <div class="skill-item">
        <span class="skill-name">${e(s.name)}</span>
        <div class="skill-bar"><div class="skill-progress" style="width:${s.percent||0}%"></div></div>
        ${(s.tags||[]).length?'<div class="skill-tags">'+s.tags.map(t=>'<span class="tag">'+e(t)+'</span>').join('')+'</div>':''}
      </div>
    `).join('')}
  </div>
</div>
${(m.certifications||[]).length?`
<div class="resume-section">
  <h2>certifications</h2>
  <div class="skill-tags">${m.certifications.map(c=>'<span class="tag">'+e(c)+'</span>').join('')}</div>
</div>
<hr>
`:''}
<div class="resume-section">
  <h2>what I offer</h2>
  <div class="services-grid">
    ${(m.offerings||[]).map(o=>`
      <div class="service-card">
        <i class="fas fa-${e(o.icon||'server')} service-icon"></i>
        <h3>${e(o.title||'')}</h3>
        <p>${e(o.desc||'')}</p>
      </div>
    `).join('')}
  </div>
</div>
<hr>
<div class="resume-section">
  <h2>portfolio</h2>
  <div class="projects-grid">
    ${projects.length?renderProjectCards(projects):'<p>No projects yet.</p>'}
  </div>
</div>
<hr>
<div class="contact-card" style="margin-top:0">
  <h2>get in touch</h2>
  <p>Feel free to reach out for collaborations or opportunities.</p>
  <div class="contact-links">
    ${m.email?'<a href="mailto:'+e(m.email)+'"><i class="fas fa-envelope"></i> '+e(m.email)+'</a>':''}
    ${m.discord?'<a href="'+e(m.discord)+'" target="_blank"><i class="fab fa-discord"></i> Discord</a>':''}
  </div>
</div>`;
  }catch(err){console.warn('Could not load member',err)}
}

(function(){
  const path=window.location.pathname;
  // Set active nav link
  if(path==='/')document.querySelector('.nav-home')?.classList.add('active');
  if(path==='/portfolio')document.querySelector('.nav-portfolio')?.classList.add('active');
  if(path==='/projects')document.querySelector('.nav-projects')?.classList.add('active');

  if(document.getElementById('member-content')){
    const slug=window.MEMBER_SLUG;
    if(slug)renderMember(slug);
    return;
  }

  if(path==='/'){renderHome();return}
  if(path==='/portfolio'){renderPortfolio();return}
  if(path==='/projects'){renderProjects();return}
  renderHome(); // fallback
})();

// Mobile menu
document.addEventListener('DOMContentLoaded',function(){
  const toggle=document.querySelector('.menu-toggle');
  const links=document.querySelector('.nav-links');
  if(toggle&&links){
    toggle.addEventListener('click',()=>{links.classList.toggle('active');document.body.classList.toggle('menu-open')});
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('active');document.body.classList.remove('menu-open')}));
  }
});
