document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const navHeight = document.getElementById('nav').offsetHeight;
            const offset = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;

            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const navLinks = document.getElementById('navLinks');
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    });

    const downloadBtn = document.querySelector('a[data-en="Download One-Pager"]');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Option 1: Direct download from your repository
            // Place your PDF file in a 'documents' folder in your project
            const pdfUrl = '../TerraGuardLand/TerraGuardOnePager.pdf';
            
            // Option 2: Download from external URL (if hosted elsewhere)
            // const pdfUrl = 'https://yourdomain.com/path/to/terraguard-one-pager.pdf';
            
            // Create temporary link element for download
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'TerraGuard-One-Pager.pdf'; // This will be the downloaded filename
            link.style.display = 'none';
            
            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Optional: Track download event (for analytics)
            console.log('PDF download initiated');
            
            // Optional: Show success message
            showDownloadMessage();
        });
    }
    
    // Function to show download message
    function showDownloadMessage() {
        // Create a temporary message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: 'Roboto', sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: opacity 0.3s ease;
        `;
        
        // Set message text based on current language
        const currentLang = document.documentElement.getAttribute('lang') || 'en';
        message.textContent = currentLang === 'ka' 
            ? 'ფაილის ჩამოტვირთვა დაიწყო...' 
            : 'Download started...';
        
        document.body.appendChild(message);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(message)) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 3000);
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Navbar shrink on scroll
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    });

    // Back to top button visibility
    const backToTopButton = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Language toggle functionality
    const languageToggle = document.getElementById('languageToggle');
    const translatableElements = document.querySelectorAll('[data-en], [data-ka]');

    // Set initial language (English by default)
    let currentLang = 'en';
    updateTextContent(currentLang);

    languageToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'ka' : 'en';
        languageToggle.textContent = currentLang === 'en' ? 'EN' : 'ქარ';
        
        // Update HTML lang attribute for proper font rendering
        document.documentElement.setAttribute('lang', currentLang);
        
        // Add language-specific class to body for CSS targeting
        document.body.className = document.body.className.replace(/lang-\w+/g, '');
        document.body.classList.add(`lang-${currentLang}`);
        
        updateTextContent(currentLang);
    });

    function updateTextContent(lang) {
        translatableElements.forEach(element => {
            if (element.tagName === 'META' && element.getAttribute('name') === 'description') {
                 element.setAttribute('content', element.getAttribute('data-' + lang + '-description'));
            } else if (element.tagName === 'TITLE') {
                 element.textContent = element.getAttribute('data-' + lang);
            }
             else if (element.classList.contains('section-title')) {
                // Handle special case for the title with colored spans
                const enText = element.getAttribute('data-en');
                const kaText = element.getAttribute('data-ka');
                if (element.innerHTML.includes('<span class="dusk-gold">') || element.innerHTML.includes('<span class="infra-green">')) {
                     if (lang === 'en') {
                        element.innerHTML = `<span class="dusk-gold">19x</span> More Coverage. <span class="infra-green">5x</span> Less Cost.`;
                     } else {
                         element.innerHTML = `<span class="dusk-gold">19x</span> მეტი დაფარვა. <span class="infra-green">5x</span> ნაკლები ხარჯი.`;
                     }
                } else {
                    element.textContent = element.getAttribute('data-' + lang);
                }

            }
             else if (element.classList.contains('lang-text')) {
                const enText = element.getAttribute('data-en');
                const kaText = element.getAttribute('data-ka');

                // Handle the Hero h1 specifically to maintain structure
                if (element.tagName === 'H1') {
                     if (lang === 'en') {
                         element.innerHTML = `<span>Eyes in the Sky</span><span>Safety on the Ground</span>`;
                     } else {
                          element.innerHTML = `<span>თვალები ცაში</span><span>დაცულობა მიწაზე</span>`;
                     }
                } else {
                    element.textContent = element.getAttribute('data-' + lang);
                }

            } else {
                element.textContent = element.getAttribute('data-' + lang);
            }
        });
    }

    // Intersection Observer for animations
    const animateElements = document.querySelectorAll('.animate');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('slide-up')) {
                    entry.target.classList.add('slide-up');
                } else if (entry.target.classList.contains('slide-left')) {
                    entry.target.classList.add('slide-left');
                } else if (entry.target.classList.contains('slide-right')) {
                    entry.target.classList.add('slide-right');
                } else {
                    entry.target.classList.add('fade-in');
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => observer.observe(el));
});