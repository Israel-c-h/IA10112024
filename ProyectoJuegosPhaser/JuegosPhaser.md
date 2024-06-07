# <center> Juegos Phaser </center>

## Juego de las 3 balas

En este proyecto lo que se tenía que hacer era a un juego de Phaser que se trata de esquivar una bala saltando, agregar dos balas más una que cayera por encima del jugador por lo cual se tiene que agregar la función de correr para poder esquivarla, para la tercera bala tenía que caer desde la esquina superior derecha hacia la inferior izquierda, por ultimo teníamos que configurar la el modo de aprendizaje automatico que ya incluye el programa de Phaser para que sea capaz de tomar decisiones y poder esquivar las 3 balas, yo fui implementando poco a poco lo que senecitaba para el resultado final, primero agregue la segunda bala y la función de correr, luego la tercer bala y por ultimo configure el modo de aprendizaje.

### Segunda bala y función correr
Agregar la segunda bala junto con su nave no es algo complicado, es practicamente copiar y pegar en la función __create()__ la forma en que se agrega la bala y nave 1
~~~
    nave2 = juego.add.sprite(20, 20, 'nave');
    bala2 = juego.add.sprite(50, 80, 'bala');
~~~

y agregar fisicas a la bala.

Para lograr que el jugador pudiera moverse para adelante en la función __update()__ coloque una condicional que verificara cuando se presione la tecla escogida para realizar el movimiento, en este caso la letra C
~~~
if (correr.isDown) {
            corriendo();
        }
~~~
una vez se presione la tecla activa la función __corriendo()__ la cúal aumenta la posición del jugar en 4 usando una variable llamada paso, en esta función de igual forma se agrega una condicional para que el jugador tenga un tope hasta donde puede correr que en este caso escogí 100.
~~~
function corriendo(){
    if(jugador.position.x < 100){
        jugador.position.x += paso;
    }
}
~~~
También en __update()__ en la condición antes mencionada se agrego una segunda condición anidada a la ya mencionada, la que se encarga de verificar cuando no se este presionando la tecla C y el jugador se haya movido de la posición inicial el juagdor se regrese a la misma de forma automática
~~~
else if(!correr.isDown && jugador.position.x >50){
            regresar();
        }     
~~~ 
la cual activa la función __regresar()__ que realiza lo contrario a la función __corriendo()__, le resta la variable paso a la posición del jugador, en esta ocasión se utlizan dos condiciones para verificar que tampoco se vaya más atras de las posicion inicial en este caso 50, siendo que si la posición es menor de 50 restablece la posición del juagdor a 50
~~~
function regresar(){
    if(jugador.position.x > 51){
        jugador.position.x -= (paso / 2);
    }
    else if(jugador.position.x < 49){
        jugador.position.x = 50;
    }
}
~~~

al igual que la bala 1 aquí tambien se agregaron sus respectivas variables y su función de disparo pero en esta ocasión modificando la velocidad en y
~~~
function disparo2() {
    velocidadBala2 = velocidadRandom(50, 100);
    bala2.body.velocity.y = velocidadBala2;
    bala2.body.velocity.x = 0;
    bala2D = true;
}
~~~

### Tercera bala

Para la tercera bala es practicamente lo mismo que la segunda se agregar los sprites de la nave y la bala colocandola es la esquina superior derecha del escenario de juego 
~~~
    nave3 = juego.add.sprite(w - 100, 20, 'nave');
    bala3 = juego.add.sprite(w - 55, 80, 'bala');
~~~

de igual forma se agregan variables y función de disparo pero en está ocasión modificando ambas velocidades y está vez de una difernte forma
~~~
unction disparo3() {
    var startX = bala3.position.x;
    var startY = bala3.position.y;



    var tragetX = velocidadRandom(20, 10);
    var tragetY = 10;

    bala3.position.x = startX - tragetX;
    bala3.position.y = startY - tragetY;
}
~~~
esta vez usamos la variable starX para obtener la posición de la bala y la variable target para obtener la posición a donde se debe dirigir que en este caso es un número aleatorio entre 20 y 10 para que pueda variar el disparo y no sea siempre la misma dirección, este proceso se hace en ambas variables.

### Configurar modo de aprendizaje

Para esto lo que se hizo fue agregar más datos en el Array de __DatosEntrenamiento__ los cuales son:
despBala2, velocidadBala2, despBala3, bala3.body.velocity.x
- despBala2 
- velocidadBala2
- desBala2
- bala3.body.velocity.x
~~~
datosEntrenamiento.push({
    'input': [despBala, velocidadBala, despBala2, velocidadBala2,   despBala3, bala3.body.velocity.x],
    'output': [estatusAire, estatusCorrer]
});
~~~
las variables "desp" son la distancia entre la bala y el jugador basandonos, en este caso en la bala 1 y 3 nos basamos en el eje x, para la bala 2 nos basamos en el eje y
~~~
despBala = Math.floor(jugador.position.x - bala.position.x);
despBala2 = Math.floor(jugador.position.y - bala2.position.y);
despBala3 = Math.floor(jugador.position.x - bala3.position.x);
~~~

Al momento de hacer esto, de agregar más datos al Array de entrenamiento tenemos que modificar la estructura de la red neuronal que usaremos para jugar de forma automatica ya que incrementaron los datos de entrada como los de salida ya que ahora no solo tiene que decidir cuando saltar si no también cuando correr, en este caso la estructura quedo de la siguiente forma:
~~~
nnNetwork = new synaptic.Architect.Perceptron(6, 8, 8, 2); 
~~~
Teniendo en la capa de entrada 6 datos, con dos capas ocultas de 8 neuronas y una capa de salida de 2.
Al momento de jugar en modo automatico se hace una toma de decisiones basandonos en los datos de entrenamiento, para lo cuál se crea una variable para poner llamar el metodo __datosDeEntrenamiento()__ que retorna un array de dos variables booleanas
~~~
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
~~~
la cual nos ayuda a decidir si el jugador debe saltar o correr, en este caso se utilizan dos if 
~~~
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
~~~

de igual forma se agrega la función de regresar para cuando se decida que ya no debe de correr.

[Arbir](final.js) archivo del código del juego

## Juego de la bala que rebota

Para este juego se necesitaba hacer que el jugador se moviera en las 4 direcciones y que la bala fuera rebotando continuamente en todo el escenario del juego y que al momento de chocar con el jugador se acabará el juego, para lograr todo estó solo se necesitaba implementar dos recursos de phaser ya estabecidos en su pagina de ejemplos, lo que yo decidí hacer fue basarme en el juego de las 3 balas y solo ir implementando las partes del código de los dos ejemplos, para lo cuál coloque el jugador en el centro del escenario y cree la variable __cursors__ que activa las flechas del teclado y se puedan usar durante el juego
~~~
 jugador = juego.add.sprite(w/2, h /2, 'mono');
 cursors = juego.input.keyboard.createCursorKeys();
~~~
agregue una sola bala poniendo algunas cosas extra.
~~~
bola.body.bounce.set(1);
bola.body.velocity.set(150);
~~~

### Modo manual

Para el modo manual de juego solo se hace uso de 4 condicionales las cuales ayudan a comprobar si alguna de las flechas esta presionada y logre hacer el movimiento hacía su respectivo lado
~~~
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
~~~
Para la inserción de los datos al array de entrenamiento hacemos uso de las variables disX y disY
~~~
var disX = bola.x - jugador.position.x;
var disY = bola.y - jugador.position.y;
~~~
para ayudarnos a calcular la distancia de la bala y el jugador tomandolo como si fuera un triangulo rectangulo y fueramos a sacar su hipotenusa
~~~
despBola = Math.sqrt((disX * disX) + (disY * disY));
~~~

y los datos que se agregan al array son la despBola, jugador.position.x y jugador.position.y, solo que en esta ocasión no son solo dos salidas las que se tienen, ahora son 4, debido a que se necesita saber si en la forma automática se necesita mover a la derecha, la izquiera, para arriba o para abajo
~~~
datosEntrenamiento.push({
    'input': [despBola, jugador.position.x, jugador.position.y],
    'output': [movArriba, movAbajo, movIzquierda, movDerecha]
});
~~~

### Modo automático
De igual forma que en el juego de las 3 balas se hace uso de una variable que usara la función __datosEnEntrenamiento()__ y de igual forma es la que ayudará a tomar las decisiones 
~~~
var disX = bola.x - jugador.x;
var disY = bola.y - jugador.y;
despBola = Math.sqrt((disX * disX) + (disY * disY));

var acciones = datosDeEntrenamiento([despBola, jugador.position.x, jugador.position.y]);
~~~

solo que ahora en la función __datosEnEntrenamiento()__ se hace uso de 4 condiciones las cuales representan cada una de las acciones posibles a hacer
~~~
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
~~~
retornara el array con las 4 tomas de decisones y se utiliza de la misma forma que en el juego anterior, haciendo uso de condiciones
~~~
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
~~~

En el caso de este juego igual se hicieron cambios en la estructura de la red neuronal debido a que ahora son 3 datos de entrada y 4 datos de salida, quedando de la siguiente forma:
~~~
nnNetwork = new synaptic.Architect.Perceptron(3, 16, 4);
~~~

se decidió hacer uso de una capa oculta de 16 neuronas para esta red neuronal.

[Arbir](juego.js) archivo del código del juego