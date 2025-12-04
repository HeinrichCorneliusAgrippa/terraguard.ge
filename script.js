    
        document.addEventListener('DOMContentLoaded', function() {
            // Scroll animation observer
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);

            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
                observer.observe(section);
            });
            
            // Smooth scroll for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // Blog data (newest first)
            const blogPosts = [
                {
                    id: 1,
                    title: "GIST Accelerator Journey Successfully Completed",
                    excerpt: "We have completed the GIST acceleration program. The experience challenged us, revealed new opportunities, and helped us refine our team's mission. We are grateful to VentureWell and the mentors who supported us throughout the journey. We are ready for the next chapter.",
                    image: "gist-accelerator.jpg",
                    date: "March 2024"
                },
                {
                    id: 2,
                    title: "Showcasing TerraGuard at DataFest Tbilisi",
                    excerpt: "Great atmosphere at DataFest Tbilisi, where TerraGuard showcased its vineyard analytics technology and connected with startups, mentors, and innovators. The event helped us exchange ideas, explore collaborations, and gain insights for scaling. We're excited for what's next.",
                    image: "datafest-tbilisi.jpg",
                    date: "February 2024"
                },
                // Add more blog posts here as needed
                // Example third post:
                // {
                //     id: 3,
                //     title: "New Partnership Announcement",
                //     excerpt: "We're excited to announce our new partnership with leading vineyard technology providers.",
                //     image: "partnership.jpg",
                //     date: "January 2024"
                // }
            ];
            
            // Blog carousel functionality
            const blogGrid = document.getElementById('blog-grid');
            const carouselNav = document.getElementById('carousel-nav');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const carouselDots = document.getElementById('carousel-dots');
            const currentSlideSpan = document.getElementById('current-slide');
            const totalSlidesSpan = document.getElementById('total-slides');
            
            const postsPerPage = 2;
            let currentPage = 0;
            const totalPages = Math.ceil(blogPosts.length / postsPerPage);
            
            // Initialize blog display
            function initBlog() {
                totalSlidesSpan.textContent = totalPages;
                currentSlideSpan.textContent = currentPage + 1;
                
                // Show navigation only if we have more than 2 posts
                if (blogPosts.length > postsPerPage) {
                    carouselNav.style.display = 'flex';
                    createDots();
                    updateButtons();
                }
                
                displayBlogPosts();
            }
            
            // Create dots for navigation
            function createDots() {
                carouselDots.innerHTML = '';
                for (let i = 0; i < totalPages; i++) {
                    const dot = document.createElement('button');
                    dot.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
                    dot.setAttribute('data-page', i);
                    dot.addEventListener('click', () => {
                        currentPage = i;
                        displayBlogPosts();
                        updateButtons();
                        updateDots();
                        updateSlideCounter();
                    });
                    carouselDots.appendChild(dot);
                }
            }
            
            // Display blog posts for current page
            function displayBlogPosts() {
                blogGrid.innerHTML = '';
                
                const startIndex = currentPage * postsPerPage;
                const endIndex = Math.min(startIndex + postsPerPage, blogPosts.length);
                
                // Get posts for current page
                const postsToShow = blogPosts.slice(startIndex, endIndex);
                
                // Add posts to grid
                postsToShow.forEach(post => {
                    const blogPost = document.createElement('article');
                    blogPost.className = 'blog-post';
                    
                    blogPost.innerHTML = `
                        <div class="blog-image-container">
                            <img src="${post.image}" alt="${post.title}" class="blog-image">
                        </div>
                        <div class="blog-content">
                            <h3 class="blog-title">${post.title}</h3>
                            <p class="blog-excerpt">${post.excerpt}</p>
                        </div>
                    `;
                    
                    blogGrid.appendChild(blogPost);
                });
                
                // If we have only 1 post on the last page, center it
                if (postsToShow.length === 1 && blogPosts.length > 1) {
                    const blogPost = blogGrid.querySelector('.blog-post');
                    blogPost.style.gridColumn = '1 / -1';
                    blogPost.style.maxWidth = '600px';
                    blogPost.style.margin = '0 auto';
                }
            }
            
            // Update navigation buttons
            function updateButtons() {
                prevBtn.disabled = currentPage === 0;
                nextBtn.disabled = currentPage === totalPages - 1;
            }
            
            // Update dot indicators
            function updateDots() {
                const dots = carouselDots.querySelectorAll('.carousel-dot');
                dots.forEach((dot, index) => {
                    if (index === currentPage) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
            
            // Update slide counter
            function updateSlideCounter() {
                currentSlideSpan.textContent = currentPage + 1;
            }
            
            // Event listeners for navigation
            prevBtn.addEventListener('click', () => {
                if (currentPage > 0) {
                    currentPage--;
                    displayBlogPosts();
                    updateButtons();
                    updateDots();
                    updateSlideCounter();
                }
            });
            
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    displayBlogPosts();
                    updateButtons();
                    updateDots();
                    updateSlideCounter();
                }
            });
            
            // Auto-advance blog every 8 seconds
            let blogInterval;
            if (blogPosts.length > postsPerPage) {
                blogInterval = setInterval(() => {
                    if (currentPage < totalPages - 1) {
                        currentPage++;
                    } else {
                        currentPage = 0;
                    }
                    displayBlogPosts();
                    updateButtons();
                    updateDots();
                    updateSlideCounter();
                }, 8000);
                
                // Pause auto-advance on hover
                blogGrid.addEventListener('mouseenter', () => {
                    clearInterval(blogInterval);
                });
                
                blogGrid.addEventListener('mouseleave', () => {
                    blogInterval = setInterval(() => {
                        if (currentPage < totalPages - 1) {
                            currentPage++;
                        } else {
                            currentPage = 0;
                        }
                        displayBlogPosts();
                        updateButtons();
                        updateDots();
                        updateSlideCounter();
                    }, 8000);
                });
            }
            
            // Initialize blog
            initBlog();
        });
    
