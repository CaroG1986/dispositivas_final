import * as THREE from 'three';

/**
 * Módulo de funciones matemáticas paramétricas puras para los 13 estados conceptuales.
 * Garantiza separación compositiva (TEXT ZONE vs VISUAL ZONE) e identidad visual única.
 */
export function getCoordsForState(mode, streamID, ox, oy, oz, i, timeSec, flowPhase, livePos) {
    let res;
    switch(mode) {
        case 0:  res = getVortexState(ox, oy, oz, i, timeSec, flowPhase); break;
        case 1:  res = getRadialExpansionState(ox, oy, oz, i, timeSec, flowPhase); break;
        case 2:  res = getWorldAndUniversityState(ox, oy, oz, streamID, i, timeSec, flowPhase); break;
        case 3:  res = getFragmentedGroupsState(ox, oy, oz, streamID, i, timeSec, flowPhase); break;
        case 4:  res = getImpactExplosionState(ox, oy, oz, i, timeSec, flowPhase); break;
        case 5:  res = getCommunityDriftState(ox, oy, oz, streamID, i, timeSec, flowPhase); break;
        case 6:  res = getConfidenceGrowthState(ox, oy, oz, streamID, i, timeSec, flowPhase); break;
        case 7:  res = getNewRoutesState(ox, oy, oz, streamID, i, timeSec, flowPhase); break;
        case 8:  res = getTwoGenerationsState(ox, oy, oz, streamID, i, timeSec, flowPhase); break;
        case 9:  res = getTeamworkState(ox, oy, oz, streamID, i, timeSec, flowPhase); break;
        case 10: res = getPresentState(ox, oy, oz, streamID, i, timeSec, flowPhase); break;
        case 11: res = getFutureConstructionState(ox, oy, oz, streamID, i, timeSec, flowPhase); break;
        case 12: res = getClosureSphereState(ox, oy, oz, streamID, i, timeSec, flowPhase); break;
        default: res = getVortexState(ox, oy, oz, i, timeSec, flowPhase); break;
    }

    // Regla General de Seguridad Compositiva (Clamp espacial de zona de texto)
    // Garantiza que las partículas de estados visuales asignados a la derecha/izquierda no invadan el texto
    if (mode === 0 || mode === 3 || mode === 4 || mode === 6 || mode === 10 || mode === 12) {
        // ZONA VISUAL DERECHA: Limitar que X no cruce hacia la zona izquierda del texto (< +0.8)
        res.x = Math.max(0.8, res.x);
    } else if (mode === 5 || mode === 7 || mode === 11) {
        // ZONA VISUAL IZQUIERDA: Limitar que X no cruce hacia la zona derecha del texto (> -0.8)
        res.x = Math.min(-0.8, res.x);
    }

    return res;
}

// 0. ESTADO 1: INTRO VÓRTICE MAGNÉTICO & MATRIZ ESTELAR (Restaurado a la versión original con offset visual-right)
function getVortexState(ox, oy, oz, i, timeSec, flowPhase) {
    const visualCenterX = 4.8;
    const visualCenterY = 0.0;
    
    const rV = 1.2 + 5.6 * Math.pow(Math.abs(Math.sin(flowPhase[i] * 0.5 + timeSec * 0.45)), 0.85);
    const thetaV = flowPhase[i] * 2.8 + timeSec * 0.9;
    const spiralDepth = Math.sin(thetaV * 3.0 + timeSec * 1.5) * 1.6;
    
    return {
        x: visualCenterX + Math.cos(thetaV) * rV,
        y: visualCenterY + Math.sin(thetaV) * rV,
        z: spiralDepth + oz * 0.5
    };
}

// 1. ESTADO 2: EXPANSIÓN RADIAL (Restaurado a la versión original previa)
function getRadialExpansionState(ox, oy, oz, i, timeSec, flowPhase) {
    const expPulse = Math.sin(timeSec * 0.75) * 0.5 + 0.5;
    const rBaseExp = Math.sqrt(ox * ox + oy * oy + oz * oz) + 0.01;
    const scaleExp = 0.8 + 4.2 * Math.pow(expPulse, 1.4);
    const dirX = ox / rBaseExp;
    const dirY = oy / rBaseExp;
    const dirZ = oz / rBaseExp;
    
    return {
        x: dirX * rBaseExp * scaleExp,
        y: dirY * rBaseExp * scaleExp,
        z: dirZ * rBaseExp * scaleExp
    };
}

// 2. ESTADO 3: ATRACCIÓN / UNIVERSIDAD + MUNDO (Esfera Blanca en visual-left: x = -4.8, Universidad fluyendo desde la derecha)
function getWorldAndUniversityState(ox, oy, oz, streamID, i, timeSec, flowPhase) {
    const worldCenterX = -4.8;
    const worldCenterY = 0.0;
    const worldR = 2.2;
    
    if (streamID === 2) {
        // MUNDO: Esfera 3D blanca densa
        const phiM = flowPhase[i] % Math.PI;
        const thetaM = (flowPhase[i] * 2.1 + timeSec * 0.2) % (Math.PI * 2);
        const rSph = worldR * (0.85 + 0.15 * Math.sin(i * 0.1));
        return {
            x: worldCenterX + rSph * Math.sin(phiM) * Math.cos(thetaM),
            y: worldCenterY + rSph * Math.sin(phiM) * Math.sin(thetaM),
            z: rSph * Math.cos(phiM) * 0.85
        };
    } else {
        // UNIVERSIDAD (Rojas, Rosas, Azules): Fluido buscando encontrarse con el mundo
        const flowT = (timeSec * 0.35 + (i % 600) * 0.0015) % 1.0;
        const startX = 5.2;
        const targetX = worldCenterX + Math.cos(flowPhase[i]) * 2.6;
        const currX = THREE.MathUtils.lerp(startX, targetX, flowT);
        const orbitHeight = Math.sin(flowT * Math.PI * 2.0 + flowPhase[i]) * 1.8;
        
        return {
            x: currX,
            y: worldCenterY + orbitHeight + Math.sin(currX * 0.8 + timeSec) * 0.6,
            z: Math.cos(orbitHeight) * 0.8
        };
    }
}

// 3. ESTADO 4: FRAGMENTACIÓN (visual-right: x = +4.5)
function getFragmentedGroupsState(ox, oy, oz, streamID, i, timeSec, flowPhase) {
    const visualCenterX = 4.5;
    
    if (streamID === 0) {
        // ROJAS/ROSAS (Industria) — Fluido independiente superior
        const t1 = timeSec * 0.85 + flowPhase[i];
        return {
            x: visualCenterX - 1.2 + Math.sin(t1 * 0.7 + oy) * 1.8,
            y: 2.0 + Math.cos(t1 * 0.5 + ox) * 1.2,
            z: oz * 0.5 + Math.sin(t1) * 0.5
        };
    } else if (streamID === 1) {
        // AZULES (Ciudad) — Fluido independiente inferior
        const t2 = timeSec * 0.95 + flowPhase[i];
        return {
            x: visualCenterX + 1.2 + Math.cos(t2 * 0.6 + oy) * 1.8,
            y: -2.0 + Math.sin(t2 * 0.8 + ox) * 1.2,
            z: oz * 0.5 + Math.cos(t2) * 0.5
        };
    } else {
        // BLANCAS (Academia) — Fluido independiente diagonal
        const t3 = timeSec * 0.7 + flowPhase[i];
        return {
            x: visualCenterX + Math.sin(t3 * 0.85) * 2.2,
            y: Math.sin(t3 * 1.2) * 1.0,
            z: oz * 0.5 + Math.sin(t3 * 2.0) * 0.6
        };
    }
}

// 4. ESTADO 5: IMPACTO / EXPLOSIÓN CONTROLADA (visual-right: x = +4.5)
function getImpactExplosionState(ox, oy, oz, i, timeSec, flowPhase) {
    const visualCenterX = 4.5;
    const visualCenterY = 0.0;
    
    const cycleImp = (timeSec * 0.4 + (i % 200) * 0.0005) % 1.0;
    const isCorePhase = cycleImp < 0.25;
    
    if (isCorePhase) {
        // Núcleo concentrado acumulando energía
        const coreR = 0.4 + Math.sin(timeSec * 10.0 + i) * 0.25;
        return {
            x: visualCenterX + Math.sin(flowPhase[i]) * coreR,
            y: visualCenterY + Math.cos(flowPhase[i]) * coreR,
            z: oz * 0.3
        };
    } else {
        // Explosión radial cinemática con estelas y caída suave
        const explProgress = (cycleImp - 0.25) / 0.75;
        const rExpl = Math.pow(explProgress, 0.65) * (3.8 + Math.sin(i * 0.5) * 1.8);
        const fallY = -Math.pow(explProgress, 2.0) * 1.4;
        
        return {
            x: visualCenterX + Math.sin(flowPhase[i]) * rExpl,
            y: visualCenterY + Math.cos(flowPhase[i]) * rExpl + fallY,
            z: Math.sin(flowPhase[i] * 2.0) * rExpl * 0.4
        };
    }
}

// 5. ESTADO 6: DERIVA / COMUNIDAD (visual-left: x = -4.5)
function getCommunityDriftState(ox, oy, oz, streamID, i, timeSec, flowPhase) {
    const visualCenterX = -4.5;
    const visualCenterY = 0.0;
    
    const communityCycle = (timeSec * 0.3) % (Math.PI * 2);
    const connectRatio = 0.5 + 0.5 * Math.sin(communityCycle);
    
    // 3 focos de atracción comunitarios
    const clusterIdx = i % 3;
    const clusterOffsets = [
        { x: -1.8, y:  1.4 },
        { x:  1.8, y: -1.4 },
        { x:  0.0, y:  0.0 }
    ];
    
    const cTarget = clusterOffsets[clusterIdx];
    const freeX = ox * 1.5 + Math.sin(timeSec + oy) * 1.2;
    const freeY = oy * 1.5 + Math.cos(timeSec + ox) * 1.2;
    
    const clusterX = visualCenterX + cTarget.x + Math.sin(flowPhase[i] + timeSec * 0.5) * 0.8;
    const clusterY = visualCenterY + cTarget.y + Math.cos(flowPhase[i] + timeSec * 0.5) * 0.8;
    
    return {
        x: THREE.MathUtils.lerp(visualCenterX + freeX, clusterX, connectRatio),
        y: THREE.MathUtils.lerp(visualCenterY + freeY, clusterY, connectRatio),
        z: oz * 0.5 + Math.sin(timeSec + i) * 0.4
    };
}

// 6. ESTADO 7: CONFIANZA / CRECIMIENTO (visual-right: x = +4.5 — Distribución orgánica que llena la zona visual)
function getConfidenceGrowthState(ox, oy, oz, streamID, i, timeSec, flowPhase) {
    const visualCenterX = 4.5;
    
    const cycle = (timeSec * 0.35) % (Math.PI * 2);
    const growthProgress = 0.25 + 0.75 * Math.pow(Math.sin(cycle * 0.5), 1.2);
    
    if (streamID === 2) {
        // BLANCAS: Estructura en árbol/red 2D distribuida por toda la zona visual (no solo un eje vertical)
        // Usar dos coordenadas paramétricas independientes para cubrir X e Y por igual
        const pU = ((i * 7 + 3) % 1000) / 1000.0;   // u: avance en altura (de 0 a 1)
        const pV = ((i * 17 + 11) % 1000) / 1000.0;  // v: posición lateral dentro de la rama
        
        const heightT   = pU * growthProgress;
        const branchIdx = Math.floor(pU * 5);          // 5 ramas principales
        const branchAng = (branchIdx / 5) * Math.PI * 2 + flowPhase[i] * 0.25;
        
        // Radio de la rama crece con la altura Y oscila lateralmente
        const branchR   = (0.8 + heightT * 3.5) * growthProgress;
        const lateralW  = Math.sin(heightT * Math.PI * 6.0 + flowPhase[i]) * (1.2 + heightT * 2.4);
        
        return {
            x: visualCenterX + Math.cos(branchAng) * branchR + lateralW * Math.cos(branchAng + Math.PI / 2),
            y: -4.8 + heightT * 9.6 + Math.sin(branchAng * 2.0 + timeSec * 0.6) * 0.8,
            z: Math.sin(branchAng) * branchR * 0.5 + lateralW * 0.3
        };
    } else {
        // COLORES: Enjambre que sigue la red con retraso, distribuido en toda la zona visual
        const pU = ((i * 7 + 3) % 1000) / 1000.0;
        const heightT   = Math.max(0, pU * growthProgress - 0.09);
        const branchIdx = Math.floor(pU * 5);
        const branchAng = (branchIdx / 5) * Math.PI * 2 + flowPhase[i] * 0.25 - 0.4;
        
        const lagR      = (1.0 + heightT * 4.0) * growthProgress;
        const swarm     = Math.sin(timeSec * 3.5 + flowPhase[i]) * (0.8 + heightT * 1.5);
        
        return {
            x: visualCenterX + Math.cos(branchAng) * lagR + swarm,
            y: -4.8 + heightT * 9.6 + Math.cos(timeSec * 2.5 + i * 0.1) * 0.7,
            z: Math.sin(branchAng) * lagR * 0.5 + swarm * 0.4
        };
    }
}

// 7. ESTADO 8: NUEVAS RUTAS (Ruta luminosa amplia y serpenteante)
function getNewRoutesState(ox, oy, oz, streamID, i, timeSec, flowPhase) {
    const visualCenterX = -4.5;
    
    if (streamID === 0 || streamID === 1) {
        // COLORES: Serpenteo amplio y dinámico de la ruta principal
        const tCol = (timeSec * 0.48 + (i % 500) * 0.0018) % 1.0;
        const rx = (visualCenterX - 4.8) + tCol * 9.6;
        const ry = Math.sin(tCol * Math.PI * 2.2 + timeSec * 0.6) * 4.8;
        
        return {
            x: rx + Math.sin(i * 0.1) * 0.4,
            y: ry + Math.cos(i * 0.1) * 0.4,
            z: oz * 0.5
        };
    } else {
        // BLANCAS: Siguen con retraso y desviaciones de aprendizaje escaladas
        const tWhite = (timeSec * 0.34 + (i % 500) * 0.0018 - 0.16) % 1.0;
        const validT = tWhite < 0 ? tWhite + 1.0 : tWhite;
        const rx = (visualCenterX - 4.8) + validT * 9.6;
        const ry = Math.sin(validT * Math.PI * 2.2 + timeSec * 0.6) * 4.8;
        
        return {
            x: rx + Math.sin(i * 0.4 + timeSec) * 1.4,
            y: ry + Math.cos(i * 0.4 + timeSec) * 1.4,
            z: oz * 0.5 + Math.sin(i) * 0.8
        };
    }
}

// 8. ESTADO 9: DOS GENERACIONES (Ondas Senoidales Verticales — Colores centrados en x=-4.5, Blancas en x=+4.5)
function getTwoGenerationsState(ox, oy, oz, streamID, i, timeSec, flowPhase) {
    if (streamID === 0 || streamID === 1) {
        // COLORES (Izquierda): Eje base -4.5, ondulación lateral de ±1.8
        const yCol = 5.5 - ((timeSec * 3.2 + flowPhase[i] * 0.5) % 11.0);
        const waveX = -4.5 + Math.sin(yCol * 0.9 + timeSec * 1.4) * 1.8;
        return {
            x: waveX,
            y: yCol,
            z: oz * 0.4 + Math.cos(yCol * 0.6) * 0.8
        };
    } else {
        // BLANCAS (Derecha): Eje base +4.5, ondulación lateral de ±1.8
        const yWhite = 5.5 - ((timeSec * 2.4 + flowPhase[i] * 0.5) % 11.0);
        const waveX = 4.5 + Math.sin(yWhite * 0.6 + timeSec * 0.9) * 1.8;
        return {
            x: waveX,
            y: yWhite,
            z: oz * 0.4 + Math.sin(yWhite * 0.6) * 0.8
        };
    }
}

// 9. ESTADO 10: TRABAJO EN EQUIPO (Ondas inclinadas hacia el centro — Colores desde -4.5, Blancas desde +4.5)
function getTeamworkState(ox, oy, oz, streamID, i, timeSec, flowPhase) {
    const convergeRatio = 0.55 + 0.45 * Math.sin(timeSec * 0.4);
    
    if (streamID === 0 || streamID === 1) {
        // COLORES: Parten del eje -4.5 y se inclinan progresivamente hacia el centro
        const yCol = 5.5 - ((timeSec * 3.0 + flowPhase[i] * 0.5) % 11.0);
        const startX = -4.5 + Math.sin(yCol * 0.9) * 1.5;
        const targetX = 0.0 + Math.sin(yCol * 1.4 + timeSec) * 1.8;
        return {
            x: THREE.MathUtils.lerp(startX, targetX, convergeRatio),
            y: yCol,
            z: oz * 0.4 + Math.cos(yCol * 0.8) * 0.8
        };
    } else {
        // BLANCAS: Parten del eje +4.5 y se inclinan progresivamente hacia el centro
        const yWhite = 5.5 - ((timeSec * 2.6 + flowPhase[i] * 0.5) % 11.0);
        const startX = 4.5 + Math.sin(yWhite * 0.7) * 1.5;
        const targetX = -Math.sin(yWhite * 1.4 + timeSec) * 1.8;
        return {
            x: THREE.MathUtils.lerp(startX, targetX, convergeRatio),
            y: yWhite,
            z: oz * 0.4 + Math.sin(yWhite * 0.8) * 0.8
        };
    }
}

// 10. ESTADO 11: PRESENTE (visual-right: x = +4.5 — Juventud enérgica en expansión masiva)
function getPresentState(ox, oy, oz, streamID, i, timeSec, flowPhase) {
    const visualCenterX = 4.5;
    const visualCenterY = 0.0;
    
    if (streamID === 2) {
        // BLANCAS: Fondo sutil y reducido en proporción (destaca el protagonismo de los jóvenes)
        return {
            x: visualCenterX + ox * 0.35,
            y: visualCenterY + oy * 0.35,
            z: oz * 0.35
        };
    } else {
        // COLORES (La Juventud): Activación rápida, ágil y de gran volumen espacial
        const activationProgress = (timeSec * 2.5 + (i % 500) * 0.002) % 1.0;
        const isActive = activationProgress > 0.12; // >88% de partículas activas dinámicamente
        
        if (isActive) {
            const flowAngle = flowPhase[i] + timeSec * 2.2;
            const flowR = 2.2 + 3.2 * Math.pow(Math.abs(Math.sin(flowAngle * 1.5)), 1.3);
            const flowY = Math.sin(flowAngle * 2.0 + timeSec * 1.2) * 4.2;
            
            return {
                x: visualCenterX + Math.cos(flowAngle) * flowR,
                y: visualCenterY + flowY,
                z: Math.sin(flowAngle * 3.0) * 1.2
            };
        } else {
            return {
                x: visualCenterX + ox * 0.5,
                y: visualCenterY + oy * 0.5,
                z: oz * 0.4
            };
        }
    }
}

// 11. ESTADO 12: FUTURO / CONSTRUCCIÓN (visual-left: x = -4.5, Red 3D generativa)
function getFutureConstructionState(ox, oy, oz, streamID, i, timeSec, flowPhase) {
    const visualCenterX = -4.5;
    
    const nodeX = visualCenterX - 2.4 + (i % 9) * 0.6;
    const nodeY = -2.4 + (Math.floor(i / 9) % 9) * 0.6;
    const nodeZ = (i % 5) * 0.5 - 1.0;
    
    const buildProgress = 0.4 + 0.6 * Math.sin(timeSec * 0.5 + (i % 50) * 0.05);
    
    const freeX = visualCenterX + ox * 1.4 + Math.sin(timeSec + oy) * 1.0;
    const freeY = oy * 1.4 + Math.cos(timeSec + ox) * 1.0;
    
    return {
        x: THREE.MathUtils.lerp(freeX, nodeX, buildProgress),
        y: THREE.MathUtils.lerp(freeY, nodeY, buildProgress),
        z: THREE.MathUtils.lerp(oz * 1.4, nodeZ, buildProgress)
    };
}

// 12. ESTADO 13: CIERRE (visual-right: x = +4.5, Esfera 3D viva que se sostiene y despliega)
function getClosureSphereState(ox, oy, oz, streamID, i, timeSec, flowPhase) {
    const visualCenterX = 4.5;
    const visualCenterY = 0.0;
    
    const closeCycle = (timeSec * 0.25) % (Math.PI * 2);
    const unfoldRatio = Math.max(0, Math.sin(closeCycle) - 0.4) * 2.0;
    
    const rBase = 2.6 + unfoldRatio * 3.2;
    const phiC = flowPhase[i] % Math.PI;
    const thetaC = (flowPhase[i] * 2.0 + timeSec * 0.4) % (Math.PI * 2);
    
    const sphX = rBase * Math.sin(phiC) * Math.cos(thetaC);
    const sphY = rBase * Math.sin(phiC) * Math.sin(thetaC);
    const sphZ = rBase * Math.cos(phiC) * 0.85;
    
    return {
        x: visualCenterX + sphX,
        y: visualCenterY + sphY,
        z: sphZ
    };
}
