const toggle = document.getElementById('themeToggle');
const stored = localStorage.getItem('theme');
document.body.setAttribute('data-theme', stored || 'dark');

toggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// --- New: PDF download button + dynamic html2pdf loader ---
function loadScript(src){
  return new Promise(resolve => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

function injectPdfStyles(){
  const css = `
.pdf-theme {
  background: #ffffff !important;
  color: #0f172a !important;
  -webkit-print-color-adjust: exact;
}
.pdf-theme .bg-orb,
.pdf-theme .nav .orb,
.pdf-theme .orb-1,
.pdf-theme .orb-2,
.pdf-theme .actions .btn.print-only {
  display: none !important;
}
.pdf-theme .container {
  width: 180mm;
  max-width: 180mm;
  margin: 0 auto;
  padding: 12mm 12mm;
  background: transparent !important;
  box-shadow: none !important;
}
.pdf-theme .card,
.pdf-theme .hero-grid > * {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  color: inherit !important;
}
.pdf-theme a { color: #0645ad !important; text-decoration: underline; }
.pdf-theme body {
  font-size: 11pt;
  line-height: 1.3;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
.pdf-theme .page-break { page-break-before: always; }
@media print {
  body { background: #fff !important; color: #0f172a !important; }
  .bg-orb, .orb-1, .orb-2, .nav { display: none !important; }
  .container { width: auto !important; padding: 8mm !important; }
}
  `;
  const style = document.createElement('style');
  style.type = 'text/css';
  style.id = 'pdf-theme-styles';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
  injectPdfStyles();

  // Download PDF button functionality
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', async () => {
      if (typeof html2pdf === 'undefined') {
        // load html2pdf bundle from CDN
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js');
      }

      // apply PDF-friendly class (overrides in CSS)
      document.body.classList.add('pdf-theme');

      const element = document.querySelector('main') || document.body;
      const opt = {
        margin: 12,
        filename: 'Saigiridharan_Portfolio.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // generate and save PDF, then remove the pdf-theme class
      try {
        await html2pdf().set(opt).from(element).save();
      } catch (e) {
        // fallback to window.print if html2pdf fails
        window.print();
      } finally {
        // small timeout to ensure the library finishes using the DOM
        setTimeout(() => document.body.classList.remove('pdf-theme'), 500);
      }
    });
  }
});
