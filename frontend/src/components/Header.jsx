import React, { useState, useEffect } from 'react';
import { Container, Form, Button, InputGroup } from 'react-bootstrap';
import { Sun, Moon, Search } from 'lucide-react';

const T = { primary: '#7c5cff', primaryDeep: '#6a41e6', accent: '#a78bfa' };

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    if (document.cookie.includes('googtrans=/en/hi') || document.cookie.includes('googtrans=/auto/hi')) {
      setLang('hi');
    }
  }, []);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    if (selectedLang === 'hi') {
      document.cookie = 'googtrans=/en/hi; path=/';
      document.cookie = `googtrans=/en/hi; path=/; domain=${window.location.hostname}`;
    } else {
      document.cookie = 'googtrans=/en/en; path=/';
      document.cookie = `googtrans=/en/en; path=/; domain=${window.location.hostname}`;
    }
    
    // Trigger Google Translate without reload
    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
      googleSelect.value = selectedLang === 'en' ? 'en' : 'hi';
      googleSelect.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
  };

  const handleSearch = () => {
    if (searchQuery) window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  return (
    <div className="py-2"
      style={{ background: `linear-gradient(90deg, ${T.primary} 0%, ${T.accent} 50%, ${T.primaryDeep} 100%)`, color: '#fff' }}>
      <Container fluid className="px-4 px-md-5">
        <div className="d-flex align-items-center justify-content-between" style={{ flexWrap: 'nowrap', gap: 12 }}>
          <h6 className="mb-0 fw-semibold" style={{ letterSpacing: 0.3 }}>
            Welcome to <span style={{ fontWeight: 800 }}>CDAC ExamWeb</span>
          </h6>

          <div className="d-flex align-items-center" style={{ flexWrap: 'nowrap', gap: 12, flexShrink: 0 }}>
            <Form.Select size="sm" className="w-auto" value={lang} onChange={handleLanguageChange}
              style={{ border: 'none', borderRadius: 8, fontWeight: 600 }}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </Form.Select>
            <Button size="sm" onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-1 rounded-circle d-flex align-items-center justify-content-center border-0"
              style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            <InputGroup size="sm" style={{ maxWidth: 260 }}>
              <Form.Control placeholder="Search…" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ border: 'none', borderRadius: '8px 0 0 8px' }} />
              <Button onClick={handleSearch} className="border-0 d-flex align-items-center gap-1"
                style={{ background: 'var(--cdac-surface)', color: T.primaryDeep, borderRadius: '0 8px 8px 0', fontWeight: 600 }}>
                <Search size={14} /> Search
              </Button>
            </InputGroup>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Header;
