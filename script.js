const toggle = document.getElementById('themeToggle');
const stored = localStorage.getItem('theme');
document.body.setAttribute('data-theme', stored || 'dark');

toggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// --- New: contact cleanup + PDF download button + dynamic html2pdf loader ---
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
.pdf-theme .contact-card,
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

  // Add "Download PDF" button to header actions if present
  const actions = document.querySelector('.actions');
  if (actions && !document.getElementById('downloadPdfBtn')) {
    const btn = document.createElement('button');
    btn.id = 'downloadPdfBtn';
    btn.className = 'btn primary';
    btn.type = 'button';
    btn.textContent = 'Download PDF';
    actions.appendChild(btn);

    btn.addEventListener('click', async () => {
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

  // Contact section cleanup: remove descriptions and keep only Gmail contact
  const contact = document.getElementById('contact') || document.querySelector('[id="contact"]');
  if (contact) {
    // Remove descriptive paragraphs or small description blocks
    const desc = contact.querySelector('.description, .contact-description, p');
    if (desc) desc.remove();

    // Collect candidate contact nodes (broad selector to cover multiple markup styles)
    const candidates = Array.from(contact.querySelectorAll('.card, .contact-card, .contact-item, li, a, div'));

    // Find a node that already contains a gmail address
    let gmailNode = candidates.find(c => /gmail|@gmail\.com/i.test(c.textContent));
    if (!gmailNode) {
      // fallback: any node with an email-like pattern
      gmailNode = candidates.find(c => /@/.test(c.textContent));
    }

    // Hide/comment other nodes visually (keeps source intact but hides from view)
    candidates.forEach(c => {
      if (c !== gmailNode) {
        c.style.display = 'none';
        c.setAttribute('data-commented', 'true');
      }
    });

    // Ensure the Gmail node contains the requested email and is a mailto link
    if (gmailNode) {
      // replace any existing email with the provided one
      gmailNode.innerHTML = gmailNode.innerHTML.replace(/([\w.+-]+@[\w-]+\.[\w.-]+)/g, 'giridharan.sai@gmail.com');
      if (!/giridharan\.sai@gmail\.com/i.test(gmailNode.textContent)) {
        gmailNode.innerHTML = '<a href="mailto:giridharan.sai@gmail.com">giridharan.sai@gmail.com</a>';
      } else {
        const a = gmailNode.querySelector('a') || gmailNode;
        if (a.tagName !== 'A') {
          const link = document.createElement('a');
          link.href = 'mailto:giridharan.sai@gmail.com';
          link.textContent = 'giridharan.sai@gmail.com';
          gmailNode.innerHTML = '';
          gmailNode.appendChild(link);
        } else {
          a.href = 'mailto:giridharan.sai@gmail.com';
        }
      }
    } else {
      // If no candidate found, create a simple contact entry
      const div = document.createElement('div');
      div.className = 'contact-card';
      div.innerHTML = '<a href="mailto:giridharan.sai@gmail.com">giridharan.sai@gmail.com</a>';
      contact.appendChild(div);
    }
  }
});
