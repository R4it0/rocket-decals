document.addEventListener('DOMContentLoaded', () => {
    const toggleLangBtn = document.getElementById('toggleLangBtn');
    const elementsToTranslate = document.querySelectorAll('.lang');
    
    // Vérifie si une langue est déjà stockée dans le localStorage
    let currentLang = localStorage.getItem('preferredLanguage') || 'fr'; // Par défaut, 'fr'

    // Appliquer la langue stockée ou par défaut
    function applyLanguage(lang) {
        elementsToTranslate.forEach(element => {
            const langText = element.getAttribute(`data-lang-${lang}`);
            if (langText) {
                element.textContent = langText;
            }
        });
        toggleLangBtn.innerText = lang === 'fr' ? 'EN' : 'FR'; // Mettre à jour le bouton
    }

    // Applique la langue dès le chargement de la page
    applyLanguage(currentLang);

    toggleLangBtn.addEventListener('click', () => {
        // Alterner entre 'fr' et 'en'
        currentLang = currentLang === 'fr' ? 'en' : 'fr';
        applyLanguage(currentLang);

        // Stocker la langue choisie dans le localStorage
        localStorage.setItem('preferredLanguage', currentLang);
    });
});