// Boxel Rebound - 50 Levels Fixed

(function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const CANVAS_WIDTH = 360;
    const CANVAS_HEIGHT = 640;
    
    const SET_COLORS = [
        ['#0f172a', '#1e293b'],
        ['#1a0f0f', '#2d1b1b'],
        ['#0f1a0f', '#1b2d1b'],
        ['#1a0f1a', '#2d1b2d'],
        ['#0f0f1a', '#1b1b2d']
    ];
    
    let game = { view: 1, currentLevel: 1, maxLevel: 1, paused: false, showComplete: false, newRecord: false, particles: [] };
    let player = { x: 90, y: 500, width: 20, height: 20, vx: 0, vy: 0, onGround: false, dead: false, rotation: 0, spawnX: 90, spawnY: 500, canDoubleJump: false, isSmall: false };
    const GRAVITY = 0.5, JUMP_FORCE = -11, MOVE_SPEED = 3, SMALL_GRAVITY = 0.7, SMALL_JUMP_FORCE = -14;
    let keys = {}, blocks = [], startTime = 0, elapsed = 0, finishTimer = 0, currentSet = 0;
    
    function getSet(level) { return Math.floor((level - 1) / 10); }
    function addBlock(x, y, w, h, type) { blocks.push({x, y, w, h, type}); }
    
    function loadLevel(level) {
        game.currentLevel = level;
        blocks = [];
        finishTimer = 0;
        currentSet = getSet(level);
        
        const LEVELS = {
            1: () => { for(let i=0;i<6;i++) addBlock(i*45,580,45,45,1); addBlock(270,535,45,45,1); addBlock(315,490,45,90,1); addBlock(360,445,45,135,1); addBlock(405,400,45,180,1); addBlock(450,355,90,45,11); player.spawnX=45; player.spawnY=540; },
            2: () => { for(let i=0;i<5;i++) addBlock(i*45,580,45,45,1); addBlock(225,595,45,10,4); addBlock(315,595,45,10,4); for(let i=8;i<13;i++) addBlock(i*45,580,45,45,1); addBlock(540,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            3: () => { for(let i=0;i<4;i++) addBlock(i*45,580,45,45,1); addBlock(180,565,45,15,10); addBlock(270,490,90,45,1); addBlock(360,400,90,45,1); addBlock(450,310,90,45,11); player.spawnX=45; player.spawnY=540; },
            4: () => { for(let i=0;i<5;i++) addBlock(i*45,580,45,45,1); addBlock(225,565,45,15,9); addBlock(270,520,45,60,1); addBlock(270,460,45,60,1); addBlock(315,520,45,60,1); addBlock(315,460,45,60,1); addBlock(360,520,45,60,1); addBlock(360,460,45,60,1); addBlock(405,565,45,15,8); addBlock(495,535,90,45,11); player.spawnX=45; player.spawnY=540; },
            5: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,580,45,45,4); addBlock(225,580,45,45,1); addBlock(270,580,45,45,4); addBlock(360,580,45,45,1); addBlock(405,580,45,45,4); addBlock(495,580,45,45,1); addBlock(540,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            6: () => { for(let i=0;i<4;i++) addBlock(i*45,580,45,45,1); addBlock(180,565,45,15,10); addBlock(270,400,90,45,1); addBlock(315,355,45,15,10); addBlock(405,220,90,45,1); addBlock(450,175,90,45,11); player.spawnX=45; player.spawnY=540; },
            7: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,535,45,45,1); addBlock(180,490,45,45,1); addBlock(225,445,45,45,1); addBlock(270,400,45,45,1); addBlock(315,355,45,45,1); addBlock(360,310,45,45,1); addBlock(405,265,90,45,11); player.spawnX=45; player.spawnY=540; },
            8: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(180,490,45,45,1); addBlock(270,400,45,45,1); addBlock(360,310,45,45,1); addBlock(450,220,45,45,1); addBlock(495,175,90,45,11); player.spawnX=45; player.spawnY=540; },
            9: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,565,45,15,10); addBlock(225,490,45,45,1); addBlock(225,565,45,15,9); addBlock(315,400,90,45,1); addBlock(360,355,45,15,13); addBlock(450,265,90,45,11); player.spawnX=45; player.spawnY=540; },
            10: () => { for(let i=0;i<2;i++) addBlock(i*45,580,45,45,1); addBlock(90,580,45,45,4); addBlock(135,535,45,45,1); addBlock(180,490,45,15,10); addBlock(270,355,45,45,1); addBlock(270,580,45,45,4); addBlock(315,400,45,15,9); addBlock(405,310,45,15,8); addBlock(450,220,90,45,11); player.spawnX=45; player.spawnY=540; },
            11: () => { for(let i=0;i<8;i++) addBlock(i*45,580,45,45,1); addBlock(360,580,45,45,4); addBlock(405,580,45,45,1); addBlock(450,535,45,45,1); addBlock(495,490,45,45,1); addBlock(540,445,90,45,11); player.spawnX=45; player.spawnY=540; },
            12: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,535,45,45,1); addBlock(180,490,45,90,1); addBlock(225,400,45,180,1); addBlock(270,310,45,270,1); addBlock(315,220,45,360,1); addBlock(360,130,90,45,11); player.spawnX=45; player.spawnY=540; },
            13: () => { for(let i=0;i<4;i++) addBlock(i*45,400,45,45,1); addBlock(180,580,225,45,1); addBlock(180,400,30,30,4); addBlock(270,400,30,30,4); addBlock(360,400,30,30,4); addBlock(450,490,90,45,11); player.spawnX=45; player.spawnY=360; },
            14: () => { for(let i=0;i<10;i++) addBlock(i*45,580,45,45,1); addBlock(225,565,45,15,13); addBlock(315,565,45,15,13); addBlock(405,565,45,15,13); addBlock(495,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            15: () => { for(let i=0;i<4;i++) addBlock(i*45,580,45,45,1); addBlock(180,565,45,15,9); addBlock(225,535,45,45,1); addBlock(225,400,45,45,1); addBlock(225,265,45,45,1); addBlock(270,565,45,15,8); addBlock(360,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            16: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(180,490,90,45,1); addBlock(315,400,90,45,1); addBlock(180,310,90,45,1); addBlock(315,220,90,45,1); addBlock(405,130,90,45,11); player.spawnX=45; player.spawnY=540; },
            17: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,580,45,45,4); addBlock(180,535,45,45,1); addBlock(225,580,45,45,4); addBlock(270,490,45,45,1); addBlock(315,580,45,45,4); addBlock(360,445,45,45,1); addBlock(405,580,45,45,4); addBlock(450,400,90,45,11); player.spawnX=45; player.spawnY=540; },
            18: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,565,45,15,10); addBlock(225,400,45,15,10); addBlock(315,265,45,15,10); addBlock(405,130,90,45,11); player.spawnX=45; player.spawnY=540; },
            19: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,580,45,45,4); addBlock(180,580,45,45,1); addBlock(225,580,45,45,4); addBlock(270,580,45,45,1); addBlock(315,580,45,45,4); addBlock(360,580,45,45,1); addBlock(405,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            20: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,565,45,15,10); addBlock(225,490,45,45,1); addBlock(225,565,45,15,9); addBlock(315,400,90,45,1); addBlock(360,355,45,15,13); addBlock(450,265,90,45,11); player.spawnX=45; player.spawnY=540; },
            21: () => { for(let i=0;i<2;i++) addBlock(i*45,580,45,45,1); addBlock(90,580,45,45,4); addBlock(135,580,45,45,1); addBlock(180,580,45,45,4); addBlock(225,580,45,45,1); addBlock(270,580,45,45,4); addBlock(315,580,45,45,1); addBlock(360,580,45,45,4); addBlock(405,580,45,45,1); addBlock(450,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            22: () => { addBlock(0,580,45,45,1); addBlock(90,535,45,45,1); addBlock(180,490,45,45,1); addBlock(270,445,45,45,1); addBlock(360,400,45,45,1); addBlock(450,355,45,45,1); addBlock(495,310,90,45,11); player.spawnX=20; player.spawnY=540; },
            23: () => { for(let i=0;i<5;i++) addBlock(i*45,580,45,45,1); addBlock(225,580,45,45,4); addBlock(270,580,45,45,4); addBlock(315,580,45,45,4); for(let i=8;i<13;i++) addBlock(i*45,580,45,45,1); addBlock(540,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            24: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,565,45,15,10); addBlock(225,490,90,45,1); addBlock(270,445,45,15,10); addBlock(360,355,90,45,1); addBlock(405,310,45,15,10); addBlock(495,220,90,45,11); player.spawnX=45; player.spawnY=540; },
            25: () => { for(let i=0;i<4;i++) addBlock(i*45,580,45,45,1); addBlock(180,400,45,180,1); addBlock(270,400,45,180,1); addBlock(315,400,45,15,9); addBlock(405,400,45,15,8); addBlock(450,310,90,45,11); player.spawnX=45; player.spawnY=540; },
            26: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,565,45,15,10); addBlock(225,535,45,45,1); addBlock(270,490,45,15,10); addBlock(360,400,90,45,1); addBlock(405,355,45,15,10); addBlock(495,265,90,45,11); player.spawnX=45; player.spawnY=540; },
            27: () => { for(let i=0;i<4;i++) addBlock(i*45,580,45,45,1); addBlock(180,565,45,15,9); addBlock(225,535,20,45,1); addBlock(270,565,45,15,8); addBlock(360,580,45,45,1); addBlock(405,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            28: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(180,580,45,45,4); addBlock(225,535,45,45,1); addBlock(270,580,45,45,4); addBlock(315,490,45,45,1); addBlock(360,580,45,45,4); addBlock(405,445,45,45,1); addBlock(450,400,90,45,11); player.spawnX=45; player.spawnY=540; },
            29: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,580,45,45,4); addBlock(135,535,45,45,1); addBlock(180,580,45,45,4); addBlock(180,535,45,45,1); addBlock(225,580,45,45,4); addBlock(225,535,45,45,1); addBlock(270,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            30: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,565,45,15,10); addBlock(225,400,90,45,1); addBlock(270,565,45,15,9); addBlock(315,355,45,15,13); addBlock(405,355,45,15,8); addBlock(450,265,90,45,11); player.spawnX=45; player.spawnY=540; },
            31: () => { addBlock(0,580,45,45,1); addBlock(135,535,45,45,1); addBlock(270,490,45,45,1); addBlock(405,445,45,45,1); addBlock(495,400,90,45,11); player.spawnX=20; player.spawnY=540; },
            32: () => { for(let i=0;i<4;i++) addBlock(i*45,580,45,45,1); addBlock(180,580,45,45,4); addBlock(225,580,45,45,1); addBlock(225,535,45,45,4); addBlock(270,580,45,45,1); addBlock(315,580,45,45,4); addBlock(315,535,45,45,1); addBlock(360,580,45,45,1); addBlock(405,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            33: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,565,45,15,10); addBlock(225,490,45,15,10); addBlock(315,415,45,15,10); addBlock(405,340,45,15,10); addBlock(495,265,90,45,11); player.spawnX=45; player.spawnY=540; },
            34: () => { for(let i=0;i<5;i++) addBlock(i*45,580,45,45,1); addBlock(225,565,45,15,9); addBlock(270,535,30,45,1); addBlock(315,565,45,15,8); addBlock(405,535,45,45,1); addBlock(450,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            35: () => { for(let i=0;i<2;i++) addBlock(i*45,580,45,45,1); addBlock(90,580,45,45,4); addBlock(135,580,45,45,4); addBlock(180,580,45,45,1); addBlock(180,535,45,45,4); addBlock(225,580,45,45,1); addBlock(225,535,45,45,4); addBlock(270,580,45,45,1); addBlock(315,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            36: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,535,45,45,4); addBlock(180,490,45,45,1); addBlock(225,445,45,45,4); addBlock(270,400,45,45,1); addBlock(315,355,45,45,4); addBlock(360,310,45,45,1); addBlock(405,265,90,45,11); player.spawnX=45; player.spawnY=540; },
            37: () => { for(let i=0;i<12;i++) addBlock(i*45,580,45,45,1); addBlock(270,565,45,15,13); addBlock(450,565,45,15,13); addBlock(585,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            38: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,580,45,45,4); addBlock(180,580,45,45,4); addBlock(225,580,45,45,4); addBlock(270,580,45,45,1); addBlock(360,580,45,45,4); addBlock(405,580,45,45,4); addBlock(450,580,45,45,1); addBlock(495,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            39: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,565,45,15,10); addBlock(225,490,45,45,1); addBlock(225,565,45,15,9); addBlock(315,400,90,45,1); addBlock(360,565,45,15,8); addBlock(450,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            40: () => { for(let i=0;i<2;i++) addBlock(i*45,580,45,45,1); addBlock(90,580,45,45,4); addBlock(135,535,45,45,1); addBlock(180,490,45,15,10); addBlock(270,355,45,45,1); addBlock(270,580,45,45,4); addBlock(315,400,45,15,9); addBlock(405,310,45,15,8); addBlock(450,220,90,45,11); player.spawnX=45; player.spawnY=540; },
            41: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,580,45,45,4); addBlock(180,580,45,45,4); addBlock(225,580,45,45,1); addBlock(270,580,45,45,4); addBlock(315,580,45,45,4); addBlock(360,580,45,45,1); addBlock(405,580,45,45,4); addBlock(450,580,45,45,4); addBlock(495,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            42: () => { addBlock(0,580,45,45,1); addBlock(90,490,45,45,1); addBlock(90,400,45,45,4); addBlock(180,400,45,45,1); addBlock(180,310,45,45,4); addBlock(270,310,45,45,1); addBlock(270,220,45,45,4); addBlock(360,220,45,45,1); addBlock(405,175,90,45,11); player.spawnX=20; player.spawnY=540; },
            43: () => { for(let i=0;i<4;i++) addBlock(i*45,580,45,45,1); addBlock(180,580,45,45,4); addBlock(180,535,45,45,1); addBlock(225,580,45,45,4); addBlock(225,535,45,45,1); addBlock(270,580,45,45,4); addBlock(270,535,45,45,1); addBlock(315,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            44: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(135,565,45,15,10); addBlock(225,490,45,15,10); addBlock(315,415,45,15,10); addBlock(405,340,45,15,10); addBlock(495,265,90,45,11); player.spawnX=45; player.spawnY=540; },
            45: () => { for(let i=0;i<2;i++) addBlock(i*45,580,45,45,1); addBlock(90,580,45,45,4); addBlock(135,535,20,45,1); addBlock(180,580,45,45,4); addBlock(225,535,20,45,1); addBlock(270,580,45,45,4); addBlock(315,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            46: () => { for(let i=0;i<3;i++) addBlock(i*45,580,45,45,1); addBlock(180,580,45,45,4); addBlock(180,535,45,45,1); addBlock(135,580,45,45,1); addBlock(225,580,45,45,4); addBlock(225,535,45,45,1); addBlock(270,580,45,45,1); addBlock(270,535,45,45,4); addBlock(315,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            47: () => { for(let i=0;i<4;i++) addBlock(i*45,580,45,45,1); addBlock(180,565,45,15,9); addBlock(225,520,25,60,1); addBlock(225,460,25,60,1); addBlock(270,565,45,15,8); addBlock(360,580,45,45,1); addBlock(405,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            48: () => { for(let i=0;i<15;i++) addBlock(i*45,580,45,45,1); addBlock(270,565,45,15,13); addBlock(360,565,45,15,13); addBlock(450,565,45,15,13); addBlock(540,565,45,15,13); addBlock(720,490,90,45,11); player.spawnX=45; player.spawnY=540; },
            49: () => { addBlock(0,580,45,45,1); addBlock(90,580,45,45,4); addBlock(180,580,45,45,4); addBlock(270,580,45,45,4); addBlock(360,580,45,45,1); addBlock(405,580,45,45,4); addBlock(450,580,45,45,4); addBlock(495,490,90,45,11); player.spawnX=20; player.spawnY=540; },
            50: () => { for(let i=0;i<2;i++) addBlock(i*45,580,45,45,1); addBlock(90,565,45,15,10); addBlock(180,490,45,45,1); addBlock(180,565,45,15,9); addBlock(270,400,45,45,1); addBlock(270,580,45,45,4); addBlock(315,355,45,15,10); addBlock(405,265,45,45,1); addBlock(405,580,45,45,4); addBlock(450,220,45,15,13); addBlock(540,130,90,45,11); player.spawnX=45; player.spawnY=540; }
        };
        
        if (LEVELS[level]) LEVELS[level]();
        else { for(let i=0;i<10;i++) addBlock(i*45,580,45,45,1); addBlock(450,490,90,45,11); player.spawnX=45; player.spawnY=540; }
        resetPlayer();
    }
    
    function resetPlayer() {
        player.x=player.spawnX; player.y=player.spawnY;
        player.width=20; player.height=20;
        player.vx=0; player.vy=0; player.dead=false;
        player.onGround=false; player.rotation=0;
        player.isSmall=false;
        player.canDoubleJump=true;
        startTime=Date.now();
    }
    
    document.addEventListener('keydown', (e) => {
        keys[e.code]=true;
        if(game.view===1 && e.key>='1' && e.key<='9'){
            let lvl=parseInt(e.key);
            if(lvl<=game.maxLevel){ game.view=2; loadLevel(lvl); }
        }
        if(game.view===2 && !game.paused){
            if((e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW') && player.onGround && !player.dead){
                player.vy=JUMP_FORCE; player.onGround=false;
            }
            if(e.code==='KeyR') resetPlayer();
            if(e.code==='KeyP'||e.code==='Escape') game.view=1;
        }
        if(game.view===3 && (e.code==='Space'||e.code==='Enter')){ game.view=1; game.showComplete=false; }
    });
    document.addEventListener('keyup', (e)=>keys[e.code]=false);
    
    canvas.onclick = function(e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        var mx = (e.clientX - rect.left) * scaleX;
        var my = (e.clientY - rect.top) * scaleY;
        
        if (game.view === 1) {
            // 5 columns, 10 rows - each column is levels 1-10, 11-20, etc going down
            var cols = 5;
            var rows = 10;
            var cellW = CANVAS_WIDTH / cols;
            var cellH = 44;
            var startY = 95;
            var gap = 4;
            
            var col = Math.floor(mx / cellW);
            var row = Math.floor((my - startY) / (cellH + gap));
            
            var level = col * rows + row + 1;
            
            if (level >= 1 && level <= 50 && level <= game.maxLevel && my >= startY && col >= 0 && col < cols) {
                game.view = 2;
                loadLevel(level);
            }
        }
        else if (game.view === 2) {
            // Hamburger menu button in top-left
            if (mx >= 10 && mx <= 50 && my >= 10 && my <= 50) {
                game.view = 1;
                return;
            }
            // Jump on click
            if (player.onGround && !player.dead && !game.paused) {
                player.vy = JUMP_FORCE;
                player.onGround = false;
            }
        }
        else if (game.view === 3) {
            game.view = 1;
            game.showComplete = false;
        }
    };
    
    function checkCollision(x,y,w,h,b){ return x<b.x+b.w && x+w>b.x && y<b.y+b.h && y+h>b.y; }
    
    function update(){
        if(game.view!==2 || game.paused || player.dead || game.showComplete) return;
        elapsed=Date.now()-startTime;
        if(keys['ArrowLeft']||keys['KeyA']) player.vx=-MOVE_SPEED;
        else if(keys['ArrowRight']||keys['KeyD']) player.vx=MOVE_SPEED;
        else player.vx=MOVE_SPEED*0.9;
        
        // Higher gravity when small, lower when big
        var g = player.isSmall ? SMALL_GRAVITY : GRAVITY;
        player.vy += g;
        player.x+=player.vx; player.y+=player.vy;
        player.onGround=false;
        for(let b of blocks){
            if(checkCollision(player.x,player.y,player.width,player.height,b)){
                if(b.type===4){ player.dead=true; setTimeout(resetPlayer,500); return; }
                if(b.type===11 && player.vy>0 && player.y+player.height<=b.y+15){ finishLevel(); return; }
                if(b.type===10){ player.vy=JUMP_FORCE*1.3; continue; }
                if(b.type===9){ player.width=12; player.height=12; player.isSmall=true; player.vy = SMALL_JUMP_FORCE; }
                if(b.type===8){ player.width=20; player.height=20; player.isSmall=false; }
                let dx=(player.x+player.width/2)-(b.x+b.w/2), dy=(player.y+player.height/2)-(b.y+b.h/2);
                let ox=(player.width+b.w)/2-Math.abs(dx), oy=(player.height+b.h)/2-Math.abs(dy);
                if(ox<oy){ if(player.x<b.x) player.x=b.x-player.width; else player.x=b.x+b.w; player.vx=0; }
                else{ if(player.y<b.y){ player.y=b.y-player.height; player.vy=0; player.onGround=true; } else{ player.y=b.y+b.h; player.vy=0; } }
            }
        }
        if(player.y>CANVAS_HEIGHT){ player.dead=true; setTimeout(resetPlayer,500); }
        player.rotation+=6;
    }
    
    function finishLevel(){
        if(finishTimer>0) return;
        finishTimer=1; game.view=3; game.showComplete=true;
        let recordKey='level_'+game.currentLevel+'_time';
        let bestTime=localStorage.getItem(recordKey);
        game.newRecord=!bestTime || elapsed<parseInt(bestTime);
        if(game.newRecord) localStorage.setItem(recordKey,elapsed);
        if(game.currentLevel>=game.maxLevel && game.currentLevel<50){ game.maxLevel=game.currentLevel+1; localStorage.setItem('boxel_max',game.maxLevel); }
    }
    
    function draw(){
        let colors=SET_COLORS[currentSet%SET_COLORS.length];
        let grad=ctx.createLinearGradient(0,0,0,CANVAS_HEIGHT);
        grad.addColorStop(0,colors[0]); grad.addColorStop(1,colors[1]);
        ctx.fillStyle=grad; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        if(game.view===1) drawMenu();
        else if(game.view===2) drawGame();
        else if(game.view===3) drawComplete();
    }
    
    function drawMenu(){
        ctx.fillStyle='#22d3ee'; ctx.font='bold 36px Arial'; ctx.textAlign='center';
        ctx.fillText('BOXEL',CANVAS_WIDTH/2,45); ctx.fillText('REBOUND',CANVAS_WIDTH/2,75);
        
        // 5 columns x 10 rows - column 1 = 1-10, column 2 = 11-20, etc
        var cols = 5;
        var rows = 10;
        var cellW = CANVAS_WIDTH / cols;
        var cellH = 44;
        var startY = 95;
        var gap = 4;
        
        for(var c=0; c<cols; c++){
            for(var r=0; r<rows; r++){
                var level = c * rows + r + 1;
                var x = c * cellW + 5;
                var y = startY + r * (cellH + gap);
                var w = cellW - 10;
                var h = cellH;
                
                var unlocked = level <= game.maxLevel;
                var setNum = Math.floor((level-1)/10);
                var setColors = SET_COLORS[setNum % SET_COLORS.length];
                
                // Button background
                ctx.fillStyle = unlocked ? setColors[1] : '#1e1e1e';
                ctx.fillRect(x, y, w, h);
                
                // Border
                ctx.strokeStyle = unlocked ? '#22d3ee' : '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w, h);
                
                // Level number
                ctx.fillStyle = unlocked ? '#fff' : '#444';
                ctx.font = 'bold 16px Arial';
                ctx.fillText(level, x + w/2, y + h/2 + 6);
            }
        }
        
        ctx.fillStyle='#666'; ctx.font='12px Arial'; ctx.fillText('Click level to play | Press 1-9 for quick start',CANVAS_WIDTH/2,CANVAS_HEIGHT-20);
    }
    
    function drawGame(){
        // Draw hamburger menu button
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(10, 10, 40, 40);
        ctx.fillStyle = '#000';
        ctx.fillRect(15, 18, 30, 4);
        ctx.fillRect(15, 28, 30, 4);
        ctx.fillRect(15, 38, 30, 4);
        
        var camX=player.x-100; if(camX<0) camX=0;
        ctx.save(); ctx.translate(-camX,0);
        for(var b of blocks) drawBlock(b);
        if(!player.dead){
            ctx.save(); ctx.translate(player.x+player.width/2,player.y+player.height/2);
            ctx.rotate(player.rotation*Math.PI/180);
            ctx.fillStyle='#22d3ee'; ctx.fillRect(-player.width/2,-player.height/2,player.width,player.height);
            ctx.fillStyle='#0f172a'; ctx.fillRect(-4,-5,3,4); ctx.fillRect(1,-5,3,4);
            ctx.restore();
        }
        ctx.restore();
        ctx.fillStyle='#fff'; ctx.font='bold 18px Arial'; ctx.textAlign='left';
        ctx.fillText('L'+game.currentLevel,60,32);
        ctx.fillText((elapsed/1000).toFixed(2)+'s',60,54);
        if(game.paused){
            ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
            ctx.fillStyle='#fff'; ctx.font='bold 32px Arial'; ctx.textAlign='center';
            ctx.fillText('PAUSED',CANVAS_WIDTH/2,CANVAS_HEIGHT/2);
        }
        ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px Arial'; ctx.textAlign='left';
        ctx.fillText('Click menu | Space:Jump | Arrows:Move | R:Restart',10,CANVAS_HEIGHT-10);
    }
    
    function drawComplete(){
        ctx.fillStyle='rgba(0,0,0,0.85)'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        ctx.fillStyle='#22d3ee'; ctx.font='bold 36px Arial'; ctx.textAlign='center';
        ctx.fillText('LEVEL COMPLETE!',CANVAS_WIDTH/2,CANVAS_HEIGHT/2-60);
        ctx.fillStyle='#fff'; ctx.font='bold 28px Arial';
        ctx.fillText((elapsed/1000).toFixed(2)+'s',CANVAS_WIDTH/2,CANVAS_HEIGHT/2-10);
        if(game.newRecord){ ctx.fillStyle='#fbbf24'; ctx.font='bold 20px Arial'; ctx.fillText('NEW RECORD!',CANVAS_WIDTH/2,CANVAS_HEIGHT/2+20); }
        ctx.fillStyle='#22d3ee'; ctx.fillRect(CANVAS_WIDTH/2-60,CANVAS_HEIGHT/2+50,120,40);
        ctx.fillStyle='#000'; ctx.font='bold 18px Arial'; ctx.fillText('CONTINUE',CANVAS_WIDTH/2,CANVAS_HEIGHT/2+77);
    }
    
    function drawBlock(b){
        if(b.type===1){ ctx.fillStyle='#1a1a1a'; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.fillStyle='#333'; ctx.fillRect(b.x,b.y,b.w,6); }
        else if(b.type===4){ ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.moveTo(b.x,b.y+b.h); ctx.lineTo(b.x+b.w/2,b.y); ctx.lineTo(b.x+b.w,b.y+b.h); ctx.closePath(); ctx.fill(); }
        else if(b.type===10){ ctx.fillStyle='#f59e0b'; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.fillStyle='#fff'; ctx.font='bold 16px Arial'; ctx.fillText('^',b.x+b.w/2-6,b.y+b.h/2+6); }
        else if(b.type===11){ ctx.fillStyle='#fbbf24'; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.fillStyle='#000'; for(var i=0;i<3;i++) for(var j=0;j<3;j++) if((i+j)%2===0) ctx.fillRect(b.x+i*b.w/3,b.y+j*b.h/3,b.w/3,b.h/3); }
        else if(b.type===9){ ctx.fillStyle='#ec4899'; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.fillStyle='#fff'; ctx.fillText('v',b.x+b.w/2-4,b.y+b.h/2+4); }
        else if(b.type===8){ ctx.fillStyle='#14b8a6'; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.fillStyle='#fff'; ctx.fillText('^',b.x+b.w/2-4,b.y+b.h/2+4); }
        else if(b.type===13){ ctx.fillStyle='#22c55e'; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.fillStyle='#fff'; ctx.font='10px Arial'; ctx.fillText('>>',b.x+10,b.y+b.h/2+3); }
    }
    
    function loop(){ update(); draw(); requestAnimationFrame(loop); }
    try{ game.maxLevel=parseInt(localStorage.getItem('boxel_max'))||1; }catch(e){}
    loop();
})();
