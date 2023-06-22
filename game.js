//si se le cambia la sintaxis el codigo deja de servir en cualquier bloque 
//donde se haya echo tal cosa
kaboom({ //libreria que permite crear juegos con mayor facilidad
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
  }) //propiedades de la pantalla de inicio
  
  // constantes de movimiento
  const velocidad = 120
  const salto = 360
  const saltogrande = 550
  let salto_de_poder = salto
  const muerte = 400
  const velocidad_enemigo = 20
  
  let brinco = true
  //creacion de objetos imagen
loadSprite('mario', 'Mario/mario.png')
loadSprite('bloque', 'Mario/bloque.png')
loadSprite('sorpresa', 'Mario/sorpresa.png')
loadSprite('gomba', 'Mario/gomba.png')
loadSprite('moneda', 'Mario/moneda.png')
loadSprite('tubo', 'Mario/tubo.png')
loadSprite('vacio', 'Mario/vacio.png')
loadSprite('hongo', 'Mario/hongo.png')
loadSprite('tubo', 'Mario/tubo.png')
loadSprite('m1', 'Mario/m1.png')
loadSprite('m2', 'Mario/m2.png')
  
  loadSprite('piedraazul', 'Mario/piedraazul.png')
  loadSprite('bloqueazul', 'Mario/bloqueazul.png')
  loadSprite('vacioazul', 'Mario/vacioazul.png')
  loadSprite('gombaazul', 'Mario/gombaazul.png')
  loadSprite('sorpresa2', 'Mario/sorpresa2.png')
  
  scene("game", ({ level, score }) => { //
    layers(['bg', 'obj', 'ui'], 'obj')
  
    const mapas = [ //camva / diseño de nuestro mapa
      [
        '                                      ',
        '                                      ',
        '                                      ',
        '                                      ',
        '                                      ',
        '     %   =*=%=                        ',
        '                                      ',
        '                                      ',
        '                    ^   ^   (         ',
        '==============================   =====',
      ],
      [
        '£                                       £',
        '£                                       £',
        '£                                       £',
        '£                                       £',
        '£                                       £',
        '£        @@@@@@              x x        £',
        '£                          x x x        £',
        '£                        x x x x  x     £',
        '£               z   z  x x x x x  x   ( £',
        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
      ]
    ]
  
    const obstaculos = { //tamaño del mapa, con sus objetos, creacion de identificadores 
      width: 20,         // propiedades de la libreria kaboom
      height: 20,
      '=': [sprite('bloque'), solid()],
      '$': [sprite('moneda'), 'moneda'],
      '%': [sprite('sorpresa'), solid(), 'moneda-sorpresa'],
      '*': [sprite('sorpresa'), solid(), 'hongo-sorpresa'],
      '(': [sprite('tubo'), solid(), scale(0.5), 'tubo'],
      '^': [sprite('gomba'), solid(), 'morir'],
      '#': [sprite('hongo'), solid(), 'hongo', body()],
      '!': [sprite('piedraazul'), solid(), scale(0.5)],
      '£': [sprite('bloqueazul'), solid(), scale(0.5)],
      'z': [sprite('gombaazul'), solid(), scale(0.5), 'morir'],
      '@': [sprite('sorpresa2'), solid(), scale(0.5), 'moneda-sorpresa'],
      'x': [sprite('vacioazul'), solid(), scale(0.5),],
  
    }
  
    const nivel_juego = addLevel(mapas[level], obstaculos) //creacion de mapa
  
    const puntos_acumulados = add([ //marcador
      text(score),
      pos(30, 6),
      layer('ui'),
      {
        value: score,
      }
    ])
  
    add([text('Nivel: ' + parseInt(level + 1) ), pos(40, 6)]) //niveles
    
    function tamano() {//cambio de tamaño
      let tiempo = 0
      let grande = false
      return {
        update() {
          if (grande) {
            salto_de_poder = saltogrande
            tiempo -= dt()
            if (tiempo <= 0) {
              this.smallify()
            }
          }
        },
        isBig() {
          return grande
        },
        smallify() {
          this.escala = vec2(1)
          salto_de_poder = salto
          tiempo = 0
          grande = false
        },
        biggify(time) {
          this.escala = vec2(2)
          tiempo = time
          grande = true     
        }
      }
    }
  
    const jugador = add([ //creacion de nuestro objeto mario
      sprite('mario'), solid(),
      pos(30, 0),
      body(),
      tamano(),
      origin('bot')
    ])
  
    action('hongo', (m) => { //movimiento del hongo
      m.move(20, 0)
    })
  
    jugador.on("headbump", (obj) => { //romper los bloques y obtener monedas 
      if (obj.is('moneda-sorpresa')) {
        nivel_juego.spawn('$', obj.gridPos.sub(0, 1))
        destroy(obj)
        nivel_juego.spawn('}', obj.gridPos.sub(0,0))
      }
      if (obj.is('hongo-sorpresa')) {
        nivel_juego.spawn('#', obj.gridPos.sub(0, 1))
        destroy(obj)
        nivel_juego.spawn('}', obj.gridPos.sub(0,0))
      }
    })
  
    jugador.collides('hongo', (m) => { //si gomba te toca te mueres
      destroy(m)
      jugador.biggify(6)
    })
  
    jugador.collides('moneda', (c) => { //recoger monedas
      destroy(c)
      puntos_acumulados.value++
      puntos_acumulados.text = puntos_acumulados.value
    })
  
    action('morir', (d) => { //velocidad de gomba
      d.move(-velocidad_enemigo, 0)
    })
  
    jugador.collides('morir', (d) => { //golpe a los bloque, recoger monedas
      if (brinco) {
        destroy(d)
      } else {
        go('perdio', { score: puntos_acumulados.value})
      }
    })
  
    jugador.action(() => { //marcador en caso de morir
      camPos(jugador.pos)
      if (jugador.pos.y >= muerte) {
        go('perdio', { score: puntos_acumulados.value})
      }
    })
  
    jugador.collides('tubo', () => { //poder bajar por el tubo
      keyPress('down', () => {
        go('game', {
          level: (level + 1) % mapas.length,
          score: puntos_acumulados.value
        })
      })
    })
  
    keyDown('left', () => { //movimiento a la izquierda
      jugador.move(-velocidad, 0)
    })
  
    keyDown('right', () => {//movimiento a la derecha
      jugador.move(velocidad, 0)
    })
  
    jugador.action(() => { //permitir caerse/efecto de gravedad
      if(jugador.grounded()) {
        brinco = false
      }
    })
  
    keyPress('space', () => { //brinco con espacio
      if (jugador.grounded()) {
        brinco = true
        jugador.jump(salto_de_poder)
      }
    })
  })
  
  scene('perdio', ({ score }) => { //mostrar score a la mitad de la pantalla
    add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
  })
  
  start("game", { level: 0, score: 0}) //inicializacion del juego en 0