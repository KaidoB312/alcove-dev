import { Link, NavLink } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Navbar() {
  const toggleRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    const toggle = toggleRef.current;
    const links = linksRef.current;
    if (!toggle || !links) return;
    const handler = () => {
      links.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    };
    toggle.addEventListener('click', handler);
    return () => toggle.removeEventListener('click', handler);
  }, []);

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="mono">[</span> The Alcove <span className="mono">]</span>
      </div>
      <button className="menu-toggle" aria-label="Toggle navigation" ref={toggleRef}>
        <span /><span /><span />
      </button>
      <div className="nav-links" ref={linksRef}>
        <NavLink to="/" end>home</NavLink>
        <NavLink to="/portfolio">portfolio</NavLink>
        <NavLink to="/projects">projects</NavLink>
        <a href="/#contact">contact</a>
      </div>
      <DarkModeToggle />
    </nav>
  );
}

function DarkModeToggle() {
  useEffect(() => {
    const el = document.getElementById('darkModeToggle');
    if (!el) return;
    const saved = localStorage.getItem('darkMode');
    if (saved === 'enabled') setDark(true);
    else if (saved === 'disabled') setDark(false);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setDark(true);
    el.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      setDark(!isDark);
    });
    function setDark(on) {
      if (on) {
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
        el.innerHTML = '<i class="fas fa-sun"></i>';
      } else {
        document.body.classList.remove('dark');
        localStorage.setItem('darkMode', 'disabled');
        el.innerHTML = '<i class="fas fa-moon"></i>';
      }
    }
  }, []);

  return <button id="darkModeToggle" className="dark-mode-toggle" aria-label="Toggle dark mode" />;
}
