// ============================================
// GENERADOR DE MANDALAS - VERSIÓN SIMPLIFICADA
// ============================================

// Elementos del DOM
const canvas = document.getElementById('mandalaCanvas');
const ctx = canvas.getContext('2d');

// Controles
const petalButtons = document.querySelectorAll('.btn-petal');
const colorInputs = document.querySelectorAll('.color-picker-group input[type="color"]');
const randomColorsBtn = document.getElementById('randomColorsBtn');
const strokeSizeInput = document.getElementById('strokeSize');
const strokeSizeDisplay = document.getElementById('strokeSizeDisplay');
const innerRadiusInput = document.getElementById('innerRadius');
const innerRadiusDisplay = document.getElementById('innerRadiusDisplay');
const regenerateBtn = document.getElementById('regenerateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');

// ============================================
// CONFIGURACIÓN
// ============================================
const config = {
    petalCount: 6,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    strokeSize: 3,
    innerRadius: 0.3,
    centerX: canvas.width / 2,
    centerY: canvas.height / 2,
    maxRadius: Math.min(canvas.width, canvas.height) / 2 - 20
};

// Estado del dibujo
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let isAnimating = false;

// ============================================
// FUNCIONES DE DIBUJO
// ============================================

function getCanvasBgColor() {
    const isLight = document.body.classList.contains('light-theme');
    return isLight ? '#f5f0e8' : '#0f0e17';
}

function getLineColor() {
    const isLight = document.body.classList.contains('light-theme');
    return isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
}

function drawBackground() {
    const bgColor = getCanvasBgColor();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const lineColor = getLineColor();
    
    // Círculos concéntricos
    for (let r = 0.1; r <= 1; r += 0.1) {
        const radius = config.maxRadius * r;
        ctx.beginPath();
        ctx.arc(config.centerX, config.centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Líneas radiales
    for (let i = 0; i < config.petalCount; i++) {
        const angle = (i / config.petalCount) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(config.centerX, config.centerY);
        ctx.lineTo(
            config.centerX + Math.cos(angle) * config.maxRadius,
            config.centerY + Math.sin(angle) * config.maxRadius
        );
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawPetal(x, y, color, size) {
    const dx = x - config.centerX;
    const dy = y - config.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > config.maxRadius || distance < 5) return;
    
    const angle = Math.atan2(dy, dx);
    const step = (2 * Math.PI) / config.petalCount;
    const innerDist = distance * config.innerRadius;
    
    for (let i = 0; i < config.petalCount; i++) {
        const rotAngle = angle + i * step;
        const startX = config.centerX + Math.cos(rotAngle) * innerDist;
        const startY = config.centerY + Math.sin(rotAngle) * innerDist;
        const endX = config.centerX + Math.cos(rotAngle) * distance;
        const endY = config.centerY + Math.sin(rotAngle) * distance;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

// ============================================
// GENERAR MANDALA ALEATORIO CON ANIMACIÓN
// ============================================

function generateMandala() {
    if (isAnimating) return;
    isAnimating = true;
    regenerateBtn.disabled = true;
    regenerateBtn.textContent = '⏳ Generando...';
    
    drawBackground();
    
    // Generar puntos
    const numPoints = 40 + Math.floor(Math.random() * 60);
    const points = [];
    
    for (let i = 0; i < numPoints; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = 0.1 + Math.random() * 0.85;
        const radius = config.maxRadius * distance;
        const x = config.centerX + Math.cos(angle) * radius;
        const y = config.centerY + Math.sin(angle) * radius;
        const color = config.colors[i % config.colors.length];
        const size = config.strokeSize * (0.5 + Math.random() * 0.8);
        points.push({ x, y, color, size });
    }
    
    // Dibujar con animación (usando setTimeout para simular animación)
    let index = 0;
    
    function drawNext() {
        if (index >= points.length) {
            // Terminar
            isAnimating = false;
            regenerateBtn.disabled = false;
            regenerateBtn.textContent = '🔄 Generar Mandala';
            
            // Círculo central
            ctx.beginPath();
            ctx.arc(config.centerX, config.centerY, config.maxRadius * 0.04, 0, 2 * Math.PI);
            ctx.fillStyle = config.colors[0];
            ctx.fill();
            return;
        }
        
        // Dibujar varios puntos a la vez para acelerar
        const batchSize = 3;
        for (let i = 0; i < batchSize && index < points.length; i++) {
            const p = points[index];
            drawPetal(p.x, p.y, p.color, p.size);
            index++;
        }
        
        // Velocidad de la animación (más bajo = más rápido)
        const delay = 20;
        setTimeout(drawNext, delay);
    }
    
    drawNext();
}

// ============================================
// FUNCIÓN RÁPIDA (sin animación)
// ============================================

function generateFast() {
    if (isAnimating) return;
    
    drawBackground();
    
    const numPoints = 40 + Math.floor(Math.random() * 60);
    
    for (let i = 0; i < numPoints; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = 0.1 + Math.random() * 0.85;
        const radius = config.maxRadius * distance;
        const x = config.centerX + Math.cos(angle) * radius;
        const y = config.centerY + Math.sin(angle) * radius;
        const color = config.colors[i % config.colors.length];
        const size = config.strokeSize * (0.5 + Math.random() * 0.8);
        drawPetal(x, y, color, size);
    }
    
    // Círculo central
    ctx.beginPath();
    ctx.arc(config.centerX, config.centerY, config.maxRadius * 0.04, 0, 2 * Math.PI);
    ctx.fillStyle = config.colors[0];
    ctx.fill();
}

// ============================================
// EVENTOS DEL CANVAS
// ============================================

function getCanvasCoords(e) {
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

function startDrawing(e) {
    if (isAnimating) return;
    e.preventDefault();
    isDrawing = true;
    const coords = getCanvasCoords(e);
    lastX = coords.x;
    lastY = coords.y;
    
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    drawPetal(lastX, lastY, color, config.strokeSize);
}

function draw(e) {
    e.preventDefault();
    if (!isDrawing || isAnimating) return;
    
    const coords = getCanvasCoords(e);
    const x = coords.x;
    const y = coords.y;
    
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    drawPetal(x, y, color, config.strokeSize);
    
    lastX = x;
    lastY = y;
}

function stopDrawing(e) {
    isDrawing = false;
}

// Eventos
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing, { passive: false });

// ============================================
// CONTROLES
// ============================================

// Pétalos
petalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isAnimating) return;
        petalButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.petalCount = parseInt(btn.dataset.petal);
        generateFast();
    });
});

// Colores
colorInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        config.colors[index] = input.value;
        if (!isAnimating) generateFast();
    });
});

// Colores aleatorios
randomColorsBtn.addEventListener('click', () => {
    for (let i = 0; i < colorInputs.length; i++) {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        colorInputs[i].value = randomColor;
        config.colors[i] = randomColor;
    }
    if (!isAnimating) generateFast();
});

// Tamaño de trazo
strokeSizeInput.addEventListener('input', () => {
    config.strokeSize = parseInt(strokeSizeInput.value);
    strokeSizeDisplay.textContent = config.strokeSize;
    if (!isAnimating) generateFast();
});

// Radio interno
innerRadiusInput.addEventListener('input', () => {
    config.innerRadius = parseFloat(innerRadiusInput.value);
    innerRadiusDisplay.textContent = config.innerRadius.toFixed(2);
    if (!isAnimating) generateFast();
});

// Regenerar
regenerateBtn.addEventListener('click', generateMandala);

// Descargar
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'mandala.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Limpiar
clearBtn.addEventListener('click', () => {
    if (isAnimating) return;
    drawBackground();
});

// ============================================
// TEMA OSCURO/CLARO
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
    if (!isAnimating) generateFast();
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
        if (!isAnimating) generateFast();
    }
});

// ============================================
// INICIALIZAR
// ============================================

function init() {
    loadTheme();
    drawBackground();
    generateMandala();
    
    console.log('🎨 Generador de Mandalas iniciado!');
}

init();