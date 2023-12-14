var w = 800;
var h = 400;
var jugador;
var fondo;
var bala, balaD = false, nave;
var bala2, bala2D = false, nave2;
var salto;
var movimiento;
var menu;
var velocidadBala;
var velocidadBala2;
var despBala;
var despBala2;
var estatusAvanza;
var estatusSuelo;
var nnNetwork, nnEntrenamiento, nnSalida, datosEntrenamiento = [];
var modoAuto = false,
  eCompleto = false;
var posicionOriginal = 50;
var avanza;
var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', {
  preload: preload,
  create: create,
  update: update,
  render: render
});

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
  bala = juego.add.sprite(w - 100, h, 'bala');
  bala2 = juego.add.sprite(50, 30, 'bala');
  jugador = juego.add.sprite(50, h, 'mono');
  nave2 = juego.add.sprite(10, 10, 'nave');

  juego.physics.enable(jugador);
  jugador.body.collideWorldBounds = true;
  var corre = jugador.animations.add('corre', [8, 9, 10, 11]);
  jugador.animations.play('corre', 10, true);

  juego.physics.enable(bala);
  bala.body.collideWorldBounds = true;

  juego.physics.enable(bala2);
  bala2.body.allowGravity = false;
  bala2.body.collideWorldBounds = true;

  juego.physics.enable(nave2);
  nave2.body.allowGravity = false;
  nave2.body.collideWorldBounds = true;

  pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
  pausaL.inputEnabled = true;
  pausaL.events.onInputUp.add(pausa, self);
  juego.input.onDown.add(mPausa, self);

  avanza = juego.input.keyboard.addKey(Phaser.Keyboard.D);
  salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  nnNetwork = new synaptic.Architect.Perceptron(4,7, 7, 2);
  nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}

function enRedNeural() {
  nnEntrenamiento.train(datosEntrenamiento, { rate: 0.0003, iterations: 10000, shuffle: true });
}

function datosDeEntrenamiento(param_entrada) {
  var acciones = [0, 0]
  console.log("Entrada", param_entrada[0] + " " + param_entrada[1] + " " + param_entrada[2] + " " + param_entrada[3]);
  nnSalida = nnNetwork.activate(param_entrada)
  console.log('TODO: ', nnSalida)
  acciones[0] = nnSalida[0] <= 0.5
  acciones[1] = nnSalida[1] <= 0.5
  console.log("Suelo: " + nnSalida[0] + " Quieto: " + nnSalida[1]);
  return acciones
}

function pausa() {
  juego.paused = true;
  resetVariables();
  menu = juego.add.sprite(w / 2, h / 2, 'menu');
  menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event) {
  if (juego.paused) {
    var menu_x1 = w / 2 - 270 / 2,
      menu_x2 = w / 2 + 270 / 2,
      menu_y1 = h / 2 - 180 / 2,
      menu_y2 = h / 2 + 180 / 2;
    var mouse_x = event.x,
      mouse_y = event.y;
    if (mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2) {
      if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90) {
        eCompleto = false;
        datosEntrenamiento = [];
        modoAuto = false;
      } else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
        if (!eCompleto) {
          console.log("Entrenamiento " + datosEntrenamiento.length + " valores");
          enRedNeural();
          eCompleto = true;
        }
        modoAuto = true;
      }
      menu.destroy();
      juego.paused = false;
      jugador.body.velocity.x = 0;
      jugador.body.velocity.y = 0;
      jugador.position.x = posicionOriginal;
    }
  }
}

function resetVariables() {
  bala.body.velocity.x = 0;
  bala.position.x = w - 100;
  bala2.body.velocity.y = 0;
  bala2.position.y = h - 800;
  balaD = false;
  bala2D = false;
  juego.time.events.removeAll();
  jugador.body.velocity.x = 0;
  jugador.body.velocity.y = 0;
  jugador.position.x = posicionOriginal;
}

function resetBala() {
  bala.body.velocity.x = 0;
  bala.position.x = w - 100;
  balaD = false;
}

function resetBala2() {
  bala2.body.velocity.y = 0;
  bala2.body.position.y = h - 800;
  bala2.position.x = posicionOriginal;
  bala2D = false;
}

function saltar() {
  jugador.body.velocity.y = -270;
}

//* AVANZAR ----------------------------------------------------------------------
function avanzar() {
  if (jugador.body.position.x <= posicionOriginal + 10) {
    jugador.body.velocity.x = 250;
    juego.time.events.add(Phaser.Timer.SECOND / 4, volver, this);
  }
}

function volver() {
  if (jugador.position.x > posicionOriginal) {
    jugador.body.velocity.x = -50;
    juego.time.events.add(Phaser.Timer.SECOND / 4, detenerRetorno, this);
  } else if (jugador.position.x <= posicionOriginal) {
    detenerRetorno()
  }
}

function detenerRetorno() {
  jugador.body.velocity.x = 0;
  if (jugador.position.x != posicionOriginal) {
    jugador.position.x = posicionOriginal;
  }
}
//* -----------------------------------------------------------------------------

function update() {
  fondo.tilePosition.x -= 1;
  juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
  juego.physics.arcade.collide(bala2, jugador, colisionH, null, this);
  estatusSuelo = 1;
  estatusAvanza = 1;
  if (!jugador.body.onFloor()) {
    estatusSuelo = 0;
  }
  if (jugador.position.x >= posicionOriginal + 2) {
    estatusAvanza = 0;
  }
  despBala = Math.floor(jugador.position.x - bala.position.x);
  despBala2 = Math.floor(jugador.position.y - bala2.position.y);
  if (modoAuto == false) {
    if (salto.isDown && jugador.body.onFloor()) {
      saltar();
    }
    if (avanza.isDown) {
      avanzar();
    }
  }
  if (modoAuto == true) {
    var datos = datosDeEntrenamiento([despBala, velocidadBala, despBala2, velocidadBala2])
    if (bala.position.x > 0 && jugador.body.onFloor()) {
      if (datos[0]) {
        saltar();
      }
    }
    if (bala2.position.y > 0) {
      if (datos[1]) {
        avanzar();
      }
    }
  }
  if (balaD == false) {
    disparo();
  }
  if (bala2D == false) {
    disparo();
  }
  if (bala.position.x <= 0) {
    resetBala();
  }
  if (bala2.position.y >= 383) {
    resetBala2();
  }
  if (modoAuto == false) {
    datosEntrenamiento.push({
      'input': [despBala, velocidadBala, despBala2, velocidadBala2],
      'output': [estatusSuelo, estatusAvanza]
    });
    console.log(despBala + " " + velocidadBala + " " + despBala2 + " " + velocidadBala2 + " " + estatusSuelo + " " + estatusAvanza);
  }
}

function disparo() {
  velocidadBala = -1 * velocidadRandom(280, 400);
  velocidadBala2 = 1 * velocidadRandom(50, 50);
  bala.body.velocity.y = 0;
  bala.body.velocity.x = velocidadBala;
  balaD = true;
  bala2.body.velocity.x = 0;
  bala2.body.velocity.y = velocidadBala2;
  bala2D = true;
}

function colisionH() {
  pausa();
}

function velocidadRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render() {}
