const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.endsWith('.jsx')) results.push(file);
          next();
        }
      });
    })();
  });
};

walk('c:/Users/sneha/OneDrive/Desktop/6Month/cdac-examweb/frontend/src', (err, files) => {
  if (err) throw err;
  
  const replacements = [
    { regex: /'#faf8ff'/g, replacement: "'var(--cdac-bg)'" },
    { regex: /"#faf8ff"/g, replacement: "'var(--cdac-bg)'" },
    { regex: /'#f9f9ff'/g, replacement: "'var(--cdac-bg)'" },
    { regex: /'#f8fafc'/g, replacement: "'var(--cdac-bg)'" },
    { regex: /'#f3eeff'/g, replacement: "'var(--cdac-surface-alt)'" },
    { regex: /'#ece6fb'/g, replacement: "'var(--cdac-border)'" },
    { regex: /'#2a2440'/g, replacement: "'var(--cdac-text)'" },
    { regex: /'#6b6786'/g, replacement: "'var(--cdac-text-muted)'" },
    { regex: /'#0f172a'/g, replacement: "'var(--cdac-text)'" },
    { regex: /'#64748b'/g, replacement: "'var(--cdac-text-muted)'" },
    { regex: /'#475569'/g, replacement: "'var(--cdac-text-muted)'" },
    { regex: /'#e2e8f0'/g, replacement: "'var(--cdac-border)'" },
    { regex: /backgroundColor:\s*'#ffffff'/gi, replacement: "backgroundColor: 'var(--cdac-surface)'" },
    { regex: /background:\s*'#ffffff'/gi, replacement: "background: 'var(--cdac-surface)'" },
  ];

  let modified = 0;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      modified++;
    }
  });
  console.log(`Updated ${modified} files.`);
});
