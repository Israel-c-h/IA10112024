var w = 800;
var h = 400;
var jugador;
var fondo;

var bala, balaD = false, nave, velocidadBala, despBala, statusBala;
var bala2, bala2D = false, nave2, velocidadBala2, despBala2, statusBala2, pausaBala2 = 0;
var bala3, bala3D = false, nave3, velocidadBala3, despBala3, statusBala3, pausaBala3 = 0;

var salto, correr;

var menu;

var estatusAire;
var estatusCorrer;

var nnNetwork, nnEntrenamiento, nnSalida, datosEntrenamiento = [];
var modoAuto = false, eCompleto = false;

var paso = 4;
var saltando = false;

var aux=0;
var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png', 32, 48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}

function create() {
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w - 100, h - 70, 'nave');
    nave2 = juego.add.sprite(20, 20, 'nave');
    nave3 = juego.add.sprite(w - 100, 20, 'nave');
    bala = juego.add.sprite(w - 100, h, 'bala');
    bala2 = juego.add.sprite(50, 80, 'bala');
    bala3 = juego.add.sprite(w - 55, 80, 'bala');

    jugador = juego.add.sprite(50, h - 48, 'mono');

    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre', [8, 9, 10, 11]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;

    juego.physics.enable(bala2);
    bala2.body.collideWorldBounds = true;

    juego.physics.enable(bala3);
    bala3.body.collideWorldBounds = true;

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    correr = juego.input.keyboard.addKey(Phaser.Keyboard.C);

    nnNetwork = new synaptic.Architect.Perceptron(6, 8, 8, 2);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}

function enRedNeural() {
    if (datosEntrenamiento.length === 0) {
        console.error('No hay datos de entrenamiento disponibles');
        return;
    }
    else{
        console.log("Tiene datos");
    }
    
    nnEntrenamiento.train(datosEntrenamiento, { rate: 0.03, iterations: 10000, shuffle: true });
}

function datosDeEntrenamiento(param_entrada) {
    nnSalida = nnNetwork.activate(param_entrada);
    var salto = Math.round( nnSalida[0] * 100);
    var corro = Math.round( nnSalida[1] * 100);
    var decision = [false, false]

    if(salto > 50){
        decision[0] = true
    }
    if(corro > 50){
        decision[1] = true
    }
    
    return decision;
}

function pausa() {
    juego.paused = true;
    menu = juego.add.sprite(w / 2, h / 2, 'menu');
    menu.anchor.setTo(0.5, 0.5);

    jugador.position.x = 50;
    jugador.body.velocity.x = 0;
    jugador.body.velocity.y = 0;
    bala.body.velocity.x = 0;
    bala.position.x = w - 100;
    bala2.body.velocity.y = 0;
    bala2.position.y = 80;
    bala2.position.x = 50;
    bala3.body.velocity.y = 0;
    bala3.position.y = 80;
    bala3.position.x = w - 55;
    balaD = false;
    bala2D = false;
    bala3D = false;
}

function mPausa(event) {
    if (juego.paused) {
        var menu_x1 = w / 2 - 270 / 2, menu_x2 = w / 2 + 270 / 2,
            menu_y1 = h / 2 - 180 / 2, menu_y2 = h / 2 + 180 / 2;

        var mouse_x = event.x,
            mouse_y = event.y;

        if (mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2) {
            if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90) {
                if(eCompleto){
                    datosEntrenamiento = [];
                }
                else{
                    for(aux = 0; aux < 20 ; aux++){
                        datosEntrenamiento.pop();
                    }
                }
                eCompleto = false;
                modoAuto = false;
            } else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
                if (!eCompleto) {
                    for(aux = 0; aux < 20 ; aux++){
                        datosEntrenamiento.pop();
                    }
                    console.log("","Entrenamiento "+ datosEntrenamiento.length +" valores" );
                    enRedNeural();
                    eCompleto = true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            juego.paused = false;
        }
    }
}

function resetVariables() {
    if (statusBala == true) {
        bala.body.velocity.x = 0;
        bala.position.x = w - 100;
        statusBala = false;
    }

    if (statusBala2 == true && pausaBala2 == 20) {
        bala2.body.velocity.y = 0;
        bala2.position.y = 80;
        bala2.position.x = 50;
        statusBala2 = false;
        pausaBala2 = 0;
    } else if (statusBala2 == true && pausaBala2 < 20) {
        pausaBala2++;
        bala2.position.x = 800;
        bala2.position.y = 400;
    }

    if (statusBala3 == true) {
        bala3.body.velocity.y = 0;
        bala3.position.y = 80;
        bala3.position.x = w - 55;
        statusBala3 = false;
        pausaBala3 = 0;
    }

    if (estatusCorrer == 1 && !saltando) {
        jugador.body.velocity.x = 0;
        jugador.body.velocity.y = 0;
    }

    balaD = false;
    bala2D = false;
    bala3D = false;
}

function corriendo(){
    if(jugador.position.x < 100){
        jugador.position.x += paso;
    }
}

function regresar(){
    if(jugador.position.x > 51){
        jugador.position.x -= (paso / 2);
    }
    else if(jugador.position.x < 49){
        jugador.position.x = 50;
    }
}

function saltarB() {
    jugador.body.velocity.y = -350;
    saltando = true;
}

function update() {
    fondo.tilePosition.x -= 1;
    juego.physics.arcade.collide(jugador, [bala, bala2, bala3], colisionH, null, this);

    estatusAire = 0;
    estatusCorrer = 0;

    if (!jugador.body.onFloor()) {
        estatusAire = 1;
    }
    else{
        saltando = false;
    }

    if(jugador.position.x != 50){
        estatusCorrer = 1;
    }

    despBala = Math.floor(jugador.position.x - bala.position.x);
    despBala2 = Math.floor(jugador.position.y - bala2.position.y);
    despBala3 = Math.floor(jugador.position.x - bala3.position.x);

    if (!modoAuto) {
        console.log(correr.isDown);
        if(salto.isDown && jugador.body.onFloor()){
            saltarB();
        }
        if (correr.isDown) {
            corriendo();
        }
        else if(!correr.isDown && jugador.position.x >50){
            regresar();
        }    
    }else if (modoAuto == true && (bala.position.x > 0 || bala2.position.y >= 380) ) {
        var decision = datosDeEntrenamiento([despBala, velocidadBala, despBala2, velocidadBala2,despBala3, bala3.body.velocity.x]);
        
        if ( decision[0] && !saltando) {
            saltarB();
        }
        if (decision[1]) {
            corriendo();
        }
        else if(jugador.position.x != 50){
            regresar();
        }
    }

    if (!balaD) {
        disparo();
    }

    if (!bala2D) {
        disparo2();
    }

    if (!bala3D) {
        disparo3();
    }

    if (bala.position.x <= 0 || bala2.position.y >= 380 || bala3.position.y >= 380) {
        if (bala.position.x <= 0) {
            statusBala = true;
        }
        if (bala2.position.y >= 380) {
            statusBala2 = true;
        }
        if (bala3.position.x <= 0) {
            statusBala3 = true;
        }

        resetVariables();
    }

    if (!modoAuto && (bala.position.x > 0 || bala2.position.y < 380)) {
        datosEntrenamiento.push({
            'input': [despBala, velocidadBala, despBala2, velocidadBala2, despBala3, bala3.body.velocity.x],
            'output': [estatusAire, estatusCorrer]
        });
        
    }
}

function disparo() {
    velocidadBala = -1 * velocidadRandom(100, 500);
    bala.body.velocity.y = 0;
    bala.body.velocity.x = velocidadBala;
    balaD = true;
}

function disparo2() {
    velocidadBala2 = velocidadRandom(50, 100);
    bala2.body.velocity.y = velocidadBala2;
    bala2.body.velocity.x = 0;
    bala2D = true;
}

function disparo3() {
    var startX = bala3.position.x;
    var startY = bala3.position.y;



    var tragetX = velocidadRandom(20, 10);
    var tragetY = 10;

    bala3.position.x = startX - tragetX;
    bala3.position.y = startY - tragetY;
}

function colisionH() {
    pausa();
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render() {
}
