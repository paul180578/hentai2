// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Movie row scroll buttons (auto-detecta si existen)
document.querySelectorAll('.movie-row').forEach(row => {
    let isDown = false;
    let startX;
    let scrollLeft;

    row.addEventListener('mousedown', (e) => {
        isDown = true;
        row.style.cursor = 'grabbing';
        startX = e.pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
    });

    row.addEventListener('mouseleave', () => {
        isDown = false;
        row.style.cursor = 'grab';
    });

    row.addEventListener('mouseup', () => {
        isDown = false;
        row.style.cursor = 'grab';
    });

    row.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - row.offsetLeft;
        const walk = (x - startX) * 2;
        row.scrollLeft = scrollLeft - walk;
    });

    // Touch support para móviles
    let touchStartX = 0;
    let touchScrollLeft = 0;

    row.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].pageX;
        touchScrollLeft = row.scrollLeft;
    });

    row.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].pageX;
        const walk = (touchStartX - touchX) * 1.5;
        row.scrollLeft = touchScrollLeft + walk;
    });
});

// Filter buttons functionality (para browse.html)
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Aquí puedes agregar lógica de filtrado
        console.log('Filtro seleccionado:', btn.textContent);
    });
});

// Botón de búsqueda
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        alert('Función de búsqueda - Aquí implementarías un modal de búsqueda');
    });
}

// Botones de reproducción
const playButtons = document.querySelectorAll('.btn-play, .btn-play-large');
playButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        alert('▶ Iniciando reproducción...');
    });
});

// Botón "Mi Lista"
const addButtons = document.querySelectorAll('.btn-add');
addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const isAdded = btn.textContent.includes('✓');
        if (isAdded) {
            btn.textContent = '+ Mi Lista';
            alert('Eliminado de Mi Lista');
        } else {
            btn.textContent = '✓ En Mi Lista';
            alert('Agregado a Mi Lista');
        }
    });
});

// Botón Like
const likeButtons = document.querySelectorAll('.btn-like');
likeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const isLiked = btn.textContent.includes('❤');
        btn.textContent = isLiked ? '👍' : '❤️';
        alert(isLiked ? 'Me gusta eliminado' : '¡Te gusta esta película!');
    });
});

// Botón de tráiler
const trailerBtn = document.querySelector('.btn-trailer');
if (trailerBtn) {
    trailerBtn.addEventListener('click', () => {
        alert('▶ Abriendo tráiler...');
    });
}

// Animación de entrada para las tarjetas
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                entry.target.style.transition = 'all 0.6s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Aplicar animación a las tarjetas
document.querySelectorAll('.movie-card, .grid-card').forEach(card => {
    observer.observe(card);
});

// Efecto hover mejorado para movie cards
document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.boxShadow = 'none';
    });
});

// Avatar click
const avatar = document.querySelector('.avatar');
if (avatar) {
    avatar.addEventListener('click', () => {
        alert('Menú de usuario - Aquí se mostraría el menú de perfil');
    });
}

// Prevenir comportamiento por defecto en botones de info
const infoButtons = document.querySelectorAll('.btn-info');
infoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        alert('ℹ️ Más información sobre este título');
    });
});

// Smooth scroll para anclas
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Preloader simple (opcional)
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Logging para debugging
console.log('%c🎬 StreamFlix Loaded', 'color: #e50914; font-size: 20px; font-weight: bold;');
console.log('Funcionalidades activas:');
console.log('✓ Scroll navbar animado');
console.log('✓ Scroll horizontal en filas de películas');
console.log('✓ Filtros interactivos');
console.log('✓ Botones funcionales');
console.log('✓ Animaciones de entrada');