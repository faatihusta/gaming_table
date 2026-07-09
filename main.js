import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- SCENE SETUP ---
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.02);

// Camera
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
// Initial camera position (looking at the whole desk)
camera.position.set(0, 8, 15);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// --- LIGHTING ---
// Genel ortam ışığı ciddi şekilde artırıldı
const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
scene.add(ambientLight);

// Masayı tam tepeden aydınlatan GÜÇLÜ beyaz spot ışığı
const mainSpotLight = new THREE.SpotLight(0xffffff, 2500);
mainSpotLight.position.set(0, 20, 5);
mainSpotLight.angle = Math.PI / 2.5;
mainSpotLight.penumbra = 0.5;
mainSpotLight.castShadow = true;
scene.add(mainSpotLight);

const purpleSpotLight = new THREE.SpotLight(0x8a2be2, 1500);
purpleSpotLight.position.set(0, 15, -5);
purpleSpotLight.angle = Math.PI / 3;
purpleSpotLight.penumbra = 0.5;
scene.add(purpleSpotLight);

// Neon ışıkların gücü
const blueNeon = new THREE.PointLight(0x00d2ff, 400, 25);
blueNeon.position.set(-5, 5, -2);
scene.add(blueNeon);

const purpleNeon = new THREE.PointLight(0x8a2be2, 400, 25);
purpleNeon.position.set(5, 5, 2);
scene.add(purpleNeon);

// --- DESK MOCKUP ---
const deskGroup = new THREE.Group();
scene.add(deskGroup);

// Material (Karanlık Karbon Fiber ama çok daha aydınlık ve gri tonlarda)
const deskMaterial = new THREE.MeshStandardMaterial({
    color: 0x666670, // Çok daha açık bir gri/mavi tonu
    roughness: 0.3,
    metalness: 0.5
});
const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888, // Ayaklar ve metal aksamlar için açık gri
    roughness: 0.2,
    metalness: 0.8
});

// Table Top
const topGeometry = new THREE.BoxGeometry(12, 0.5, 6);
const top = new THREE.Mesh(topGeometry, deskMaterial);
top.position.y = 4;
top.castShadow = true;
top.receiveShadow = true;
deskGroup.add(top);

// Legs
const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 4);
const positions = [
    [-5.5, 2, -2.5],
    [5.5, 2, -2.5],
    [-5.5, 2, 2.5],
    [5.5, 2, 2.5]
];
positions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, metalMaterial);
    leg.position.set(...pos);
    leg.castShadow = true;
    deskGroup.add(leg);
});

// Monitor (Placeholder)
const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.5), metalMaterial);
monitorStand.position.set(0, 4.75, -2);
deskGroup.add(monitorStand);

// Ekran simsiyah olmasın diye mavi/mor bir parlama (emissive) eklendi
const monitorScreen = new THREE.Mesh(
    new THREE.BoxGeometry(6, 3.5, 0.2), 
    new THREE.MeshStandardMaterial({ 
        color: 0x111122, 
        emissive: 0x1a0b2e, // Ekranın kendinden hafif parlaması için
        roughness: 0.1, 
        metalness: 0.9 
    })
);
monitorScreen.position.set(0, 5.5, -1.8);
monitorScreen.castShadow = true;
deskGroup.add(monitorScreen);

const screenGlow = new THREE.RectAreaLight(0x4a00e0, 8, 6, 3.5);
screenGlow.position.set(0, 5.5, -1.6);
screenGlow.lookAt(0, 5.5, 0);
deskGroup.add(screenGlow);

// Cup Holder
const cupHolderGroup = new THREE.Group();
const cupHolderRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.05, 16, 32),
    metalMaterial
);
cupHolderRing.rotation.x = Math.PI / 2;
cupHolderGroup.add(cupHolderRing);

const cupGlow = new THREE.PointLight(0xff0055, 100, 4); // Işık gücü artırıldı
cupGlow.position.set(0, 0, 0);
cupHolderGroup.add(cupGlow);

cupHolderGroup.position.set(5, 4.25, 2);
deskGroup.add(cupHolderGroup);

// Mousepad
const mousepad = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 3),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 }) // Daha belirgin bir gri
);
mousepad.rotation.x = -Math.PI / 2;
mousepad.position.set(0, 4.26, 0.5);
deskGroup.add(mousepad);


// --- ANIMATION LOOP ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    
    // Slow rotation for ambient feel
    const elapsedTime = clock.getElapsedTime();
    blueNeon.position.x = Math.sin(elapsedTime * 0.5) * 5;
    blueNeon.position.z = Math.cos(elapsedTime * 0.5) * 3;

    renderer.render(scene, camera);
}
animate();

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});


// --- GSAP SCROLL ANIMATIONS ---
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
    }
});

// Camera Target Object (to interpolate lookAt)
const camTarget = new THREE.Vector3(0, 4, 0);

// Helper to update camera lookAt
function updateCameraLookAt() {
    camera.lookAt(camTarget);
}

// Initial lookAt
camera.lookAt(camTarget);

// Step 1: Initial view (Card fades in)
gsap.to("#step-1 .glass-card", {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
        trigger: "#step-1",
        start: "top center",
        end: "bottom center",
        toggleActions: "play reverse play reverse"
    }
});

// Step 2: Wide surface view
tl.to(camera.position, { x: -6, y: 7, z: 8, ease: "power1.inOut" }, 0)
  .to(camTarget, { x: -2, y: 4, z: 0, onUpdate: updateCameraLookAt, ease: "power1.inOut" }, 0);

gsap.to("#step-2 .glass-card", {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
        trigger: "#step-2",
        start: "top center",
        end: "bottom center",
        toggleActions: "play reverse play reverse"
    }
});

// Step 3: Cup holder focus
tl.to(camera.position, { x: 5, y: 6, z: 5, ease: "power1.inOut" }, 1)
  .to(camTarget, { x: 5, y: 4.25, z: 2, onUpdate: updateCameraLookAt, ease: "power1.inOut" }, 1);

gsap.to("#step-3 .glass-card", {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
        trigger: "#step-3",
        start: "top center",
        end: "bottom center",
        toggleActions: "play reverse play reverse"
    }
});

// Step 4: Cable management (Back of desk)
tl.to(camera.position, { x: 0, y: 6, z: -6, ease: "power1.inOut" }, 2)
  .to(camTarget, { x: 0, y: 4, z: -2, onUpdate: updateCameraLookAt, ease: "power1.inOut" }, 2);

gsap.to("#step-4 .glass-card", {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
        trigger: "#step-4",
        start: "top center",
        end: "bottom center",
        toggleActions: "play reverse play reverse"
    }
});

// Step 5: Final Call to Action (Front wide view again)
tl.to(camera.position, { x: 0, y: 5, z: 12, ease: "power1.inOut" }, 3)
  .to(camTarget, { x: 0, y: 4, z: 0, onUpdate: updateCameraLookAt, ease: "power1.inOut" }, 3);

gsap.to("#step-5 .glass-card", {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
        trigger: "#step-5",
        start: "top center",
        end: "bottom center",
        toggleActions: "play reverse play reverse"
    }
});
