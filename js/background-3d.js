/* ============================================================= */
/*  js/background-3d.js – ROBUST ERROR HANDLING                  */
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

        // Try to initialize renderer. If this fails, the catch block handles it.
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

    } catch (e) {
        console.error("❌ WebGL Crash:", e.message);
        // Fallback: Ensure container is hidden so static BG shows
        container.style.display = 'none';
        return;
    }

    // --- 3. THE CREST (Mesh) ---
    const textureLoader = new THREE.TextureLoader();

    // Load your specific crest image
    textureLoader.load('./assets/crest.png', (texture) => {
        const geometry = new THREE.PlaneGeometry(3.5, 3.5);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            roughness: 0.4,
            metalness: 0.6
        });

        crestMesh = new THREE.Mesh(geometry, material);
        scene.add(crestMesh);
    });

    // --- 4. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xFDBE11, 2, 100);
    pointLight.position.set(2, 2, 5);
    scene.add(pointLight);

    // --- 5. PARTICLES ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xFDBE11,
        transparent: true,
        opacity: 0.8
    });

    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- 6. INTERACTIVITY ---
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- 7. ANIMATION LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        if (crestMesh) {
            // Floating
            crestMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.2;

            // Mouse Parallax
            const targetX = mouseX * 0.001;
            const targetY = mouseY * 0.001;

            crestMesh.rotation.y += 0.05 * (targetX - crestMesh.rotation.y);
            crestMesh.rotation.x += 0.05 * (targetY - crestMesh.rotation.x);

            // Slow Spin
            crestMesh.rotation.z = Math.sin(elapsedTime * 0.2) * 0.05;
        }

        // Rotate Particles
        if (particlesMesh) {
            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.x = elapsedTime * 0.02;
        }

        renderer.render(scene, camera);
    }

    animate();
});