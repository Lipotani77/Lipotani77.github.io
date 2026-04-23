document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname.toLowerCase();
    const isGallery = path.includes("gallery");
    const isContact = path.includes("contact");

    highlightNav(isGallery, isContact);

    if (!isContact) {
        fetch("data.json")
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                if (isGallery) {
                    initGalleryPage(data);
                } else {
                    initLandingPage(data);
                }
            })
            .catch(err => console.error("Error loading portfolio data:", err));
    }
});

function highlightNav(isGallery, isContact) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href').toLowerCase();
        
        if (!isGallery && !isContact && href.includes('index')) {
            link.classList.add('active');
        } else if (isGallery && href.includes('gallery')) {
            link.classList.add('active');
        } else if (isContact && href.includes('contact')) {
            link.classList.add('active');
        }
    });
}

function initLandingPage(data) {
    // 1. RENDER FEATURED CATEGORIES GRID (Your existing logic)
    const featuredContainer = document.getElementById("featured-categories");
    if (featuredContainer) {
        const featuredGroups = data.categories.filter(cat => cat.featured);
        featuredGroups.forEach(category => {
            const card = document.createElement("a");
            card.href = `gallery.html?category=${category.id}`;
            card.className = "category-card";

            card.innerHTML = `
                <img src="${category.thumbnail}" alt="${category.name}" loading="lazy" />
                <div class="category-overlay">
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                </div>
            `;
            featuredContainer.appendChild(card);
        });
    }

    // 2. RENDER HERO CAROUSEL
    const track = document.getElementById("carousel-track");
    const dotsContainer = document.getElementById("carousel-dots");
    
    if (track && dotsContainer) {
        // Grab the first 5 photos from your JSON to feature in the carousel
        const carouselPhotos = data.photos.slice(0, 5); 

        // Build the slides and dots
        carouselPhotos.forEach((photo, index) => {
            // Create Image Slide container
            const slide = document.createElement("div");
            slide.className = "carousel-slide";
            
            // Create the image element manually so we can measure it
            const img = document.createElement("img");
            img.src = photo.url;
            img.alt = photo.alt || "Featured Portfolio Work";
            img.loading = "lazy";
            
            // The Magic Trick: Automatic Portrait Detection
            img.onload = function() {
                // If the natural width is less than the natural height, it's a portrait.
                if (this.naturalWidth < this.naturalHeight) {
                    this.style.objectFit = "contain";
                } else {
                    this.style.objectFit = "cover";
                    // Optional: You can still keep the focal point tweak for landscapes!
                    this.style.objectPosition = "center 15%"; 
                }
            };

            slide.appendChild(img);
            track.appendChild(slide);

            // Create Dot
            const dot = document.createElement("div");
            dot.className = `dot ${index === 0 ? "active" : ""}`;
            dot.addEventListener("click", () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        let currentSlide = 0;
        const maxSlide = carouselPhotos.length - 1;

        // Function to move the track
        function goToSlide(index) {
            currentSlide = index;
            // Slide the track sideways
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update which dot is solid
            Array.from(dotsContainer.children).forEach((dot, i) => {
                dot.classList.toggle("active", i === currentSlide);
            });
        }

        // Arrow Event Listeners
        document.querySelector(".carousel-arrow.prev").addEventListener("click", () => {
            currentSlide = currentSlide > 0 ? currentSlide - 1 : maxSlide;
            goToSlide(currentSlide);
        });

        document.querySelector(".carousel-arrow.next").addEventListener("click", () => {
            currentSlide = currentSlide < maxSlide ? currentSlide + 1 : 0;
            goToSlide(currentSlide);
        });
        
        // Optional: Auto-play the carousel every 5 seconds
        setInterval(() => {
            currentSlide = currentSlide < maxSlide ? currentSlide + 1 : 0;
            goToSlide(currentSlide);
        }, 5000);
    }
}

// --- NEW STATE VARIABLES FOR LIGHTBOX ---
let currentGalleryPhotos = [];
let currentPhotoIndex = 0;

function initGalleryPage(data) {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category");
    
    const galleryContainer = document.getElementById("masonry-gallery");
    const galleryTitle = document.getElementById("gallery-title");
    const galleryDesc = document.getElementById("gallery-description");

    if (!categoryId) {
        galleryTitle.textContent = "All Works";
        galleryDesc.textContent = "Browse our full portfolio.";
        currentGalleryPhotos = data.photos; // Save to global state
    } else {
        const category = data.categories.find(c => c.id === categoryId);
        if (category) {
            galleryTitle.textContent = category.name;
            galleryDesc.textContent = category.description;
        } else {
            galleryTitle.textContent = "Portfolio Collection";
            galleryDesc.textContent = "Viewing selected works.";
        }
        currentGalleryPhotos = data.photos.filter(p => p.categoryId === categoryId); // Save to global state
    }

    renderPhotos(currentGalleryPhotos, galleryContainer);
    setupLightbox(); // Initialize the lightbox event listeners
}

function renderPhotos(photos, container) {
    if (!container) return;
    container.innerHTML = ""; // Clear existing content
    
    if (photos.length === 0) {
        container.innerHTML = "<p style='color: var(--text-secondary); width: 100%; text-align: center;'>No photos matched.</p>";
        return;
    }

    photos.forEach((photo, index) => {
        const item = document.createElement("div");
        item.className = "masonry-item";
        
        const img = document.createElement("img");
        img.src = photo.url;
        img.alt = photo.alt || "Portfolio image";
        img.loading = "lazy";
        
        // Add click event to open the lightbox at this specific image index
        img.addEventListener("click", () => openLightbox(index));

        item.appendChild(img);
        container.appendChild(item);
    });
}

// --- LIGHTBOX FUNCTIONS ---

function setupLightbox() {
    const lightbox = document.getElementById("lightbox");
    const closeBtn = document.querySelector(".close-lightbox");
    const prevBtn = document.querySelector(".prev-arrow");
    const nextBtn = document.querySelector(".next-arrow");

    if (!lightbox) return; // Exit if we aren't on the gallery page

    // Close button click
    closeBtn.addEventListener("click", closeLightbox);

    // Arrow clicks (e.stopPropagation prevents the click from bleeding through to the background)
    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); changeLightboxImage(-1); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); changeLightboxImage(1); });

    // Click outside the image to close
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation (Escape, Left Arrow, Right Arrow)
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return; // Only trigger if popup is open
        
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") changeLightboxImage(-1);
        if (e.key === "ArrowRight") changeLightboxImage(1);
    });
}

function openLightbox(index) {
    currentPhotoIndex = index;
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    
    lightboxImg.src = currentGalleryPhotos[currentPhotoIndex].url;
    lightbox.classList.add("active");
    
    // Stop the background website from scrolling while popup is open
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    lightbox.classList.remove("active");
    
    // Re-enable background scrolling
    document.body.style.overflow = "auto";
}

function changeLightboxImage(direction) {
    currentPhotoIndex += direction;
    
    // Loop back to the beginning if we go past the end
    if (currentPhotoIndex >= currentGalleryPhotos.length) {
        currentPhotoIndex = 0;
    } 
    // Loop to the end if we go backwards from the beginning
    else if (currentPhotoIndex < 0) {
        currentPhotoIndex = currentGalleryPhotos.length - 1;
    }
    
    const lightboxImg = document.getElementById("lightbox-img");
    lightboxImg.src = currentGalleryPhotos[currentPhotoIndex].url;
}