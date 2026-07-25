// ============================================
// GENERADOR DE MANDALAS CON ANIMACIÓN
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

// Estado de animación
let animationId = null;
let isAnimating = false;
let animationPoints = [];
let animationIndex = 0;
let animationSpeed = 50; // ms entre puntos

// ============================================
// FUNCIONES DE DIBUJO
// ============================================

function getColor(index) {
    return config.colors[index % config.colors.length];
}

function drawSinglePetal(x, y, color, strokeSize, angleOffset = 0) {
    const angle = Math.atan2(y - config.centerY, x - config.centerX) + angleOffset;
    const distance = Math.sqrt((x - config.centerX) ** 2 + (y - config.centerY) ** 2);
    
    if (distance > config.maxRadius) return;
    
    const startX = config.centerX + Math.cos(angle) * distance * config.innerRadius;
    const startY = config.centerY + Math.sin(angle) * distance * config.innerRadius;
    const endX = config.centerX + Math.cos(angle) * distance;
    const endY = config.centerY + Math.sin(angle) * distance;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function drawPetal(x, y, radius, color, strokeSize) {
    const angle = Math.atan2(y - config.centerY, x - config.centerX);
    const distance = Math.sqrt((x - config.centerX) ** 2 + (y - config.centerY) ** 2);
    
    if (distance > config.maxRadius) return;
    
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

// ============================================
// DIBUJAR MANDALA DE FONDO
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
// GENERAR MANDALA CON ANIMACIÓN
// ============================================

function generatePoints() {
    const points = [];
    const numPoints = 30 + Math.floor(Math.random() * 50);
    
    for (let i = 0; i < numPoints; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = 0.1 + Math.random() * 0.85;
        const radius = config.maxRadius * distance;
        const x = config.centerX + Math.cos(angle) * radius;
        const y = config.centerY + Math.sin(angle) * radius;
        
        // Calcular cuántas veces se repite este punto (para variar intensidad)
        const repeat = 1 + Math.floor(Math.random() * 2);
        const color = config.colors[i % config.colors.length];
        const size = config.strokeSize * (0.5 + Math.random() * 0.8);
        
        points.push({ x, y, color, size, repeat });
    }
    
    return points;
}

function drawAnimatedPoint(point, progress) {
    // Dibujar el punto con un efecto de "desvanecimiento" progresivo
    const angle = Math.atan2(point.y - config.centerY, point.x - config.centerX);
    const distance = Math.sqrt((point.x - config.centerX) ** 2 + (point.y - config.centerY) ** 2);
    const step = (2 * Math.PI) / config.petalCount;
    
    // Dibujar los pétalos simétricos con el progreso
    for (let i = 0; i < config.petalCount; i++) {
        const rotAngle = i * step;
        const startX = config.centerX + Math.cos(angle + rotAngle) * distance * config.innerRadius;
        const startY = config.centerY + Math.sin(angle + rotAngle) * distance * config.innerRadius;
        const endX = config.centerX + Math.cos(angle + rotAngle) * distance * progress;
        const endY = config.centerY + Math.sin(angle + rotAngle) * distance * progress;
        
        // Efecto de opacidad según el progreso
        const opacity = Math.min(1, progress * 1.5);
        
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = point.color;
        ctx.lineWidth = point.size;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function animateMandala() {
    // Detener animación anterior si existe
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    isAnimating = true;
    regenerateBtn.disabled = true;
    regenerateBtn.textContent = '⏳ Generando...';
    
    // Limpiar y dibujar fondo
    drawBackgroundMandala();
    
    // Generar puntos
    animationPoints = generatePoints();
    animationIndex = 0;
    let progress = 0;
    const totalSteps = animationPoints.length * 20; // 20 pasos por punto
    
    function step() {
        if (progress >= totalSteps) {
            // Animación completada
            isAnimating = false;
            regenerateBtn.disabled = false;
            regenerateBtn.textContent = '🔄 Generar Mandala';
            
            // Asegurarse de que todos los puntos estén completos
            animationPoints.forEach(point => {
                const distance = Math.sqrt((point.x - config.centerX) ** 2 + (point.y - config.centerY) ** 2);
                const angle = Math.atan2(point.y - config.centerY, point.x - config.centerX);
                const step = (2 * Math.PI) / config.petalCount;
                
                for (let i = 0; i < config.petalCount; i++) {
                    const rotAngle = i * step;
                    const startX = config.centerX + Math.cos(angle + rotAngle) * distance * config.innerRadius;
                    const startY = config.centerY + Math.sin(angle + rotAngle) * distance * config.innerRadius;
                    const endX = config.centerX + Math.cos(angle + rotAngle) * distance;
                    const endY = config.centerY + Math.sin(angle + rotAngle) * distance;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = point.color;
                    ctx.lineWidth = point.size;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            });
            
            // Círculo central
            ctx.beginPath();
            ctx.arc(config.centerX, config.centerY, config.maxRadius * 0.05, 0, 2 * Math.PI);
            ctx.fillStyle = config.colors[0];
            ctx.fill();
            
            return;
        }
        
        // Calcular qué punto estamos dibujando
        const pointIndex = Math.floor(progress / 20);
        const pointProgress = (progress % 20) / 20;
        
        if (pointIndex < animationPoints.length) {
            const point = animationPoints[pointIndex];
            
            // Redibujar todos los puntos anteriores (completos)
            for (let i = 0; i < pointIndex; i++) {
                const p = animationPoints[i];
                const dist = Math.sqrt((p.x - config.centerX) ** 2 + (p.y - config.centerY) ** 2);
                const ang = Math.atan2(p.y - config.centerY, p.x - config.centerX);
                const step = (2 * Math.PI) / config.petalCount;
                
                for (let j = 0; j < config.petalCount; j++) {
                    const rotAngle = j * step;
                    const startX = config.centerX + Math.cos(ang + rotAngle) * dist * config.innerRadius;
                    const startY = config.centerY + Math.sin(ang + rotAngle) * dist * config.innerRadius;
                    const endX = config.centerX + Math.cos(ang + rotAngle) * dist;
                    const endY = config.centerY + Math.sin(ang + rotAngle) * dist;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = p.size;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            }
            
            // Dibujar el punto actual con su progreso
            const dist = Math.sqrt((point.x - config.centerX) ** 2 + (point.y - config.centerY) ** 2);
            const ang = Math.atan2(point.y - config.centerY, point.x - config.centerX);
            const step = (2 * Math.PI) / config.petalCount;
            
            // Usar una curva de easing para que el movimiento sea más natural
            const easedProgress = easeOutCubic(pointProgress);
            
            for (let j = 0; j < config.petalCount; j++) {
                const rotAngle = j * step;
                const startX = config.centerX + Math.cos(ang + rotAngle) * dist * config.innerRadius;
                const startY = config.centerY + Math.sin(ang + rotAngle) * dist * config.innerRadius;
                const endX = config.centerX + Math.cos(ang + rotAngle) * dist * easedProgress;
                const endY = config.centerY + Math.sin(ang + rotAngle) * dist * easedProgress;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = point.color;
                ctx.lineWidth = point.size;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }
        
        progress++;
        animationId = requestAnimationFrame(step);
    }
    
    animationId = requestAnimationFrame(step);
}

// Easing function para animación suave
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ============================================
// GENERAR MANDALA SIN ANIMACIÓN (para uso rápido)
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
    if (isAnimating) return;
    e.preventDefault();
    isDrawing = true;
    const coords = getCanvasCoords(e);
    lastX = coords.x;
    lastY = coords.y;
    
    const colorIndex = Math.floor(Math.random() * config.colors.length);
    const color = config.colors[colorIndex];
    drawPetal(lastX, lastY, config.strokeSize, color, config.strokeSize);
}

function draw(e) {
    e.preventDefault();
    if (!isDrawing || isAnimating) return;
    
    const coords = getCanvasCoords(e);
    const x = coords.x;
    const y = coords.y;
    
    const colorIndex = Math.floor(Math.random() * config.colors.length);
    const color = config.colors[colorIndex];
    
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
// CONTROLES
// ============================================

// Pétalos
petalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isAnimating) return;
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

// Regenerar - CON ANIMACIÓN
regenerateBtn.addEventListener('click', () => {
    if (isAnimating) return;
    animateMandala();
});

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
        detectSystemTheme();
    }
}

// ============================================
// EVENTOS DEL TEMA
// ============================================

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem('theme')) {
        detectSystemTheme();
    }
});

// ============================================
// INICIALIZAR
// ============================================

function init() {
    loadTheme();
    drawBackgroundMandala();
    
    // Generar mandala inicial CON animación
    setTimeout(() => {
        animateMandala();
    }, 300);
    
    console.log('🎨 Generador de Mandalas iniciado!');
    console.log('🌙 Tema cargado:', localStorage.getItem('theme') || 'sistema');
}

init();