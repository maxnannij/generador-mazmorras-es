/**
 * Tablas de contenido en español para el generador de mazmorras.
 * Inspirado en el estilo de salida de donjon.bin.sh
 */

const Contenido = {
  // Nombres de mazmorras
  nombres: {
    prefijos: [
      "Las Cámaras de", "Las Ruinas de", "El Laberinto de", "Las Catacumbas de",
      "El Santuario de", "Las Profundidades de", "El Templo de", "Las Galerías de",
      "El Cubil de", "Las Mazmorras de", "El Panteón de", "Las Bóvedas de"
    ],
    sujetos: [
      "la Condesa Vampira", "el Rey Esqueleto", "la Sacerdotisa Olvidada",
      "el Dragón Dormido", "los Antiguos", "la Sombra Eterna", "el Culto Negro",
      "la Bruja de la Niebla", "el Señor de las Ratas", "la Reina Araña",
      "el Liche Caído", "los Hermanos del Abismo", "la Dama de Hierro",
      "el Oráculo Ciego", "la Bestia del Abismo"
    ]
  },

  // Características generales
  paredes: [
    { nombre: "Piedra natural", climb: 15 },
    { nombre: "Piedra tallada", climb: 20 },
    { nombre: "Ladrillo", climb: 25 },
    { nombre: "Mampostería antigua", climb: 18 },
    { nombre: "Hielo", climb: 22 },
    { nombre: "Raíces y tierra", climb: 12 }
  ],

  suelos: [
    { nombre: "Losas irregulares", balance: 10 },
    { nombre: "Piedra lisa", balance: 0 },
    { nombre: "Tierra apisonada", balance: 5 },
    { nombre: "Baldosas rotas", balance: 12 },
    { nombre: "Huesos y escombros", balance: 15 },
    { nombre: "Musgo resbaladizo", balance: 18 }
  ],

  temperaturas: ["Fría", "Fresca", "Templada", "Cálida", "Calurosa", "Sofocante"],
  iluminaciones: [
    "Oscuridad total (las criaturas individuales pueden llevar luces)",
    "Penumbra",
    "Iluminación tenue de hongos bioluminiscentes",
    "Antorchas antiguas que aún arden",
    "Luz mágica tenue y parpadeante"
  ],

  // Características de pasillos
  featuresPasillo: [
    "Numerosos pilares alinean el pasillo",
    "Un estrecho pozo desciende del pasillo al siguiente nivel de la mazmorra",
    "Parte del techo se ha derrumbado en el pasillo",
    "El suelo está cubierto de un limo resbaladizo",
    "Hay nichos en las paredes con calaveras",
    "El pasillo se estrecha de forma antinatural",
    "Marcas de garras profundas en las paredes",
    "Un río subterráneo cruza el pasillo",
    "Estatuas rotas yacen a lo largo del camino",
    "El eco de gotas de agua resuena constantemente"
  ],

  // Trampas
  trampas: [
    {
      nombre: "Trampa de Roca Rodante",
      cr: 1,
      tipo: "mecánica",
      trigger: "disparador de ubicación",
      reset: "reinicio manual",
      efecto: "Atq +10 cuerpo a cuerpo (2d6, roca)",
      search: 20,
      disable: 22
    },
    {
      nombre: "Trampa de Cuchilla de Pared",
      cr: 1,
      tipo: "mecánica",
      trigger: "disparador de contacto",
      reset: "reinicio automático",
      efecto: "Atq +10 cuerpo a cuerpo (2d4/x4 guadaña); interruptor oculto de bypass (Buscar CD 25)",
      search: 22,
      disable: 22
    },
    {
      nombre: "Trampa de Péndulo del Techo",
      cr: 3,
      tipo: "mecánica",
      trigger: "disparador temporizado",
      reset: "reinicio automático",
      efecto: "Atq +15 cuerpo a cuerpo (1d12+8/x3, gran hacha)",
      search: 15,
      disable: 27
    },
    {
      nombre: "Trampa de Hoja Segadora",
      cr: 1,
      tipo: "mecánica",
      trigger: "disparador de ubicación",
      reset: "reinicio automático",
      efecto: "Atq +8 cuerpo a cuerpo (1d8/x3)",
      search: 21,
      disable: 20
    },
    {
      nombre: "Trampa de Flecha Ácida",
      cr: 3,
      tipo: "dispositivo mágico",
      trigger: "disparador de proximidad (alarma)",
      reset: "reinicio automático",
      efecto: "Atq +2 toque a distancia; efecto de conjuro (Flecha Ácida, mago nivel 3, 2d4 ácido/ronda durante 2 rondas)",
      search: 27,
      disable: 27
    },
    {
      nombre: "Trampa de Manos Ardientes",
      cr: 2,
      tipo: "dispositivo mágico",
      trigger: "disparador de proximidad (alarma)",
      reset: "reinicio automático",
      efecto: "efecto de conjuro (Manos Ardientes, mago nivel 1, 1d4 fuego, salvación Reflejos CD 11 mitad de daño)",
      search: 26,
      disable: 26
    },
    {
      nombre: "Trampa de Toque de Necrófago",
      cr: 3,
      tipo: "dispositivo mágico",
      trigger: "disparador de contacto",
      reset: "reinicio automático",
      efecto: "efecto de conjuro (Toque de Necrófago, mago nivel 3, salvación Fortaleza CD 13 niega)",
      search: 27,
      disable: 27
    },
    {
      nombre: "Trampa de Foso",
      cr: 1,
      tipo: "mecánica",
      trigger: "disparador de ubicación",
      reset: "manual",
      efecto: "foso de 6 m de profundidad (2d6 daño por caída); Reflejos CD 20 evita; múltiples objetivos (área de 3 m cuadrados)",
      search: 20,
      disable: 20
    }
  ],

  // Características de habitación
  featuresHabitacion: [
    "Esta habitación podría haber sido una cámara del tesoro. Unas pocas estatuas guardianas aún permanecen en nichos tallados en las paredes, y el suelo ha sido destrozado por ladrones buscando espacios secretos.",
    "Esqueletos cuelgan de cadenas y grilletes en las paredes este y oeste, y una llave doblada yace en la esquina suroeste de la habitación.",
    "Esta habitación podría haber sido una galería. Unas pocas estatuas aún permanecen en nichos tallados en las paredes, cada rostro capturado en una expresión de miedo y horror.",
    "Un conducto cae en esta habitación desde arriba, y alguien ha garabateado un dibujo tosco de una súcubo en la pared sur.",
    "Alguien ha garabateado «Mátalos con hielo» en la pared norte, y numerosas calaveras monstruosas yacen en nichos en la pared norte.",
    "Esta habitación podría haber sido una forja hasta hace poco. Las ruinas de un hogar de piedra yacen en el centro de la habitación, marcadas con el símbolo baleful de una deidad de la guerra.",
    "Esta habitación podría haber sido un salón de reuniones hace mucho tiempo. Una larga mesa de hierro toscamente forjado aún domina el centro de la habitación, bajo cientos de ojos tallados en el techo abovedado.",
    "Un gran horno y un cajón de carbón se encuentran en la esquina noroeste de la habitación, y un guantelete oxidado yace en el lado norte de la habitación.",
    "El suelo está cubierto de un mosaico antiguo que representa una batalla entre dioses y monstruos. Algunas losas están rotas.",
    "Hay un altar de piedra negra en el centro, manchado de sangre antigua. El aire es pesado y frío.",
    "Estanterías derrumbadas llenan la habitación. Libros podridos y pergaminos ilegibles yacen esparcidos por el suelo.",
    "Una fuente seca con forma de gárgola ocupa el centro. El agua que una vez fluyó de su boca ahora es solo polvo."
  ],

  // Trucos / efectos mágicos
  trucos: [
    "Un estanque encantado en el lado norte de la habitación desintegra cualquier objeto metálico mundano sumergido en él.",
    "Una vela mágica en la esquina suroeste de la habitación hace que todas las demás fuentes de luz se apaguen mientras está encendida.",
    "Una estatua mágica en el centro de la habitación responde a las preguntas con insultos.",
    "Una estatua mágica en el centro de la habitación responde a las preguntas con mentiras y falsedades.",
    "Un espejo en la pared este muestra el reflejo de quien lo mira... pero de hace 10 años.",
    "Cualquier moneda de oro depositada en el cuenco de piedra de la esquina se convierte en plomo al cabo de una hora.",
    "El eco de esta habitación repite las palabras dichas... pero siempre distorsionadas y amenazantes.",
    "Una runa brillante en el suelo cura 1d8 puntos de vida a quien pise sobre ella (solo una vez por criatura)."
  ],

  // Monstruos (nivel bajo)
  monstruos: [
    {
      nombre: "Guerrero Drow de nivel 1",
      tipo: "elfo",
      cr: 1,
      cantidad: "1",
      comportamiento: "reunidos alrededor de un santuario maligno",
      stats: "CR 1; humanoide mediano (elfo); HD 1d8+1; pv 5; Inic +1; Vel 30 pies; CA 16; Atq espada corta +3 (1d6+1) o ballesta de mano +3 (1d4); AL CE"
    },
    {
      nombre: "Manto Oscuro",
      tipo: "aberación",
      cr: 1,
      cantidad: "1",
      comportamiento: "patrullando su territorio",
      stats: "CR 1; aberración pequeña; HD 1d8+1; pv 5; Inic +2; Vel 20 pies, volar 30 pies; CA 14; Atq azote +4 (1d4+1); AL N"
    },
    {
      nombre: "Troglodita",
      tipo: "humanoide reptiliano",
      cr: 1,
      cantidad: "1",
      comportamiento: "consumido por la enfermedad y la locura",
      stats: "CR 1; humanoide mediano (reptiliano); HD 2d8+4; pv 13; Inic -1; Vel 30 pies; CA 15; Atq garrote +1 (1d6) o garra +1 (1d4); SA Hedor; AL CE"
    },
    {
      nombre: "Guerrero Duergar de nivel 1",
      tipo: "enano",
      cr: 1,
      cantidad: "1",
      comportamiento: "ensangrentado y huyendo de un enemigo más poderoso",
      stats: "CR 1; humanoide mediano (enano); HD 1d8+2; pv 6; Inic +0; Vel 20 pies; CA 16; Atq martillo de guerra +3 (1d8+1); AL LE"
    },
    {
      nombre: "Zombi Oso Bugbear",
      tipo: "muerto viviente",
      cr: 2,
      cantidad: "1",
      comportamiento: "deambulando sin sentido",
      stats: "CR 2; muerto viviente mediano; HD 3d12+3; pv 22; Inic +0; Vel 30 pies; CA 12; Atq manotazo +4 (1d8+2); AL NE"
    },
    {
      nombre: "Araña Monstruosa Mediana",
      tipo: "sabandija",
      cr: 1,
      cantidad: "1",
      comportamiento: "patrullando su territorio",
      stats: "CR 1; sabandija mediana; HD 2d8+2; pv 11; Inic +3; Vel 30 pies, trepar 20 pies; CA 14; Atq mordisco +4 (1d6 + veneno); AL N"
    },
    {
      nombre: "Chillador",
      tipo: "hongo",
      cr: 1,
      cantidad: "1",
      comportamiento: "creciendo en la oscuridad",
      stats: "CR 1; planta mediana; HD 2d8+2; pv 11; Inic -5; Vel 0 pies; CA 8; SA Chillido; AL N"
    },
    {
      nombre: "Rata Dire",
      tipo: "animal",
      cr: "1/3",
      cantidad: "1d4+1",
      comportamiento: "buscando comida",
      stats: "CR 1/3; animal pequeño; HD 1d8+1; pv 5; Inic +3; Vel 40 pies, trepar 20 pies; CA 15; Atq mordisco +4 (1d4 + enfermedad); AL N"
    },
    {
      nombre: "Enjambre de Arañas",
      tipo: "enjambre",
      cr: 1,
      cantidad: "1",
      comportamiento: "defendiéndose de intrusos",
      stats: "CR 1; enjambre de sabandijas diminutas; HD 2d8; pv 9; Inic +3; Vel 20 pies, trepar 20 pies; CA 17; Atq enjambre (1d6 + veneno); AL N"
    },
    {
      nombre: "Ciempiés Monstruoso Diminuto",
      tipo: "sabandija",
      cr: "1/8",
      cantidad: "2d6+3",
      comportamiento: "infestando la zona",
      stats: "CR 1/8; sabandija diminuta; HD 1/4 d8; pv 1; Inic +2; Vel 20 pies, trepar 20 pies; CA 14; Atq mordisco +4 (1d3-5 + veneno); AL N"
    },
    {
      nombre: "Kobold",
      tipo: "humanoide",
      cr: "1/4",
      cantidad: "2d4",
      comportamiento: "montando una emboscada",
      stats: "CR 1/4; humanoide pequeño (reptiliano); HD 1d8; pv 4; Inic +1; Vel 30 pies; CA 12; Atq lanza +1 (1d4-1) o honda +3 (1d3); AL LE"
    },
    {
      nombre: "Goblin",
      tipo: "humanoide",
      cr: "1/4",
      cantidad: "2d4",
      comportamiento: "saqueando la habitación",
      stats: "CR 1/4; humanoide pequeño; HD 1d8; pv 5; Inic +1; Vel 30 pies; CA 15; Atq cimitarra +2 (1d6) o arco corto +3 (1d4); AL NE"
    }
  ],

  // Generadores
  generarNombre() {
    const p = this.nombres.prefijos[Math.floor(Math.random() * this.nombres.prefijos.length)];
    const s = this.nombres.sujetos[Math.floor(Math.random() * this.nombres.sujetos.length)];
    return `${p} ${s}`;
  },

  elegir(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  generarFeaturePasillo() {
    return this.elegir(this.featuresPasillo);
  },

  generarTrampa() {
    return this.elegir(this.trampas);
  },

  generarFeatureHabitacion() {
    return this.elegir(this.featuresHabitacion);
  },

  generarTruco() {
    return this.elegir(this.trucos);
  },

  generarMonstruo(nivel = 1) {
    const posibles = this.monstruos.filter(m => {
      const cr = typeof m.cr === "string" ? parseFloat(m.cr) : m.cr;
      return cr <= nivel + 1 && cr >= Math.max(0.1, nivel - 1);
    });
    return posibles.length ? this.elegir(posibles) : this.elegir(this.monstruos);
  },

  generarTesoro(nivel = 1) {
    const monedas = Math.floor(Math.random() * 50 * nivel) + 10;
    const tipos = ["po", "pp", "pc"];
    const tipo = this.elegir(tipos);
    const gemas = Math.random() < 0.3 ? ` + ${this.elegir(["Amatista", "Cuarzo", "Ágata", "Turquesa", "Ónix"])} (${Math.floor(Math.random()*100)+20} po)` : "";
    return `${monedas} ${tipo}${gemas}`;
  },

  describirPuerta(tipo, estado = "normal") {
    const base = {
      arco: "Arco",
      simple: "Puerta de madera simple",
      fuerte: "Puerta de madera reforzada",
      buena: "Puerta de madera de buena calidad",
      piedra: "Puerta de piedra",
      hierro: "Puerta de hierro",
      porton: "Rastrillo de madera",
      secreta: "Puerta secreta"
    }[tipo] || "Puerta";

    let desc = base;
    if (estado === "cerradaConLlave") desc += " (Abrir Cerraduras CD 25, romper CD 25; dureza 5, 20 pg)";
    else if (estado === "atrancada") desc += " (romper CD 13; dureza 5, 10 pg)";
    else if (estado === "porton") desc += " (levantar CD 25, romper CD 28; dureza 5, 30 pg)";
    else if (estado === "hierro") desc += " (Abrir Cerraduras CD 30, romper CD 28; dureza 10, 60 pg)";
    else if (estado === "piedra") desc += " (romper CD 28; dureza 8, 60 pg)";

    return desc;
  }
};

// Exportar para uso en módulos o global
if (typeof window !== "undefined") {
  window.Contenido = Contenido;
}
