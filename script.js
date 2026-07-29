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