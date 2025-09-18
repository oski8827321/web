// Simplified Interstellar Website - Canvas 2D Implementation
class InterstellarApp {
    constructor() {
        this.planets = [];
        this.selectedPlanet = null;
        this.isLoading = true;
        this.missionStartTime = Date.now();
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.time = 0;
        
        // Planet data
        this.planetData = {
            miller: {
                name: "Miller's Planet",
                x: 200,
                y: 150,
                radius: 25,
                color: '#4a9eff',
                timeDilation: 61320, // 1 hour = 7 years in seconds
                description: "A water world with extreme time dilation",
                orbitRadius: 120,
                orbitSpeed: 0.02,
                angle: 0
            },
            mann: {
                name: "Mann's Planet", 
                x: 400,
                y: 200,
                radius: 20,
                color: '#f0f8ff',
                timeDilation: 1, // Earth-like time
                description: "A frozen world with minimal time effects",
                orbitRadius: 180,
                orbitSpeed: 0.01,
                angle: Math.PI / 3
            },
            edmunds: {
                name: "Edmunds' Planet",
                x: 300,
                y: 300,
                radius: 22,
                color: '#ffa500',
                timeDilation: 1.2, // Slight dilation
                description: "A rocky world suitable for colonization",
                orbitRadius: 150,
                orbitSpeed: 0.015,
                angle: Math.PI
            }
        };
        
        this.bindEvents();
    }
    
    static init() {
        const app = new InterstellarApp();
        app.initialize();
        return app;
    }
    
    async initialize() {
        try {
            await this.showLoadingScreen();
            this.setupCanvas();
            this.setupPlanets();
            this.startRenderLoop();
            this.initializeClocks();
            this.startTimeUpdates();
            this.createBackgroundAnimation();
            await this.hideLoadingScreen();
        } catch (error) {
            console.error('Failed to initialize Interstellar app:', error);
        }
    }
    
    async showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        const stages = [
            'Calibrating temporal coordinates...',
            'Initializing gravitational field...',
            'Loading planet data...',
            'Preparing visual environment...',
            'Synchronizing time dilation...',
            'Ready for journey...'
        ];
        
        for (let i = 0; i < stages.length; i++) {
            loadingText.textContent = stages[i];
            await this.sleep(600);
        }
        
        await this.sleep(300);
    }
    
    async hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        this.isLoading = false;
        await this.sleep(1000);
        loadingScreen.style.display = 'none';
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('planets-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Create starfield background
        this.createStarField();
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Update planet positions based on canvas size
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        Object.keys(this.planetData).forEach(key => {
            const planet = this.planetData[key];
            planet.centerX = centerX;
            planet.centerY = centerY;
        });
    }
    
    createStarField() {
        if (!this.canvas) return;
        
        this.stars = [];
        const starCount = 200;
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    setupPlanets() {
        this.planets = Object.keys(this.planetData).map(key => ({
            key: key,
            ...this.planetData[key],
            hover: false,
            selected: false,
            glowIntensity: 0
        }));
    }
    
    startRenderLoop() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            if (!this.isLoading && this.ctx) {
                this.updateScene();
                this.render();
            }
        };
        animate();
    }
    
    updateScene() {
        this.time += 0.016; // ~60fps
        
        // Update planet positions (orbital motion)
        this.planets.forEach(planet => {
            if (planet.centerX && planet.centerY) {
                planet.angle += planet.orbitSpeed;
                planet.x = planet.centerX + Math.cos(planet.angle) * planet.orbitRadius;
                planet.y = planet.centerY + Math.sin(planet.angle) * planet.orbitRadius;
            }
        });
    }
    
    render() {
        if (!this.ctx) return;
        
        const { width, height } = this.canvas;
        
        // Clear canvas with space background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#111111');
        gradient.addColorStop(1, '#0a0a0a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw stars
        this.drawStars();
        
        // Draw orbital paths
        this.drawOrbitalPaths();
        
        // Draw planets
        this.drawPlanets();
        
        // Draw particles
        this.drawParticles();
    }
    
    drawStars() {
        if (!this.stars) return;
        
        this.stars.forEach(star => {
            const twinkle = Math.sin(this.time * star.twinkleSpeed) * 0.3 + 0.7;
            this.ctx.globalAlpha = star.opacity * twinkle;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawOrbitalPaths() {
        this.planets.forEach(planet => {
            if (planet.centerX && planet.centerY) {
                this.ctx.strokeStyle = 'rgba(74, 158, 255, 0.2)';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.arc(planet.centerX, planet.centerY, planet.orbitRadius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        });
    }
    
    drawPlanets() {
        this.planets.forEach(planet => {
            const { x, y, radius, color, hover, selected } = planet;
            
            // Planet glow effect
            if (hover || selected) {
                const glowRadius = radius + (hover ? 10 : 5);
                const gradient = this.ctx.createRadialGradient(x, y, radius, x, y, glowRadius);
                gradient.addColorStop(0, color + '80');
                gradient.addColorStop(1, color + '00');
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Planet body
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Planet atmosphere
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.6;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
            
            // Planet rotation effect (surface details)
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            const rotationOffset = this.time * 0.5;
            for (let i = 0; i < 3; i++) {
                const detailX = x + Math.cos(rotationOffset + i * Math.PI * 0.7) * (radius * 0.7);
                const detailY = y + Math.sin(rotationOffset + i * Math.PI * 0.7) * (radius * 0.3);
                this.ctx.beginPath();
                this.ctx.arc(detailX, detailY, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawParticles() {
        // Cosmic dust particles
        const particleCount = 50;
        this.ctx.fillStyle = 'rgba(74, 158, 255, 0.3)';
        
        for (let i = 0; i < particleCount; i++) {
            const x = (this.time * 2 + i * 43) % (this.canvas.width + 20) - 10;
            const y = (i * 37) % this.canvas.height;
            const size = Math.sin(this.time + i) * 0.5 + 1;
            
            this.ctx.globalAlpha = Math.sin(this.time + i) * 0.5 + 0.5;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }
    
    // Event handling
    bindEvents() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse events for planet interaction
        document.addEventListener('mousemove', (event) => this.onMouseMove(event));
        document.addEventListener('click', (event) => this.onClick(event));
        
        // Navigation
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('nav-link')) {
                event.preventDefault();
                const targetId = event.target.getAttribute('href');
                this.scrollToSection(targetId);
            }
        });
        
        // Start journey button
        const startButton = document.getElementById('start-journey');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.scrollToSection('#planets');
                this.startJourneyAnimation();
            });
        }
        
        // Visit planet buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('visit-button')) {
                const planetKey = event.target.getAttribute('data-planet');
                this.visitPlanet(planetKey);
            }
        });
    }
    
    onWindowResize() {
        this.resizeCanvas();
        this.createStarField();
    }
    
    onMouseMove(event) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Check planet hover
        let hoveredPlanet = null;
        this.planets.forEach(planet => {
            const distance = Math.sqrt((mouseX - planet.x) ** 2 + (mouseY - planet.y) ** 2);
            planet.hover = distance <= planet.radius + 10;
            if (planet.hover) {
                hoveredPlanet = planet;
            }
        });
        
        // Update cursor and show info
        if (hoveredPlanet) {
            this.canvas.style.cursor = 'pointer';
            this.showPlanetInfo(hoveredPlanet.key, mouseX, mouseY);
        } else {
            this.canvas.style.cursor = 'default';
            this.hidePlanetInfo();
        }
    }
    
    onClick(event) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Check planet click
        this.planets.forEach(planet => {
            const distance = Math.sqrt((mouseX - planet.x) ** 2 + (mouseY - planet.y) ** 2);
            if (distance <= planet.radius + 10) {
                this.selectPlanet(planet.key);
            }
        });
    }
    
    showPlanetInfo(planetKey, mouseX, mouseY) {
        this.hidePlanetInfo();
        
        const infoPanel = document.getElementById(`${planetKey}-info`);
        if (infoPanel) {
            infoPanel.classList.add('active');
            
            // Position the panel near the mouse
            const rect = this.canvas.getBoundingClientRect();
            const x = rect.left + mouseX + 20;
            const y = rect.top + mouseY - 50;
            
            infoPanel.style.left = `${Math.min(x, window.innerWidth - 340)}px`;
            infoPanel.style.top = `${Math.max(y, 20)}px`;
        }
    }
    
    hidePlanetInfo() {
        const panels = document.querySelectorAll('.planet-info-panel');
        panels.forEach(panel => panel.classList.remove('active'));
    }
    
    selectPlanet(planetKey) {
        // Update selection
        this.planets.forEach(p => p.selected = (p.key === planetKey));
        this.selectedPlanet = this.planets.find(p => p.key === planetKey);
        
        if (this.selectedPlanet) {
            // Update clock labels
            const planetClockLabel = document.querySelector('.planet-clock .clock-label');
            if (planetClockLabel) {
                planetClockLabel.textContent = this.selectedPlanet.name;
            }
            
            // Visual feedback - animate the planet
            const planet = this.selectedPlanet;
            const originalRadius = planet.radius;
            
            // Simple scale animation
            let scaleTime = 0;
            const scaleAnimation = () => {
                scaleTime += 0.1;
                planet.radius = originalRadius + Math.sin(scaleTime * 2) * 3;
                
                if (scaleTime < Math.PI) {
                    requestAnimationFrame(scaleAnimation);
                } else {
                    planet.radius = originalRadius;
                }
            };
            scaleAnimation();
        }
    }
    
    visitPlanet(planetKey) {
        this.selectPlanet(planetKey);
        this.updateTimeline(4);
    }
    
    // Time and clock management
    initializeClocks() {
        this.earthTime = new Date();
        this.updateClockDisplay();
    }
    
    startTimeUpdates() {
        setInterval(() => {
            this.updateTime();
            this.updateClockDisplay();
            this.updateStats();
        }, 1000);
    }
    
    updateTime() {
        this.earthTime = new Date();
    }
    
    updateClockDisplay() {
        const earthTimeElement = document.getElementById('earth-time');
        const earthClockTime = document.querySelector('.earth-clock .clock-time');
        
        if (earthTimeElement) {
            earthTimeElement.textContent = this.earthTime.toLocaleTimeString();
        }
        
        if (earthClockTime) {
            earthClockTime.textContent = this.earthTime.toLocaleTimeString();
        }
        
        // Update analog clock hands
        this.updateAnalogClock('.earth-clock', this.earthTime);
        
        // Update planet time if one is selected
        if (this.selectedPlanet) {
            const planetTime = this.calculatePlanetTime(this.selectedPlanet.timeDilation);
            const planetClockTime = document.querySelector('.planet-clock .clock-time');
            
            if (planetClockTime) {
                planetClockTime.textContent = planetTime.toLocaleTimeString();
            }
            
            this.updateAnalogClock('.planet-clock', planetTime);
        }
    }
    
    updateAnalogClock(selector, time) {
        const clockElement = document.querySelector(selector);
        if (!clockElement) return;
        
        const hours = time.getHours() % 12;
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        
        const hourHand = clockElement.querySelector('.hour-hand');
        const minuteHand = clockElement.querySelector('.minute-hand');
        const secondHand = clockElement.querySelector('.second-hand');
        
        if (hourHand) {
            const hourDegrees = (hours * 30) + (minutes * 0.5);
            hourHand.style.transform = `rotate(${hourDegrees}deg)`;
        }
        
        if (minuteHand) {
            const minuteDegrees = minutes * 6;
            minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
        }
        
        if (secondHand) {
            const secondDegrees = seconds * 6;
            secondHand.style.transform = `rotate(${secondDegrees}deg)`;
        }
    }
    
    calculatePlanetTime(dilationFactor) {
        const earthSeconds = Math.floor((Date.now() - this.missionStartTime) / 1000);
        const planetSeconds = earthSeconds / dilationFactor;
        const planetTime = new Date(this.missionStartTime + (planetSeconds * 1000));
        return planetTime;
    }
    
    updateStats() {
        const missionTimeElement = document.getElementById('mission-time');
        const distanceElement = document.getElementById('distance');
        
        if (missionTimeElement) {
            const missionDays = Math.floor((Date.now() - this.missionStartTime) / (1000 * 60 * 60 * 24));
            missionTimeElement.textContent = `${missionDays} Days`;
        }
        
        if (distanceElement) {
            const distance = Math.floor(Math.random() * 100) + 50;
            distanceElement.textContent = `${distance} AU`;
        }
    }
    
    // Utility methods
    scrollToSection(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    startJourneyAnimation() {
        // Simple text animation for stats
        let dayCounter = 0;
        let distanceCounter = 0;
        
        const animateStats = () => {
            if (dayCounter < 1) {
                dayCounter += 0.05;
                const missionTimeElement = document.getElementById('mission-time');
                if (missionTimeElement) {
                    missionTimeElement.textContent = `${Math.floor(dayCounter)} Days`;
                }
            }
            
            if (distanceCounter < 10) {
                distanceCounter += 0.5;
                const distanceElement = document.getElementById('distance');
                if (distanceElement) {
                    distanceElement.textContent = `${Math.floor(distanceCounter)} AU`;
                }
            }
            
            if (dayCounter < 1 || distanceCounter < 10) {
                requestAnimationFrame(animateStats);
            }
        };
        
        animateStats();
        this.updateTimeline(2);
    }
    
    updateTimeline(step) {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            if (index < step) {
                item.classList.add('completed');
            } else if (index === step - 1) {
                item.classList.add('active');
            }
        });
    }
    
    createBackgroundAnimation() {
        // Add floating elements to the hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 4 + 1}px;
                    height: ${Math.random() * 4 + 1}px;
                    background: rgba(74, 158, 255, ${Math.random() * 0.5 + 0.2});
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: float ${Math.random() * 10 + 5}s infinite linear;
                    z-index: 1;
                `;
                heroSection.appendChild(particle);
            }
        }
        
        // Add CSS animation for floating particles
        if (!document.getElementById('floating-animation')) {
            const style = document.createElement('style');
            style.id = 'floating-animation';
            style.textContent = `
                @keyframes float {
                    0% { transform: translateY(100vh) translateX(0); }
                    100% { transform: translateY(-100px) translateX(50px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize when DOM is loaded
if (typeof window !== 'undefined') {
    window.InterstellarApp = InterstellarApp;
}

// Spacetime visualization
function createSpacetimeVisualization() {
    const canvas = document.getElementById('spacetime-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 200;
    const height = canvas.height = 200;
    
    let animationFrame;
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw spacetime grid with warping effect
        ctx.strokeStyle = 'rgba(74, 158, 255, 0.4)';
        ctx.lineWidth = 1;
        
        const time = Date.now() * 0.001;
        const gridSize = 15;
        
        for (let x = 0; x <= width; x += gridSize) {
            for (let y = 0; y <= height; y += gridSize) {
                const centerX = width / 2;
                const centerY = height / 2;
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const warp = Math.max(0, 1 - distance / 80) * Math.sin(time * 2) * 5;
                
                ctx.beginPath();
                ctx.moveTo(x, y + warp);
                ctx.lineTo(x + gridSize, y + warp);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x + warp, y);
                ctx.lineTo(x + warp, y + gridSize);
                ctx.stroke();
            }
        }
        
        // Draw central mass (black hole)
        const centerX = width / 2;
        const centerY = height / 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(74, 158, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.stroke();
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    };
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Start spacetime visualization
    setTimeout(createSpacetimeVisualization, 1000);
});