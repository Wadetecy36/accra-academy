/* ============================================================= */
/*  js/background-3d.js – THE ACCRA ACADEMY HOLOGRAM             */
/* ============================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();

    // Camera config
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer config (Transparent background)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 2. THE CREST (Mesh)
    const textureLoader = new THREE.TextureLoader();
    let crestMesh;

    // Load your specific crest image
    textureLoader.load('./assets/crest.png', (texture) => {
        // Geometry: Plane (Width, Height)
        const geometry = new THREE.PlaneGeometry(3.5, 3.5);

        // Material: Reacts to light, transparent
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

    // 3. LIGHTING (Cinematic)
    // Ambient Light (Soft base)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Point Light (The "Gold" shine)
    const pointLight = new THREE.PointLight(0xFDBE11, 2, 100); // Gold Color
    pointLight.position.set(2, 2, 5);
    scene.add(pointLight);

    // 4. PARTICLES (The "Bleoo Spirit" Dust)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200; // Number of floating specks
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        // Random positions around the crest
        posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xFDBE11, // Gold dust
        transparent: true,
        opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 5. INTERACTIVITY (Mouse Parallax)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 6. ANIMATION LOOP
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        if (crestMesh) {
            // Automatic gentle floating
            crestMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.2;

            // Mouse Interaction (Parallax Tilt)
            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;

            // Smooth interpolation (Ease-out)
            crestMesh.rotation.y += 0.05 * (targetX - crestMesh.rotation.y);
            crestMesh.rotation.x += 0.05 * (targetY - crestMesh.rotation.x);

            // Background slow spin independent of mouse
            crestMesh.rotation.z = Math.sin(elapsedTime * 0.2) * 0.05;
        }

        // Rotate Particles
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        renderer.render(scene, camera);
    }

    animate();
});