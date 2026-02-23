// Boxel Rebound - Ultimate Edition

(function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const CANVAS_WIDTH = 360;
    const CANVAS_HEIGHT = 640;
    
    // Beautiful themes
    const THEMES = [
        { bg1: '#0a0a1a', bg2: '#1a1a3a', accent: '#00ffff', name: 'Cyan Night' },
        { bg1: '#1a0a0a', bg2: '#3a1a1a', accent: '#ff4444', name: 'Crimson' },
        { bg1: '#0a1a0a', bg2: '#1a3a1a', accent: '#44ff44', name: 'Emerald' },
        { bg1: '#0a0a1a', bg2: '#2a1a3a', accent: '#aa44ff', name: 'Purple' },
        { bg1: '#1a1a0a', bg2: '#3a3a1a', accent: '#ffff44', name: 'Gold' }
    ];
    
    // Player colors
    const PLAYER_COLORS = ['#00ffff', '#ff4444', '#44ff44', '#ff44ff', '#ffff44', 'rainbow', '#ff8844', '#8844ff'];
    
    // Game state
    let game = { 
        view: 1, currentLevel: 1, maxLevel: 1, paused: false, 
        showComplete: false, newRecord: false, deathCount: 0,
        selectedColor: 0, selectedShape: 0, particles: [], levelParticles: [], 
        backgroundStars: [], combo: 0, totalDeaths: 0
    };
    
    // Shape unlocks: 0=circle (free), 1=triangle (end), 2=heart (41), 3=cat (11), 4=dog (11), 5=chicken (31), 6=mouse (21), 7=box (free)
    const SHAPES = [
        { name: 'Circle', unlock: 1, draw: drawCircle },
        { name: 'Triangle', unlock: 50, draw: drawTriangle },
        { name: 'Heart', unlock: 41, draw: drawHeart },
        { name: 'Cat', unlock: 11, draw: drawCat },
        { name: 'Dog', unlock: 11, draw: drawDog },
        { name: 'Chicken', unlock: 31, draw: drawChicken },
        { name: 'Mouse', unlock: 21, draw: drawMouse },
        { name: 'Box', unlock: 1, draw: drawBox }
    ];
    
        // Player with better physics
    let player = { 
        x: 90, y: 500, width: 22, height: 22, 
        vx: 0, vy: 0, onGround: false, dead: false, 
        rotation: 0, spawnX: 90, spawnY: 500, 
        isSmall: false, trail: [], colorIndex: 0, shapeIndex: 0,
        wasOnGround: false, canFallJump: false
    };
    
    // IMPROVED PHYSICS - Better feel
    const GRAVITY = 0.75, JUMP_FORCE = -14, MOVE_SPEED = 2.5, 
          SMALL_GRAVITY = 0.85, SMALL_JUMP_FORCE = -17,
          AIR_CONTROL = 0.92, GROUND_FRICTION = 0.85;
    
    let keys = {}, blocks = [], startTime = 0, elapsed = 0, 
        finishTimer = 0, currentTheme = 0, cameraX = 0, scrollSpeed = 2.5;
    
    // Generate stars
    for(let i=0; i<80; i++) {
        game.backgroundStars.push({
            x: Math.random() * CANVAS_WIDTH * 4,
            y: Math.random() * CANVAS_HEIGHT * 2,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.5 + 0.2,
            twinkle: Math.random() * Math.PI * 2
        });
    }
    
    function getTheme(level) { return Math.floor((level - 1) / 10) % THEMES.length; }
    function addBlock(x, y, w, h, type) { blocks.push({x, y, w, h, type}); }
    
    function drawCircle(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    function drawTriangle(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(x, y - size/2);
        ctx.lineTo(x + size/2, y + size/2);
        ctx.lineTo(x - size/2, y + size/2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    function drawHeart(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        let topX = x, topY = y - size*0.3, bottomX = x, bottomY = y + size*0.3;
        let leftLobeX = x - size*0.3, leftLobeY = y - size*0.1;
        let rightLobeX = x + size*0.3, rightLobeY = y - size*0.1;
        ctx.moveTo(bottomX, bottomY);
        ctx.quadraticCurveTo(leftLobeX - size*0.2, leftLobeY - size*0.3, leftLobeX, leftLobeY);
        ctx.quadraticCurveTo(topX, topY, rightLobeX, rightLobeY);
        ctx.quadraticCurveTo(rightLobeX + size*0.2, rightLobeY - size*0.3, bottomX, bottomY);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    function drawCat(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        // Head
        ctx.fillRect(x - size/2, y - size*0.3, size, size*0.6);
        // Left ear
        ctx.beginPath();
        ctx.moveTo(x - size/2 + 3, y - size*0.3);
        ctx.lineTo(x - size/2 - 2, y - size*0.5);
        ctx.lineTo(x - size/2 + 5, y - size*0.3);
        ctx.closePath();
        ctx.fill();
        // Right ear
        ctx.beginPath();
        ctx.moveTo(x + size/2 - 3, y - size*0.3);
        ctx.lineTo(x + size/2 + 2, y - size*0.5);
        ctx.lineTo(x + size/2 - 5, y - size*0.3);
        ctx.closePath();
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x - size*0.15, y - size*0.1, 2, 3);
        ctx.fillRect(x + size*0.15, y - size*0.1, 2, 3);
        ctx.shadowBlur = 0;
    }
    
    function drawDog(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        // Head
        ctx.fillRect(x - size*0.35, y - size*0.25, size*0.7, size*0.5);
        // Snout
        ctx.fillRect(x - size*0.25, y + size*0.1, size*0.5, size*0.25);
        // Left ear (floppy)
        ctx.beginPath();
        ctx.moveTo(x - size/2, y - size*0.25);
        ctx.lineTo(x - size*0.45, y + size*0.1);
        ctx.lineTo(x - size*0.35, y - size*0.15);
        ctx.closePath();
        ctx.fill();
        // Right ear
        ctx.beginPath();
        ctx.moveTo(x + size/2, y - size*0.25);
        ctx.lineTo(x + size*0.45, y + size*0.1);
        ctx.lineTo(x + size*0.35, y - size*0.15);
        ctx.closePath();
        ctx.fill();
        // Nose
        ctx.fillStyle = '#000';
        ctx.fillRect(x - 1.5, y + size*0.15, 3, 3);
        ctx.shadowBlur = 0;
    }
    
    function drawChicken(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        // Body
        ctx.beginPath();
        ctx.ellipse(x, y, size*0.35, size*0.4, 0, 0, Math.PI*2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(x, y - size*0.35, size*0.2, 0, Math.PI*2);
        ctx.fill();
        // Beak
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.moveTo(x + size*0.15, y - size*0.35);
        ctx.lineTo(x + size*0.4, y - size*0.35);
        ctx.lineTo(x + size*0.2, y - size*0.3);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    function drawMouse(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        // Body
        ctx.beginPath();
        ctx.ellipse(x, y, size*0.3, size*0.35, 0, 0, Math.PI*2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(x + size*0.2, y - size*0.2, size*0.18, 0, Math.PI*2);
        ctx.fill();
        // Tail
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.quadraticCurveTo(x - size*0.4, y + size*0.1, x - size*0.5, y - size*0.1);
        ctx.stroke();
        // Ears
        ctx.beginPath();
        ctx.arc(x + size*0.15, y - size*0.4, size*0.1, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size*0.35, y - size*0.4, size*0.1, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    function drawBox(x, y, size, color) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fillRect(x - size/2, y - size/2, size, size);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    // Particle system
    function createParticle(x, y, color, speed = 1) {
        game.particles.push({
            x, y, color,
            vx: (Math.random() - 0.5) * 8 * speed,
            vy: (Math.random() - 0.5) * 8 * speed - 2,
            alpha: 1, size: Math.random() * 5 + 2
        });
    }
    
    function createConfetti() {
        const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
        for(let i=0; i<50; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = 5 + Math.random() * 10;
            game.levelParticles.push({
                x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 5,
                alpha: 1, size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random()*colors.length)]
            });
        }
    }
    
    // 50 ULTIMATE LEVELS - Each one unique and awesome
    const LEVELS = {
        // 1-10: Tutorial & Basics
        1: () => { // Warm up - simple steps
            for(let i=0; i<6; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 520, 45, 60, 1);
            addBlock(315, 460, 45, 120, 1);
            addBlock(360, 400, 45, 180, 1);
            addBlock(405, 340, 45, 240, 1);
            addBlock(450, 280, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        2: () => { // First obstacle
            for(let i=0; i<8; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(360, 580, 45, 45, 4);
            addBlock(450, 520, 45, 60, 1);
            addBlock(540, 460, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        3: () => { // Bounce intro
            for(let i=0; i<4; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 555, 45, 25, 10);
            addBlock(315, 445, 90, 45, 1);
            addBlock(450, 355, 90, 45, 1);
            addBlock(585, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        4: () => { // Shrink tunnel - wider and easier
            for(let i=0; i<5; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 555, 45, 25, 9);
            addBlock(270, 445, 90, 135, 1);
            addBlock(360, 445, 90, 135, 1);
            addBlock(405, 555, 45, 25, 8);
            addBlock(495, 520, 90, 60, 1);
            addBlock(585, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        5: () => { // Easy jumps
            for(let i=0; i<10; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 535, 45, 45, 4);
            addBlock(360, 535, 45, 45, 4);
            addBlock(495, 535, 45, 45, 4);
            addBlock(630, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        6: () => { // Double bounce
            for(let i=0; i<4; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 555, 45, 25, 10);
            addBlock(315, 400, 90, 45, 1);
            addBlock(405, 355, 45, 25, 10);
            addBlock(540, 265, 90, 45, 1);
            addBlock(630, 175, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        7: () => { // Platform climbing
            for(let i=0; i<3; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(135, 505, 45, 75, 1);
            addBlock(180, 430, 45, 150, 1);
            addBlock(225, 355, 45, 225, 1);
            addBlock(270, 280, 45, 300, 1);
            addBlock(315, 205, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        8: () => { // Gap jumping
            for(let i=0; i<3; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 460, 90, 45, 1);
            addBlock(315, 400, 90, 45, 1);
            addBlock(450, 340, 90, 45, 1);
            addBlock(585, 280, 90, 45, 1);
            addBlock(675, 220, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        9: () => { // Bounce + shrink + speed
            for(let i=0; i<4; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 555, 45, 25, 10);
            addBlock(270, 445, 90, 45, 1);
            addBlock(315, 445, 45, 25, 9);
            addBlock(405, 400, 90, 45, 1);
            addBlock(450, 355, 45, 25, 13);
            addBlock(540, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        10: () => { // Challenge mix
            for(let i=0; i<3; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(135, 580, 45, 45, 4);
            addBlock(225, 520, 45, 60, 1);
            addBlock(315, 475, 45, 25, 10);
            addBlock(405, 400, 90, 45, 1);
            addBlock(450, 355, 45, 25, 8);
            addBlock(540, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        
        // 11-20: Intermediate
        11: () => { // Long corridor with spikes
            for(let i=0; i<16; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 580, 45, 45, 4);
            addBlock(405, 580, 45, 45, 4);
            addBlock(585, 580, 45, 45, 4);
            addBlock(765, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        12: () => { // Tower of bounces
            for(let i=0; i<4; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 555, 45, 25, 10);
            addBlock(270, 460, 90, 45, 1);
            addBlock(315, 415, 45, 25, 10);
            addBlock(405, 355, 90, 45, 1);
            addBlock(450, 310, 45, 25, 10);
            addBlock(540, 220, 90, 45, 1);
            addBlock(585, 175, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        13: () => { // Drop and dodge
            for(let i=0; i<4; i++) addBlock(i*45, 340, 45, 45, 1);
            addBlock(180, 580, 450, 45, 1);
            addBlock(200, 340, 25, 25, 4);
            addBlock(290, 340, 25, 25, 4);
            addBlock(380, 340, 25, 25, 4);
            addBlock(470, 340, 25, 25, 4);
            addBlock(560, 340, 25, 25, 4);
            addBlock(650, 430, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 300;
        },
        14: () => { // Speed boost run
            for(let i=0; i<18; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 555, 45, 25, 13);
            addBlock(450, 555, 45, 25, 13);
            addBlock(675, 555, 45, 25, 13);
            addBlock(900, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        15: () => { // Shrink climb tower
            for(let i=0; i<4; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 555, 45, 25, 9);
            addBlock(225, 490, 45, 90, 1);
            addBlock(225, 340, 45, 90, 1);
            addBlock(225, 250, 45, 90, 1);
            addBlock(270, 555, 45, 25, 8);
            addBlock(360, 490, 90, 45, 1);
            addBlock(450, 400, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        16: () => { // Zigzag descent
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 475, 90, 45, 1);
            addBlock(405, 385, 90, 45, 1);
            addBlock(585, 295, 90, 45, 1);
            addBlock(765, 205, 90, 45, 1);
            addBlock(900, 130, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        17: () => { // Step up challenge
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 505, 45, 75, 1);
            addBlock(405, 430, 45, 150, 1);
            addBlock(540, 355, 45, 225, 1);
            addBlock(675, 280, 45, 300, 1);
            addBlock(810, 205, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        18: () => { // Bounce chain
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 555, 45, 25, 10);
            addBlock(360, 460, 45, 25, 10);
            addBlock(540, 365, 45, 25, 10);
            addBlock(720, 270, 45, 25, 10);
            addBlock(900, 175, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        19: () => { // Spike gauntlet
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(315, 580, 45, 45, 4);
            addBlock(450, 580, 45, 45, 4);
            addBlock(585, 580, 45, 45, 4);
            addBlock(720, 580, 45, 45, 4);
            addBlock(855, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        20: () => { // Advanced combo
            for(let i=0; i<16; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 555, 45, 25, 10);
            addBlock(405, 460, 90, 45, 1);
            addBlock(495, 460, 45, 25, 9);
            addBlock(585, 400, 90, 45, 1);
            addBlock(675, 355, 45, 25, 13);
            addBlock(810, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        
        // 21-30: Advanced
        21: () => { // Extended spike run
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 535, 45, 45, 4);
            addBlock(360, 535, 45, 45, 4);
            addBlock(540, 535, 45, 45, 4);
            addBlock(720, 535, 45, 45, 4);
            addBlock(900, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        22: () => { // Floating steps
            for(let i=0; i<18; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(135, 505, 45, 75, 1);
            addBlock(315, 430, 45, 150, 1);
            addBlock(495, 355, 45, 225, 1);
            addBlock(675, 280, 45, 300, 1);
            addBlock(855, 205, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        23: () => { // Triple spike sections
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 580, 135, 45, 4);
            addBlock(540, 580, 135, 45, 4);
            addBlock(855, 580, 45, 45, 4);
            addBlock(945, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        24: () => { // Double bounce tower
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 555, 45, 25, 10);
            addBlock(405, 430, 90, 45, 1);
            addBlock(495, 385, 45, 25, 10);
            addBlock(675, 295, 90, 45, 1);
            addBlock(765, 250, 45, 25, 10);
            addBlock(945, 160, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        25: () => { // Wall climb extended
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 460, 45, 25, 10);
            addBlock(270, 340, 45, 240, 1);
            addBlock(405, 460, 45, 25, 10);
            addBlock(450, 340, 45, 240, 1);
            addBlock(540, 340, 45, 25, 9);
            addBlock(720, 340, 45, 25, 8);
            addBlock(855, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        26: () => { // Bounce maze
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 555, 45, 25, 10);
            addBlock(405, 490, 45, 90, 1);
            addBlock(495, 425, 45, 25, 10);
            addBlock(675, 340, 90, 45, 1);
            addBlock(765, 295, 45, 25, 10);
            addBlock(945, 205, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        27: () => { // Tight squeeze
            for(let i=0; i<16; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 555, 45, 25, 9);
            addBlock(315, 505, 30, 75, 1);
            addBlock(405, 555, 45, 25, 8);
            addBlock(540, 535, 45, 45, 1);
            addBlock(630, 445, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        28: () => { // Spike platforms
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 580, 45, 45, 4);
            addBlock(405, 505, 45, 75, 1);
            addBlock(540, 580, 45, 45, 4);
            addBlock(675, 445, 45, 135, 1);
            addBlock(810, 580, 45, 45, 4);
            addBlock(945, 385, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        29: () => { // Double stack challenge
            for(let i=0; i<16; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(180, 505, 45, 75, 1);
            addBlock(270, 580, 45, 45, 4);
            addBlock(270, 505, 45, 75, 1);
            addBlock(360, 580, 45, 45, 4);
            addBlock(360, 505, 45, 75, 1);
            addBlock(450, 430, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        30: () => { // Advanced combo
            for(let i=0; i<16; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 555, 45, 25, 10);
            addBlock(360, 430, 90, 45, 1);
            addBlock(450, 430, 45, 25, 9);
            addBlock(585, 340, 90, 45, 1);
            addBlock(675, 295, 45, 25, 13);
            addBlock(765, 265, 45, 25, 8);
            addBlock(855, 175, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        
        // 31-40: Expert
        31: () => { // Big gap challenge
            for(let i=0; i<14; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 505, 45, 75, 1);
            addBlock(450, 430, 45, 150, 1);
            addBlock(630, 355, 45, 225, 1);
            addBlock(810, 280, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        32: () => { // Spike maze
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 580, 45, 45, 4);
            addBlock(360, 580, 45, 45, 1);
            addBlock(360, 505, 45, 75, 4);
            addBlock(495, 580, 45, 45, 4);
            addBlock(585, 580, 45, 45, 1);
            addBlock(585, 505, 45, 75, 4);
            addBlock(720, 580, 45, 45, 1);
            addBlock(855, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        33: () => { // Bounce tower tall
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 555, 45, 25, 10);
            addBlock(405, 460, 45, 25, 10);
            addBlock(585, 365, 45, 25, 10);
            addBlock(765, 270, 45, 25, 10);
            addBlock(945, 175, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        34: () => { // Narrow passage
            for(let i=0; i<16; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 555, 45, 25, 9);
            addBlock(360, 505, 40, 75, 1);
            addBlock(450, 555, 45, 25, 8);
            addBlock(585, 520, 45, 60, 1);
            addBlock(675, 445, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        35: () => { // Spike corridor
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(270, 580, 45, 45, 4);
            addBlock(360, 580, 45, 45, 1);
            addBlock(360, 505, 45, 75, 4);
            addBlock(495, 580, 45, 45, 1);
            addBlock(495, 505, 45, 75, 4);
            addBlock(630, 580, 45, 45, 1);
            addBlock(765, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        36: () => { // Staircase of peril
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 505, 45, 75, 4);
            addBlock(360, 430, 45, 150, 1);
            addBlock(450, 430, 45, 150, 4);
            addBlock(585, 355, 45, 225, 1);
            addBlock(675, 355, 45, 225, 4);
            addBlock(810, 280, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        37: () => { // Speed demon
            for(let i=0; i<26; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(315, 555, 45, 25, 13);
            addBlock(540, 555, 45, 25, 13);
            addBlock(765, 555, 45, 25, 13);
            addBlock(990, 555, 45, 25, 13);
            addBlock(1215, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        38: () => { // Leap of faith
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 580, 45, 45, 4);
            addBlock(360, 580, 45, 45, 4);
            addBlock(495, 580, 45, 45, 4);
            addBlock(675, 580, 45, 45, 1);
            addBlock(810, 580, 45, 45, 4);
            addBlock(945, 580, 45, 45, 4);
            addBlock(1080, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        39: () => { // Bounce & shrink combo
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 555, 45, 25, 10);
            addBlock(360, 460, 90, 45, 1);
            addBlock(405, 460, 45, 25, 9);
            addBlock(540, 385, 90, 45, 1);
            addBlock(585, 385, 45, 25, 8);
            addBlock(720, 340, 90, 45, 1);
            addBlock(855, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        40: () => { // Ultimate test
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(315, 505, 45, 75, 1);
            addBlock(405, 460, 45, 25, 10);
            addBlock(540, 340, 90, 45, 1);
            addBlock(540, 580, 45, 45, 4);
            addBlock(630, 340, 45, 25, 9);
            addBlock(765, 295, 45, 25, 8);
            addBlock(855, 205, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        
        // 41-50: Master
        41: () => { // NinetyNine run
            for(let i=0; i<24; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 580, 45, 45, 4);
            addBlock(360, 580, 45, 45, 4);
            addBlock(495, 580, 45, 45, 1);
            addBlock(630, 580, 45, 45, 4);
            addBlock(765, 580, 45, 45, 4);
            addBlock(900, 580, 45, 45, 1);
            addBlock(1035, 580, 45, 45, 4);
            addBlock(1170, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        42: () => { // Platform hell
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 460, 45, 120, 1);
            addBlock(180, 265, 45, 120, 4);
            addBlock(315, 385, 45, 195, 1);
            addBlock(315, 115, 45, 100, 4);
            addBlock(450, 295, 45, 285, 1);
            addBlock(585, 205, 45, 375, 1);
            addBlock(720, 115, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        43: () => { // Trap city
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 580, 45, 45, 4);
            addBlock(270, 505, 45, 75, 1);
            addBlock(360, 580, 45, 45, 4);
            addBlock(360, 505, 45, 75, 1);
            addBlock(450, 580, 45, 45, 4);
            addBlock(450, 505, 45, 75, 1);
            addBlock(540, 580, 45, 45, 4);
            addBlock(630, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        44: () => { // Bounce marathon
            for(let i=0; i<24; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 555, 45, 25, 10);
            addBlock(450, 460, 45, 25, 10);
            addBlock(630, 365, 45, 25, 10);
            addBlock(810, 270, 45, 25, 10);
            addBlock(990, 175, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        45: () => { // Precision landing
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(270, 520, 30, 60, 1);
            addBlock(405, 580, 45, 45, 4);
            addBlock(495, 520, 30, 60, 1);
            addBlock(630, 580, 45, 45, 4);
            addBlock(720, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        46: () => { // The maze
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 580, 45, 45, 4);
            addBlock(270, 505, 45, 75, 1);
            addBlock(360, 580, 45, 45, 4);
            addBlock(360, 505, 45, 75, 1);
            addBlock(450, 580, 45, 45, 1);
            addBlock(450, 505, 45, 75, 4);
            addBlock(540, 580, 45, 45, 4);
            addBlock(630, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        47: () => { // Shrink or die
            for(let i=0; i<16; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 555, 45, 25, 9);
            addBlock(315, 490, 35, 90, 1);
            addBlock(315, 340, 35, 90, 1);
            addBlock(360, 555, 45, 25, 8);
            addBlock(495, 535, 45, 45, 1);
            addBlock(585, 445, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        48: () => { // Ultra speed run
            for(let i=0; i<30; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(405, 555, 45, 25, 13);
            addBlock(585, 555, 45, 25, 13);
            addBlock(765, 555, 45, 25, 13);
            addBlock(945, 555, 45, 25, 13);
            addBlock(1125, 555, 45, 25, 13);
            addBlock(1305, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        49: () => { // Near impossible
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(315, 580, 45, 45, 4);
            addBlock(450, 580, 45, 45, 4);
            addBlock(585, 580, 45, 45, 1);
            addBlock(720, 580, 45, 45, 4);
            addBlock(855, 580, 45, 45, 4);
            addBlock(990, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        50: () => { // FINAL BOSS
            for(let i=0; i<26; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 555, 45, 25, 10);
            addBlock(315, 460, 45, 120, 1);
            addBlock(360, 460, 45, 25, 9);
            addBlock(495, 385, 45, 195, 1);
            addBlock(495, 580, 45, 45, 4);
            addBlock(630, 340, 45, 25, 10);
            addBlock(765, 250, 45, 45, 1);
            addBlock(765, 580, 45, 45, 4);
            addBlock(855, 205, 45, 25, 13);
            addBlock(990, 115, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        }
    };
    
    function loadLevel(level) {
        game.currentLevel = level;
        blocks = [];
        finishTimer = 0;
        currentTheme = getTheme(level);
        
        if (LEVELS[level]) LEVELS[level]();
        else {
            for(let i=0; i<15; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(675, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        }
        resetPlayer();
    }
    
    function resetPlayer() {
        player.x = player.spawnX;
        player.y = player.spawnY;
        player.width = 22;
        player.height = 22;
        player.vx = 0;
        player.vy = 0;
        player.dead = false;
        player.onGround = false;
        player.rotation = 0;
        player.isSmall = false;
        player.trail = [];
        player.canFallJump = false;
        player.wasOnGround = false;
        game.combo = 0;
        cameraX = 0;
        player.shapeIndex = game.selectedShape;
        startTime = Date.now();
    }
    
    // Input handling
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        
        if (game.view === 1 && e.key >= '1' && e.key <= '9') {
            let lvl = parseInt(e.key);
            if (lvl <= game.maxLevel) { game.view = 2; loadLevel(lvl); }
        }
        
        if (game.view === 2 && !game.paused) {
            if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !player.dead) {
                if (player.onGround) {
                    player.vy = JUMP_FORCE;
                    player.onGround = false;
                    player.canFallJump = false;
                    for(let i = 0; i < 6; i++) createParticle(player.x + player.width/2, player.y + player.height, '#ffffff', 1.2);
                } else if (player.canFallJump) {
                    // Ledge jump
                    player.vy = JUMP_FORCE;
                    player.canFallJump = false;
                    for(let i = 0; i < 6; i++) createParticle(player.x + player.width/2, player.y + player.height, '#ffffff', 1.2);
                }
            }
            if (e.code === 'KeyR') resetPlayer();
            if (e.code === 'KeyP' || e.code === 'Escape') game.view = 1;
        }
        
        if (game.view === 3 && (e.code === 'Space' || e.code === 'Enter')) { game.view = 1; game.showComplete = false; }
        
        if (game.view === 4) {
            if (e.code === 'Escape') game.view = 1;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                game.selectedColor = (game.selectedColor + 1) % PLAYER_COLORS.length;
                player.colorIndex = game.selectedColor;
                localStorage.setItem('boxel_color', game.selectedColor);
            }
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                game.selectedColor = (game.selectedColor - 1 + PLAYER_COLORS.length) % PLAYER_COLORS.length;
                player.colorIndex = game.selectedColor;
                localStorage.setItem('boxel_color', game.selectedColor);
            }
            if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                let available = SHAPES.filter((s, i) => game.maxLevel >= s.unlock);
                let currentIdx = available.findIndex(s => SHAPES.indexOf(s) === game.selectedShape);
                if (currentIdx > 0) {
                    game.selectedShape = SHAPES.indexOf(available[currentIdx - 1]);
                    localStorage.setItem('boxel_shape', game.selectedShape);
                }
            }
            if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                let available = SHAPES.filter((s, i) => game.maxLevel >= s.unlock);
                let currentIdx = available.findIndex(s => SHAPES.indexOf(s) === game.selectedShape);
                if (currentIdx < available.length - 1) {
                    game.selectedShape = SHAPES.indexOf(available[currentIdx + 1]);
                    localStorage.setItem('boxel_shape', game.selectedShape);
                }
            }
        }
    });
    
    document.addEventListener('keyup', (e) => keys[e.code] = false);
    
    canvas.onclick = function(e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        var mx = (e.clientX - rect.left) * scaleX;
        var my = (e.clientY - rect.top) * scaleY;
        
        if (game.view === 1) {
            if (mx >= CANVAS_WIDTH - 60 && mx <= CANVAS_WIDTH - 10 && my >= 10 && my <= 50) {
                game.view = 4;
                return;
            }
            
            var cols = 5, rows = 10, cellW = CANVAS_WIDTH / cols, cellH = 42, startY = 100, gap = 3;
            var col = Math.floor(mx / cellW);
            var row = Math.floor((my - startY) / (cellH + gap));
            var level = col * rows + row + 1;
            
            if (level >= 1 && level <= 50 && level <= game.maxLevel && my >= startY && col >= 0 && col < cols) {
                game.view = 2;
                loadLevel(level);
            }
        }
        else if (game.view === 2) {
            if (mx >= 10 && mx <= 50 && my >= 10 && my <= 50) { game.view = 1; return; }
            if (!player.dead && !game.paused) {
                if (player.onGround) {
                    player.vy = JUMP_FORCE;
                    player.onGround = false;
                    player.canFallJump = false;
                    for(let i = 0; i < 6; i++) createParticle(player.x + player.width/2, player.y + player.height, '#ffffff', 1.2);
                } else if (player.canFallJump) {
                    player.vy = JUMP_FORCE;
                    player.canFallJump = false;
                    for(let i = 0; i < 6; i++) createParticle(player.x + player.width/2, player.y + player.height, '#ffffff', 1.2);
                }
            }
        }
        else if (game.view === 3) { game.view = 1; game.showComplete = false; }
        else if (game.view === 4) {
            // Back button
            if (mx >= 10 && mx <= 50 && my >= 10 && my <= 50) { game.view = 1; return; }
            
            // Save button
            if (mx >= CANVAS_WIDTH/2 - 50 && mx <= CANVAS_WIDTH/2 + 50 && my >= CANVAS_HEIGHT - 65 && my <= CANVAS_HEIGHT - 25) {
                player.colorIndex = game.selectedColor;
                localStorage.setItem('boxel_color', game.selectedColor);
                localStorage.setItem('boxel_shape', game.selectedShape);
                game.view = 1;
                return;
            }
            
            // Check color clicks
            let colorStartY = 260;
            for(let i = 0; i < PLAYER_COLORS.length; i++) {
                let x = 20 + (i % 4) * 80;
                let y = colorStartY + Math.floor(i / 4) * 60;
                if (mx >= x && mx <= x + 70 && my >= y && my <= y + 50) {
                    game.selectedColor = i;
                    player.colorIndex = game.selectedColor;
                    localStorage.setItem('boxel_color', game.selectedColor);
                    return;
                }
            }
            
            // Check shape clicks - 2x4 grid
            let shapeGridStartX = 20;
            let shapeGridStartY = 380;
            let shapeCols = 4;
            let shapeSize = 70;
            let shapeGap = 10;
            
            for(let i = 0; i < SHAPES.length; i++) {
                let col = i % shapeCols;
                let row = Math.floor(i / shapeCols);
                let sx = shapeGridStartX + col * (shapeSize + shapeGap);
                let sy = shapeGridStartY + row * (shapeSize + shapeGap);
                
                if (mx >= sx && mx <= sx + shapeSize && my >= sy && my <= sy + shapeSize) {
                    if (game.maxLevel >= SHAPES[i].unlock) {
                        game.selectedShape = i;
                        localStorage.setItem('boxel_shape', game.selectedShape);
                    }
                    return;
                }
            }
        }
    };
    
    function checkCollision(x, y, w, h, b) { 
        return x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y; 
    }
    
    function checkSpikeCollision(px, py, pw, ph, spike) {
        let px2 = px + 5, py2 = py + 5, pw2 = pw - 10, ph2 = ph - 10;
        let sx = spike.x + 8, sy = spike.y + 8, sw = spike.w - 16, sh = spike.h - 8;
        return px2 < sx + sw && px2 + pw2 > sx && py2 < sy + sh && py2 + ph2 > sy;
    }
    
    function update() {
        if (game.view !== 2 || game.paused || player.dead || game.showComplete) return;
        
        elapsed = Date.now() - startTime;
        
        // Auto-scroll camera to the right
        cameraX += scrollSpeed;
        
        // Kill player if they fall too far behind the camera
        if (player.x < cameraX - 30) {
            player.dead = true;
            game.deathCount++;
            game.totalDeaths++;
            for(let i = 0; i < 20; i++) createParticle(player.x, player.y, '#ff4444', 1.5);
            setTimeout(resetPlayer, 500);
            return;
        }
        
        // Trail with color
        if (Math.random() > 0.4) {
            let trailColor = PLAYER_COLORS[player.colorIndex];
            // Handle rainbow color - generate a random hue from rainbow spectrum
            if (trailColor === 'rainbow') {
                const rainbowColors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'];
                trailColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
            }
            // Calculate trail size based on shape (smaller proportions)
            let trailSize = player.width / 4;
            if (player.shapeIndex === 0) trailSize = player.width / 4.5; // Circle
            else if (player.shapeIndex === 1) trailSize = player.width / 4; // Triangle
            else if (player.shapeIndex === 2) trailSize = player.width / 3.5; // Heart
            else if (player.shapeIndex === 3) trailSize = player.width / 4; // Cat
            else if (player.shapeIndex === 4) trailSize = player.width / 4; // Dog
            else if (player.shapeIndex === 5) trailSize = player.width / 4.5; // Chicken
            else if (player.shapeIndex === 6) trailSize = player.width / 4; // Mouse
            else if (player.shapeIndex === 7) trailSize = player.width / 4.5; // Box
            
            player.trail.push({
                x: player.x + player.width/2,
                y: player.y + player.height/2,
                alpha: 1,
                color: trailColor,
                size: trailSize
            });
        }
        player.trail = player.trail.filter(t => { t.alpha -= 0.03; return t.alpha > 0; });
        
        // Store ground state
        player.wasOnGround = player.onGround;
        
        // Movement with auto-forward - always move at camera speed, arrow keys modify this
        if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -MOVE_SPEED;
        else if (keys['ArrowRight'] || keys['KeyD']) player.vx = scrollSpeed + MOVE_SPEED;
        else player.vx = scrollSpeed;
        
        // Gravity
        var g = player.isSmall ? SMALL_GRAVITY : GRAVITY;
        player.vy += g;
        
        // Terminal velocity
        if (player.vy > 18) player.vy = 18;
        
        player.x += player.vx;
        player.y += player.vy;
        
        // Check ledge jump
        if (player.wasOnGround && !player.onGround && player.vy > 0) {
            player.canFallJump = true;
        }
        
        player.onGround = false;
        
        for (let b of blocks) {
            if (checkCollision(player.x, player.y, player.width, player.height, b)) {
                // Spike collision
                if (b.type === 4 && checkSpikeCollision(player.x, player.y, player.width, player.height, b)) {
                    player.dead = true;
                    game.deathCount++;
                    game.totalDeaths++;
                    for(let i = 0; i < 20; i++) createParticle(player.x + player.width/2, player.y + player.height/2, '#ff4444', 1.5);
                    setTimeout(resetPlayer, 500);
                    return;
                }
                
                // Finish
                if (b.type === 11 && player.vy > 0 && player.y + player.height <= b.y + 30) {
                    finishLevel();
                    return;
                }
                
                // Bounce pad
                if (b.type === 10) {
                    player.vy = JUMP_FORCE * 1.4;
                    for(let i = 0; i < 10; i++) createParticle(player.x + player.width/2, player.y + player.height, '#ffaa00', 1.3);
                    continue;
                }
                
                // Shrink
                if (b.type === 9) {
                    player.width = 13;
                    player.height = 13;
                    player.isSmall = true;
                    player.vy = SMALL_JUMP_FORCE;
                    for(let i = 0; i < 10; i++) createParticle(player.x + player.width/2, player.y + player.height/2, '#ff44ff', 1.3);
                }
                
                // Grow
                if (b.type === 8) {
                    player.width = 22;
                    player.height = 22;
                    player.isSmall = false;
                    for(let i = 0; i < 10; i++) createParticle(player.x + player.width/2, player.y + player.height/2, '#44ffaa', 1.3);
                }
                
                // Solid collision
                let dx = (player.x + player.width/2) - (b.x + b.w/2);
                let dy = (player.y + player.height/2) - (b.y + b.h/2);
                let ox = (player.width + b.w)/2 - Math.abs(dx);
                let oy = (player.height + b.h)/2 - Math.abs(dy);
                
                if (ox < oy) {
                    if (player.x < b.x) player.x = b.x - player.width;
                    else player.x = b.x + b.w;
                    player.vx = 0;
                } else {
                    if (player.y < b.y) {
                        player.y = b.y - player.height;
                        player.vy = 0;
                        player.onGround = true;
                    } else {
                        player.y = b.y + b.h;
                        player.vy = 0;
                    }
                }
            }
        }
        
        // Fall death
        if (player.y > CANVAS_HEIGHT + 50) {
            player.dead = true;
            game.deathCount++;
            game.totalDeaths++;
            for(let i = 0; i < 20; i++) createParticle(player.x, CANVAS_HEIGHT, '#ff4444', 1.5);
            setTimeout(resetPlayer, 500);
        }
        
        // Rotation: flat on ground, spin in air
        if (player.onGround) {
            player.rotation = 0;
        } else {
            player.rotation += 6;
        }
        
        // Update particles
        game.particles = game.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15;
            p.alpha -= 0.025;
            return p.alpha > 0;
        });
        
        game.levelParticles = game.levelParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.alpha -= 0.01;
            return p.alpha > 0;
        });
    }
    
    function finishLevel() {
        if (finishTimer > 0) return;
        finishTimer = 1;
        game.view = 3;
        game.showComplete = true;
        createConfetti();
        
        let recordKey = 'level_' + game.currentLevel + '_time';
        let bestTime = localStorage.getItem(recordKey);
        game.newRecord = !bestTime || elapsed < parseInt(bestTime);
        if (game.newRecord) localStorage.setItem(recordKey, elapsed);
        
        if (game.currentLevel >= game.maxLevel && game.currentLevel < 50) {
            game.maxLevel = game.currentLevel + 1;
            localStorage.setItem('boxel_max', game.maxLevel);
        }
    }
    
    function draw() {
        let theme = THEMES[currentTheme % THEMES.length];
        let grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        grad.addColorStop(0, theme.bg1);
        grad.addColorStop(1, theme.bg2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Stars
        ctx.fillStyle = '#ffffff';
        for(let star of game.backgroundStars) {
            star.twinkle += 0.015;
            let alpha = star.alpha * (0.6 + 0.4 * Math.sin(star.twinkle));
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        if (game.view === 1) drawMenu(theme);
        else if (game.view === 2) drawGame(theme);
        else if (game.view === 3) drawComplete(theme);
        else if (game.view === 4) drawSettings(theme);
    }
    
    function drawMenu(theme) {
        ctx.shadowColor = theme.accent;
        ctx.shadowBlur = 30;
        ctx.fillStyle = theme.accent;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOXEL', CANVAS_WIDTH/2, 55);
        ctx.fillText('ULTIMATE', CANVAS_WIDTH/2, 95);
        ctx.shadowBlur = 0;
        
        // Settings button
        ctx.fillStyle = theme.accent;
        ctx.fillRect(CANVAS_WIDTH - 55, 15, 40, 35);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('⚙', CANVAS_WIDTH - 35, 40);
        
        // Level grid
        var cols = 5, rows = 10, cellW = CANVAS_WIDTH / cols, cellH = 42, startY = 100, gap = 3;
        for (var c = 0; c < cols; c++) {
            for (var r = 0; r < rows; r++) {
                var level = c * rows + r + 1;
                var x = c * cellW + 5;
                var y = startY + r * (cellH + gap);
                var w = cellW - 10;
                var h = cellH;
                
                var unlocked = level <= game.maxLevel;
                var levelTheme = THEMES[getTheme(level) % THEMES.length];
                
                ctx.fillStyle = unlocked ? levelTheme.bg2 : '#151515';
                ctx.fillRect(x, y, w, h);
                
                ctx.strokeStyle = unlocked ? theme.accent : '#333';
                ctx.lineWidth = unlocked ? 2 : 1;
                ctx.strokeRect(x, y, w, h);
                
                ctx.fillStyle = unlocked ? '#ffffff' : '#444';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(level, x + w/2, y + h/2 + 5);
            }
        }
        
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '11px Arial';
        ctx.fillText('Click level | 1-9 quick | ⚙ settings | Space: jump', CANVAS_WIDTH/2, CANVAS_HEIGHT - 15);
    }
    
    function drawGame(theme) {
        // Menu button
        ctx.fillStyle = theme.accent;
        ctx.fillRect(10, 10, 40, 40);
        ctx.fillStyle = '#000';
        ctx.fillRect(15, 18, 30, 4);
        ctx.fillRect(15, 28, 30, 4);
        ctx.fillRect(15, 38, 30, 4);
        
        var camX = cameraX;
        ctx.save();
        ctx.translate(-camX, 0);
        
        // Trail
        for (let t of player.trail) {
            ctx.globalAlpha = t.alpha * 0.6;
            ctx.fillStyle = t.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size || player.width/4, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Blocks
        for (var b of blocks) drawBlock(b, theme);
        
        // Player
        if (!player.dead) {
            ctx.save();
            ctx.translate(player.x + player.width/2, player.y + player.height/2);
            ctx.rotate(player.rotation * Math.PI/180);
            
            let colorVal = PLAYER_COLORS[player.colorIndex];
            let isRainbow = colorVal === 'rainbow';
            let color = isRainbow ? '#ff8800' : colorVal;
            let shapeIdx = player.shapeIndex;
            
            // Create rainbow gradient if needed
            let fillStyle = color;
            if (isRainbow) {
                let grad = ctx.createLinearGradient(-player.width/2, -player.height/2, player.width/2, player.height/2);
                grad.addColorStop(0, '#ff0000');
                grad.addColorStop(0.2, '#ffff00');
                grad.addColorStop(0.4, '#00ff00');
                grad.addColorStop(0.6, '#00ffff');
                grad.addColorStop(0.8, '#0000ff');
                grad.addColorStop(1, '#ff00ff');
                fillStyle = grad;
            }
            
            // Draw selected shape at origin point
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            
            if (shapeIdx === 0) { // Circle
                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                ctx.arc(0, 0, player.width/2, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (shapeIdx === 1) { // Triangle
                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                ctx.moveTo(0, -player.height/2);
                ctx.lineTo(player.width/2, player.height/2);
                ctx.lineTo(-player.width/2, player.height/2);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (shapeIdx === 2) { // Heart
                ctx.fillStyle = fillStyle;
                ctx.shadowBlur = 20;
                ctx.beginPath();
                let topY = -player.height*0.3, bottomY = player.height*0.3;
                let leftX = -player.width*0.3, rightX = player.width*0.3;
                ctx.moveTo(0, bottomY);
                ctx.quadraticCurveTo(leftX - player.width*0.2, topY, leftX, 0);
                ctx.quadraticCurveTo(0, -player.height*0.5, rightX, 0);
                ctx.quadraticCurveTo(rightX + player.width*0.2, topY, 0, bottomY);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (shapeIdx === 3) { // Cat
                ctx.fillStyle = fillStyle;
                ctx.fillRect(-player.width/2, -player.height*0.3, player.width, player.height*0.6);
                // Ears
                ctx.beginPath();
                ctx.moveTo(-player.width/2 + 3, -player.height*0.3);
                ctx.lineTo(-player.width/2 - 2, -player.height*0.5);
                ctx.lineTo(-player.width/2 + 5, -player.height*0.3);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(player.width/2 - 3, -player.height*0.3);
                ctx.lineTo(player.width/2 + 2, -player.height*0.5);
                ctx.lineTo(player.width/2 - 5, -player.height*0.3);
                ctx.closePath();
                ctx.fill();
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(-player.width*0.15, -player.height*0.1, 2, 3);
                ctx.fillRect(player.width*0.15, -player.height*0.1, 2, 3);
                ctx.shadowBlur = 0;
            } else if (shapeIdx === 4) { // Dog
                ctx.fillStyle = fillStyle;
                ctx.fillRect(-player.width*0.35, -player.height*0.25, player.width*0.7, player.height*0.5);
                ctx.fillRect(-player.width*0.25, player.height*0.1, player.width*0.5, player.height*0.25);
                // Ears
                ctx.beginPath();
                ctx.moveTo(-player.width/2, -player.height*0.25);
                ctx.lineTo(-player.width*0.45, player.height*0.1);
                ctx.lineTo(-player.width*0.35, -player.height*0.15);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(player.width/2, -player.height*0.25);
                ctx.lineTo(player.width*0.45, player.height*0.1);
                ctx.lineTo(player.width*0.35, -player.height*0.15);
                ctx.closePath();
                ctx.fill();
                // Nose
                ctx.fillStyle = '#000';
                ctx.fillRect(-1.5, player.height*0.15, 3, 3);
                ctx.shadowBlur = 0;
            } else if (shapeIdx === 5) { // Chicken
                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                ctx.ellipse(0, 0, player.width*0.35, player.height*0.4, 0, 0, Math.PI*2);
                ctx.fill();
                // Head
                ctx.beginPath();
                ctx.arc(0, -player.height*0.35, player.width*0.2, 0, Math.PI*2);
                ctx.fill();
                // Beak
                ctx.fillStyle = '#ff8800';
                ctx.beginPath();
                ctx.moveTo(player.width*0.15, -player.height*0.35);
                ctx.lineTo(player.width*0.4, -player.height*0.35);
                ctx.lineTo(player.width*0.2, -player.height*0.3);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (shapeIdx === 6) { // Mouse
                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                ctx.ellipse(0, 0, player.width*0.3, player.height*0.35, 0, 0, Math.PI*2);
                ctx.fill();
                // Head
                ctx.beginPath();
                ctx.arc(player.width*0.2, -player.height*0.2, player.width*0.18, 0, Math.PI*2);
                ctx.fill();
                // Tail
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.quadraticCurveTo(-player.width*0.4, player.height*0.1, -player.width*0.5, -player.height*0.1);
                ctx.stroke();
                // Ears
                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                ctx.arc(player.width*0.15, -player.height*0.4, player.width*0.1, 0, Math.PI*2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(player.width*0.35, -player.height*0.4, player.width*0.1, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (shapeIdx === 7) { // Box
                ctx.fillStyle = fillStyle;
                ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.stroke();
            } else { // Default: Square
                ctx.fillStyle = fillStyle;
                ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
                ctx.shadowBlur = 0;
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(-5, -5, 3, 4);
                ctx.fillRect(2, -5, 3, 4);
            }
            
            ctx.restore();
        }
        
        ctx.restore();
        
        // Particles
        for (let p of game.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // UI
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('L' + game.currentLevel, 60, 34);
        ctx.fillText((elapsed/1000).toFixed(2) + 's', 60, 56);
        
        // Death counter
        ctx.font = '12px Arial';
        ctx.fillText('Deaths: ' + game.totalDeaths, 60, 74);
        
        if (game.paused) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        }
        
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('☰ Menu | Space: Jump | ←→: Move | R: Restart', 10, CANVAS_HEIGHT - 10);
    }
    
    function drawComplete(theme) {
        // Particles
        for (let p of game.levelParticles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.shadowColor = theme.accent;
        ctx.shadowBlur = 30;
        ctx.fillStyle = theme.accent;
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 70);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px Arial';
        ctx.fillText((elapsed/1000).toFixed(2) + 's', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 15);
        
        if (game.newRecord) {
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('★ NEW RECORD! ★', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 25);
            ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = theme.accent;
        ctx.fillRect(CANVAS_WIDTH/2 - 80, CANVAS_HEIGHT/2 + 55, 160, 45);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('CONTINUE', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 85);
    }
    
    function drawSettings(theme) {
        ctx.fillStyle = theme.accent;
        ctx.fillRect(10, 10, 40, 40);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('←', 22, 36);
        
        ctx.fillStyle = theme.accent;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CUSTOMIZE', CANVAS_WIDTH/2, 85);
        
        // Color section
        ctx.font = '18px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('Player Color:', CANVAS_WIDTH/2, 135);
        
        let currentColor = PLAYER_COLORS[game.selectedColor];
        if (currentColor === 'rainbow') {
            let grad = ctx.createLinearGradient(CANVAS_WIDTH/2 - 40, 155, CANVAS_WIDTH/2 + 40, 155);
            grad.addColorStop(0, '#ff0000');
            grad.addColorStop(0.2, '#ffff00');
            grad.addColorStop(0.4, '#00ff00');
            grad.addColorStop(0.6, '#00ffff');
            grad.addColorStop(0.8, '#0000ff');
            grad.addColorStop(1, '#ff00ff');
            ctx.fillStyle = grad;
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 20;
        } else {
            ctx.fillStyle = currentColor;
            ctx.shadowColor = currentColor;
            ctx.shadowBlur = 30;
        }
        ctx.fillRect(CANVAS_WIDTH/2 - 40, 155, 80, 80);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(CANVAS_WIDTH/2 - 40, 155, 80, 80);
        
        let colorStartY = 260;
        for(let i = 0; i < PLAYER_COLORS.length; i++) {
            let x = 20 + (i % 4) * 80;
            let y = colorStartY + Math.floor(i / 4) * 60;
            
            if (PLAYER_COLORS[i] === 'rainbow') {
                let grad = ctx.createLinearGradient(x, y, x + 70, y);
                grad.addColorStop(0, '#ff0000');
                grad.addColorStop(0.2, '#ffff00');
                grad.addColorStop(0.4, '#00ff00');
                grad.addColorStop(0.6, '#00ffff');
                grad.addColorStop(0.8, '#0000ff');
                grad.addColorStop(1, '#ff00ff');
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = PLAYER_COLORS[i];
            }
            ctx.fillRect(x, y, 70, 50);
            
            if (i === game.selectedColor) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, 70, 50);
            }
        }
        
        // Shape section - 2x4 grid
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
       
        
        let shapeGridStartX = 20;
        let shapeGridStartY = 380;
        let shapeCols = 4;
        let shapeSize = 70;
        let shapeGap = 10;
        let previewColor = PLAYER_COLORS[game.selectedColor] === 'rainbow' ? '#ff8800' : PLAYER_COLORS[game.selectedColor];
        
        for(let i = 0; i < SHAPES.length; i++) {
            let isUnlocked = game.maxLevel >= SHAPES[i].unlock;
            let col = i % shapeCols;
            let row = Math.floor(i / shapeCols);
            let sx = shapeGridStartX + col * (shapeSize + shapeGap);
            let sy = shapeGridStartY + row * (shapeSize + shapeGap);
            
            // Background
            ctx.fillStyle = isUnlocked ? 'rgba(100, 100, 100, 0.5)' : 'rgba(50, 50, 50, 0.8)';
            ctx.fillRect(sx, sy, shapeSize, shapeSize);
            
            // Border if selected
            if (i === game.selectedShape && isUnlocked) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.strokeRect(sx, sy, shapeSize, shapeSize);
            }
            
            // Locked indicator
            if (!isUnlocked) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(sx, sy, shapeSize, shapeSize);
                ctx.fillStyle = '#888';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Lvl ' + SHAPES[i].unlock, sx + shapeSize/2, sy + shapeSize/2 + 4);
            } else {
                // Draw shape icon
                SHAPES[i].draw(sx + shapeSize/2, sy + shapeSize/2, 25, previewColor);
            }
        }
        
        // Save button
        ctx.fillStyle = theme.accent;
        ctx.fillRect(CANVAS_WIDTH/2 - 50, CANVAS_HEIGHT - 95, 100, 40);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SAVE', CANVAS_WIDTH/2, CANVAS_HEIGHT - 68);
        
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click colors and shapes', CANVAS_WIDTH/2, CANVAS_HEIGHT - 25);
    }
    
    function drawBlock(b, theme) {
        if (b.type === 1) {
            let g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#3a3a4a');
            g.addColorStop(1, '#1a1a2a');
            ctx.fillStyle = g;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = theme.accent;
            ctx.globalAlpha = 0.25;
            ctx.fillRect(b.x, b.y, b.w, 4);
            ctx.globalAlpha = 1;
        }
        else if (b.type === 4) {
            ctx.fillStyle = '#ff3344';
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.h);
            ctx.lineTo(b.x + b.w/2, b.y);
            ctx.lineTo(b.x + b.w, b.y + b.h);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ff6677';
            ctx.beginPath();
            ctx.moveTo(b.x + b.w/2, b.y);
            ctx.lineTo(b.x + b.w/2 - 8, b.y + 14);
            ctx.lineTo(b.x + b.w/2, b.y + 8);
            ctx.closePath();
            ctx.fill();
        }
        else if (b.type === 10) {
            let g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#ffbb00');
            g.addColorStop(1, '#ff8800');
            ctx.fillStyle = g;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▲', b.x + b.w/2, b.y + b.h/2 + 5);
        }
        else if (b.type === 11) {
            ctx.fillStyle = '#ffdd00';
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#000';
            for(var i = 0; i < 3; i++) for(var j = 0; j < 3; j++)
                if ((i + j) % 2 === 0) ctx.fillRect(b.x + i*b.w/3, b.y + j*b.h/3, b.w/3, b.h/3);
        }
        else if (b.type === 9) {
            let g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#ff55bb');
            g.addColorStop(1, '#dd2299');
            ctx.fillStyle = g;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▼', b.x + b.w/2, b.y + b.h/2 + 4);
        }
        else if (b.type === 8) {
            let g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#22ddbb');
            g.addColorStop(1, '#00aa88');
            ctx.fillStyle = g;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▲', b.x + b.w/2, b.y + b.h/2 + 4);
        }
        else if (b.type === 13) {
            let g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#44ff88');
            g.addColorStop(1, '#22cc55');
            ctx.fillStyle = g;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▶▶', b.x + b.w/2 - 8, b.y + b.h/2 + 3);
        }
    }
    
    function loop() { update(); draw(); requestAnimationFrame(loop); }
    
    try {
        game.maxLevel = parseInt(localStorage.getItem('boxel_max')) || 1;
        game.selectedColor = parseInt(localStorage.getItem('boxel_color')) || 0;
        game.selectedShape = parseInt(localStorage.getItem('boxel_shape')) || 0;
        game.totalDeaths = parseInt(localStorage.getItem('boxel_deaths')) || 0;
        player.colorIndex = game.selectedColor;
        player.shapeIndex = game.selectedShape;
    } catch(e) {}
    
    // Save deaths
    setInterval(() => {
        localStorage.setItem('boxel_deaths', game.totalDeaths);
    }, 1000);
    
    loop();
})();
