import * as THREE from 'three';
import { CameraController } from './src/cameraController.js';
import { getCoordsForState } from './src/particleStates.js';
import { translations, getCurrentLang, applyLanguage, setupLanguageSwitch } from './src/i18n.js';

let camera, scene, renderer, cameraController;
let geometry, positionsOriginal, particleCount = 30000;
let positions, streamIDs, livePos, flowPhase;
let particlesMesh, bgRadialsEl;

let currentMode = 0;
let targetMode = 0;
let transitionProgress = 1.0;

let currentSlideIndex = 0;
let slides = [];

// Posición del gradiente ambiental rojo por estado (% de pantalla)
const bgPositions = [
    { x: 75, y: 50 },   // 0: FLOR / EXPANSIÓN (visual-right)
    { x: 75, y: 50 },   // 1: EXPANSIÓN (visual-right)
    { x: 25, y: 50 },   // 2: MUNDO + UNIVERSIDAD (visual-left)
    { x: 75, y: 50 },   // 3: FRAGMENTACIÓN (visual-right)
    { x: 75, y: 50 },   // 4: IMPACTO (visual-right)
    { x: 25, y: 50 },   // 5: COMUNIDAD (visual-left)
    { x: 75, y: 50 },   // 6: CONFIANZA / CRECIMIENTO (visual-right)
    { x: 25, y: 50 },   // 7: NUEVAS RUTAS (visual-left)
    { x: 25, y: 50 },   // 8: DOS GENERACIONES (ondas izq/der)
    { x: 25, y: 50 },   // 9: TRABAJO EN EQUIPO (cruces)
    { x: 75, y: 50 },   // 10: PRESENTE (visual-right)
    { x: 25, y: 50 },   // 11: FUTURO / CONSTRUCCIÓN (visual-left)
    { x: 75, y: 50 },   // 12: CIERRE (esfera desplegable)
];

let currentBgX = 75, currentBgY = 50;
let targetBgX  = 75, targetBgY  = 50;

const startTime = performance.now();
const durationFast = 3500;

// Inicialización de aplicación Three.js y UI
init();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 16);

    cameraController = new CameraController(camera);

    const canvasElement = document.querySelector('#bg-canvas');
   renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.autoClearColor = false;

    geometry = new THREE.BufferGeometry();
    positions = new Float32Array(particleCount * 3);
    positionsOriginal = new Float32Array(particleCount * 3);
    livePos = new Float32Array(particleCount * 3);
    flowPhase = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    streamIDs = new Float32Array(particleCount);

    const particlesPerStream = particleCount / 3;

    for (let i = 0; i < particleCount; i++) {
        const streamIndex = Math.floor(i / particlesPerStream);
        streamIDs[i] = streamIndex;

        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * 6.5;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi) * 0.45;

        positionsOriginal[i * 3]     = x;
        positionsOriginal[i * 3 + 1] = y;
        positionsOriginal[i * 3 + 2] = z;

        positions[i * 3]     = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        livePos[i * 3]     = x;
        livePos[i * 3 + 1] = y;
        livePos[i * 3 + 2] = z;

        flowPhase[i] = Math.random() * 62.8;

        let col = new THREE.Color();
        if (streamIndex === 0) {
            col.set(Math.random() > 0.4 ? '#ff2a85' : '#e63946');
        } else if (streamIndex === 1) {
            col.set('#457b9d');
        } else {
            col.set('#ffffff');
        }

        colors[i * 3]     = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;

        const isFocal = Math.random() < 0.03;
        sizes[i] = isFocal ? (Math.random() * 1.0 + 0.6) : (Math.random() * 0.5 + 0.3);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            `
            void main() {
                float d = distance(gl_PointCoord, vec2(0.5));
                if (d > 0.5) discard;
                float alpha = smoothstep(0.5, 0.2, d);
            `
        );
        shader.fragmentShader = shader.fragmentShader.replace(
            'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
            'gl_FragColor = vec4( outgoingLight * alpha, alpha * 0.85 );'
        );
    };

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    bgRadialsEl = document.getElementById('bg-radials');
    slides = document.querySelectorAll('.slide');

    // Event listeners
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onWindowResize);

    setupNavigationUI();
    setupLanguageSwitch();
    applyLanguage('es');

    renderer.setAnimationLoop(animate);
}

function setupNavigationUI() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                updateSlideContent();
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (currentSlideIndex < slides.length - 1) {
                currentSlideIndex++;
                updateSlideContent();
            }
        });
    }

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
        btnRestart.addEventListener('click', restartPresentation);
    }

    const btnFullscreen = document.getElementById('btn-fullscreen');
if (btnFullscreen) {
    btnFullscreen.addEventListener('click', toggleFullscreen);
}

    updateNavIndicator();
}

function updateNavIndicator() {
    const navIndicator = document.getElementById('nav-indicator');
    if (navIndicator) {
        const label = translations[getCurrentLang()]['nav-label'];
        navIndicator.innerText = label(currentSlideIndex + 1, slides.length);
    }
}

function restartPresentation() {
    currentSlideIndex = 0;
    updateSlideContent();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
}

function onKeyDown(event) {
    let key = event.key;
    let newMode = -1;

    if (key === '1') newMode = 0;
    if (key === '2') newMode = 1;
    if (key === '3') newMode = 2;
    if (key === '4') newMode = 3;
    if (key === '5') newMode = 4;
    if (key === '6') newMode = 5;
    if (key === '7') newMode = 6;
    if (key === '8') newMode = 7;
    if (key === '9') newMode = 8;
    if (key === '0') newMode = 9;

    if (newMode !== -1) {
        setTargetMode(newMode);
    }

    if (event.key === 'ArrowRight' || event.key === ' ') {
        if (currentSlideIndex < slides.length - 1) {
            currentSlideIndex++;
            updateSlideContent();
        }
    } else if (event.key === 'ArrowLeft') {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlideContent();
        }
    } else if (key === 'r' || key === 'R') {
        restartPresentation();
    }
}

function setTargetMode(mode) {
    if (mode !== targetMode) {
        currentMode = targetMode;
        targetMode = mode;
        transitionProgress = 0.0;

        // Actualizar destino del gradiente ambiental
        if (bgPositions[mode]) {
            targetBgX = bgPositions[mode].x;
            targetBgY = bgPositions[mode].y;
        }

        // Notificar al controlador inteligente de cámara
        if (cameraController) {
            cameraController.setMode(mode);
        }
    }
}

function updateSlideContent() {
    slides.forEach((slide, index) => {
        if (index === currentSlideIndex) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    const activeSlide = slides[currentSlideIndex];
    const stateAttr = parseInt(activeSlide.getAttribute('data-state'));
    if (!isNaN(stateAttr)) {
        setTargetMode(stateAttr);
    }

    updateNavIndicator();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;
    
    let speedFactor = 1.0;
    if (elapsed < durationFast) {
        let t = elapsed / durationFast;
        let easeOut = 1.0 - Math.pow(1.0 - t, 3.0);
        speedFactor = 1.0 + (8.0 * (1.0 - easeOut));
    }

    if (transitionProgress < 1.0) {
        transitionProgress += 0.015;
        if (transitionProgress > 1.0) transitionProgress = 1.0;
    }

    let smoothT = transitionProgress * transitionProgress * (3.0 - 2.0 * transitionProgress);
    
    if (transitionProgress >= 1.0) {
        currentMode = targetMode;
    }

    const timeSec = currentTime * 0.0007 * speedFactor;

    // Actualizar controlador inteligente de cámara
    if (cameraController) {
        cameraController.update(timeSec);
    }

    const posAttr = geometry.attributes.position;
    const posArray = posAttr.array;

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const streamID = streamIDs[i];
        const ox = positionsOriginal[i3];
        const oy = positionsOriginal[i3 + 1];
        const oz = positionsOriginal[i3 + 2];

        // Obtener coordenadas paramétricas puras del módulo particleStates
        let currCoords = getCoordsForState(currentMode, streamID, ox, oy, oz, i, timeSec, flowPhase, livePos);
        let targCoords = getCoordsForState(targetMode, streamID, ox, oy, oz, i, timeSec, flowPhase, livePos);

        let finalX = THREE.MathUtils.lerp(currCoords.x, targCoords.x, smoothT);
        let finalY = THREE.MathUtils.lerp(currCoords.y, targCoords.y, smoothT);
        let finalZ = THREE.MathUtils.lerp(currCoords.z, targCoords.z, smoothT);

        posArray[i3]     = THREE.MathUtils.lerp(posArray[i3], finalX, 0.08);
        posArray[i3 + 1] = THREE.MathUtils.lerp(posArray[i3 + 1], finalY, 0.08);
        posArray[i3 + 2] = THREE.MathUtils.lerp(posArray[i3 + 2], finalZ, 0.08);
    }

    posAttr.needsUpdate = true;

    // --- Degradado ambiental rojo (lerp suave) ---
    currentBgX += (targetBgX - currentBgX) * 0.007;
    currentBgY += (targetBgY - currentBgY) * 0.007;
    if (bgRadialsEl) {
        const gx  = currentBgX.toFixed(2) + '%';
        const gy  = currentBgY.toFixed(2) + '%';
        const gx2 = (100 - currentBgX).toFixed(2) + '%';
        const gy2 = (100 - currentBgY).toFixed(2) + '%';
        bgRadialsEl.style.background =
            `radial-gradient(ellipse 58% 48% at ${gx} ${gy}, rgba(110,0,22,0.28) 0%, transparent 72%),
             radial-gradient(ellipse 38% 32% at ${gx2} ${gy2}, rgba(70,0,12,0.18) 0%, transparent 65%),
             radial-gradient(ellipse 25% 20% at 50% 50%, rgba(80,0,15,0.10) 0%, transparent 60%)`;
    }

    scene.rotation.y = currentTime * 0.00015 * speedFactor;

    renderer.setClearColor(0x000000, 0.20);
    renderer.clear(true, true, true);

    renderer.render(scene, camera);
}