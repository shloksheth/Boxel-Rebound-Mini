// Boxel Rebound - Pro Edition

(function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const CANVAS_WIDTH = 360;
    const CANVAS_HEIGHT = 640;
    
    // Beautiful color schemes - 10 unique themes
    const THEMES = [
        { bg1: '#0c1929', bg2: '#1e3a5f', accent: '#00d4ff', name: 'Ocean' },
        { bg1: '#1a0d14', bg2: '#3d1026', accent: '#ff3366', name: 'Ruby' },
        { bg1: '#0d1a0d', bg2: '#1b3d1b', accent: '#00ff66', name: 'Forest' },
        { bg1: '#120d1a', bg2: '#2d1b3d', accent: '#aa00ff', name: 'Void' },
        { bg1: '#0d141a', bg2: '#1b2833', accent: '#00ccff', name: 'Ice' },
        { bg1: '#1a140d', bg2: '#33261b', accent: '#ff9900', name: 'Amber' },
        { bg1: '#0d1a14', bg2: '#1b2d22', accent: '#00ff99', name: 'Mint' },
        { bg1: '#140d1a', bg2: '#281b2d', accent: '#ff00aa', name: 'Rose' },
        { bg1: '#0d0d1a', bg2: '#1b1b2d', accent: '#6666ff', name: 'Royal' },
        { bg1: '#1a0f0a', bg2: '#2d1b14', accent: '#ff5500', name: 'Ember' }
    ];
    
    // 10 player colors
    const PLAYER_COLORS = [
        '#00d4ff', '#ff3366', '#00ff66', '#aa00ff', '#ff9900',
        '#00ff99', '#ff00aa', '#6666ff', '#ffff00', '#ff6600'
    ];
    
    // Game state
    let game = { 
        view: 1, currentLevel: 1, maxLevel: 1, paused: false, 
        showComplete: false, newRecord: false, deathCount: 0,
        selectedColor: 0, particles: [], levelParticles: [], 
        backgroundStars: [], bounceCount: 0
    };
    
    // Player
    let player = { 
        x: 90, y: 500, width: 20, height: 20, 
        vx: 0, vy: 0, onGround: false, dead: false, 
        rotation: 0, spawnX: 90, spawnY: 500, 
        isSmall: false, trail: [], colorIndex: 0,
        wasOnGround: false, canFallJump: false
    };
    
    // Tuned physics
    const GRAVITY = 0.85, JUMP_FORCE = -13, MOVE_SPEED = 4.5, 
          SMALL_GRAVITY = 1.1, SMALL_JUMP_FORCE = -14.5;
    
    let keys = {}, blocks = [], startTime = 0, elapsed = 0, 
        finishTimer = 0, currentTheme = 0;
    
    // Generate stars
    for(let i=0; i<60; i++) {
        game.backgroundStars.push({
            x: Math.random() * CANVAS_WIDTH * 3,
            y: Math.random() * CANVAS_HEIGHT,
            size: Math.random() * 2.5 + 0.5,
            alpha: Math.random() * 0.6 + 0.15,
            twinkle: Math.random() * Math.PI * 2
        });
    }
    
    function getTheme(level) { return (level - 1) % THEMES.length; }
    function addBlock(x, y, w, h, type) { blocks.push({x, y, w, h, type}); }
    
    // Particle system
    function createParticle(x, y, color) {
        game.particles.push({
            x, y, color,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6 - 3,
            alpha: 1, size: Math.random() * 5 + 2
        });
    }
    
    function createConfetti() {
        const colors = ['#fbbf24', '#00d4ff', '#00ff66', '#ff3366', '#aa00ff'];
        for(let i=0; i<40; i++) {
            game.levelParticles.push({
                x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                alpha: 1, size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random()*colors.length)]
            });
        }
    }
    
    // 50 Advanced Levels - Each one is unique and challenging
    const LEVELS = {
        // Tutorial Section (1-10) - Learning the mechanics
        1: () => { // Basic Movement
            for(let i=0; i<6; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 535, 45, 45, 1);
            addBlock(315, 490, 45, 90, 1);
            addBlock(360, 445, 45, 135, 1);
            addBlock(405, 400, 45, 180, 1);
            addBlock(450, 355, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        2: () => { // First Jump
            for(let i=0; i<8; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(360, 595, 45, 10, 4);
            addBlock(450, 535, 45, 45, 1);
            addBlock(540, 445, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        3: () => { // Bounce Introduction
            for(let i=0; i<4; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 560, 45, 20, 10);
            addBlock(315, 445, 90, 45, 1);
            addBlock(450, 355, 90, 45, 1);
            addBlock(585, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        4: () => { // Shrink Mechanic
            for(let i=0; i<6; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 560, 45, 20, 9);
            addBlock(315, 505, 45, 75, 1);
            addBlock(315, 430, 45, 75, 1);
            addBlock(360, 505, 45, 75, 1);
            addBlock(360, 430, 45, 75, 1);
            addBlock(405, 505, 45, 75, 1);
            addBlock(405, 430, 45, 75, 1);
            addBlock(450, 560, 45, 20, 8);
            addBlock(585, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        5: () => { // Spike Pattern
            for(let i=0; i<12; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 580, 45, 45, 4);
            addBlock(360, 580, 45, 45, 4);
            addBlock(495, 580, 45, 45, 4);
            addBlock(675, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        6: () => { // Double Bounce
            for(let i=0; i<4; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 560, 45, 20, 10);
            addBlock(315, 400, 90, 45, 1);
            addBlock(405, 355, 45, 20, 10);
            addBlock(540, 265, 90, 45, 1);
            addBlock(630, 175, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        7: () => { // Platform Steps
            for(let i=0; i<3; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(135, 520, 45, 60, 1);
            addBlock(180, 460, 45, 120, 1);
            addBlock(225, 400, 45, 180, 1);
            addBlock(270, 340, 45, 240, 1);
            addBlock(315, 280, 45, 300, 1);
            addBlock(360, 220, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        8: () => { // Easy Steps
            for(let i=0; i<8; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(360, 535, 45, 45, 1);
            addBlock(405, 490, 45, 90, 1);
            addBlock(450, 445, 45, 135, 1);
            addBlock(495, 400, 45, 180, 1);
            addBlock(540, 355, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        9: () => { // Mechanics Combo
            for(let i=0; i<4; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 560, 45, 20, 10);
            addBlock(270, 445, 90, 45, 1);
            addBlock(315, 445, 45, 20, 9);
            addBlock(405, 400, 90, 45, 1);
            addBlock(450, 355, 45, 20, 13);
            addBlock(540, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        10: () => { // Tutorial Challenge
            for(let i=0; i<3; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(135, 580, 45, 45, 4);
            addBlock(225, 535, 45, 45, 1);
            addBlock(315, 490, 45, 20, 10);
            addBlock(405, 400, 90, 45, 1);
            addBlock(450, 355, 45, 20, 8);
            addBlock(540, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        
        // Intermediate (11-20) - More complex patterns
        11: () => { // Long Spike Corridor
            for(let i=0; i<18; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 580, 45, 45, 4);
            addBlock(360, 580, 45, 45, 4);
            addBlock(495, 580, 45, 45, 4);
            addBlock(630, 580, 45, 45, 4);
            addBlock(765, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        12: () => { // Tower of Bounces
            for(let i=0; i<4; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 560, 45, 20, 10);
            addBlock(270, 475, 90, 45, 1);
            addBlock(315, 430, 45, 20, 10);
            addBlock(405, 355, 90, 45, 1);
            addBlock(450, 310, 45, 20, 10);
            addBlock(540, 220, 90, 45, 1);
            addBlock(585, 175, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        13: () => { // Drop & Dodge
            for(let i=0; i<4; i++) addBlock(i*45, 355, 45, 45, 1);
            addBlock(180, 580, 405, 45, 1);
            addBlock(200, 355, 25, 25, 4);
            addBlock(290, 355, 25, 25, 4);
            addBlock(380, 355, 25, 25, 4);
            addBlock(470, 355, 25, 25, 4);
            addBlock(560, 355, 25, 25, 4);
            addBlock(650, 445, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 315;
        },
        14: () => { // Speed Boost
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 560, 45, 20, 13);
            addBlock(405, 560, 45, 20, 13);
            addBlock(585, 560, 45, 20, 13);
            addBlock(765, 560, 45, 20, 13);
            addBlock(945, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        15: () => { // Shrink Tower Climb
            for(let i=0; i<4; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 560, 45, 20, 9);
            addBlock(225, 505, 45, 75, 1);
            addBlock(225, 355, 45, 75, 1);
            addBlock(225, 265, 45, 75, 1);
            addBlock(270, 560, 45, 20, 8);
            addBlock(360, 490, 90, 45, 1);
            addBlock(450, 400, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        16: () => { // Zigzag Descent
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 490, 90, 45, 1);
            addBlock(405, 400, 90, 45, 1);
            addBlock(585, 310, 90, 45, 1);
            addBlock(765, 220, 90, 45, 1);
            addBlock(945, 130, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        17: () => { // Step Up Challenge
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 520, 45, 60, 1);
            addBlock(405, 460, 45, 120, 1);
            addBlock(540, 400, 45, 180, 1);
            addBlock(675, 340, 45, 240, 1);
            addBlock(810, 280, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        18: () => { // Bounce Chain
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 560, 45, 20, 10);
            addBlock(360, 475, 45, 20, 10);
            addBlock(540, 390, 45, 20, 10);
            addBlock(720, 305, 45, 20, 10);
            addBlock(900, 220, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        19: () => { // Spike Gauntlet
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(315, 580, 45, 45, 4);
            addBlock(405, 580, 45, 45, 4);
            addBlock(540, 580, 45, 45, 4);
            addBlock(675, 580, 45, 45, 4);
            addBlock(765, 580, 45, 45, 4);
            addBlock(900, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        20: () => { // Advanced Mix
            for(let i=0; i<18; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 560, 45, 20, 10);
            addBlock(405, 475, 90, 45, 1);
            addBlock(495, 475, 45, 20, 9);
            addBlock(585, 400, 90, 45, 1);
            addBlock(675, 355, 45, 20, 13);
            addBlock(810, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        
        // Advanced (21-30) - Expert level design
        21: () => { // Extended Corridor
            for(let i=0; i<25; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(315, 580, 45, 45, 4);
            addBlock(450, 580, 45, 45, 4);
            addBlock(585, 580, 45, 45, 4);
            addBlock(720, 580, 45, 45, 4);
            addBlock(900, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        22: () => { // Floating Steps
            for(let i=0; i<20; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(135, 520, 45, 60, 1);
            addBlock(315, 460, 45, 120, 1);
            addBlock(495, 400, 45, 180, 1);
            addBlock(675, 340, 45, 240, 1);
            addBlock(855, 280, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        23: () => { // Triple Spike Sections
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 580, 135, 45, 4);
            addBlock(540, 580, 135, 45, 4);
            addBlock(855, 580, 45, 45, 4);
            addBlock(945, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        24: () => { // Double Bounce Tower
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 560, 45, 20, 10);
            addBlock(405, 445, 90, 45, 1);
            addBlock(495, 400, 45, 20, 10);
            addBlock(675, 310, 90, 45, 1);
            addBlock(765, 265, 45, 20, 10);
            addBlock(945, 175, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        25: () => { // Simple Steps
            for(let i=0; i<10; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(450, 535, 45, 45, 1);
            addBlock(495, 490, 45, 90, 1);
            addBlock(540, 445, 45, 135, 1);
            addBlock(585, 400, 45, 180, 1);
            addBlock(630, 355, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        26: () => { // Bounce Maze
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 560, 45, 20, 10);
            addBlock(405, 505, 45, 75, 1);
            addBlock(495, 450, 45, 20, 10);
            addBlock(675, 355, 90, 45, 1);
            addBlock(765, 310, 45, 20, 10);
            addBlock(945, 220, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        27: () => { // Tight Squeeze
            for(let i=0; i<18; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 560, 45, 20, 9);
            addBlock(315, 520, 25, 60, 1);
            addBlock(405, 560, 45, 20, 8);
            addBlock(540, 580, 45, 45, 1);
            addBlock(630, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        28: () => { // Spike Platforms
            for(let i=0; i<24; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 580, 45, 45, 4);
            addBlock(405, 520, 45, 60, 1);
            addBlock(540, 580, 45, 45, 4);
            addBlock(675, 460, 45, 120, 1);
            addBlock(810, 580, 45, 45, 4);
            addBlock(945, 400, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        29: () => { // Double Stack Challenge
            for(let i=0; i<18; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(180, 520, 45, 60, 1);
            addBlock(270, 580, 45, 45, 4);
            addBlock(270, 520, 45, 60, 1);
            addBlock(360, 580, 45, 45, 4);
            addBlock(360, 520, 45, 60, 1);
            addBlock(450, 460, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        30: () => { // Advanced Combo
            for(let i=0; i<18; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 560, 45, 20, 10);
            addBlock(360, 445, 90, 45, 1);
            addBlock(450, 445, 45, 20, 9);
            addBlock(585, 355, 90, 45, 1);
            addBlock(675, 310, 45, 20, 13);
            addBlock(765, 265, 45, 20, 8);
            addBlock(855, 175, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        
        // Expert (31-40) - Master levels
        31: () => { // Big Gap Challenge
            for(let i=0; i<16; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 520, 45, 60, 1);
            addBlock(450, 460, 45, 120, 1);
            addBlock(630, 400, 45, 180, 1);
            addBlock(810, 340, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        32: () => { // Spike Maze
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 580, 45, 45, 4);
            addBlock(360, 580, 45, 45, 1);
            addBlock(360, 520, 45, 60, 4);
            addBlock(495, 580, 45, 45, 4);
            addBlock(585, 580, 45, 45, 1);
            addBlock(585, 520, 45, 60, 4);
            addBlock(720, 580, 45, 45, 1);
            addBlock(855, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        33: () => { // Bounce Tower
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 560, 45, 20, 10);
            addBlock(405, 475, 45, 20, 10);
            addBlock(585, 390, 45, 20, 10);
            addBlock(765, 305, 45, 20, 10);
            addBlock(945, 220, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        34: () => { // Narrow Passage
            for(let i=0; i<18; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 560, 45, 20, 9);
            addBlock(360, 520, 35, 60, 1);
            addBlock(450, 560, 45, 20, 8);
            addBlock(585, 535, 45, 45, 1);
            addBlock(675, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        35: () => { // Spike Corridor
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(270, 580, 45, 45, 4);
            addBlock(360, 580, 45, 45, 1);
            addBlock(360, 520, 45, 60, 4);
            addBlock(495, 580, 45, 45, 1);
            addBlock(495, 520, 45, 60, 4);
            addBlock(630, 580, 45, 45, 1);
            addBlock(765, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        36: () => { // Staircase of Peril
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 520, 45, 60, 4);
            addBlock(360, 460, 45, 120, 1);
            addBlock(450, 460, 45, 120, 4);
            addBlock(585, 400, 45, 180, 1);
            addBlock(675, 400, 45, 180, 4);
            addBlock(810, 340, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        37: () => { // Speed Demon
            for(let i=0; i<28; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(315, 560, 45, 20, 13);
            addBlock(540, 560, 45, 20, 13);
            addBlock(765, 560, 45, 20, 13);
            addBlock(990, 560, 45, 20, 13);
            addBlock(1215, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        38: () => { // Leap of Faith
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 580, 45, 45, 4);
            addBlock(360, 580, 45, 45, 4);
            addBlock(495, 580, 45, 45, 4);
            addBlock(675, 580, 45, 45, 1);
            addBlock(810, 580, 45, 45, 4);
            addBlock(945, 580, 45, 45, 4);
            addBlock(1080, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        39: () => { // Bounce & Shrink Combo
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 560, 45, 20, 10);
            addBlock(360, 475, 90, 45, 1);
            addBlock(405, 475, 45, 20, 9);
            addBlock(540, 400, 90, 45, 1);
            addBlock(585, 400, 45, 20, 8);
            addBlock(720, 355, 90, 45, 1);
            addBlock(855, 265, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        40: () => { // Ultimate Test
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(315, 520, 45, 60, 1);
            addBlock(405, 475, 45, 20, 10);
            addBlock(540, 355, 90, 45, 1);
            addBlock(540, 580, 45, 45, 4);
            addBlock(630, 355, 45, 20, 9);
            addBlock(765, 310, 45, 20, 8);
            addBlock(855, 220, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        
        // Master (41-50) - Extreme challenges
        41: () => { // NinetyNine Run
            for(let i=0; i<25; i++) addBlock(i*45, 580, 45, 45, 1);
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
        42: () => { // Platform Hell
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 475, 45, 105, 1);
            addBlock(180, 280, 45, 105, 4);
            addBlock(315, 400, 45, 180, 1);
            addBlock(315, 130, 45, 90, 4);
            addBlock(450, 310, 45, 270, 1);
            addBlock(585, 220, 45, 360, 1);
            addBlock(720, 130, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        43: () => { // Trap City
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 580, 45, 45, 4);
            addBlock(270, 520, 45, 60, 1);
            addBlock(360, 580, 45, 45, 4);
            addBlock(360, 520, 45, 60, 1);
            addBlock(450, 580, 45, 45, 4);
            addBlock(450, 520, 45, 60, 1);
            addBlock(540, 580, 45, 45, 4);
            addBlock(630, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        44: () => { // Bounce Marathon
            for(let i=0; i<25; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 560, 45, 20, 10);
            addBlock(450, 475, 45, 20, 10);
            addBlock(630, 390, 45, 20, 10);
            addBlock(810, 305, 45, 20, 10);
            addBlock(990, 220, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        45: () => { // Precision Landing
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(270, 535, 25, 45, 1);
            addBlock(405, 580, 45, 45, 4);
            addBlock(495, 535, 25, 45, 1);
            addBlock(630, 580, 45, 45, 4);
            addBlock(720, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        46: () => { // The Maze
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(270, 580, 45, 45, 4);
            addBlock(270, 520, 45, 60, 1);
            addBlock(360, 580, 45, 45, 4);
            addBlock(360, 520, 45, 60, 1);
            addBlock(450, 580, 45, 45, 1);
            addBlock(450, 520, 45, 60, 4);
            addBlock(540, 580, 45, 45, 4);
            addBlock(630, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        47: () => { // Shrink or Die
            for(let i=0; i<18; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(225, 560, 45, 20, 9);
            addBlock(315, 505, 30, 75, 1);
            addBlock(315, 355, 30, 75, 1);
            addBlock(360, 560, 45, 20, 8);
            addBlock(495, 580, 45, 45, 1);
            addBlock(585, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        48: () => { // Ultra Speed Run
            for(let i=0; i<32; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(405, 560, 45, 20, 13);
            addBlock(585, 560, 45, 20, 13);
            addBlock(765, 560, 45, 20, 13);
            addBlock(945, 560, 45, 20, 13);
            addBlock(1125, 560, 45, 20, 13);
            addBlock(1305, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        49: () => { // Near Impossible
            for(let i=0; i<22; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 580, 45, 45, 4);
            addBlock(315, 580, 45, 45, 4);
            addBlock(450, 580, 45, 45, 4);
            addBlock(585, 580, 45, 45, 1);
            addBlock(720, 580, 45, 45, 4);
            addBlock(855, 580, 45, 45, 4);
            addBlock(990, 490, 90, 45, 11);
            player.spawnX = 45; player.spawnY = 540;
        },
        50: () => { // Final Boss
            for(let i=0; i<28; i++) addBlock(i*45, 580, 45, 45, 1);
            addBlock(180, 560, 45, 20, 10);
            addBlock(315, 475, 45, 105, 1);
            addBlock(360, 475, 45, 20, 9);
            addBlock(495, 400, 45, 180, 1);
            addBlock(495, 580, 45, 45, 4);
            addBlock(630, 355, 45, 20, 10);
            addBlock(765, 265, 45, 45, 1);
            addBlock(765, 580, 45, 45, 4);
            addBlock(855, 220, 45, 20, 13);
            addBlock(990, 130, 90, 45, 11);
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
        player.width = 20;
        player.height = 20;
        player.vx = 0;
        player.vy = 0;
        player.dead = false;
        player.onGround = false;
        player.rotation = 0;
        player.isSmall = false;
        player.trail = [];
        player.canFallJump = false;
        player.wasOnGround = false;
        game.bounceCount = 0;
        startTime = Date.now();
    }
    
    // Input
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
                    for(let i = 0; i < 5; i++) createParticle(player.x + player.width/2, player.y + player.height, '#ffffff');
                } else if (player.canFallJump) {
                    // Ledge jump - jump after falling off without jumping
                    player.vy = JUMP_FORCE;
                    player.canFallJump = false;
                    for(let i = 0; i < 5; i++) createParticle(player.x + player.width/2, player.y + player.height, '#ffffff');
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
            // Settings button
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
                    for(let i = 0; i < 5; i++) createParticle(player.x + player.width/2, player.y + player.height, '#ffffff');
                } else if (player.canFallJump) {
                    player.vy = JUMP_FORCE;
                    player.canFallJump = false;
                    for(let i = 0; i < 5; i++) createParticle(player.x + player.width/2, player.y + player.height, '#ffffff');
                }
            }
        }
        else if (game.view === 3) { game.view = 1; game.showComplete = false; }
        else if (game.view === 4) {
            if (mx >= 10 && mx <= 50 && my >= 10 && my <= 50) { game.view = 1; return; }
        }
    };
    
    function checkCollision(x, y, w, h, b) { 
        return x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y; 
    }
    
    function checkSpikeCollision(px, py, pw, ph, spike) {
        let px2 = px + 4, py2 = py + 4, pw2 = pw - 8, ph2 = ph - 8;
        let sx = spike.x + 6, sy = spike.y + 6, sw = spike.w - 12, sh = spike.h - 6;
        return px2 < sx + sw && px2 + pw2 > sx && py2 < sy + sh && py2 + ph2 > sy;
    }
    
    function update() {
        if (game.view !== 2 || game.paused || player.dead || game.showComplete) return;
        
        elapsed = Date.now() - startTime;
        
        // Trail
        if (Math.random() > 0.5) {
            player.trail.push({
                x: player.x + player.width/2,
                y: player.y + player.height/2,
                alpha: 1,
                color: PLAYER_COLORS[player.colorIndex]
            });
        }
        player.trail = player.trail.filter(t => { t.alpha -= 0.035; return t.alpha > 0; });
        
        // Store previous frame's ground state
        player.wasOnGround = player.onGround;
        
        // Movement
        if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -MOVE_SPEED;
        else if (keys['ArrowRight'] || keys['KeyD']) player.vx = MOVE_SPEED;
        else player.vx = MOVE_SPEED * 0.85;
        
        var g = player.isSmall ? SMALL_GRAVITY : GRAVITY;
        player.vy += g;
        player.x += player.vx;
        player.y += player.vy;
        
        // Check if player fell off a ledge (was on ground, now not on ground, didn't jump)
        if (player.wasOnGround && !player.onGround && player.vy > 0) {
            player.canFallJump = true;
        }
        
        player.onGround = false;
        
        for (let b of blocks) {
            if (checkCollision(player.x, player.y, player.width, player.height, b)) {
                if (b.type === 4 && checkSpikeCollision(player.x, player.y, player.width, player.height, b)) {
                    player.dead = true;
                    game.deathCount++;
                    for(let i = 0; i < 15; i++) createParticle(player.x + player.width/2, player.y + player.height/2, '#ff3333');
                    setTimeout(resetPlayer, 600);
                    return;
                }
                
                if (b.type === 11 && player.vy > 0 && player.y + player.height <= b.y + 25) {
                    finishLevel();
                    return;
                }
                
                if (b.type === 10) {
                    player.vy = JUMP_FORCE * 1.35;
                    game.bounceCount++;
                    for(let i = 0; i < 8; i++) createParticle(player.x + player.width/2, player.y + player.height, '#ffaa00');
                    continue;
                }
                
                if (b.type === 9) {
                    player.width = 12;
                    player.height = 12;
                    player.isSmall = true;
                    player.vy = SMALL_JUMP_FORCE;
                    for(let i = 0; i < 8; i++) createParticle(player.x + player.width/2, player.y + player.height/2, '#ff66aa');
                }
                
                if (b.type === 8) {
                    player.width = 20;
                    player.height = 20;
                    player.isSmall = false;
                    for(let i = 0; i < 8; i++) createParticle(player.x + player.width/2, player.y + player.height/2, '#00ccaa');
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
        
        if (player.y > CANVAS_HEIGHT + 50) {
            player.dead = true;
            game.deathCount++;
            for(let i = 0; i < 15; i++) createParticle(player.x, CANVAS_HEIGHT, '#ff3333');
            setTimeout(resetPlayer, 600);
        }
        
        player.rotation += 5;
        
        // Particles
        game.particles = game.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.alpha -= 0.02;
            return p.alpha > 0;
        });
        
        game.levelParticles = game.levelParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.03;
            p.alpha -= 0.012;
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
            star.twinkle += 0.02;
            let alpha = star.alpha * (0.7 + 0.3 * Math.sin(star.twinkle));
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
        ctx.shadowBlur = 25;
        ctx.fillStyle = theme.accent;
        ctx.font = 'bold 44px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOXEL', CANVAS_WIDTH/2, 55);
        ctx.fillText('PRO', CANVAS_WIDTH/2, 95);
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
        ctx.fillText('Click level to play | 1-9 quick start | ⚙ Customize', CANVAS_WIDTH/2, CANVAS_HEIGHT - 20);
    }
    
    function drawGame(theme) {
        // Menu button
        ctx.fillStyle = theme.accent;
        ctx.fillRect(10, 10, 40, 40);
        ctx.fillStyle = '#000';
        ctx.fillRect(15, 18, 30, 4);
        ctx.fillRect(15, 28, 30, 4);
        ctx.fillRect(15, 38, 30, 4);
        
        var camX = player.x - 100;
        if (camX < 0) camX = 0;
        ctx.save();
        ctx.translate(-camX, 0);
        
        // Trail
        for (let t of player.trail) {
            ctx.globalAlpha = t.alpha * 0.5;
            ctx.fillStyle = t.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, player.width/2.5, 0, Math.PI*2);
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
            
            ctx.shadowColor = PLAYER_COLORS[player.colorIndex];
            ctx.shadowBlur = 18;
            ctx.fillStyle = PLAYER_COLORS[player.colorIndex];
            ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = '#000';
            ctx.fillRect(-5, -5, 3, 4);
            ctx.fillRect(2, -5, 3, 4);
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
        ctx.shadowBlur = 25;
        ctx.fillStyle = theme.accent;
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 70);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.fillText((elapsed/1000).toFixed(2) + 's', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 15);
        
        if (game.newRecord) {
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 22px Arial';
            ctx.fillText('★ NEW RECORD! ★', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 25);
            ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = theme.accent;
        ctx.fillRect(CANVAS_WIDTH/2 - 75, CANVAS_HEIGHT/2 + 55, 150, 45);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('CONTINUE', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 85);
    }
    
    function drawSettings(theme) {
        // Back
        ctx.fillStyle = theme.accent;
        ctx.fillRect(10, 10, 40, 40);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('←', 22, 36);
        
        ctx.fillStyle = theme.accent;
        ctx.font = 'bold 34px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CUSTOMIZE', CANVAS_WIDTH/2, 85);
        
        ctx.font = '18px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('Player Color:', CANVAS_WIDTH/2, 135);
        
        let currentColor = PLAYER_COLORS[game.selectedColor];
        ctx.fillStyle = currentColor;
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 25;
        ctx.fillRect(CANVAS_WIDTH/2 - 35, 155, 70, 70);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(CANVAS_WIDTH/2 - 35, 155, 70, 70);
        
        // Colors
        let colorStartY = 250;
        for(let i = 0; i < PLAYER_COLORS.length; i++) {
            let x = 25 + (i % 5) * 65;
            let y = colorStartY + Math.floor(i / 5) * 55;
            
            ctx.fillStyle = PLAYER_COLORS[i];
            ctx.fillRect(x, y, 55, 45);
            
            if (i === game.selectedColor) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, 55, 45);
            }
        }
        
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '12px Arial';
        ctx.fillText('← → to change color', CANVAS_WIDTH/2, CANVAS_HEIGHT - 35);
    }
    
    function drawBlock(b, theme) {
        if (b.type === 1) {
            let g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#3d4f5f');
            g.addColorStop(1, '#1a2833');
            ctx.fillStyle = g;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = theme.accent;
            ctx.globalAlpha = 0.3;
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
            ctx.lineTo(b.x + b.w/2 - 6, b.y + 12);
            ctx.lineTo(b.x + b.w/2, b.y + 6);
            ctx.closePath();
            ctx.fill();
        }
        else if (b.type === 10) {
            let g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#ffaa00');
            g.addColorStop(1, '#cc7700');
            ctx.fillStyle = g;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▲', b.x + b.w/2, b.y + b.h/2 + 5);
        }
        else if (b.type === 11) {
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#000';
            for(var i = 0; i < 3; i++) for(var j = 0; j < 3; j++)
                if ((i + j) % 2 === 0) ctx.fillRect(b.x + i*b.w/3, b.y + j*b.h/3, b.w/3, b.h/3);
        }
        else if (b.type === 9) {
            let g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#ff44aa');
            g.addColorStop(1, '#cc0066');
            ctx.fillStyle = g;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▼', b.x + b.w/2, b.y + b.h/2 + 4);
        }
        else if (b.type === 8) {
            let g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#00ccaa');
            g.addColorStop(1, '#008866');
            ctx.fillStyle = g;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('▲', b.x + b.w/2, b.y + b.h/2 + 4);
        }
        else if (b.type === 13) {
            let g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#33ff66');
            g.addColorStop(1, '#00cc33');
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
        player.colorIndex = game.selectedColor;
    } catch(e) {}
    
    loop();
})();
