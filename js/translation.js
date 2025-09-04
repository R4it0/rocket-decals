document.addEventListener('DOMContentLoaded', () => {
    const toggleLangBtn = document.getElementById('toggleLangBtn');

    // Vérifie si une langue est déjà stockée dans le localStorage
    let currentLang = localStorage.getItem('preferredLanguage') || 'fr'; // Par défaut, 'fr'

    // Appliquer la langue stockée ou par défaut (re-sélectionne les éléments à chaque fois)
    function applyLanguage(lang) {
        // Met à jour l'attribut lang du document pour que les autres scripts puissent réagir
        if (document && document.documentElement) {
            document.documentElement.setAttribute('lang', lang);
        }

        // Requête dynamique afin d'inclure les éléments injectés (ex: contenu du modal)
        const elementsToTranslate = document.querySelectorAll('.lang');
        elementsToTranslate.forEach(element => {
            const langText = element.getAttribute(`data-lang-${lang}`);
            if (langText !== null && langText !== undefined) {
                element.textContent = langText;
            }
        });

        if (toggleLangBtn) {
            toggleLangBtn.innerText = lang === 'fr' ? 'EN' : 'FR';
        }
    }

    // Expose une fonction globale optionnelle pour appliquer la langue à la demande
    window.applyLanguageGlobally = applyLanguage;

    // Applique la langue dès le chargement de la page
    applyLanguage(currentLang);

    if (toggleLangBtn) {
        toggleLangBtn.addEventListener('click', () => {
            // Alterner entre 'fr' et 'en'
            currentLang = currentLang === 'fr' ? 'en' : 'fr';
            applyLanguage(currentLang);

            // Stocker la langue choisie dans le localStorage
            localStorage.setItem('preferredLanguage', currentLang);
        });
    }
});