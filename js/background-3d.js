/* ============================================================= */
/*  js/background-3d.js – ROBUST & MOBILE OPTIMIZED              */
/* ============================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // --- 1. SAFETY CHECK: Can we run 3D? ---
    if (!window.WebGLRenderingContext) {
        console.warn("⚠️ WebGL not supported. 3D Background disabled.");
        return; // Stop here, fall back to CSS background
    }

    let scene, camera, renderer, crestMesh, particlesMesh;

    try {
        // --- 2. SCENE SETUP ---
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer with Alpha (Transparency)
renderer = new THREE.WebGLRenderer({
    alpha: true,      // Enable transparency
    antialias: true,  // Smooth edges
    preserveDrawingBuffer: true // Optional: keeps canvas content after render
});

// Make sure canvas fills the viewport
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance

// Fully transparent background (important for z-index -1)
renderer.setClearColor(0x000000, 0); 

// Append to container
container.appendChild(renderer.domElement);

    } catch (e) {
        console.error("❌ WebGL Crash:", e.message);
        container.style.display = 'none';
        return;
    }

    // --- 3. THE CREST (Mesh) ---
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load('./assets/crest.png', (texture) => {
        const geometry = new THREE.PlaneGeometry(3.5, 3.5);
        
        // Use MeshBasicMaterial so it glows without needing external light sources
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
        });

        crestMesh = new THREE.Mesh(geometry, material);
        scene.add(crestMesh);
    }, undefined, (err) => console.error("❌ Error loading Crest:", err));

    // --- 4. LIGHTING (Kept for scene ambiance if needed later) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xFDBE11, 2, 100);
    pointLight.position.set(2, 2, 5);
    scene.add(pointLight);

    // --- 5. SMART PARTICLES (Performance Optimized) ---
    const isMobile = window.innerWidth < 768;
    
    // Desktop: 300 (Rich), Mobile: 100 (Fast)
    const particlesCount = isMobile ? 100 : 300; 
    
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        // Spread particles: X (-15 to 15), Y (-15 to 15), Z (-5 to 5)
        posArray[i] = (Math.random() - 0.5) * 30; 
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: isMobile ? 0.08 : 0.05, // Larger on mobile for visibility
        color: 0xFDBE11, 
        transparent: true,
        opacity: 0.6
    });

    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- 6. INTERACTIVITY ---
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    // Only track mouse on desktop to save resources
    if (!isMobile) {
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX);
            mouseY = (event.clientY - windowHalfY);
        });
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- 7. ANIMATION LOOP & BATTERY SAVER ---
    const clock = new THREE.Clock();
    let animationId;

    function animate() {
        animationId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        if (crestMesh) {
            // Gentle Floating
            crestMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.2;

            if (!isMobile) {
                // Parallax only on Desktop
                const targetX = mouseX * 0.001;
                const targetY = mouseY * 0.001;
                crestMesh.rotation.y += 0.05 * (targetX - crestMesh.rotation.y);
                crestMesh.rotation.x += 0.05 * (targetY - crestMesh.rotation.x);
            } else {
                // Auto-spin on Mobile
                crestMesh.rotation.y = Math.sin(elapsedTime * 0.2) * 0.1;
            }
        }

        // Rotate Particles
        if (particlesMesh) {
            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.x = elapsedTime * 0.02;
        }

        renderer.render(scene, camera);
    }

    // Start Animation
    animate();

    // --- 8. BATTERY SAVER: PAUSE WHEN TAB HIDDEN ---
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId); // Pause
        } else {
            clock.getDelta(); // Reset clock delta to prevent jump
            animate(); // Resume
        }
    });
});

console.log('Canvas container:', document.getElementById('canvas-container'));
