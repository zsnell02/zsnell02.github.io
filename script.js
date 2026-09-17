let laws = [];
let unseenIndices = [];
const lawText = document.getElementById('law-text');
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

// --- THEME LOGIC ---
// Check for saved theme or default to system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
}

themeToggle.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevents the click from bubbling up to the body and skipping a law
    
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// --- DATA LOGIC ---
fetch('laws.json')
    .then(response => response.json())
    .then(data => {
        laws = data;
        resetUnseenPool();
        displayLaw();
    })
    .catch(error => {
        lawText.innerText = "Law 1: The server failed to load the universe.";
    });

function resetUnseenPool() {
    unseenIndices = Array.from({ length: laws.length }, (_, i) => i);
    console.log(`Pool reset. Loaded ${unseenIndices.length} laws.`);
}

function displayLaw() {
    if (laws.length === 0) return;
    
    lawText.classList.add('fade-out');
    
    setTimeout(() => {
        if (unseenIndices.length === 0) {
            resetUnseenPool();
        }
        
        const poolIndex = Math.floor(Math.random() * unseenIndices.length);
        const actualLawIndex = unseenIndices[poolIndex];
        
        unseenIndices.splice(poolIndex, 1);
        console.log(`Remaining unseen: ${unseenIndices.length}`, unseenIndices);
        
        lawText.innerText = laws[actualLawIndex].law;
        lawText.classList.remove('fade-out');
    }, 150); 
}

// Ensure clicks on the background trigger the next law, but ignore clicks on the button
document.body.addEventListener('click', (event) => {
    if (event.target.closest('#theme-toggle')) return;
    displayLaw();
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault(); 
        displayLaw();
    }
});

// --- STARFIELD LOGIC ---
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let width, height;
let stars = [];
let shootingStars = [];

function initStars() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5,
            alpha: Math.random(),
            speed: (Math.random() * 0.02) + 0.005,
            direction: Math.random() > 0.5 ? 1 : -1
        });
    }
}

function spawnShootingStar() {
    shootingStars.push({
        x: Math.random() * width + (width / 2), 
        y: 0,
        length: Math.random() * 80 + 20,
        speed: Math.random() * 10 + 10,
        thickness: Math.random() * 2 + 1,
        alpha: 1
    });
    // Fire another one randomly between 2 and 7 seconds from now
    setTimeout(spawnShootingStar, Math.random() * 5000 + 2000); 
}

function animateStars() {
    ctx.clearRect(0, 0, width, height);
    
    // Twinkling background stars
    ctx.fillStyle = '#f1edfa';
    stars.forEach(star => {
        star.alpha += star.speed * star.direction;
        if (star.alpha >= 1) { star.alpha = 1; star.direction = -1; }
        if (star.alpha <= 0) { 
            star.alpha = 0; 
            star.direction = 1; 
            star.x = Math.random() * width; 
            star.y = Math.random() * height; 
        }
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Shooting stars
    shootingStars.forEach((star, index) => {
        star.x -= star.speed; // Move left
        star.y += star.speed; // Move down
        star.alpha -= 0.015;  // Fade out
        
        if (star.alpha <= 0) {
            shootingStars.splice(index, 1);
            return;
        }
        
        ctx.globalAlpha = star.alpha;
        ctx.strokeStyle = '#f1edfa';
        ctx.lineWidth = star.thickness;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + star.length, star.y - star.length);
        ctx.stroke();
    });

    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', initStars);
initStars();
animateStars();
setTimeout(spawnShootingStar, 2000);