document.addEventListener('DOMContentLoaded', () => {
    // Language Toggle Logic
    const langBtn = document.getElementById('lang-toggle');
    const langOpts = langBtn.querySelectorAll('.lang-opt');

    langBtn.addEventListener('click', (e) => {
        if (e.target.classList.contains('lang-opt')) {
            // Update active state on buttons
            langOpts.forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');

            // Update body data attribute to toggle CSS display rules
            const targetLang = e.target.getAttribute('data-target');
            document.body.setAttribute('data-lang', targetLang);
        }
    });

    // Optional: Add smooth scrolling for browsers that don't support it natively
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if(href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
