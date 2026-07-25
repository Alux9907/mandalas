// ============================================
// GENERADOR DE MANDALAS - CON FLOR QUE FLORECE
// ============================================

// ============================================
// 1. CONFIGURACIÓN
// ============================================

const canvas = document.getElementById('mandalaCanvas');
const ctx = canvas.getContext('2d');

const CENTER_X = canvas.width / 2;
const CENTER_Y = canvas.height / 2;
const MAX_RADIUS = Math.min(canvas.width, canvas.height) / 2 - 20;

// ============================================
// 1.5. PALETAS DE COLORES
// ============================================

const PALETTES = {
    default: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    sunset: ['#FF6B35', '#F7931E', '#FFB347', '#FFD93D', '#FF6B35'],
    forest: ['#2D6A4F', '#40916C', '#52B788', '#95D5B2', '#D8F3DC'],
    ocean: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#0077B6'],
    pastel: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
    mono: ['#333333', '#666666', '#999999', '#CCCCCC', '#333333'],
    neon: ['#FF00FF', '#00FFFF', '#FF0000', '#00FF00', '#FF00FF'],
    vintage: ['#8B6B4A', '#C4A882', '#D4B896', '#E8D5C4', '#8B6B4A']
};

let config = {
    petalCount: 6,
    colors: [...PALETTES.default],
    strokeSize: 3,
    innerRadius: 0.3,
    shape: 'petal'
};

let currentPalette = 'default';
let isAnimating = false;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// ============================================
// 1.6. ROTACIÓN CONTINUA
// ============================================

let rotationAngle = 0;
let isRotating = false;
let rotationSpeed = 0.5;
let rotationAnimationId = null;
let savedImageData = null;
let currentPoints = [];

// ============================================
// 1.7. MODO FLOR QUE FLORECE
// ============================================

let isFlowerMode = false;
let flowerAnimationId = null;
let flowerProgress = 0;
let flowerPoints = [];
let flowerTotalPoints = 0;
let flowerMaxRadius = 0;

// ============================================
// 2. FUNCIONES DE DIBUJO
// ============================================

function getBgColor() {
    return document.body.classList.contains('light-theme') ? '#f5f0e8' : '#0f0e17';
}

function getLineColor() {
    return document.body.classList.contains('light-theme') 
        ? 'rgba(0,0,0,0.06)' 
        : 'rgba(255,255,255,0.06)';
}

function drawBackground() {
    ctx.fillStyle = getBgColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const lineColor = getLineColor();
    
    for (let r = 0.1; r <= 1; r += 0.1) {
        const radius = MAX_RADIUS * r;
        ctx.beginPath();
        ctx.arc(CENTER_X, CENTER_Y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    for (let i = 0; i < config.petalCount; i++) {
        const angle = (i / config.petalCount) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(CENTER_X, CENTER_Y);
        ctx.lineTo(
            CENTER_X + Math.cos(angle) * MAX_RADIUS,
            CENTER_Y + Math.sin(angle) * MAX_RADIUS
        );
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// --- FORMA: PÉTALO ---
function drawShapePetal(x, y, color, size, angleOffset = 0) {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > MAX_RADIUS || distance < 3) return;
    
    const angle = Math.atan2(dy, dx) + angleOffset;
    const step = (2 * Math.PI) / config.petalCount;
    const innerDist = distance * config.innerRadius;
    
    for (let i = 0; i < config.petalCount; i++) {
        const rotAngle = angle + i * step;
        const startX = CENTER_X + Math.cos(rotAngle) * innerDist;
        const startY = CENTER_Y + Math.sin(rotAngle) * innerDist;
        const endX = CENTER_X + Math.cos(rotAngle) * distance;
        const endY = CENTER_Y + Math.sin(rotAngle) * distance;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

// --- FORMA: CÍRCULO ---
function drawShapeCircle(x, y, color, size, angleOffset = 0) {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > MAX_RADIUS || distance < 3) return;
    
    const angle = Math.atan2(dy, dx) + angleOffset;
    const step = (2 * Math.PI) / config.petalCount;
    const radius = size * 2;
    
    for (let i = 0; i < config.petalCount; i++) {
        const rotAngle = angle + i * step;
        const cx = CENTER_X + Math.cos(rotAngle) * distance;
        const cy = CENTER_Y + Math.sin(rotAngle) * distance;
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.stroke();
    }
}

// --- FORMA: ESTRELLA ---
function drawShapeStar(x, y, color, size, angleOffset = 0) {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > MAX_RADIUS || distance < 3) return;
    
    const angle = Math.atan2(dy, dx) + angleOffset;
    const step = (2 * Math.PI) / config.petalCount;
    const starSize = size * 3;
    const points = 5;
    
    for (let i = 0; i < config.petalCount; i++) {
        const rotAngle = angle + i * step;
        const cx = CENTER_X + Math.cos(rotAngle) * distance;
        const cy = CENTER_Y + Math.sin(rotAngle) * distance;
        
        ctx.beginPath();
        for (let j = 0; j < points * 2; j++) {
            const r = j % 2 === 0 ? starSize : starSize * 0.4;
            const a = (j / (points * 2)) * 2 * Math.PI - Math.PI / 2;
            const px = cx + Math.cos(a) * r;
            const py = cy + Math.sin(a) * r;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.stroke();
    }
}

// --- FORMA: ESPIRAL ---
function drawShapeSpiral(x, y, color, size, angleOffset = 0) {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > MAX_RADIUS || distance < 3) return;
    
    const angle = Math.atan2(dy, dx) + angleOffset;
    const step = (2 * Math.PI) / config.petalCount;
    const turns = 3;
    const maxR = size * 2;
    
    for (let i = 0; i < config.petalCount; i++) {
        const rotAngle = angle + i * step;
        const cx = CENTER_X + Math.cos(rotAngle) * distance;
        const cy = CENTER_Y + Math.sin(rotAngle) * distance;
        
        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.02) {
            const r = t * maxR;
            const a = t * turns * 2 * Math.PI;
            const px = cx + Math.cos(a) * r;
            const py = cy + Math.sin(a) * r;
            if (t === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.stroke();
    }
}

// --- FORMA: GOTA ---
function drawShapeDrop(x, y, color, size, angleOffset = 0) {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > MAX_RADIUS || distance < 3) return;
    
    const angle = Math.atan2(dy, dx) + angleOffset;
    const step = (2 * Math.PI) / config.petalCount;
    const dropSize = size * 2.5;
    
    for (let i = 0; i < config.petalCount; i++) {
        const rotAngle = angle + i * step;
        const cx = CENTER_X + Math.cos(rotAngle) * distance;
        const cy = CENTER_Y + Math.sin(rotAngle) * distance;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - dropSize);
        ctx.quadraticCurveTo(cx + dropSize, cy + dropSize * 0.3, cx, cy + dropSize);
        ctx.quadraticCurveTo(cx - dropSize, cy + dropSize * 0.3, cx, cy - dropSize);
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.stroke();
    }
}

// --- FORMA: TRIÁNGULO ---
function drawShapeTriangle(x, y, color, size, angleOffset = 0) {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > MAX_RADIUS || distance < 3) return;
    
    const angle = Math.atan2(dy, dx) + angleOffset;
    const step = (2 * Math.PI) / config.petalCount;
    const triSize = size * 3;
    
    for (let i = 0; i < config.petalCount; i++) {
        const rotAngle = angle + i * step;
        const cx = CENTER_X + Math.cos(rotAngle) * distance;
        const cy = CENTER_Y + Math.sin(rotAngle) * distance;
        
        ctx.beginPath();
        for (let j = 0; j < 3; j++) {
            const a = (j / 3) * 2 * Math.PI - Math.PI / 2;
            const px = cx + Math.cos(a) * triSize;
            const py = cy + Math.sin(a) * triSize;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.stroke();
    }
}

// ============================================
// 3. DISPATCHER DE FORMAS
// ============================================

function drawShape(x, y, color, size, angleOffset = 0) {
    switch (config.shape) {
        case 'petal': drawShapePetal(x, y, color, size, angleOffset); break;
        case 'circle': drawShapeCircle(x, y, color, size, angleOffset); break;
        case 'star': drawShapeStar(x, y, color, size, angleOffset); break;
        case 'spiral': drawShapeSpiral(x, y, color, size, angleOffset); break;
        case 'drop': drawShapeDrop(x, y, color, size, angleOffset); break;
        case 'triangle': drawShapeTriangle(x, y, color, size, angleOffset); break;
        default: drawShapePetal(x, y, color, size, angleOffset);
    }
}

function drawCenterDot(angleOffset = 0) {
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, MAX_RADIUS * 0.04, 0, 2 * Math.PI);
    ctx.fillStyle = config.colors[0];
    ctx.fill();
}

// ============================================
// 4. GENERAR MANDALA
// ============================================

function generateMandala() {
    if (isAnimating) return;
    
    // Detener rotación y modo flor
    stopRotation();
    stopFlowerMode();
    
    drawBackground();
    
    const numPoints = 50 + Math.floor(Math.random() * 50);
    currentPoints = [];
    
    for (let i = 0; i < numPoints; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = 0.1 + Math.random() * 0.85;
        const radius = MAX_RADIUS * distance;
        const x = CENTER_X + Math.cos(angle) * radius;
        const y = CENTER_Y + Math.sin(angle) * radius;
        const color = config.colors[i % config.colors.length];
        const size = config.strokeSize * (0.5 + Math.random() * 0.8);
        currentPoints.push({ x, y, color, size });
    }
    
    drawMandalaFromPoints(currentPoints, 0);
    drawCenterDot(0);
    
    savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const btn = document.getElementById('regenerateBtn');
    btn.textContent = '🔄 Generar Mandala';
    btn.disabled = false;
    isAnimating = false;
    
    if (isRotating) {
        startRotation();
    }
}

function drawMandalaFromPoints(points, angleOffset) {
    drawBackground();
    
    for (const p of points) {
        drawShape(p.x, p.y, p.color, p.size, angleOffset);
    }
    
    drawCenterDot(angleOffset);
}

function generateWithAnimation() {
    if (isAnimating) return;
    
    stopRotation();
    stopFlowerMode();
    
    isAnimating = true;
    
    const btn = document.getElementById('regenerateBtn');
    btn.textContent = '⏳ Generando...';
    btn.disabled = true;
    
    drawBackground();
    
    const numPoints = 50 + Math.floor(Math.random() * 50);
    const points = [];
    
    for (let i = 0; i < numPoints; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = 0.1 + Math.random() * 0.85;
        const radius = MAX_RADIUS * distance;
        const x = CENTER_X + Math.cos(angle) * radius;
        const y = CENTER_Y + Math.sin(angle) * radius;
        const color = config.colors[i % config.colors.length];
        const size = config.strokeSize * (0.5 + Math.random() * 0.8);
        points.push({ x, y, color, size });
    }
    
    let index = 0;
    
    function drawNext() {
        if (index >= points.length) {
            currentPoints = points;
            drawCenterDot(0);
            savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            btn.textContent = '🔄 Generar Mandala';
            btn.disabled = false;
            isAnimating = false;
            
            if (isRotating) {
                startRotation();
            }
            return;
        }
        
        for (let i = 0; i < 2 && index < points.length; i++) {
            const p = points[index];
            drawShape(p.x, p.y, p.color, p.size, 0);
            index++;
        }
        
        setTimeout(drawNext, 30);
    }
    
    drawNext();
}

// ============================================
// 5. ROTACIÓN CONTINUA
// ============================================

function startRotation() {
    if (rotationAnimationId) {
        cancelAnimationFrame(rotationAnimationId);
        rotationAnimationId = null;
    }
    
    if (!savedImageData) return;
    isRotating = true;
    document.getElementById('toggleRotationBtn').textContent = '⏸️ Pausar';
    
    function rotateStep() {
        if (!isRotating) return;
        
        rotationAngle = (rotationAngle + rotationSpeed) % 360;
        
        if (currentPoints.length > 0) {
            drawMandalaFromPoints(currentPoints, rotationAngle * Math.PI / 180);
        }
        
        rotationAnimationId = requestAnimationFrame(rotateStep);
    }
    
    rotateStep();
}

function stopRotation() {
    isRotating = false;
    if (rotationAnimationId) {
        cancelAnimationFrame(rotationAnimationId);
        rotationAnimationId = null;
    }
    document.getElementById('toggleRotationBtn').textContent = '▶️ Reanudar';
}

function toggleRotation() {
    if (isRotating) {
        stopRotation();
    } else {
        if (!savedImageData || currentPoints.length === 0) {
            generateMandala();
            setTimeout(() => {
                if (savedImageData) {
                    startRotation();
                }
            }, 100);
        } else {
            startRotation();
        }
    }
}

// ============================================
// 6. MODO FLOR QUE FLORECE
// ============================================

function startFlowerMode() {
    // Detener cualquier animación previa
    stopFlowerMode();
    stopRotation();
    
    if (isAnimating) return;
    
    // Si no hay puntos, generar un mandala primero
    if (currentPoints.length === 0) {
        generateMandala();
        // Esperar a que se genere
        setTimeout(() => {
            if (currentPoints.length > 0) {
                startFlowerAnimation();
            }
        }, 200);
    } else {
        startFlowerAnimation();
    }
}

function startFlowerAnimation() {
    isFlowerMode = true;
    flowerProgress = 0;
    flowerPoints = [...currentPoints];
    flowerTotalPoints = flowerPoints.length;
    flowerMaxRadius = 0;
    
    // Calcular el radio máximo de los puntos
    for (const p of flowerPoints) {
        const dist = Math.sqrt((p.x - CENTER_X) ** 2 + (p.y - CENTER_Y) ** 2);
        if (dist > flowerMaxRadius) flowerMaxRadius = dist;
    }
    
    document.getElementById('flowerModeBtn').textContent = '🌸 Floreciendo...';
    document.getElementById('flowerModeBtn').style.opacity = '0.7';
    document.getElementById('stopFlowerBtn').style.display = 'inline-block';
    
    // Dibujar el fondo
    drawBackground();
    
    // Animación: dibujar puntos desde el centro hacia afuera
    function drawFlowerStep() {
        if (!isFlowerMode) return;
        
        // Limpiar y dibujar fondo
        drawBackground();
        
        // Calcular el radio actual basado en el progreso
        const currentRadius = flowerMaxRadius * easeOutCubic(flowerProgress);
        
        // Dibujar solo los puntos que están dentro del radio actual
        let drawnCount = 0;
        for (const p of flowerPoints) {
            const dist = Math.sqrt((p.x - CENTER_X) ** 2 + (p.y - CENTER_Y) ** 2);
            if (dist <= currentRadius) {
                drawShape(p.x, p.y, p.color, p.size, 0);
                drawnCount++;
            }
        }
        
        // Dibujar el centro
        drawCenterDot(0);
        
        // Actualizar progreso
        flowerProgress += 0.005; // Velocidad de floración
        
        if (flowerProgress >= 1) {
            // Terminar: dibujar todo el mandala
            drawMandalaFromPoints(flowerPoints, 0);
            document.getElementById('flowerModeBtn').textContent = '🌸 Flor completa 🌸';
            document.getElementById('flowerModeBtn').style.opacity = '1';
            isFlowerMode = false;
            savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return;
        }
        
        flowerAnimationId = requestAnimationFrame(drawFlowerStep);
    }
    
    flowerAnimationId = requestAnimationFrame(drawFlowerStep);
}

function stopFlowerMode() {
    isFlowerMode = false;
    if (flowerAnimationId) {
        cancelAnimationFrame(flowerAnimationId);
        flowerAnimationId = null;
    }
    document.getElementById('flowerModeBtn').textContent = '🌸 Flor que florece';
    document.getElementById('flowerModeBtn').style.opacity = '1';
    document.getElementById('stopFlowerBtn').style.display = 'inline-block';
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ============================================
// 7. PALETAS
// ============================================

function applyPalette(paletteName) {
    const colors = PALETTES[paletteName];
    if (!colors) return;
    
    config.colors = [...colors];
    
    const inputs = document.querySelectorAll('.color-picker-group input[type="color"]');
    inputs.forEach((input, index) => {
        if (index < colors.length) {
            input.value = colors[index];
        }
    });
    
    document.querySelectorAll('.btn-palette').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.palette === paletteName);
    });
    
    currentPalette = paletteName;
    
    if (!isAnimating) generateMandala();
}

// ============================================
// 8. EVENTOS DEL CANVAS
// ============================================

function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDraw(e) {
    if (isAnimating) return;
    if (isFlowerMode) stopFlowerMode();
    if (isRotating) stopRotation();
    
    e.preventDefault();
    isDrawing = true;
    const coords = getCoords(e);
    lastX = coords.x;
    lastY = coords.y;
    
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    drawShape(lastX, lastY, color, config.strokeSize, rotationAngle * Math.PI / 180);
    
    setTimeout(() => {
        savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }, 10);
}

function draw(e) {
    e.preventDefault();
    if (!isDrawing || isAnimating) return;
    
    const coords = getCoords(e);
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    drawShape(coords.x, coords.y, color, config.strokeSize, rotationAngle * Math.PI / 180);
    
    currentPoints.push({ x: coords.x, y: coords.y, color, size: config.strokeSize });
    
    lastX = coords.x;
    lastY = coords.y;
    
    savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function stopDraw(e) {
    isDrawing = false;
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDraw, { passive: false });

// ============================================
// 9. CONTROLES DE LA INTERFAZ
// ============================================

// --- Paletas ---
document.querySelectorAll('.btn-palette').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isAnimating) return;
        const palette = btn.dataset.palette;
        applyPalette(palette);
    });
});

// --- Formas ---
document.querySelectorAll('.btn-shape').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isAnimating) return;
        if (isFlowerMode) stopFlowerMode();
        document.querySelectorAll('.btn-shape').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.shape = btn.dataset.shape;
        generateMandala();
    });
});

// --- Pétalos ---
document.querySelectorAll('.btn-petal').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isAnimating) return;
        if (isFlowerMode) stopFlowerMode();
        document.querySelectorAll('.btn-petal').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.petalCount = parseInt(btn.dataset.petal);
        generateMandala();
    });
});

// --- Colores ---
document.querySelectorAll('.color-picker-group input[type="color"]').forEach((input, index) => {
    input.addEventListener('input', () => {
        config.colors[index] = input.value;
        if (!isAnimating) generateMandala();
    });
});

// --- Colores aleatorios ---
document.getElementById('randomColorsBtn').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.color-picker-group input[type="color"]');
    for (let i = 0; i < inputs.length; i++) {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        inputs[i].value = randomColor;
        config.colors[i] = randomColor;
    }
    document.querySelectorAll('.btn-palette').forEach(b => b.classList.remove('active'));
    if (!isAnimating) generateMandala();
});

// --- Tamaño trazo ---
const strokeInput = document.getElementById('strokeSize');
const strokeDisplay = document.getElementById('strokeSizeDisplay');
strokeInput.addEventListener('input', () => {
    config.strokeSize = parseInt(strokeInput.value);
    strokeDisplay.textContent = config.strokeSize;
    if (!isAnimating) generateMandala();
});

// --- Radio interno ---
const radiusInput = document.getElementById('innerRadius');
const radiusDisplay = document.getElementById('innerRadiusDisplay');
radiusInput.addEventListener('input', () => {
    config.innerRadius = parseFloat(radiusInput.value);
    radiusDisplay.textContent = config.innerRadius.toFixed(2);
    if (!isAnimating) generateMandala();
});

// --- Velocidad de rotación ---
const rotationSpeedInput = document.getElementById('rotationSpeed');
const rotationSpeedDisplay = document.getElementById('rotationSpeedDisplay');
rotationSpeedInput.addEventListener('input', () => {
    rotationSpeed = parseFloat(rotationSpeedInput.value);
    rotationSpeedDisplay.textContent = rotationSpeed.toFixed(1);
});

// --- Botón de rotación ---
document.getElementById('toggleRotationBtn').addEventListener('click', toggleRotation);

// --- Modo Flor ---
document.getElementById('flowerModeBtn').addEventListener('click', startFlowerMode);
document.getElementById('stopFlowerBtn').addEventListener('click', () => {
    stopFlowerMode();
    // Restaurar el mandala completo
    if (currentPoints.length > 0) {
        drawMandalaFromPoints(currentPoints, 0);
        savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
});

// --- Botones principales ---
document.getElementById('regenerateBtn').addEventListener('click', generateWithAnimation);
document.getElementById('downloadBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'mandala.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
document.getElementById('clearBtn').addEventListener('click', () => {
    if (isAnimating) return;
    stopRotation();
    stopFlowerMode();
    currentPoints = [];
    savedImageData = null;
    drawBackground();
});

// ============================================
// 10. TEMA OSCURO/CLARO
// ============================================

function detectSystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const themeBtn = document.getElementById('themeToggle');
    
    if (prefersDark.matches) {
        document.body.classList.remove('light-theme');
        themeBtn.textContent = '🌙';
    } else {
        document.body.classList.add('light-theme');
        themeBtn.textContent = '☀️';
    }
}

function toggleTheme() {
    const themeBtn = document.getElementById('themeToggle');
    const isLight = document.body.classList.contains('light-theme');
    
    if (isLight) {
        document.body.classList.remove('light-theme');
        themeBtn.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.add('light-theme');
        themeBtn.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
    
    drawBackground();
    if (!isAnimating) generateMandala();
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeBtn.textContent = '☀️';
    } else if (savedTheme === 'dark') {
        document.body.classList.remove('light-theme');
        themeBtn.textContent = '🌙';
    } else {
        detectSystemTheme();
    }
}

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem('theme')) {
        detectSystemTheme();
        drawBackground();
        if (!isAnimating) generateMandala();
    }
});

// ============================================
// 11. INICIAR
// ============================================

function init() {
    loadTheme();
    drawBackground();
    generateMandala();
    
    setTimeout(() => {
        if (savedImageData && currentPoints.length > 0) {
            // No iniciar rotación automáticamente, esperar a que el usuario active
        }
    }, 500);
    
    console.log('🎨 Generador de Mandalas iniciado!');
    console.log('🎯 Forma:', config.shape);
    console.log('🌸 Pétalos:', config.petalCount);
    console.log('🎨 Paleta:', currentPalette);
    console.log('🌺 Modo Flor:', isFlowerMode ? 'Activo' : 'Inactivo');
}

init();