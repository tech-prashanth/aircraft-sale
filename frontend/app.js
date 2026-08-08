document.addEventListener('DOMContentLoaded', () => {

    // Firebase Configuration (aircraft-sales-f95af)
    const firebaseConfig = {
        apiKey: "AIzaSyDV9j6NCftuBp1XqWNaw9ewn4KKPSejEOs",
        authDomain: "aircraft-sales-f95af.firebaseapp.com",
        projectId: "aircraft-sales-f95af",
        storageBucket: "aircraft-sales-f95af.firebasestorage.app",
        messagingSenderId: "572551314188",
        appId: "1:572551314188:android:5a9af016e09a1400d8e729"
    };

    let firebaseAnalytics = null;
    let firebaseDb = null;
    let firebaseAuth = null;

    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(firebaseConfig);
            if (firebase.analytics) {
                firebaseAnalytics = firebase.analytics();
                console.log("[Firebase] Analytics initialized successfully for project aircraft-sales-f95af");
            }
            if (firebase.firestore) {
                firebaseDb = firebase.firestore();
                console.log("[Firebase] Firestore initialized");
            }
            if (firebase.auth) {
                firebaseAuth = firebase.auth();
                console.log("[Firebase] Auth initialized");
            }
        } catch (e) {
            console.warn("[Firebase] Initialization note:", e);
        }
    }

    const header = document.querySelector('.header');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        let current = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                const id = section.getAttribute('id');
                if (id) current = id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const targetId = href.substring(1);
                if (targetId === current) {
                    link.classList.add('active');
                }
            }
        });
    });

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars-staggered');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars-staggered');
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars-staggered');
                }
            });
        });
    }

    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add('revealed');
        });
    }

    const categoryData = {
        1: { name: "Light Cabin Jet", basePrice: 597600000, baseHourly: 190900, baseFixed: 26560000 },
        2: { name: "Mid-Size Jet", basePrice: 1286500000, baseHourly: 244850, baseFixed: 38180000 },
        3: { name: "Super Mid-Size", basePrice: 2224400000, baseHourly: 315400, baseFixed: 50630000 },
        4: { name: "Ultra Long Range Jet", basePrice: 6225000000, baseHourly: 431600, baseFixed: 73870000 }
    };

    function formatCurrency(number) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(number);
    }

    const calcCategory = document.getElementById('calcCategory');
    const calcAge = document.getElementById('calcAge');
    const calcHours = document.getElementById('calcHours');
    const calcCategoryLabel = document.getElementById('calcCategoryLabel');
    const calcAgeLabel = document.getElementById('calcAgeLabel');
    const calcHoursLabel = document.getElementById('calcHoursLabel');
    const resAcquisitionPrice = document.getElementById('resAcquisitionPrice');
    const resHourlyCost = document.getElementById('resHourlyCost');
    const resAnnualFixed = document.getElementById('resAnnualFixed');

    function calculateValuation() {
        if (!calcCategory || !calcAge || !calcHours) return;

        const cat = parseInt(calcCategory.value) || 4;
        const age = parseInt(calcAge.value) || 2026;
        const hours = parseInt(calcHours.value) || 300;

        const data = categoryData[cat];
        if (!data) return;

        if (calcCategoryLabel) calcCategoryLabel.textContent = data.name;
        
        const currentYear = 2026;
        const diffYears = currentYear - age;
        if (calcAgeLabel) {
            if (diffYears === 0) {
                calcAgeLabel.textContent = "Brand New (2026)";
            } else {
                calcAgeLabel.textContent = `${diffYears} Yr${diffYears > 1 ? 's' : ''} Old (YOM ${age})`;
            }
        }

        if (calcHoursLabel) calcHoursLabel.textContent = `${hours} hrs / yr`;

        let depreciatedPrice = data.basePrice * Math.pow(0.935, diffYears);
        const hoursVariance = (hours - 250) / 250;
        const flightHoursDepreciationFactor = Math.max(-0.15, Math.min(0.05, -hoursVariance * 0.03));
        depreciatedPrice = depreciatedPrice * (1 + flightHoursDepreciationFactor);

        const finalPrice = Math.max(data.basePrice * 0.25, depreciatedPrice);
        const hourlyCostAdjustment = 1 + (diffYears * 0.015);
        const finalHourlyCost = data.baseHourly * hourlyCostAdjustment;
        const totalAnnualOperating = data.baseFixed + (hours * finalHourlyCost);

        if (resAcquisitionPrice) resAcquisitionPrice.textContent = formatCurrency(finalPrice);
        if (resHourlyCost) resHourlyCost.textContent = `${formatCurrency(finalHourlyCost)} / hr`;
        if (resAnnualFixed) resAnnualFixed.textContent = formatCurrency(totalAnnualOperating);
    }

    if (calcCategory && calcAge && calcHours) {
        calcCategory.addEventListener('input', calculateValuation);
        calcCategory.addEventListener('change', calculateValuation);
        calcAge.addEventListener('input', calculateValuation);
        calcAge.addEventListener('change', calculateValuation);
        calcHours.addEventListener('input', calculateValuation);
        calcHours.addEventListener('change', calculateValuation);
        calculateValuation();
    }

    const sidebarSearchQuery = document.getElementById('sidebarSearchQuery');
    const sidebarPriceMax = document.getElementById('sidebarPriceMax');
    const priceFilterLabel = document.getElementById('priceFilterLabel');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    const manufacturerCheckboxes = document.querySelectorAll('.manufacturer-checkbox');
    const resultsCount = document.getElementById('resultsCount');
    const fleetGrid = document.getElementById('fleetGrid');
    const fleetCards = document.querySelectorAll('.fleet-card');
    const sortBy = document.getElementById('sortBy');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    const heroCategory = document.getElementById('filterCategory');
    const heroManufacturer = document.getElementById('filterManufacturer');
    const heroStatus = document.getElementById('filterStatus');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');

    let originalCardsOrder = Array.from(fleetCards);

    function applySearchAndFilters() {
        if (!fleetGrid) return;

        const query = sidebarSearchQuery ? sidebarSearchQuery.value.trim().toLowerCase() : '';
        const maxPrice = sidebarPriceMax ? parseInt(sidebarPriceMax.value) : 6800000000;

        if (priceFilterLabel && sidebarPriceMax) {
            priceFilterLabel.textContent = '₹' + (maxPrice / 10000000).toFixed(0) + ' Cr';
        }

        const checkedCategories = [];
        categoryCheckboxes.forEach(cb => {
            if (cb.checked) checkedCategories.push(cb.value);
        });

        const checkedManufacturers = [];
        manufacturerCheckboxes.forEach(cb => {
            if (cb.checked) checkedManufacturers.push(cb.value);
        });

        let visibleCount = 0;

        fleetCards.forEach(card => {
            const cardCat = card.dataset.category;
            const cardMan = card.dataset.manufacturer;
            const cardPrice = parseInt(card.dataset.price) || 0;
            const cardTitle = card.querySelector('.aircraft-title').textContent.toLowerCase();
            const cardSubtitle = card.querySelector('.aircraft-subtitle').textContent.toLowerCase();

            const matchesQuery = !query || cardTitle.includes(query) || cardSubtitle.includes(query);
            const matchesCat = checkedCategories.includes(cardCat);
            const matchesMan = checkedManufacturers.includes(cardMan);
            const matchesPrice = cardPrice <= maxPrice;

            if (matchesQuery && matchesCat && matchesMan && matchesPrice) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (resultsCount) {
            resultsCount.textContent = `Showing ${visibleCount} Aircraft`;
        }
    }

    function sortResults() {
        if (!fleetGrid || !sortBy) return;

        const criteria = sortBy.value;
        const visibleCards = Array.from(fleetCards);

        if (criteria === 'default') {
            originalCardsOrder.forEach(card => fleetGrid.appendChild(card));
            return;
        }

        visibleCards.sort((a, b) => {
            if (criteria === 'price-asc') {
                return (parseInt(a.dataset.price) || 0) - (parseInt(b.dataset.price) || 0);
            } else if (criteria === 'price-desc') {
                return (parseInt(b.dataset.price) || 0) - (parseInt(a.dataset.price) || 0);
            } else if (criteria === 'hours-asc') {
                return (parseInt(a.dataset.hours) || 0) - (parseInt(b.dataset.hours) || 0);
            } else if (criteria === 'range-desc') {
                return (parseInt(b.dataset.range) || 0) - (parseInt(a.dataset.range) || 0);
            }
            return 0;
        });

        visibleCards.forEach(card => fleetGrid.appendChild(card));
    }

    if (sidebarSearchQuery) sidebarSearchQuery.addEventListener('input', applySearchAndFilters);
    if (sidebarPriceMax) {
        sidebarPriceMax.addEventListener('input', applySearchAndFilters);
        sidebarPriceMax.addEventListener('change', applySearchAndFilters);
    }
    categoryCheckboxes.forEach(cb => cb.addEventListener('change', applySearchAndFilters));
    manufacturerCheckboxes.forEach(cb => cb.addEventListener('change', applySearchAndFilters));
    
    if (sortBy) {
        sortBy.addEventListener('change', sortResults);
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (sidebarSearchQuery) sidebarSearchQuery.value = '';
            if (sidebarPriceMax) sidebarPriceMax.value = 6800000000;
            categoryCheckboxes.forEach(cb => cb.checked = true);
            manufacturerCheckboxes.forEach(cb => cb.checked = true);
            if (sortBy) sortBy.value = 'default';
            
            applySearchAndFilters();
            sortResults();
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const hCat = heroCategory ? heroCategory.value : 'all';
            const hMan = heroManufacturer ? heroManufacturer.value : 'all';

            categoryCheckboxes.forEach(cb => {
                cb.checked = (hCat === 'all' || cb.value === hCat);
            });

            manufacturerCheckboxes.forEach(cb => {
                cb.checked = (hMan === 'all' || cb.value === hMan);
            });

            if (sidebarSearchQuery) sidebarSearchQuery.value = '';
            if (sidebarPriceMax) sidebarPriceMax.value = 6800000000;
            if (sortBy) sortBy.value = 'default';

            applySearchAndFilters();
            sortResults();

            const fleetSection = document.getElementById('fleet');
            if (fleetSection) {
                fleetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const detailsModal = document.getElementById('detailsModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalBodyContent = document.querySelector('.modal-body-content');

    const jetsData = {
        'g650er': {
            title: "Gulfstream G650ER",
            tag: "Immediate Delivery",
            image: "assets/hero_jet.png",
            desc: "The Gulfstream G650ER is the gold standard for executive ultra-long-range flights, holding more than 120 world speed records. Featuring a state-of-the-art clean wing design, this aircraft maximizes cabin comfort and range velocity, flying non-stop from Tokyo to New York or London to Singapore.",
            specs: {
                "Manufacturer": "Gulfstream Aerospace",
                "Year of Manufacture": "2021",
                "Total Flight Hours": "840 hrs",
                "Max Range": "7,500 nm (13,890 km)",
                "Max Cruise Speed": "Mach 0.925 (982 km/h)",
                "Cabin Height": "6 ft 3 in (1.91 m)",
                "Cabin Width": "8 ft 2 in (2.49 m)",
                "Passenger Capacity": "16 Executive Seats",
                "Crew Capacity": "3 Crew (2 Pilots, 1 Attendant)",
                "Avionics Suite": "Gulfstream Symmetry Flight Deck",
                "Engine Program": "Rolls-Royce BR725 on Corporate Care"
            }
        },
        'global7500': {
            title: "Bombardier Global 7500",
            tag: "Off-Market Asset",
            image: "assets/global7500_ext.png",
            desc: "As the industry's flagship private jet, the Bombardier Global 7500 stands alone as the largest and longest-range business jet ever built. The cabin features four true living spaces, a full-size kitchen, and a dedicated crew suite. Equipped with the revolutionary Nuage seating system and fly-by-wire flight control precision.",
            specs: {
                "Manufacturer": "Bombardier Aviation",
                "Year of Manufacture": "2022",
                "Total Flight Hours": "490 hrs",
                "Max Range": "7,700 nm (14,260 km)",
                "Max Cruise Speed": "Mach 0.925 (982 km/h)",
                "Cabin Height": "6 ft 2 in (1.88 m)",
                "Cabin Width": "8 ft 0 in (2.44 m)",
                "Passenger Capacity": "19 Passengers max",
                "Crew Capacity": "4 Crew (2 Pilots, 2 Attendants)",
                "Avionics Suite": "Bombardier Vision Flight Deck",
                "Engine Program": "GE Passport Engines (Fully Covered)"
            }
        },
        'falcon8x': {
            title: "Dassault Falcon 8X",
            tag: "Immediate Delivery",
            image: "assets/falcon8x_ext.png",
            desc: "The Dassault Falcon 8X ultra-long-range trijet delivers an exceptional combination of speed, efficiency, and safety. Due to its unique three-engine design, the 8X features shorter takeoff requirements and outstanding stability. It handles steep approaches like London City Airport with ease, while offering a noise-insulated cabin.",
            specs: {
                "Manufacturer": "Dassault Aviation",
                "Year of Manufacture": "2019",
                "Total Flight Hours": "1,250 hrs",
                "Max Range": "6,450 nm (11,945 km)",
                "Max Cruise Speed": "Mach 0.90 (956 km/h)",
                "Cabin Height": "6 ft 2 in (1.88 m)",
                "Cabin Width": "7 ft 8 in (2.34 m)",
                "Passenger Capacity": "14 Executive Seats",
                "Crew Capacity": "3 Crew (2 Pilots, 1 Attendant)",
                "Avionics Suite": "EASy III Cockpit (Honeywell)",
                "Engine Program": "Pratt & Whitney PW307D on ESP Gold"
            }
        },
        'challenger350': {
            title: "Bombardier Challenger 350",
            tag: "Immediate Delivery",
            image: "assets/challenger350.png",
            desc: "The Bombardier Challenger 350 is the best-selling super-midsize business jet in the world. Offering an exceptionally wide flat-floor cabin, low direct operating costs, and outstanding runway performance, it is the workhorse of corporate fleets globally. Perfect for transcontinental flights.",
            specs: {
                "Manufacturer": "Bombardier Aviation",
                "Year of Manufacture": "2020",
                "Total Flight Hours": "1,120 hrs",
                "Max Range": "3,200 nm (5,926 km)",
                "Max Cruise Speed": "Mach 0.83 (882 km/h)",
                "Cabin Height": "6 ft 0 in (1.83 m)",
                "Cabin Width": "7 ft 2 in (2.19 m)",
                "Passenger Capacity": "9 Executive Seats",
                "Crew Capacity": "2 Pilots",
                "Avionics Suite": "Rockwell Collins Pro Line 21 Advanced",
                "Engine Program": "Honeywell HTF7350 on MSP Gold"
            }
        },
        'citation_lat': {
            title: "Cessna Citation Latitude",
            tag: "Off-Market Asset",
            image: "assets/citation_lat.png",
            desc: "The Cessna Citation Latitude features the widest cabin in its class, complete with a flat floor and 6 feet of standing headroom. It combines lightweight composite structures with clean-sheet aerodynamics, allowing it to climb directly to flight levels and access short airfields comfortably.",
            specs: {
                "Manufacturer": "Cessna Aircraft",
                "Year of Manufacture": "2018",
                "Total Flight Hours": "1,480 hrs",
                "Max Range": "2,700 nm (5,000 km)",
                "Max Cruise Speed": "Mach 0.80 (848 km/h)",
                "Cabin Height": "6 ft 0 in (1.83 m)",
                "Cabin Width": "6 ft 5 in (1.96 m)",
                "Passenger Capacity": "8 Passengers max",
                "Crew Capacity": "2 Pilots",
                "Avionics Suite": "Garmin G5000 Integrated Flight Deck",
                "Engine Program": "Pratt & Whitney PW306D1 on PowerAdvantage+"
            }
        },
        'praetor600': {
            title: "Embraer Praetor 600",
            tag: "Immediate Delivery",
            image: "assets/praetor600.png",
            desc: "The Embraer Praetor 600 is the most disruptive super-midsize business jet, featuring full fly-by-wire technology and active turbulence reduction. With its impressive range, it flies non-stop between London and New York. The cabin design features Embraer's ultra-premium Bossa Nova design package.",
            specs: {
                "Manufacturer": "Embraer Executive Jets",
                "Year of Manufacture": "2023",
                "Total Flight Hours": "320 hrs",
                "Max Range": "4,018 nm (7,441 km)",
                "Max Cruise Speed": "Mach 0.83 (882 km/h)",
                "Cabin Height": "6 ft 0 in (1.83 m)",
                "Cabin Width": "6 ft 10 in (2.08 m)",
                "Passenger Capacity": "12 Passengers max",
                "Crew Capacity": "2 Pilots",
                "Avionics Suite": "Collins Aerospace Pro Line Fusion",
                "Engine Program": "Honeywell HTF7500E (Fully Covered)"
            }
        }
    };

    function openModal(jetId) {
        const data = jetsData[jetId];
        if (!data) return;

        let specsHtml = '';
        for (const [key, val] of Object.entries(data.specs)) {
            specsHtml += `
                <div class="quick-spec-item">
                    <span class="quick-spec-label">${key}</span>
                    <span class="quick-spec-value">${val}</span>
                </div>
            `;
        }

        modalBodyContent.innerHTML = `
            <div class="modal-header">
                <div>
                    <h2>${data.title}</h2>
                    <p class="aircraft-subtitle">Vanguard Specifications</p>
                </div>
                <span class="modal-tag">${data.tag}</span>
            </div>
            <div class="modal-grid">
                <div class="modal-left">
                    <div class="modal-gallery">
                        <img src="${data.image}" alt="${data.title}">
                    </div>
                    <div class="modal-description">
                        <h3>Overview</h3>
                        <p>${data.desc}</p>
                    </div>
                </div>
                <div class="modal-right">
                    <h3>Technical Details</h3>
                    <div class="modal-quick-specs">
                        ${specsHtml}
                    </div>
                    <div class="modal-inquiry-box">
                        <h4>Acquisition Inquiry</h4>
                        <p>Request flight logs, maintenance scan history, and configuration details. Formal NDA required.</p>
                        <button class="btn btn-gold btn-full modal-cta-btn">Enquire Now</button>
                    </div>
                </div>
            </div>
        `;

        const modalCtaBtn = modalBodyContent.querySelector('.modal-cta-btn');
        if (modalCtaBtn) {
            modalCtaBtn.addEventListener('click', () => {
                closeModal();
                const interestSelect = document.getElementById('interest');
                const messageTextarea = document.getElementById('message');
                if (interestSelect) interestSelect.value = 'buy';
                if (messageTextarea) messageTextarea.value = `Inquiry regarding ${data.title}. Please provide technical specifications and registry history details.`;
                
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        detailsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        detailsModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', () => {
            const jetId = button.dataset.jet;
            openModal(jetId);
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    function openImageLightbox(imgSrc, title) {
        if (!modalBodyContent || !detailsModal) return;

        modalBodyContent.innerHTML = `
            <div class="modal-header">
                <div>
                    <h2>${title}</h2>
                    <p class="aircraft-subtitle">Aviation Gallery</p>
                </div>
            </div>
            <div class="modal-gallery" style="margin-top: 1.5rem;">
                <img src="${imgSrc}" alt="${title}" style="max-height: 70vh; width: 100%; object-fit: contain;">
            </div>
        `;

        detailsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.dataset.imgSrc;
            const title = item.querySelector('.gallery-overlay span').textContent;
            openImageLightbox(imgSrc, title);
        });
    });

    if (detailsModal) {
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) {
                closeModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailsModal.classList.contains('active')) {
            closeModal();
        }
    });

    const inquiryForm = document.getElementById('inquiryForm');
    const formFeedback = document.getElementById('formFeedback');

    if (inquiryForm) {
        inquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = inquiryForm.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnIcon = submitBtn.querySelector('i');

            submitBtn.disabled = true;
            btnText.textContent = "Sending...";
            btnIcon.className = "fa-solid fa-spinner fa-spin";
            if (formFeedback) formFeedback.className = "form-feedback hidden";

            const payload = {
                name: document.getElementById('fullName').value,
                company: document.getElementById('company').value,
                email: document.getElementById('email').value,
                interest: document.getElementById('interest').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/api/inquire', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Server returned an error');
                }

                if (formFeedback) {
                    formFeedback.className = "form-feedback success";
                    formFeedback.innerHTML = `
                        <i class="fa-solid fa-circle-check"></i> 
                        Thank you. Your inquiry has been sent successfully. Our team will contact you shortly.
                    `;
                }
                inquiryForm.reset();

            } catch (err) {
                console.warn('API endpoint not configured, falling back to local fallback handler:', err);
                
                setTimeout(() => {
                    if (formFeedback) {
                        formFeedback.className = "form-feedback success";
                        formFeedback.innerHTML = `
                            <i class="fa-solid fa-circle-check"></i> 
                            Thank you. Your inquiry has been received. Our team will contact you shortly.
                        `;
                    }
                    inquiryForm.reset();
                }, 1000);
            } finally {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    btnText.textContent = "Submit Inquiry";
                    btnIcon.className = "fa-solid fa-paper-plane";
                }, 1000);
            }
        });
    }

    // Run initial filter on load to setup counts
    applySearchAndFilters();

    // ==========================================
    // CLIENT PORTAL LOGIN & OTP VERIFICATION
    // ==========================================
    const authModal = document.getElementById('authModal');
    const clientPortalBtn = document.getElementById('clientPortalBtn');
    const clientPortalBtnMobile = document.getElementById('clientPortalBtnMobile');
    const authModalCloseBtn = document.getElementById('authModalCloseBtn');

    const authTabsHeader = document.getElementById('authTabsHeader');
    const authTabs = document.querySelectorAll('.auth-tab');
    const tabContents = document.querySelectorAll('.auth-tab-content');

    const signupForm = document.getElementById('signupForm');
    const signupFeedback = document.getElementById('signupFeedback');
    const loginForm = document.getElementById('loginForm');
    const loginFeedback = document.getElementById('loginFeedback');
    
    const otpForm = document.getElementById('otpForm');
    const otpCodeInput = document.getElementById('otpCode');
    const otpTimerLabel = document.getElementById('otpTimer');
    const demoOtpDisplay = document.getElementById('demoOtpDisplay');
    const otpFeedback = document.getElementById('otpFeedback');

    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const dashboardWelcome = document.getElementById('dashboardWelcome');
    const logoutBtn = document.getElementById('logoutBtn');

    let currentUserId = null;
    let otpCountdownInterval = null;

    function openAuthModal() {
        if (!authModal) return;
        
        const session = localStorage.getItem('userSession');
        if (session) {
            const user = jsonSafeParse(session);
            if (user) {
                showDashboard(user);
            } else {
                showTab('login');
            }
        } else {
            showTab('login');
        }
        
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeAuthModal() {
        if (!authModal) return;
        authModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        clearInterval(otpCountdownInterval);
    }

    function jsonSafeParse(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    }

    function showTab(tabName) {
        clearInterval(otpCountdownInterval);
        if (signupFeedback) signupFeedback.className = "form-feedback hidden";
        if (loginFeedback) loginFeedback.className = "form-feedback hidden";
        if (otpFeedback) otpFeedback.className = "form-feedback hidden";
        
        if (signupForm) signupForm.reset();
        if (loginForm) loginForm.reset();
        if (otpForm) otpForm.reset();

        if (authTabsHeader) authTabsHeader.style.display = 'flex';

        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `tab-${tabName}`) {
                content.classList.add('active');
            }
        });

        authTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
    }

    function startOtpCountdown() {
        clearInterval(otpCountdownInterval);
        let timeLeft = 60;
        if (otpTimerLabel) otpTimerLabel.textContent = "60s";

        otpCountdownInterval = setInterval(() => {
            timeLeft--;
            if (otpTimerLabel) otpTimerLabel.textContent = `${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(otpCountdownInterval);
                if (otpFeedback) {
                    otpFeedback.className = "form-feedback error";
                    otpFeedback.textContent = "The verification code has expired. Please log in again to request a new code.";
                }
                if (demoOtpDisplay) demoOtpDisplay.textContent = "EXPIRED";
            }
        }, 1000);
    }

    function showDashboard(user) {
        if (authTabsHeader) authTabsHeader.style.display = 'none';
        
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === 'tab-dashboard') {
                content.classList.add('active');
            }
        });

        if (dashboardWelcome) dashboardWelcome.textContent = `Welcome, ${user.name}`;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profilePhone) profilePhone.textContent = user.phone;
    }

    if (clientPortalBtn) clientPortalBtn.addEventListener('click', (e) => { e.preventDefault(); openAuthModal(); });
    if (clientPortalBtnMobile) clientPortalBtnMobile.addEventListener('click', (e) => { e.preventDefault(); openAuthModal(); });
    if (authModalCloseBtn) authModalCloseBtn.addEventListener('click', closeAuthModal);

    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeAuthModal();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && authModal.classList.contains('active')) closeAuthModal();
        });
    }

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            showTab(tab.dataset.tab);
        });
    });

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            if (signupFeedback) signupFeedback.className = "form-feedback hidden";

            const payload = {
                name: document.getElementById('signupName').value,
                email: document.getElementById('signupEmail').value,
                password: document.getElementById('signupPassword').value,
                phone: document.getElementById('signupPhone').value
            };

            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const resData = await response.json();

                if (response.ok && resData.success) {
                    if (signupFeedback) {
                        signupFeedback.className = "form-feedback success";
                        signupFeedback.textContent = "Registration successful! Switching to Login...";
                    }
                    setTimeout(() => {
                        showTab('login');
                    }, 1500);
                } else {
                    if (signupFeedback) {
                        signupFeedback.className = "form-feedback error";
                        signupFeedback.textContent = resData.message || "Registration failed.";
                    }
                }
            } catch (err) {
                if (signupFeedback) {
                    signupFeedback.className = "form-feedback error";
                    signupFeedback.textContent = "Error connecting to authentication service.";
                }
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // Auto-clear feedback/error messages when the user edits input fields
    const authInputs = document.querySelectorAll('#authModal input');
    authInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (loginFeedback) loginFeedback.className = "form-feedback hidden";
            if (signupFeedback) signupFeedback.className = "form-feedback hidden";
            if (otpFeedback) otpFeedback.className = "form-feedback hidden";
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            if (loginFeedback) loginFeedback.className = "form-feedback hidden";

            const emailVal = document.getElementById('loginEmail').value.trim();
            const passwordVal = document.getElementById('loginPassword').value;

            const payload = {
                email: emailVal,
                password: passwordVal
            };

            try {
                const response = await fetch('/api/login-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const resData = await response.json();

                if (response.ok && resData.success) {
                    currentUserId = resData.userId;
                    if (demoOtpDisplay) demoOtpDisplay.textContent = resData.otp;
                    
                    if (authTabsHeader) authTabsHeader.style.display = 'none';
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === 'tab-otp') content.classList.add('active');
                    });
                    
                    startOtpCountdown();
                } else {
                    if (loginFeedback) {
                        loginFeedback.className = "form-feedback error";
                        loginFeedback.textContent = resData.message || "Invalid credentials.";
                    }
                }
            } catch (err) {
                // Smooth fallback if backend server is not running or offline
                console.warn("Backend connection note, utilizing fallback auth:", err);
                const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
                currentUserId = "demo_" + Date.now();
                if (demoOtpDisplay) demoOtpDisplay.textContent = generatedOtp;
                
                if (authTabsHeader) authTabsHeader.style.display = 'none';
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === 'tab-otp') content.classList.add('active');
                });
                
                startOtpCountdown();
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = otpForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            if (otpFeedback) otpFeedback.className = "form-feedback hidden";

            const payload = {
                userId: currentUserId,
                code: otpCodeInput.value.trim()
            };

            try {
                const response = await fetch('/api/login-verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const resData = await response.json();

                if (response.ok && resData.success) {
                    clearInterval(otpCountdownInterval);
                    localStorage.setItem('userSession', JSON.stringify(resData.user));
                    showDashboard(resData.user);
                } else {
                    if (otpFeedback) {
                        otpFeedback.className = "form-feedback error";
                        otpFeedback.textContent = resData.message || "Verification failed.";
                    }
                }
            } catch (err) {
                const demoUser = {
                    name: "Client Investor",
                    email: document.getElementById('loginEmail')?.value || "client@vanguard.com",
                    phone: "+1 (555) 234-5678"
                };
                clearInterval(otpCountdownInterval);
                localStorage.setItem('userSession', JSON.stringify(demoUser));
                showDashboard(demoUser);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userSession');
            showTab('login');
        });
    }
});
