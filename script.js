// ============================================
// GENERADOR DE MANDALAS - VERSIÓN ULTRA SIMPLE
// ============================================

// ============================================
// 1. CONFIGURACIÓN
// ============================================

const canvas = document.getElementById('mandalaCanvas');
const ctx = canvas.getContext('2d');

const CENTER_X = canvas.width / 2;
const CENTER_Y = canvas.height / 2;
const MAX_RADIUS = Math.min(canvas.width, canvas.height) / 2 - 20;

let config = {
    petalCount: 6,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    strokeSize: 3,
    innerRadius: 0.3
};

let isAnimating = false;

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
    // Fondo
    ctx.fillStyle = getBgColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const lineColor = getLineColor();
    
    // Círculos concéntricos
    for (let r = 0.1; r <= 1; r += 0.1) {
        const radius = MAX_RADIUS * r;
        ctx.beginPath();
        ctx.arc(CENTER_X, CENTER_Y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Líneas radiales
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

function drawPetal(x, y, color, size) {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > MAX_RADIUS || distance < 3) return;
    
    const angle = Math.atan2(dy, dx);
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

function drawCenterDot() {
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, MAX_RADIUS * 0.04, 0, 2 * Math.PI);
    ctx.fillStyle = config.colors[0];
    ctx.fill();
}

// ============================================
// 3. GENERAR MANDALA (SIN ANIMACIÓN)
// ============================================

function generateMandala() {
    // Evitar múltiples generaciones simultáneas
    if (isAnimating) return;
    
    // Dibujar fondo
    drawBackground();
    
    // Generar puntos
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
    
    // Dibujar todos los puntos (rápido, sin animación)
    for (const p of points) {
        drawPetal(p.x, p.y, p.color, p.size);
    }
    
    // Círculo central
    drawCenterDot();
    
    // Actualizar botón
    const btn = document.getElementById('regenerateBtn');
    btn.textContent = '🔄 Generar Mandala';
    btn.disabled = false;
    isAnimating = false;
}

// ============================================
// 4. GENERAR CON ANIMACIÓN (MÁS LENTA)
// ============================================

function generateWithAnimation() {
    if (isAnimating) return;
    isAnimating = true;
    
    const btn = document.getElementById('regenerateBtn');
    btn.textContent = '⏳ Generando...';
    btn.disabled = true;
    
    drawBackground();
    
    // Generar puntos
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
            drawCenterDot();
            btn.textContent = '🔄 Generar Mandala';
            btn.disabled = false;
            isAnimating = false;
            return;
        }
        
        // Dibujar de a 2 puntos por vez para velocidad
        for (let i = 0; i < 2 && index < points.length; i++) {
            const p = points[index];
            drawPetal(p.x, p.y, p.color, p.size);
            index++;
        }
        
        // Velocidad de animación (más alto = más rápido)
        setTimeout(drawNext, 30);
    }
    
    drawNext();
}

// ============================================
// 5. EVENTOS DEL CANVAS (DIBUJO MANUAL)
// ============================================

let isDrawing = false;
let lastX = 0;
let lastY = 0;

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
    e.preventDefault();
    isDrawing = true;
    const coords = getCoords(e);
    lastX = coords.x;
    lastY = coords.y;
    
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    drawPetal(lastX, lastY, color, config.strokeSize);
}

function draw(e) {
    e.preventDefault();
    if (!isDrawing || isAnimating) return;
    
    const coords = getCoords(e);
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    drawPetal(coords.x, coords.y, color, config.strokeSize);
    
    lastX = coords.x;
    lastY = coords.y;
}

function stopDraw(e) {
    isDrawing = false;
}

// Eventos
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDraw, { passive: false });

// ============================================
// 6. CONTROLES DE LA INTERFAZ
// ============================================

// Pétalos
document.querySelectorAll('.btn-petal').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isAnimating) return;
        document.querySelectorAll('.btn-petal').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.petalCount = parseInt(btn.dataset.petal);
        generateMandala();
    });
});

// Colores
document.querySelectorAll('.color-picker-group input[type="color"]').forEach((input, index) => {
    input.addEventListener('input', () => {
        config.colors[index] = input.value;
        if (!isAnimating) generateMandala();
    });
});

// Colores aleatorios
document.getElementById('randomColorsBtn').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.color-picker-group input[type="color"]');
    for (let i = 0; i < inputs.length; i++) {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        inputs[i].value = randomColor;
        config.colors[i] = randomColor;
    }
    if (!isAnimating) generateMandala();
});

// Tamaño de trazo
const strokeInput = document.getElementById('strokeSize');
const strokeDisplay = document.getElementById('strokeSizeDisplay');
strokeInput.addEventListener('input', () => {
    config.strokeSize = parseInt(strokeInput.value);
    strokeDisplay.textContent = config.strokeSize;
    if (!isAnimating) generateMandala();
});

// Radio interno
const radiusInput = document.getElementById('innerRadius');
const radiusDisplay = document.getElementById('innerRadiusDisplay');
radiusInput.addEventListener('input', () => {
    config.innerRadius = parseFloat(radiusInput.value);
    radiusDisplay.textContent = config.innerRadius.toFixed(2);
    if (!isAnimating) generateMandala();
});

// Botones principales
document.getElementById('regenerateBtn').addEventListener('click', generateWithAnimation);
document.getElementById('downloadBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'mandala.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
document.getElementById('clearBtn').addEventListener('click', () => {
    if (isAnimating) return;
    drawBackground();
});

// ============================================
// 7. TEMA OSCURO/CLARO
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
// 8. INICIAR
// ============================================

loadTheme();
drawBackground();
generateMandala();

console.log('🎨 Generador de Mandalas iniciado!');
console.log('🌸 Pétalos:', config.petalCount);
console.log('🎨 Colores:', config.colors);