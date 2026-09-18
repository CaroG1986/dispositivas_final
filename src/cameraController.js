import * as THREE from 'three';

/**
 * Controlador de Cámara Cinematográfica Inteligente.
 * Asigna posiciones, zoom (FOV) y rotación sutil orquestada por diapositiva.
 */
export class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.targetPos = new THREE.Vector3(0, 0, 16);
        this.targetLookAt = new THREE.Vector3(0, 0, 0);
        this.currentLookAt = new THREE.Vector3(0, 0, 0);
        this.targetFov = 60;

        // Configuraciones de cámara por estado (0 a 12)
        this.cameraConfigs = [
            // 0: FLOR / EXPANSIÓN (visual-right)
            { pos: { x: 0.0, y: 0.0, z: 16.5 }, fov: 60 },
            // 1: EXPANSIÓN (visual-right)
            { pos: { x: 0.0, y: 0.0, z: 18.0 }, fov: 62 },
            // 2: ATRACCIÓN / UNIVERSIDAD + MUNDO (Mundo en izq visual-left, Univ en der)
            { pos: { x: 0.0, y: 0.2, z: 15.5 }, fov: 58 },
            // 3: FRAGMENTACIÓN (3 sistemas en visual-right)
            { pos: { x: 0.0, y: 0.4, z: 16.0 }, fov: 58 },
            // 4: IMPACTO / EXPLOSIÓN (visual-right)
            { pos: { x: 0.0, y: 0.0, z: 15.5 }, fov: 58 },
            // 5: DERIVA / COMUNIDAD (visual-left)
            { pos: { x: 0.0, y: 0.0, z: 15.8 }, fov: 58 },
            // 6: CONFIANZA / CRECIMIENTO (visual-right)
            { pos: { x: 0.0, y: -0.2, z: 16.0 }, fov: 58 },
            // 7: NUEVAS RUTAS (visual-left)
            { pos: { x: 0.0, y: 0.0, z: 16.2 }, fov: 60 },
            // 8: DOS GENERACIONES (Ondas verticales izq y der)
            { pos: { x: 0.0, y: 0.0, z: 16.0 }, fov: 58 },
            // 9: TRABAJO EN EQUIPO (Cruces centrales de trayectorias)
            { pos: { x: 0.0, y: 0.2, z: 15.5 }, fov: 56 },
            // 10: PRESENTE (visual-right activándose)
            { pos: { x: 0.0, y: 0.0, z: 15.5 }, fov: 58 },
            // 11: FUTURO / CONSTRUCCIÓN (Red nodal 3D en visual-left)
            { pos: { x: 0.0, y: 0.3, z: 15.2 }, fov: 56 },
            // 12: CIERRE (Esfera 3D viva que se despliega)
            { pos: { x: 0.0, y: 0.0, z: 15.0 }, fov: 55 },
        ];
    }

    setMode(mode) {
        const config = this.cameraConfigs[mode] || this.cameraConfigs[0];
        this.targetPos.set(config.pos.x, config.pos.y, config.pos.z);
        this.targetFov = config.fov;
    }

    update(timeSec) {
        // Interpolación suave (lerp) de posición de cámara
        this.camera.position.x += (this.targetPos.x - this.camera.position.x) * 0.035;
        this.camera.position.y += (this.targetPos.y - this.camera.position.y) * 0.035;
        this.camera.position.z += (this.targetPos.z - this.camera.position.z) * 0.035;

        // Órbita sutil para darle profundidad cinematográfica
        const subtleOrbitX = Math.sin(timeSec * 0.4) * 0.35;
        const subtleOrbitY = Math.cos(timeSec * 0.3) * 0.25;

        this.camera.position.x += subtleOrbitX * 0.02;
        this.camera.position.y += subtleOrbitY * 0.02;

        // Interpolación de FOV
        if (Math.abs(this.camera.fov - this.targetFov) > 0.1) {
            this.camera.fov += (this.targetFov - this.camera.fov) * 0.035;
            this.camera.updateProjectionMatrix();
        }

        this.camera.lookAt(this.targetLookAt);
    }
}
