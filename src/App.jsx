import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Projects from './pages/Projects';
import Member from './pages/Member';
import AdminApp from './admin/AdminApp';

export default function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<PublicLayout />} />
      </Routes>
    </div>
  );
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/:slug" element={<Member />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <a href="/admin" className="admin-badge">
        <i className="fas fa-lock" /> admin
      </a>
    </>
  );
}

function NotFound() {
  return (
    <section className="hero" style={{ textAlign: 'center', margin: '4rem 0' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <a href="/" className="btn primary">Go home →</a>
    </section>
  );
}
