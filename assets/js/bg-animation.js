let scene, camera, renderer;
let spheres = [];
let targetPositions = [];
const sphereCount = 30;

// For mouse parallax
let mouseX = 0, mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 1000;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("bg-animation").appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    for (let i = 0; i < sphereCount; i++) {
        const radius = Math.random() * 10 + 8;
        const geometry = new THREE.SphereGeometry(radius, 32, 32);

        // Neon gradient: purple → blue
        const color = new THREE.Color().setHSL(0.7 + Math.random() * 0.1, 0.8, 0.6);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });

        const sphere = new THREE.Mesh(geometry, material);

        sphere.orbitRadius = 200 + Math.random() * 400;
        sphere.orbitSpeed = 0.001 + Math.random() * 0.003;
        sphere.angle = Math.random() * Math.PI * 2;
        sphere.yOffset = (Math.random() - 0.5) * 200;

        group.add(sphere);
        spheres.push(sphere);
        targetPositions.push(sphere.position.clone());
    }

    window.addEventListener("scroll", updateTargetPositions);
    document.addEventListener("mousemove", onMouseMove);

    animate();
}

// Update target positions based on scroll
function updateTargetPositions() {
    const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);

    spheres.forEach((sphere, i) => {
        let target = new THREE.Vector3();
        if (scrollPercent < 0.33) { // circle
            sphere.angle += sphere.orbitSpeed;
            target.x = Math.cos(sphere.angle) * sphere.orbitRadius;
            target.z = Math.sin(sphere.angle) * sphere.orbitRadius;
            target.y = sphere.yOffset + Math.sin(sphere.angle * 2) * 50;
        } else if (scrollPercent < 0.66) { // wave
            target.x = (i - sphereCount / 2) * 50;
            target.z = Math.sin(Date.now() * 0.001 + i) * 300;
            target.y = Math.sin(Date.now() * 0.002 + i) * 200;
        } else { // grid
            const row = Math.floor(i / 6);
            const col = i % 6;
            target.x = (col - 3) * 100;
            target.y = (row - 2) * 100;
            target.z = Math.sin(Date.now() * 0.001 + i) * 200;
        }
        targetPositions[i].copy(target);
    });
}

// Mouse movement for subtle parallax
function onMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.05;
    mouseY = (event.clientY - windowHalfY) * 0.05;
}

function animate() {
    requestAnimationFrame(animate);

    spheres.forEach((sphere, i) => {
        // Smoothly move towards target
        sphere.position.lerp(targetPositions[i], 0.07);

        // Add trailing glow effect by scaling slightly
        sphere.scale.x = sphere.scale.y = sphere.scale.z = 0.9 + Math.sin(Date.now() * 0.005 + i) * 0.2;
    });

    // Parallax effect
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();