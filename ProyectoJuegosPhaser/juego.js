var w = 600;
var h = 400;
var jugador, cursors;
var fondo;

var bola, despBola;
var movArriba, movAbajo, movDerecha, movIzquierda;
var menu;

var nnNetwork, nnEntrenamiento, nnSalida, datosEntrenamiento = [];
var modoAuto = false, eCompleto = false;

var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

function preload() {
    juego.load.image('fondo', 'assets/game/fondo2.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png', 32, 48);
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}

function create() {
//  Juego
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.time.desiredFps = 30;
    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

//  Jugador
    jugador = juego.add.sprite(w/2, h /2, 'mono');
    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre', [8, 9, 10, 11]);
    jugador.animations.play('corre', 10, true);
    cursors = juego.input.keyboard.createCursorKeys();

//  Bola
    bola = juego.add.sprite(w-50, h-50, 'bala');
    juego.physics.enable(bola);
    bola.body.collideWorldBounds = true;
    bola.body.bounce.set(1);
    bola.body.velocity.set(150);

//  Entrenamiento
    nnNetwork = new synaptic.Architect.Perceptron(3, 16, 4);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}

function enRedNeural() {
    console.log("Entra a entrenamiento")
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
    var decision = [false, false, false, false];
    var arriba = Math.round( nnSalida[0] * 100);
    var abajo = Math.round( nnSalida[1] * 100);
    var izquierda = Math.round( nnSalida[2] * 100);
    var derecha = Math.round( nnSalida[3] * 100);

    if(arriba > 50){
        decision[0] = true;
    }
    if(abajo > 50){
        decision[1] = true;
    }
    if(izquierda > 50){
        decision[2] = true;
    }
    if(derecha > 50){
        decision[3] = true;
    }

    return decision;
}

function pausa() {
    juego.paused = true;
    menu = juego.add.sprite(w / 2, h / 2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
    
    resetVariables();
}

function resetVariables(){
    jugador.body.velocity.x = 0;
    jugador.body.velocity.y = 0;
    jugador.position.x = w/2;
    jugador.position.y = h/2;
    var coorX;
    var coorY;

    do {
        coorX = aleatorio(20, w - 50);
    } while (coorX >= 350 && coorX <= 450);
    do {
        coorY = aleatorio(20, w - 50);
    } while (coorY >= 150 && coorY <= 250);

    var velocidad = aleatorio(200, 500);
    var angulo = aleatorio(0, 360);

    bola.x = coorX;
    bola.y = coorY;
    bola.body.bounce.set(1);
    juego.physics.arcade.velocityFromAngle(angulo, velocidad, bola.body.velocity);
}

function aleatorio(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

function update() {
    fondo.tilePosition.x -= 1;
    juego.physics.arcade.collide(jugador, bola, colisionH, null, this);
    movAbajo = movArriba = movIzquierda = movDerecha = 0;

    if(!modoAuto){
        if (cursors.left.isDown){
            jugador.body.x -= 5;
            movIzquierda = 1;
        }
        else if (cursors.right.isDown){
            jugador.body.x += 5;
            movDerecha = 1;
        }
        if (cursors.up.isDown){
            jugador.body.y -= 5;
            movArriba = 1;
        }
        else if (cursors.down.isDown){
            jugador.body.y += 5;
            movAbajo = 1;
        }
        var disX = bola.x - jugador.position.x;
        var disY = bola.y - jugador.position.y;


        despBola = Math.sqrt((disX * disX) + (disY * disY));
        console.log(bola.body.velocity.x + "-" + bola.body.velocity.y)
        datosEntrenamiento.push({
            'input': [despBola, jugador.position.x, jugador.position.y],
            'output': [movArriba, movAbajo, movIzquierda, movDerecha]
        });
    }
    else if (modoAuto) {
        var disX = bola.x - jugador.x;
        var disY = bola.y - jugador.y;
        despBola = Math.sqrt((disX * disX) + (disY * disY));

        var acciones = datosDeEntrenamiento([despBola, jugador.position.x, jugador.position.y]);
        console.log(acciones);
        if (acciones[0]) { // Mover arriba
            jugador.body.y -= 5;
        }
        if (acciones[1]) { // Mover abajo
            jugador.body.y += 5;
        }
        if (acciones[2]) { // Mover izquierda
            jugador.body.x -= 5;
        }
        if (acciones[3]) { // Mover derecha
            jugador.body.x += 5;
        }
    }
    
}


function colisionH() {
    resetVariables();
    pausa();
}

function render() {
}
