(() => {
    'use strict';

    // Estado en memoria (reemplaza localStorage)
    const state = {
        users: [],
        currentUser: null,
        userLists: {},
        userLikes: {}
    };

    // Cache de elementos DOM
    const dom = {};

    // Inicialización
    const init = () => {
        cacheDOMElements();
        bindEvents();
        initNavbar();
        initMovieRows();
        initFilters();
        restoreUserData();
    };

    // Cachear elementos DOM una sola vez
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

    console.log('%c🎬 StreamFlix Loaded', 'color:#e50914;font-size:20px;font-weight:bold');
})();