document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openContactBtn');
    const modal = document.getElementById('contactModal');
    const closeBtn = document.getElementById('closeContactModal');
    const form = document.getElementById('contactForm');

    function openModal() {
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        if (window.applyLanguageGlobally) {
            const lang = document.documentElement.getAttribute('lang') || 'fr';
            window.applyLanguageGlobally(lang);
        }
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('contactEmail');
            const subjectInput = document.getElementById('contactSubject');
            const messageInput = document.getElementById('contactMessage');

            const to = 'raitodesign3d@gmail.com';
            const subject = encodeURIComponent(subjectInput.value.trim());
            const bodyParts = [];
            if (emailInput.value.trim()) bodyParts.push(`From: ${emailInput.value.trim()}`);
            if (messageInput.value.trim()) bodyParts.push(`\n\n${messageInput.value.trim()}`);
            const body = encodeURIComponent(bodyParts.join('\n'));

            const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;
            window.location.href = mailtoUrl;
            closeModal();
        });
    }
});


