(() => {
    'use strict';

    const state = {
        users: [],
        currentUser: null,
        userLists: {},
        userLikes: {}
    };

    const dom = {};

    const init = () => {
        cacheDOMElements();
        bindEvents();
        initNavbar();
        initMovieRows();
        initFilters();
        restoreUserData();
    };

    const cacheDOMElements = () => {
        dom.navbar = document.querySelector('.navbar');
        dom.avatar = document.querySelector('.avatar');
        dom.searchBtn = document.querySelector('.search-btn');
        dom.registerModal = document.getElementById('register-modal');
        dom.searchModal = document.getElementById('search-modal');
        dom.closeModal = document.getElementById('close-modal');
        dom.closeSearch = document.getElementById('close-search');
        dom.userForm = document.getElementById('user-form');
        dom.searchInput = document.getElementById('search-input');
        dom.searchResults = document.getElementById('search-results');
        dom.filterButtons = document.querySelectorAll('.filter-btn');
        dom.addButtons = document.querySelectorAll('.btn-add');
        dom.likeButtons = document.querySelectorAll('.btn-like');
        dom.playButtons = document.querySelectorAll('.btn-play, .btn-play-large');
        dom.trailerBtn = document.querySelector('.btn-trailer');
        dom.infoButtons = document.querySelectorAll('.btn-info');
    };

    // Vincular eventos
    const bindEvents = () => {
        // Modales
        if (dom.avatar && dom.registerModal) {
            dom.avatar.addEventListener('click', () => toggleModal(dom.registerModal, true));
        }
        if (dom.closeModal && dom.registerModal) {
            dom.closeModal.addEventListener('click', () => toggleModal(dom.registerModal, false));
        }
        if (dom.searchBtn && dom.searchModal) {
            dom.searchBtn.addEventListener('click', () => toggleModal(dom.searchModal, true));
            if (dom.searchInput) dom.searchInput.focus();
        }
        if (dom.closeSearch && dom.searchModal) {
            dom.closeSearch.addEventListener('click', () => {
                toggleModal(dom.searchModal, false);
                if (dom.searchInput) dom.searchInput.value = '';
                if (dom.searchResults) dom.searchResults.innerHTML = '';
            });
        }

        // Cerrar modales al hacer clic fuera
        [dom.registerModal, dom.searchModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) toggleModal(modal, false);
                });
            }
        });

        // Formulario de registro
        if (dom.userForm) dom.userForm.addEventListener('submit', handleRegister);

        // Búsqueda
        if (dom.searchInput) dom.searchInput.addEventListener('input', handleSearch);

        // Botones de películas
        dom.addButtons.forEach(btn => btn.addEventListener('click', () => handleList(btn)));
        dom.likeButtons.forEach(btn => btn.addEventListener('click', () => handleLike(btn)));
        dom.playButtons.forEach(btn => btn.addEventListener('click', () => alert('▶ Iniciando reproducción...')));
        if (dom.trailerBtn) dom.trailerBtn.addEventListener('click', () => alert('▶ Abriendo tráiler...'));
        dom.infoButtons.forEach(btn => btn.addEventListener('click', () => alert('ℹ️ Más información')));
    };

    // Toggle modal
    const toggleModal = (modal, show) => {
        if (!modal) return;
        modal.classList.toggle('visible', show);
        modal.classList.toggle('hidden', !show);
    };

    // Navbar scroll effect
    const initNavbar = () => {
        if (!dom.navbar) return;
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    dom.navbar.classList.toggle('scrolled', window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        });
    };

    // Movie rows scroll
    const initMovieRows = () => {
        document.querySelectorAll('.movie-row').forEach(row => {
            let isDown = false;
            let startX, scrollLeft;

            row.addEventListener('mousedown', (e) => {
                isDown = true;
                row.style.cursor = 'grabbing';
                startX = e.pageX - row.offsetLeft;
                scrollLeft = row.scrollLeft;
            });

            ['mouseleave', 'mouseup'].forEach(evt => {
                row.addEventListener(evt, () => {
                    isDown = false;
                    row.style.cursor = 'grab';
                });
            });

            row.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - row.offsetLeft;
                row.scrollLeft = scrollLeft - (x - startX) * 2;
            });

            // Touch support
            let touchStartX = 0, touchScrollLeft = 0;
            row.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].pageX;
                touchScrollLeft = row.scrollLeft;
            }, { passive: true });

            row.addEventListener('touchmove', (e) => {
                row.scrollLeft = touchScrollLeft + (touchStartX - e.touches[0].pageX) * 1.5;
            }, { passive: true });
        });
    };

    // Filtros
    const initFilters = () => {
        dom.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Marcar el botón activo
                dom.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.textContent.trim(); // Ej: "Acción", "Drama"...

                // Filtrar las películas
                document.querySelectorAll('.grid-card').forEach(card => {
                    const meta = card.querySelector('.grid-meta')?.textContent || '';

                    if (filter === 'Todas' || meta.toLowerCase().includes(filter.toLowerCase())) {
                        card.style.display = '';  // mostrar
                    } else {
                        card.style.display = 'none';  // ocultar
                    }
                });
            });
        });
    };

    
    
    const initMovieNavigation = () => {    

        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                const movieId = card.dataset.id;
                localStorage.setItem('selectedMovie', movieId);
            });
        });

        document.querySelectorAll('.grid-card').forEach(card => {
            card.addEventListener('click', () => {
                const movieId = card.dataset.id;
                localStorage.setItem('selectedMovie', movieId);
            });
        });
    
        if (window.location.pathname.includes('movie-detail.html')) {
            const movieId = localStorage.getItem('selectedMovie');
            const infoSection = document.querySelector('.detail-info-section .detail-container');
    
            if (!movieId || !infoSection) return;
    
            let movie = {};
      
            switch (movieId) {
                case "pelicula1":
                    movie = {
                        title: "Operación Centella",
                        year: "2024",
                        duration: "2h 05min",
                        rating: "★ 8.9",
                        description: "Un agente especial debe detener una red internacional de contrabandistas antes de que estalle una guerra.",
                        director: "Julián Cortés",
                        cast: "Marco Díaz, Ana Vega, Carlos Muñoz",
                        release: "2 de septiembre de 2024",
                        classification: "R",
                        tags: ["Explosiva", "Espionaje", "Intensa"],
                        backdrop: "img/pelicula1.jpg",
                        genres: "Acción",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                        };
                        break;
                        
                        
                case "pelicula2":
                    movie = {
                        title: "Risas a Medianoche",
                        rating: "★ 7.8",
                        description: "Un comediante fracasado tiene la oportunidad de su vida cuando un programa de televisión lo contacta.",
                        director: "Camila Fuentes",
                        cast: "Pablo Soto, Lucía Torres, Andrés Gil",
                        genres: "Comedia",
                        release: "11 de junio de 2023",
                        classification: "PG-13",
                        year: "2023",
                        tags: ["Divertida", "Irónica", "Optimista"],
                        backdrop: "img/pelicula2.jpg",
                        duration: "1h 40min",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                
                case "pelicula3":
                    movie = {
                        title: "Harta",
                        year: "2024",
                        duration: "1h 55min",
                        rating: "★ 8.7",
                        description: "Una madre soltera enfrenta una difícil situación económica que la lleva a límites inesperados.",
                        director: "Rosa Pérez",
                        cast: "Carla Jiménez, Lucía Torres, Pablo Soto",
                        genres: "Drama",
                        release: "15 de abril de 2024",
                        classification: "PG-13",
                        tags: ["Impactante", "Emotiva", "Basada en hechos reales"],
                        backdrop: "img/pelicula3.jpg",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                
                case "pelicula4":
                    movie = {
                        year: "2024",
                        duration: "1h 47min",
                        rating: "★ 8.6",
                        description: "Cinco desconocidos despiertan encerrados en una habitación. Solo uno podrá salir con vida.",
                        director: "Raúl Montes",
                        cast: "Laura Gómez, Pablo Ruiz, Sara Medina",
                        genres: "Terror",
                        release: "31 de octubre de 2024",
                        classification: "R",
                        tags: ["Psicológica", "Claustrofóbica", "Siniesta"],
                        backdrop: "img/pelicula4.jpg",
                        title: "El Juego del Miedo",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                
                case "pelicula5":        
                    movie = {
                        title: "El Último Horizonte",
                        year: "2022",
                        duration: "2h 5min",
                        rating: "★ 9.1",
                        description: "En un futuro distópico, un grupo de rebeldes lucha por salvar la humanidad.",
                        director: "Camila Ortega",
                        cast: "Juan Ríos, Elena Suárez, Tomás Vidal",
                        genres: "Ciencia Ficción",
                        release: "20 de junio de 2022",
                        classification: "PG-13",
                        tags: ["Futurista", "Épica", "Reflexiva"],
                        backdrop: "img/pelicula5.jpg",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                    
                case "pelicula6":
                    movie = {
                        title: "Velocidad Mortal",
                        year: "2023",
                        duration: "1h 50min",
                        rating: "★ 8.4",
                        description: "Un expiloto es obligado a volver a las carreras clandestinas para salvar a su hermano.",
                        director: "Rodrigo Núñez",
                        cast: "Iván Torres, Daniela Rojas, Álvaro Mena",
                        release: "8 de diciembre de 2023",
                        classification: "PG-13",
                        tags: ["Adrenalina", "Carreras", "Explosiva"],
                        backdrop: "img/pelicula6.jpg",
                        genres: "Acción",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                        };
                        break;
                case "pelicula7":
                    movie = {
                        title: "Unas Vacaciones de Locura",
                        year: "2022",
                        duration: "1h 38min",
                        rating: "★ 7.5",
                        description: "Una familia viaja a la playa y descubre que nada sale como esperaban.",
                        director: "Natalia Gómez",
                        cast: "Tomás Ruiz, Lucía Pérez, Sergio Bravo",
                        genres: "Comedia",
                        release: "10 de agosto de 2022",
                        classification: "PG",
                        tags: ["Divertida", "Familiar", "Caótica"],
                        backdrop: "img/pelicula7.jpg",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                    
                case "pelicula8":
                    movie = {
                        title: "Corazón de Hielo",
                        year: "2018",
                        duration: "1h 50min",
                        rating: "★ 8.0",
                        description: "En un remoto pueblo nórdico, dos desconocidos se encuentran en medio de una tormenta.",
                        director: "Jorge Manzano",
                        cast: "Elena Vidal, Marcos Herrera, Inés Pardo",
                        genres: "Drama",
                        release: "21 de enero de 2018",
                        classification: "PG",
                        tags: ["Romántica", "Fría", "Reflexiva"],
                        backdrop: "img/pelicula8.jpg",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                    
                case "pelicula9":
                    movie = {
                        title: "Noche de Pánico",
                        year: "2023",
                        duration: "1h 44min",
                        rating: "★ 8.3",
                        description: "Un grupo de amigos queda atrapado en una cabaña mientras algo los acecha en la oscuridad.",
                        director: "Marta León",
                        cast: "Carlos Méndez, Sara Ruiz, Diego Torres",
                        genres: "Terror",
                        release: "13 de octubre de 2023",
                        classification: "R",
                        tags: ["Sangrienta", "Tensa", "Siniesta"],
                        backdrop: "img/pelicula9.jpg",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                    
                case "pelicula10":                        
                    movie = {
                        title: "Sueños Eléctricos",
                        year: "2023",
                        duration: "1h 58min",
                        rating: "★ 8.9",
                        description: "En una sociedad controlada por IA, una mujer comienza a tener sueños prohibidos.",
                        director: "Lucía Fernández",
                        cast: "Sofía Márquez, Diego Pons, Carla Mena",
                        genres: "Ciencia Ficción",
                        release: "1 de agosto de 2023",
                        classification: "PG-13",
                        tags: ["Futurista", "Distópica", "Profunda"],
                        backdrop: "img/pelicula10.jpg",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                
                case "pelicula11":
                    movie = {
                        year: "2024",
                        duration: "2h 01min",
                        rating: "★ 8.5",
                        description: "Un exsoldado es reclutado para ejecutar una misión suicida en territorio enemigo.",
                        director: "Fernando Paredes",
                        cast: "Luis Gutiérrez, Paula Mena, Andrés Díaz",
                        genres: "Acción",
                        release: "19 de marzo de 2024",
                        classification: "R",
                        tags: ["Militar", "Heroica", "Intensa"],
                        backdrop: "img/pelicula11.jpg",
                        title: "Golpe Final",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                
                case "pelicula12":
                        movie = {
                            title: "Una Boda Imposible",
                            year: "2020",
                            duration: "1h 42min",
                            rating: "★ 7.9",
                            description: "Una novia descubre que su prometido y su mejor amiga esconden un secreto justo antes del gran día.",
                            director: "Marina Campos",
                            cast: "Laura Vega, Ricardo Ruiz, Sofía Lozano",
                            genres: "Comedia",
                            release: "5 de mayo de 2020",
                            classification: "PG-13",
                            tags: ["Romántica", "Divertida", "Caótica"],
                            backdrop: "img/pelicula12.jpg",
                            trailer: "https://www.youtube.com/watch?v=wedding001"
                        };
                        break;
                
                case "pelicula13":
                    movie = {
                        title: "Bajo la Lluvia",
                        year: "2021",
                        duration: "1h 48min",
                        rating: "★ 8.2",
                        description: "Un músico callejero y una abogada solitaria cruzan caminos una noche lluviosa en la ciudad.",
                        director: "Rosa Pérez",
                        cast: "Samuel López, Inés Rojas, Pedro Mora",
                        genres: "Drama",
                        release: "18 de noviembre de 2021",
                        classification: "PG-13",
                        tags: ["Emotiva", "Inspiradora", "Romántica"],
                        backdrop: "img/pelicula13.jpg",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                
                case "pelicula14":
                    movie = {
                        title: "El Experimento",
                        year: "2024",
                        duration: "1h 55min",
                        rating: "★ 9.0",
                        description: "Un grupo de científicos realiza pruebas genéticas que terminan desatando algo incontrolable.",
                        director: "Esteban Rivas",
                        cast: "Camila Vega, Mario Gil, Hugo Delgado",
                        genres: "Ciencia Ficción",
                        release: "10 de enero de 2024",
                        classification: "PG-13",
                        tags: ["Científica", "Tensa", "Apocalíptica"],
                        backdrop: "img/pelicula14.jpg",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;
                    
                case "pelicula15":
                    movie = {
                        title: "Pesadilla Final",
                        year: "2025",
                        duration: "1h 52min",
                        rating: "★ 8.8",
                        description: "Una joven descubre que sus sueños esconden un portal a una dimensión oscura.",
                        director: "Rafael Medina",
                        cast: "Natalia Ríos, Diego Romero, Paula Gálvez",
                        genres: "Terror",
                        release: "5 de octubre de 2025",
                        classification: "R",
                        tags: ["Pesadillesca", "Psicológica", "Sobrenatural"],
                        backdrop: "img/pelicula15.jpg",
                        trailer: "https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1"
                    };
                    break;                

                default:
                    movie = {
                        title: "Película no encontrada",
                        
                        description: "No se pudo cargar la información de esta película.",
                        backdrop: "img/default.jpg",
                        tags: ["Error", "Desconocida"]
                    };
                    break;
            }
    
            infoSection.innerHTML = `
                <div class="detail-main">
                    <h1 class="info-title">${movie.title}</h1>
                    <div class="info-meta">
                        <span>${movie.year || ''}</span> |
                        <span>${movie.duration || ''}</span> |
                        <span>${movie.rating || ''}</span>
                    </div>
                    <p class="info-description">${movie.description}</p>
    
                    <div class="info-row"><span class="info-label">Director:</span><span class="info-value">${movie.director}</span></div>
                    <div class="info-row"><span class="info-label">Reparto:</span><span class="info-value">${movie.cast}</span></div>
                    <div class="info-row"><span class="info-label">Géneros:</span><span class="info-value">${movie.genres}</span></div>
                    <div class="info-row"><span class="info-label">Estreno:</span><span class="info-value">${movie.release}</span></div>
                    <div class="info-row"><span class="info-label">Clasificación:</span><span class="info-value">${movie.classification}</span></div>
    
                    <div class="tags">
                        ${movie.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
    
                    <div class="detail-buttons">
                        <button class="btn-play-large">▶ Reproducir</button>
                        <button class="btn-add">+ Mi Lista</button>
                        <button class="btn-like">👍</button>
                    </div>
                </div>
    
                <div class="detail-sidebar">
                    <div class="trailer-container">
                        <div class="trailer-placeholder">
                            <img src="${movie.backdrop}" alt="${movie.title}" class="poster-preview">
                        </div>
                        <button class="btn-trailer" data-trailer="${movie.trailer}">▶ Ver Tráiler</button>
                    </div>
                </div>
            `;
    
            // ▶ Evento del botón de tráiler
            const trailerBtn = document.querySelector('.btn-trailer');
            if (trailerBtn) {
                trailerBtn.addEventListener('click', () => {
                    window.open(movie.trailer, '_blank');
                });
            }
        }
    }

    initMovieNavigation();

    initMovieNavigation();

    const initSimilarMovies = () => {
        const similarContainer = document.getElementById('similar-movies');
        if (!similarContainer) return;

        const movieId = window.localStorage.getItem('selectedMovie');
        if (!movieId) return;

        const allMovies = [
            { id: "pelicula1", title: "Operación Centella", rating: "★ 8.9", img: "img/pelicula1.jpg", genres: "Acción" },
            { id: "pelicula2", title: "Risas a Medianoche", rating: "★ 7.8", img: "img/pelicula2.jpg", genres: "Comedia" },
            { id: "pelicula3", title: "Harta", rating: "★ 8.7", img: "img/pelicula3.jpg", genres: "Drama" },
            { id: "pelicula4", title: "El Juego del Miedo", rating: "★ 8.6", img: "img/pelicula4.jpg", genres: "Terror" },
            { id: "pelicula5", title: "El Último Horizonte", rating: "★ 9.1", img: "img/pelicula5.jpg", genres: "Ciencia Ficción" },
            { id: "pelicula6", title: "Velocidad Mortal", rating: "★ 8.4", img: "img/pelicula6.jpg", genres: "Acción" },
            { id: "pelicula7", title: "Unas Vacaciones de Locura", rating: "★ 7.5", img: "img/pelicula7.jpg", genres: "Comedia" },
            { id: "pelicula8", title: "Corazón de Hielo", rating: "★ 8.0", img: "img/pelicula8.jpg", genres: "Drama" },
            { id: "pelicula9", title: "Noche de Pánico", rating: "★ 8.3", img: "img/pelicula9.jpg", genres: "Terror" },
            { id: "pelicula10", title: "Sueños Eléctricos", rating: "★ 8.9", img: "img/pelicula10.jpg", genres: "Ciencia Ficción" },
            { id: "pelicula11", title: "Golpe Final", rating: "★ 8.5", img: "img/pelicula11.jpg", genres: "Acción" },
            { id: "pelicula12", title: "Una Boda Imposible", rating: "★ 7.9", img: "img/pelicula12.jpg", genres: "Comedia" },
            { id: "pelicula13", title: "Bajo la Lluvia", rating: "★ 8.2", img: "img/pelicula13.jpg", genres: "Drama" },
            { id: "pelicula14", title: "El Experimento", rating: "★ 9.0", img: "img/pelicula14.jpg", genres: "Ciencia Ficción" },
            { id: "pelicula15", title: "Pesadilla Final", rating: "★ 8.8", img: "img/pelicula15.jpg", genres: "Terror" }
        ];

        const currentMovie = allMovies.find(m => m.id === movieId);
        if (!currentMovie) return;

        const similares = allMovies.filter(
            m => m.genres === currentMovie.genres && m.id !== currentMovie.id
        );

        if (similares.length === 0) {
            similarContainer.innerHTML = `<p>No hay películas similares disponibles.</p>`;
        } else {
            similarContainer.innerHTML = '';
            similares.forEach(sim => {
                const card = document.createElement('div');
                card.classList.add('movie-section');
                card.dataset.id = sim.id;
                card.innerHTML = `
                    <div class="movie-poster">
                        <img src="${sim.img}" alt="${sim.title}">
                    </div>
                    <div class="movie-info">
                        <h4>${sim.title}</h4>
                        <span class="movie-rating">${sim.rating}</span>
                    </div>
                `;
                card.addEventListener('click', () => {
                    window.localStorage.setItem('selectedMovie', sim.id);
                    window.location.reload();
                });
                similarContainer.appendChild(card);
            });
        }
    };

    initSimilarMovies();

    // Registro de usuario
    const handleRegister = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        const errors = {};
        const errorEls = {
            username: document.getElementById('username-error'),
            email: document.getElementById('email-error'),
            password: document.getElementById('password-error'),
            confirmPassword: document.getElementById('confirm-password-error')
        };

        // Limpiar errores
        Object.values(errorEls).forEach(el => { if (el) el.textContent = ''; });

        // Validaciones
        if (!data.username?.trim()) {
            errors.username = 'El nombre de usuario es obligatorio';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Correo electrónico inválido';
        }
        if (!data.password || data.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        if (data.password !== data['confirm-password']) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        // Mostrar errores
        Object.entries(errors).forEach(([key, msg]) => {
            if (errorEls[key]) errorEls[key].textContent = msg;
        });

        if (Object.keys(errors).length > 0) return;

        // Verificar usuario existente
        if (state.users.some(u => u.username === data.username || u.email === data.email)) {
            if (errorEls.username) errorEls.username.textContent = 'El nombre o correo ya existe';
            return;
        }

        // Registrar usuario
        state.users.push({ username: data.username, email: data.email, password: data.password });
        state.currentUser = data.username;
        state.userLists[data.username] = [];
        state.userLikes[data.username] = [];

        const successEl = document.getElementById('success-message');
        if (successEl) successEl.textContent = 'Usuario registrado correctamente ✅';

        setTimeout(() => {
            e.target.reset();
            toggleModal(dom.registerModal, false);
            if (successEl) successEl.textContent = '';
        }, 900);
    };

    // Búsqueda
    const handleSearch = () => {
        if (!dom.searchInput || !dom.searchResults) return;
        
        const query = dom.searchInput.value.toLowerCase().trim();
        dom.searchResults.innerHTML = '';

        if (!query) return;

        const movies = document.querySelectorAll('.movie-card, .grid-card');
        const matches = [];

        movies.forEach(movie => {
            const titleEl = movie.querySelector('h4');
            if (titleEl?.textContent.toLowerCase().includes(query)) {
                matches.push({
                    title: titleEl.textContent,
                    link: movie.getAttribute('href') || '#'
                });
            }
        });

        if (matches.length === 0) {
            dom.searchResults.innerHTML = '<p>No se encontraron resultados</p>';
        } else {
            matches.forEach(m => {
                const item = document.createElement('a');
                item.href = m.link;
                item.textContent = m.title;
                dom.searchResults.appendChild(item);
            });
        }
    };

    // Mi Lista
    const handleList = (btn) => {
        if (!state.currentUser) {
            alert('Debes registrarte para usar Mi Lista');
            if (dom.registerModal) toggleModal(dom.registerModal, true);
            return;
        }

        const title = getMovieTitle(btn);
        if (!title) return;

        const list = state.userLists[state.currentUser];
        const index = list.indexOf(title);

        if (index > -1) {
            list.splice(index, 1);
            btn.textContent = '+ Mi Lista';
        } else {
            list.push(title);
            btn.textContent = '✓ En Mi Lista';
        }
    };

    // Likes
    const handleLike = (btn) => {
        if (!state.currentUser) {
            alert('Debes registrarte para dar like');
            if (dom.registerModal) toggleModal(dom.registerModal, true);
            return;
        }

        const title = getMovieTitle(btn);
        if (!title) return;

        const likes = state.userLikes[state.currentUser];
        const index = likes.indexOf(title);

        if (index > -1) {
            likes.splice(index, 1);
            btn.textContent = '👍';
        } else {
            likes.push(title);
            btn.textContent = '❤️';
        }
    };

    // Obtener título de película
    const getMovieTitle = (btn) => {
        const card = btn.closest('.movie-card') || btn.closest('.grid-card');
        return card?.querySelector('h4')?.textContent;
    };

    // Restaurar datos de usuario
    const restoreUserData = () => {
        if (!state.currentUser) return;

        const list = state.userLists[state.currentUser] || [];
        const likes = state.userLikes[state.currentUser] || [];

        dom.addButtons.forEach(btn => {
            const title = getMovieTitle(btn);
            if (title) btn.textContent = list.includes(title) ? '✓ En Mi Lista' : '+ Mi Lista';
        });

        dom.likeButtons.forEach(btn => {
            const title = getMovieTitle(btn);
            if (title) btn.textContent = likes.includes(title) ? '❤️' : '👍';
        });
    };

    // Animaciones de entrada
    const initAnimations = () => {
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
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.movie-card, .grid-card').forEach(card => observer.observe(card));
    };

    // Cargar al estar listo el DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            initAnimations();
        });
    } else {
        init();
        initAnimations();
    }

})();