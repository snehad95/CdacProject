import React, { useState, useEffect } from 'react';
import { Container, Form, Button, InputGroup } from 'react-bootstrap';
import { Sun, Moon } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Check if google translation cookie exists to set default selected
    if (document.cookie.includes('googtrans=/en/hi') || document.cookie.includes('googtrans=/auto/hi')) {
      setLang('hi');
    }
  }, []);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);

    if (selectedLang === 'hi') {
      document.cookie = "googtrans=/en/hi; path=/";
      document.cookie = "googtrans=/en/hi; path=/; domain=" + window.location.hostname;
    } else {
      document.cookie = "googtrans=/en/en; path=/";
      document.cookie = "googtrans=/en/en; path=/; domain=" + window.location.hostname;
    }
    window.location.reload();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
  };

  const handleSearch = () => {
    if (searchQuery) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="text-white py-2" style={{ backgroundColor: ' #a78bfa' }}>
      <Container fluid className="px-5 px-md-5">
        <div className="d-flex align-items-center justify-content-between" style={{ flexWrap: 'nowrap', gap: '12px' }}>
          {/* LEFT: Welcome text */}
          <h5 className="mb-0 fw-semibold">Welcome to CDAC ExamWeb</h5>

          {/* RIGHT: Language + Theme + Search — all on one line */}
          <div className="d-flex align-items-center" style={{ flexWrap: 'nowrap', gap: '17px', flexShrink: 0 }}>
            <Form.Select
              size="sm"
              className="w-auto d-inline-block"
              value={lang}
              onChange={handleLanguageChange}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </Form.Select>
            <Button
              size="sm"
              variant="outline-light"
              className="p-1 rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <InputGroup size="sm" style={{ maxWidth: '250px', marginRight: '-10px' }}>
              <Form.Control
                placeholder="Search..."
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                variant="light"
                id="button-addon2"
                onClick={handleSearch}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ backgroundColor: isHovered ? '#add8e6' : '', transition: 'background-color 0.2s' }}
              >
                Search
              </Button>
            </InputGroup>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Header;
