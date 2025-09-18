// Interstellar Website - Main JavaScript Application
class InterstellarApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.planets = [];
        this.selectedPlanet = null;
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.isLoading = true;
        this.timeScale = 1;
        this.missionStartTime = Date.now();
        
        // Planet data
        this.planetData = {
            miller: {
                name: "Miller's Planet",
                position: { x: -8, y: 0, z: 2 },
                color: 0x4a9eff,
                size: 1.2,
                timeDilation: 61320, // 1 hour = 7 years in seconds
                description: "A water world with extreme time dilation",
                gravity: 1.3,
                surface: "Ocean",
                hazards: "Tidal waves"
            },
            mann: {
                name: "Mann's Planet",
                position: { x: 8, y: 2, z: -3 },
                color: 0xf0f8ff,
                size: 1.0,
                timeDilation: 1, // Earth-like time
                description: "A frozen world with minimal time effects",
                gravity: 0.8,
                surface: "Frozen clouds",
                hazards: "Extreme cold"
            },
            edmunds: {
                name: "Edmunds' Planet",
                position: { x: 0, y: -3, z: 8 },
                color: 0xffa500,
                size: 1.1,
                timeDilation: 1.2, // Slight dilation
                description: "A rocky world suitable for colonization",
                gravity: 1.0,
                surface: "Rocky terrain",
                hazards: "Dust storms"
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
            this.setupScene();
            this.createPlanets();
            this.setupLighting();
            this.startRenderLoop();
            this.initializeClocks();
            this.startTimeUpdates();
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
            'Preparing 3D environment...',
            'Synchronizing time dilation...',
            'Ready for journey...'
        ];
        
        for (let i = 0; i < stages.length; i++) {
            loadingText.textContent = stages[i];
            progressBar.style.transform = `translateX(${(i - stages.length) * 100 / stages.length}%)`;
            await this.sleep(800);
        }
        
        progressBar.style.transform = 'translateX(0%)';
        await this.sleep(500);
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
    
    setupScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer setup
        const canvas = document.getElementById('planets-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add stars background
        this.createStarField();
        
        // Add cosmic dust particles
        this.createParticleSystem();
    }
    
    createStarField() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 2000;
        const positions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 200;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }
    
    createParticleSystem() {
        const particleCount = 500;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            
            const color = new THREE.Color();
            color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        
        // Animate particles
        this.animateParticles = () => {
            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= 0.01;
                if (positions[i + 1] < -25) {
                    positions[i + 1] = 25;
                }
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
        };
    }
    
    createPlanets() {
        Object.keys(this.planetData).forEach((key, index) => {
            const data = this.planetData[key];
            const planet = this.createPlanet(data, key);
            this.planets.push(planet);
            this.scene.add(planet.group);
        });
    }
    
    createPlanet(data, key) {
        const group = new THREE.Group();
        
        // Planet geometry and material
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        
        // Create planet texture based on type
        const material = this.createPlanetMaterial(data, key);
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { planetKey: key, planetData: data };
        
        // Add atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(data.size * 1.05, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(data.size * 1.2, 16, 16);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(data.color) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(color, intensity * 0.3);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        
        group.add(mesh);
        group.add(atmosphere);
        group.add(glow);
        
        // Position the planet
        group.position.set(data.position.x, data.position.y, data.position.z);
        
        // Add orbital path
        const orbitRadius = Math.sqrt(
            data.position.x * data.position.x + 
            data.position.z * data.position.z
        );
        const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.1, orbitRadius + 0.1, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = -Math.PI / 2;
        this.scene.add(orbit);
        
        return {
            group: group,
            mesh: mesh,
            atmosphere: atmosphere,
            glow: glow,
            data: data,
            key: key,
            orbitRadius: orbitRadius,
            orbitSpeed: 0.01 / (orbitRadius * 0.5), // Slower for outer planets
            rotation: 0
        };
    }
    
    createPlanetMaterial(data, key) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Generate procedural texture based on planet type
        if (key === 'miller') {
            // Water world - blue with wave patterns
            const gradient = ctx.createLinearGradient(0, 0, 0, 256);
            gradient.addColorStop(0, '#001122');
            gradient.addColorStop(0.3, '#003366');
            gradient.addColorStop(0.7, '#0066cc');
            gradient.addColorStop(1, '#4a9eff');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 256);
            
            // Add wave patterns
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.moveTo(0, Math.random() * 256);
                for (let x = 0; x < 512; x += 20) {
                    ctx.lineTo(x, Math.sin(x * 0.02 + i) * 20 + Math.random() * 256);
                }
                ctx.stroke();
            }
        } else if (key === 'mann') {
            // Ice world - white and blue
            const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 200);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.5, '#e6f3ff');
            gradient.addColorStop(1, '#b3d9ff');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 256);
            
            // Add ice crystals
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 256;
                const size = Math.random() * 3 + 1;
                ctx.fillRect(x, y, size, size);
            }
        } else if (key === 'edmunds') {
            // Rocky world - orange and brown
            const gradient = ctx.createLinearGradient(0, 0, 512, 256);
            gradient.addColorStop(0, '#8B4513');
            gradient.addColorStop(0.3, '#A0522D');
            gradient.addColorStop(0.6, '#CD853F');
            gradient.addColorStop(1, '#FFA500');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 256);
            
            // Add rocky texture
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 256;
                const size = Math.random() * 8 + 2;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return new THREE.MeshPhongMaterial({
            map: texture,
            shininess: key === 'miller' ? 100 : 30,
            transparent: key === 'miller',
            opacity: key === 'miller' ? 0.9 : 1.0
        });
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(10, 10, 5);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        this.scene.add(sunLight);
        
        // Accent lights for atmosphere
        const blueLight = new THREE.PointLight(0x4a9eff, 0.5, 50);
        blueLight.position.set(-10, 5, 10);
        this.scene.add(blueLight);
        
        const cyanLight = new THREE.PointLight(0x00d4ff, 0.3, 30);
        cyanLight.position.set(10, -5, -10);
        this.scene.add(cyanLight);
    }
    
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            if (!this.isLoading) {
                this.updateScene();
                this.renderer.render(this.scene, this.camera);
            }
        };
        animate();
    }
    
    updateScene() {
        const elapsedTime = this.clock.getElapsedTime();
        
        // Animate particles
        if (this.animateParticles) {
            this.animateParticles();
        }
        
        // Update planets
        this.planets.forEach(planet => {
            // Rotate planet
            planet.mesh.rotation.y += 0.01;
            
            // Orbital motion
            planet.rotation += planet.orbitSpeed;
            const x = Math.cos(planet.rotation) * planet.orbitRadius;
            const z = Math.sin(planet.rotation) * planet.orbitRadius;
            planet.group.position.x = x;
            planet.group.position.z = z;
            
            // Update glow shader
            if (planet.glow.material.uniforms) {
                planet.glow.material.uniforms.time.value = elapsedTime;
            }
        });
        
        // Smooth camera movement
        if (this.selectedPlanet) {
            const targetPosition = this.selectedPlanet.group.position.clone();
            targetPosition.add(new THREE.Vector3(0, 2, 5));
            this.camera.position.lerp(targetPosition, 0.02);
            this.camera.lookAt(this.selectedPlanet.group.position);
        }
    }
    
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
            const planetTime = this.calculatePlanetTime(this.selectedPlanet.data.timeDilation);
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
            const distance = Math.floor(Math.random() * 100) + 50; // Simulated distance
            distanceElement.textContent = `${distance} AU`;
        }
    }
    
    bindEvents() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse events for planet interaction
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        window.addEventListener('click', (event) => this.onClick(event));
        
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
        
        // Audio toggle
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => this.toggleAudio());
        }
        
        // Info toggle
        const infoToggle = document.getElementById('info-toggle');
        if (infoToggle) {
            infoToggle.addEventListener('click', () => this.toggleInfo());
        }
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    onMouseMove(event) {
        if (!this.renderer) return;
        
        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Raycast for planet hover effects
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.planets.map(p => p.mesh)
        );
        
        // Reset all planet scales
        this.planets.forEach(planet => {
            gsap.to(planet.group.scale, {
                duration: 0.3,
                x: 1,
                y: 1,
                z: 1
            });
        });
        
        // Highlight hovered planet
        if (intersects.length > 0) {
            const hoveredPlanet = intersects[0].object;
            gsap.to(hoveredPlanet.parent.scale, {
                duration: 0.3,
                x: 1.1,
                y: 1.1,
                z: 1.1
            });
            
            // Show planet info
            this.showPlanetInfo(hoveredPlanet.userData.planetKey);
            canvas.style.cursor = 'pointer';
        } else {
            this.hidePlanetInfo();
            canvas.style.cursor = 'default';
        }
    }
    
    onClick(event) {
        if (!this.renderer) return;
        
        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) {
            return;
        }
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.planets.map(p => p.mesh)
        );
        
        if (intersects.length > 0) {
            const clickedPlanet = intersects[0].object;
            this.selectPlanet(clickedPlanet.userData.planetKey);
        }
    }
    
    showPlanetInfo(planetKey) {
        this.hidePlanetInfo();
        
        const infoPanel = document.getElementById(`${planetKey}-info`);
        if (infoPanel) {
            infoPanel.classList.add('active');
            
            // Position the panel near the planet
            const planet = this.planets.find(p => p.key === planetKey);
            if (planet) {
                const vector = planet.group.position.clone();
                vector.project(this.camera);
                
                const x = (vector.x * 0.5 + 0.5) * this.renderer.domElement.clientWidth;
                const y = (vector.y * -0.5 + 0.5) * this.renderer.domElement.clientHeight;
                
                infoPanel.style.left = `${Math.min(x + 20, window.innerWidth - 340)}px`;
                infoPanel.style.top = `${Math.max(y - 100, 20)}px`;
            }
        }
    }
    
    hidePlanetInfo() {
        const panels = document.querySelectorAll('.planet-info-panel');
        panels.forEach(panel => panel.classList.remove('active'));
    }
    
    selectPlanet(planetKey) {
        const planet = this.planets.find(p => p.key === planetKey);
        if (planet) {
            this.selectedPlanet = planet;
            
            // Update clock labels
            const planetClockLabel = document.querySelector('.planet-clock .clock-label');
            if (planetClockLabel) {
                planetClockLabel.textContent = planet.data.name;
            }
            
            // Show selection feedback
            gsap.to(planet.group.rotation, {
                duration: 2,
                y: planet.group.rotation.y + Math.PI * 2,
                ease: "power2.out"
            });
            
            // Camera focus animation
            const targetPosition = planet.group.position.clone();
            targetPosition.add(new THREE.Vector3(0, 2, 5));
            
            gsap.to(this.camera.position, {
                duration: 2,
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z,
                ease: "power2.inOut"
            });
        }
    }
    
    visitPlanet(planetKey) {
        this.selectPlanet(planetKey);
        
        // Add visual effect for planet visit
        const planet = this.planets.find(p => p.key === planetKey);
        if (planet) {
            // Create a flash effect
            const flash = new THREE.Mesh(
                new THREE.SphereGeometry(planet.data.size * 2, 16, 16),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0
                })
            );
            flash.position.copy(planet.group.position);
            this.scene.add(flash);
            
            gsap.to(flash.material, {
                duration: 0.5,
                opacity: 0.8,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    this.scene.remove(flash);
                }
            });
            
            // Update timeline
            this.updateTimeline(4);
        }
    }
    
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
        // Animate hero stats
        gsap.to('#mission-time', {
            duration: 2,
            textContent: '1 Days',
            ease: "power2.out"
        });
        
        gsap.to('#distance', {
            duration: 2,
            textContent: '10 AU',
            ease: "power2.out"
        });
        
        // Update timeline
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
    
    toggleAudio() {
        // Placeholder for audio functionality
        const audioIcon = document.querySelector('.audio-icon');
        if (audioIcon) {
            audioIcon.textContent = audioIcon.textContent === '🔊' ? '🔇' : '🔊';
        }
    }
    
    toggleInfo() {
        // Toggle information panels visibility
        const infoPanels = document.querySelectorAll('.planet-info-panel');
        const isVisible = infoPanels[0]?.style.display !== 'none';
        
        infoPanels.forEach(panel => {
            panel.style.display = isVisible ? 'none' : 'block';
        });
    }
}

// Initialize when DOM is loaded
if (typeof window !== 'undefined') {
    window.InterstellarApp = InterstellarApp;
}

// Additional utility functions
function createSpacetimeVisualization() {
    const canvas = document.getElementById('spacetime-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    let animationFrame;
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw spacetime grid
        ctx.strokeStyle = 'rgba(74, 158, 255, 0.3)';
        ctx.lineWidth = 1;
        
        const time = Date.now() * 0.001;
        const gridSize = 20;
        
        for (let x = 0; x <= width; x += gridSize) {
            for (let y = 0; y <= height; y += gridSize) {
                const distortion = Math.sin(time + (x + y) * 0.02) * 2;
                ctx.beginPath();
                ctx.moveTo(x, y + distortion);
                ctx.lineTo(x + gridSize, y + distortion);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x + distortion, y);
                ctx.lineTo(x + distortion, y + gridSize);
                ctx.stroke();
            }
        }
        
        // Draw black hole effect in center
        const centerX = width / 2;
        const centerY = height / 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(74, 158, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
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

// Start spacetime visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(createSpacetimeVisualization, 1000);
});