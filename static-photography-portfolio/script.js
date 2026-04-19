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
    const featuredContainer = document.getElementById("featured-categories");
    if (!featuredContainer) return;

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

function initGalleryPage(data) {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category");
    
    const galleryContainer = document.getElementById("masonry-gallery");
    const galleryTitle = document.getElementById("gallery-title");
    const galleryDesc = document.getElementById("gallery-description");

    if (!categoryId) {
        galleryTitle.textContent = "All Works";
        galleryDesc.textContent = "Browse our full portfolio.";
        renderPhotos(data.photos, galleryContainer);
        return;
    }

    const category = data.categories.find(c => c.id === categoryId);
    if (category) {
        galleryTitle.textContent = category.name;
        galleryDesc.textContent = category.description;
    } else {
        galleryTitle.textContent = "Portfolio Collection";
        galleryDesc.textContent = "Viewing selected works.";
    }

    const categoryPhotos = data.photos.filter(p => p.categoryId === categoryId);
    renderPhotos(categoryPhotos, galleryContainer);
}

function renderPhotos(photos, container) {
    if (!container) return;
    
    if (photos.length === 0) {
        container.innerHTML = "<p style='color: var(--text-secondary); width: 100%; text-align: center;'>No photos matched.</p>";
        return;
    }

    photos.forEach(photo => {
        const item = document.createElement("div");
        item.className = "masonry-item";
        
        const img = document.createElement("img");
        img.src = photo.url;
        img.alt = photo.alt || "Portfolio image";
        img.loading = "lazy";

        item.appendChild(img);
        container.appendChild(item);
    });
}
