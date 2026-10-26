/**
 * Aplicación principal del Generador de Mazmorras en Español
 */

let currentDungeon = null;
let currentName = "";
let currentLevel = 1;

function $(id) { return document.getElementById(id); }

function generarMazmorra() {
  const sizeMap = {
    "Fine": 15, "Diminutive": 19, "Tiny": 25, "Small": 31,
    "Medium": 39, "Large": 49, "Huge": 59, "Gargantuan": 69, "Colossal": 79
  };

  const sizeKey = $("dungeon-size").value;
  const n = sizeMap[sizeKey] || 39;
  const seed = $("seed").value ? parseInt($("seed").value, 10) : Date.now();
  $("seed").value = seed;

  currentLevel = parseInt($("dungeon-level").value, 10) || 1;
  currentName = $("dungeon-name").value.trim() || Contenido.generarNombre();
  $("dungeon-name").value = currentName;

  const opts = {
    seed,
    nRows: n,
    nCols: n,
    dungeonLayout: $("dungeon-layout").value,
    roomLayout: $("room-layout").value === "Dense" ? "Dense" : "Scattered",
    corridorLayout: $("corridor-layout").value,
    roomMin: 3,
    roomMax: $("room-size").value === "Large" ? 11 : ($("room-size").value === "Huge" ? 13 : 9),
    addStairs: $("stairs").value === "Yes" ? 2 : ($("stairs").value === "Many" ? 4 : 0),
    cellSize: 10
  };

  $("status").textContent = "Generando mazmorra...";
  $("output").style.display = "none";

  setTimeout(() => {
    try {
      currentDungeon = new DungeonGenerator(opts).create();
      const canvas = $("map-canvas");
      currentDungeon.draw(canvas);

      const rooms = currentDungeon.getRoomData();
      rooms.forEach(room => {
        room.content = generarContenidoHabitacion(room, currentLevel);
      });

      renderResultado(rooms);
      $("status").textContent = `Mazmorra generada: ${rooms.length} habitaciones · Seed: ${seed}`;
      $("output").style.display = "block";
    } catch (e) {
      console.error(e);
      $("status").textContent = "Error al generar: " + e.message;
    }
  }, 50);
}

function generarContenidoHabitacion(room, nivel) {
  const content = {
    features: [],
    monstruos: [],
    trampas: [],
    trucos: [],
    tesoro: null,
    puertas: []
  };

  if (Math.random() < 0.6) {
    content.features.push(Contenido.generarFeatureHabitacion());
  }

  if (Math.random() < 0.5) {
    const m = Contenido.generarMonstruo(nivel);
    content.monstruos.push(m);
  }

  if (Math.random() < 0.25) {
    content.trampas.push(Contenido.generarTrampa());
  }

  if (Math.random() < 0.15) {
    content.trucos.push(Contenido.generarTruco());
  }

  if (Math.random() < 0.3) {
    content.tesoro = Contenido.generarTesoro(nivel);
  }

  room.doors.forEach(d => {
    const tipos = ["simple", "fuerte", "buena", "piedra", "hierro", "porton"];
    const estados = ["cerrada", "atrancada", "cerradaConLlave", "normal"];
    content.puertas.push({
      dir: d.dir,
      tipo: Contenido.elegir(tipos),
      estado: Contenido.elegir(estados)
    });
  });

  return content;
}

function renderResultado(rooms) {
  const gen = currentDungeon;
  const paredes = Contenido.elegir(Contenido.paredes);
  const suelo = Contenido.elegir(Contenido.suelos);
  const temp = Contenido.elegir(Contenido.temperaturas);
  const ilum = Contenido.elegir(Contenido.iluminaciones);

  $("result-title").textContent = currentName;
  $("result-level").textContent = `Nivel ${currentLevel}`;
  $("result-size").textContent = `Personalizado (${gen.getSize().cols} x ${gen.getSize().rows})`;
  $("result-walls").textContent = `${paredes.nombre} (Trepar CD ${paredes.climb})`;
  $("result-floor").textContent = `${suelo.nombre}${suelo.balance ? ` (Equilibrio CD ${suelo.balance} para cargar o correr)` : ""}`;
  $("result-temp").textContent = temp;
  $("result-light").textContent = ilum;

  const corrFeatures = [];
  for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
    corrFeatures.push(Contenido.generarFeaturePasillo());
  }
  if (Math.random() < 0.5) {
    const t = Contenido.generarTrampa();
    corrFeatures.push(`${t.nombre}: CR ${t.cr}; ${t.tipo}; ${t.trigger}; ${t.reset}; ${t.efecto}; Buscar CD ${t.search}; Desactivar Dispositivo CD ${t.disable}`);
  }
  $("corridor-features").innerHTML = corrFeatures.map((f, i) => {
    const letter = String.fromCharCode(97 + i);
    return `<div class="feature-item"><strong>${letter}</strong> ${f}</div>`;
  }).join("");

  const wandering = [];
  for (let i = 0; i < 6; i++) {
    const m = Contenido.generarMonstruo(currentLevel);
    wandering.push(`${m.cantidad} x ${m.nombre} (${m.tipo}); ${m.comportamiento}`);
  }
  $("wandering-monsters").innerHTML = wandering.map((w, i) =>
    `<div class="feature-item"><strong>${i + 1}</strong> ${w}</div>`
  ).join("");

  const roomsHtml = rooms.map(room => {
    const c = room.content;
    let html = `<div class="room-block" id="room-${room.id}">
      <h3>Habitación #${room.id}</h3>`;

    if (c.puertas && c.puertas.length) {
      html += `<div class="room-section"><strong>Entradas:</strong><ul>`;
      c.puertas.forEach(p => {
        const dirLabel = { north: "Norte", south: "Sur", east: "Este", west: "Oeste" }[p.dir] || p.dir;
        html += `<li><strong>${dirLabel}</strong>: ${Contenido.describirPuerta(p.tipo, p.estado)}</li>`;
      });
      html += `</ul></div>`;
    }

    if (c.features.length) {
      html += `<div class="room-section"><strong>Características de la habitación:</strong>
        <p>${c.features.join(" ")}</p></div>`;
    }

    if (c.monstruos.length) {
      html += `<div class="room-section"><strong>Monstruo:</strong>`;
      c.monstruos.forEach(m => {
        html += `<p>${m.cantidad} x ${m.nombre}</p>
          <pre class="stats">${m.stats}</pre>`;
      });
      html += `</div>`;
    }

    if (c.trampas.length) {
      html += `<div class="room-section"><strong>Trampa:</strong>`;
      c.trampas.forEach(t => {
        html += `<p>${t.nombre}: CR ${t.cr}; ${t.tipo}; ${t.trigger}; ${t.reset}; ${t.efecto}; Buscar CD ${t.search}; Desactivar Dispositivo CD ${t.disable}</p>`;
      });
      html += `</div>`;
    }

    if (c.trucos.length) {
      html += `<div class="room-section"><strong>Truco:</strong>
        <p>${c.trucos.join(" ")}</p></div>`;
    }

    if (c.tesoro) {
      html += `<div class="room-section"><strong>Tesoro:</strong> ${c.tesoro}</div>`;
    }

    if (!c.features.length && !c.monstruos.length && !c.trampas.length && !c.trucos.length && !c.tesoro) {
      html += `<div class="room-section"><em>Vacía</em></div>`;
    }

    html += `</div>`;
    return html;
  }).join("");

  $("rooms-container").innerHTML = roomsHtml;
}

function exportarPDF() {
  if (!currentDungeon) {
    alert("Primero genera una mazmorra.");
    return;
  }

  $("status").textContent = "Generando PDF...";

  const element = $("printable-area");

  if (typeof html2pdf !== "undefined") {
    const opt = {
      margin: 10,
      filename: `${currentName.replace(/[^a-z0-9]/gi, "_")}_nivel${currentLevel}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      $("status").textContent = "PDF exportado correctamente.";
    }).catch(err => {
      console.error(err);
      $("status").textContent = "Error al exportar PDF. Usa Imprimir del navegador.";
      window.print();
    });
  } else {
    window.print();
    $("status").textContent = "Usa el diálogo de impresión del navegador para guardar como PDF.";
  }
}

function randomizarNombre() {
  $("dungeon-name").value = Contenido.generarNombre();
}

function randomizarSeed() {
  $("seed").value = Math.floor(Math.random() * 1e9);
}

document.addEventListener("DOMContentLoaded", () => {
  $("btn-generate").addEventListener("click", generarMazmorra);
  $("btn-pdf").addEventListener("click", exportarPDF);
  $("btn-random-name").addEventListener("click", randomizarNombre);
  $("btn-random-seed").addEventListener("click", randomizarSeed);

  randomizarNombre();
  randomizarSeed();
});
