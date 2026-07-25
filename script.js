// ============================================
// GENERADOR DE MANDALAS
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

// ============================================
// FUNCIONES DE DIBUJO
// ============================================

function getColor(index) {
    return config.colors[index % config.colors.length];
}

function drawPetal(x, y, radius, color, strokeSize) {
    const angle = Math.atan2(y - config.centerY, x - config.centerX);
    const distance = Math.sqrt((x - config.centerX) ** 2 + (y - config.centerY) ** 2);
    
    if (distance > config.maxRadius) return;
    
    const adjustedRadius = distance * (1 - config.innerRadius);
    const startX = config.centerX + Math.cos(angle) * distance * config.innerRadius;
    const startY = config.centerY + Math.sin(angle) * distance * config.innerRadius;
    const endX = config.centerX + Math.cos(angle) * distance;
    const endY = config.centerY + Math.sin(angle) * distance;
    
    // Dibujar el pétalo principal
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Dibujar los pétalos simétricos
    const step = (2 * Math.PI) / config.petalCount;
    for (let i = 1; i < config.petalCount; i++) {
        const rotAngle = i * step;
        const rotX = config.centerX + Math.cos(angle + rotAngle) * distance;
        const rotY = config.centerY + Math.sin(angle + rotAngle) * distance;
        const rotStartX = config.centerX + Math.cos(angle + rotAngle) * distance * config.innerRadius;
        const rotStartY = config.centerY + Math.sin(angle + rotAngle) * distance * config.innerRadius;
        const rotEndX = config.centerX + Math.cos(angle + rotAngle) * distance;
        const rotEndY = config.centerY + Math.sin(angle + rotAngle) * distance;
        
        ctx.beginPath();
        ctx.moveTo(rotStartX, rotStartY);
        ctx.lineTo(rotEndX, rotEndY);
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeSize;
        ctx.stroke();
    }
}

function drawCircle(x, y, radius, color, strokeSize) {
    const distance = Math.sqrt((x - config.centerX) ** 2 + (y - config.centerY) ** 2);
    if (distance > config.maxRadius) return;
    
    const adjustedRadius = radius * (1 - config.innerRadius);
    const centerX = config.centerX + (x - config.centerX) * config.innerRadius;
    const centerY = config.centerY + (y - config.centerY) * config.innerRadius;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, adjustedRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeSize;
    ctx.stroke();
    
    // Simetría
    const step = (2 * Math.PI) / config.petalCount;
    for (let i = 1; i < config.petalCount; i++) {
        const rotAngle = i * step;
        const rotX = config.centerX + Math.cos(Math.atan2(y - config.centerY, x - config.centerX) + rotAngle) * distance;
        const rotY = config.centerY + Math.sin(Math.atan2(y - config.centerY, x - config.centerX) + rotAngle) * distance;
        const rotCenterX = config.centerX + (rotX - config.centerX) * config.innerRadius;
        const rotCenterY = config.centerY + (rotY - config.centerY) * config.innerRadius;
        
        ctx.beginPath();
        ctx.arc(rotCenterX, rotCenterY, adjustedRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeSize;
        ctx.stroke();
    }
}

// ============================================
// EVENTOS DEL CANVAS (TOUCH Y MOUSE)
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
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const coords = getCanvasCoords(e);
    lastX = coords.x;
    lastY = coords.y;
    
    // Dibujar un punto al empezar
    const colorIndex = Math.floor(Math.random() * config.colors.length);
    const color = config.colors[colorIndex];
    drawPetal(lastX, lastY, config.strokeSize, color, config.strokeSize);
}

function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    
    const coords = getCanvasCoords(e);
    const x = coords.x;
    const y = coords.y;
    
    // Dibujar una línea desde la última posición
    const colorIndex = Math.floor(Math.random() * config.colors.length);
    const color = config.colors[colorIndex];
    
    // Dibujar pétalos
    const distance = Math.sqrt((x - config.centerX) ** 2 + (y - config.centerY) ** 2);
    const angle = Math.atan2(y - config.centerY, x - config.centerX);
    const step = (2 * Math.PI) / config.petalCount;
    
    for (let i = 0; i < config.petalCount; i++) {
        const rotAngle = i * step;
        const rotX = config.centerX + Math.cos(angle + rotAngle) * distance;
        const rotY = config.centerY + Math.sin(angle + rotAngle) * distance;
        const rotStartX = config.centerX + Math.cos(angle + rotAngle) * distance * config.innerRadius;
        const rotStartY = config.centerY + Math.sin(angle + rotAngle) * distance * config.innerRadius;
        
        ctx.beginPath();
        ctx.moveTo(rotStartX, rotStartY);
        ctx.lineTo(rotX, rotY);
        ctx.strokeStyle = color;
        ctx.lineWidth = config.strokeSize;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    lastX = x;
    lastY = y;
}

function stopDrawing(e) {
    isDrawing = false;
}

// Eventos de ratón
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Eventos táctiles
canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing, { passive: false });

// ============================================
// DIBUJAR MANDALA DE FONDO (PATRÓN INICIAL)
// ============================================

function drawBackgroundMandala() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo
    ctx.fillStyle = '#0f0e17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Círculos concéntricos
    for (let r = 0.1; r <= 1; r += 0.1) {
        const radius = config.maxRadius * r;
        ctx.beginPath();
        ctx.arc(config.centerX, config.centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + r * 0.05})`;
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
        ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// ============================================
// GENERAR MANDALA ALEATORIO
// ============================================

function generateRandomMandala() {
    drawBackgroundMandala();
    
    // Generar puntos aleatorios
    const numPoints = 30 + Math.floor(Math.random() * 50);
    const points = [];
    
    for (let i = 0; i < numPoints; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = 0.1 + Math.random() * 0.85;
        const radius = config.maxRadius * distance;
        const x = config.centerX + Math.cos(angle) * radius;
        const y = config.centerY + Math.sin(angle) * radius;
        points.push({ x, y });
    }
    
    // Dibujar los puntos como pétalos
    points.forEach((point, index) => {
        const color = config.colors[index % config.colors.length];
        const size = config.strokeSize * (0.5 + Math.random() * 0.8);
        const distance = Math.sqrt((point.x - config.centerX) ** 2 + (point.y - config.centerY) ** 2);
        const angle = Math.atan2(point.y - config.centerY, point.x - config.centerX);
        const step = (2 * Math.PI) / config.petalCount;
        
        for (let i = 0; i < config.petalCount; i++) {
            const rotAngle = i * step;
            const rotX = config.centerX + Math.cos(angle + rotAngle) * distance;
            const rotY = config.centerY + Math.sin(angle + rotAngle) * distance;
            const rotStartX = config.centerX + Math.cos(angle + rotAngle) * distance * config.innerRadius;
            const rotStartY = config.centerY + Math.sin(angle + rotAngle) * distance * config.innerRadius;
            
            ctx.beginPath();
            ctx.moveTo(rotStartX, rotStartY);
            ctx.lineTo(rotX, rotY);
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    });
    
    // Círculo central
    ctx.beginPath();
    ctx.arc(config.centerX, config.centerY, config.maxRadius * 0.05, 0, 2 * Math.PI);
    ctx.fillStyle = config.colors[0];
    ctx.fill();
}

// ============================================
// CONTROLES
// ============================================

// Pétalos
petalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        petalButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.petalCount = parseInt(btn.dataset.petal);
        drawBackgroundMandala();
    });
});

// Colores
colorInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        config.colors[index] = input.value;
    });
});

// Colores aleatorios
randomColorsBtn.addEventListener('click', () => {
    const newColors = [];
    for (let i = 0; i < colorInputs.length; i++) {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        newColors.push(randomColor);
        colorInputs[i].value = randomColor;
    }
    config.colors = newColors;
});

// Tamaño de trazo
strokeSizeInput.addEventListener('input', () => {
    config.strokeSize = parseInt(strokeSizeInput.value);
    strokeSizeDisplay.textContent = config.strokeSize;
});

// Radio interno
innerRadiusInput.addEventListener('input', () => {
    config.innerRadius = parseFloat(innerRadiusInput.value);
    innerRadiusDisplay.textContent = config.innerRadius.toFixed(2);
});

// Regenerar
regenerateBtn.addEventListener('click', generateRandomMandala);

// Descargar
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'mandala.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Limpiar
clearBtn.addEventListener('click', () => {
    drawBackgroundMandala();
});

// ============================================
// MODO OSCURO/CLARO
// ============================================

// Detectar preferencia del sistema
function detectSystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = prefersDark.matches;
    const themeBtn = document.getElementById('themeToggle');
    
    if (isDark) {
        document.body.classList.remove('light-theme');
        themeBtn.textContent = '🌙';
    } else {
        document.body.classList.add('light-theme');
        themeBtn.textContent = '☀️';
    }
}

// Alternar tema
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
}

// Cargar tema guardado
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
        // Si no hay tema guardado, usar el del sistema
        detectSystemTheme();
    }
}

// ============================================
// EVENTOS DEL TEMA
// ============================================

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// Escuchar cambios en el tema del sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem('theme')) {
        detectSystemTheme();
    }
});

// ============================================
// INICIALIZAR
// ============================================

function init() {
    // Cargar tema
    loadTheme();
    
    // Dibujar mandala de fondo
    drawBackgroundMandala();
    generateRandomMandala();
    
    console.log('🎨 Generador de Mandalas iniciado!');
    console.log('🌙 Tema cargado:', localStorage.getItem('theme') || 'sistema');
}

// Ejecutar
init();