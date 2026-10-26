/**
 * Generador de layout de mazmorras
 * Basado en el algoritmo de drow (donjon.bin.sh) - CC BY-NC 3.0
 */
const NOTHING = 0x00000000;
const BLOCKED = 0x00000001;
const ROOM = 0x00000002;
const CORRIDOR = 0x00000004;
const PERIMETER = 0x00000010;
const ENTRANCE = 0x00000020;
const DOOR = 0x00020000;
const LOCKED = 0x00040000;
const TRAPPED = 0x00080000;
const SECRET = 0x00100000;
const BARS = 0x00200000;
const STAIR_DN = 0x00400000;
const STAIR_UP = 0x00800000;
const OPENSPACE = ROOM | CORRIDOR;

class DungeonGenerator {
  constructor(opts = {}) {
    this.opts = Object.assign({
      seed: Date.now(),
      nRows: 39,
      nCols: 39,
      dungeonLayout: "None",
      roomMin: 3,
      roomMax: 9,
      roomLayout: "Scattered",
      corridorLayout: "Bent",
      addStairs: 2,
      cellSize: 12
    }, opts);
    this.nRooms = 0;
    this.rooms = [];
    this.cell = [];
    this.rng = this._mulberry32(this.opts.seed);
  }

  _mulberry32(a) {
    return function () {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  rand(max = 1) { return this.rng() * max; }
  randInt(max) { return Math.floor(this.rand(max)); }

  create() {
    const n_i = Math.floor(this.opts.nRows / 2);
    const n_j = Math.floor(this.opts.nCols / 2);
    this.nRows = n_i * 2;
    this.nCols = n_j * 2;
    this.maxRow = this.nRows - 1;
    this.maxCol = this.nCols - 1;
    this.nRooms = 0;
    this.rooms = [];
    this.roomBase = Math.floor((this.opts.roomMin + 1) / 2);
    this.roomRadix = Math.floor((this.opts.roomMax - this.opts.roomMin) / 2) + 1;

    this._initCells();
    this._emplaceRooms();
    this._openRooms();
    this._corridors();
    this._finalizeDoors();
    if (this.opts.addStairs > 0) this._emplaceStairs();
    this._cleanDungeon();
    return this;
  }

  _initCells() {
    this.cell = [];
    for (let r = 0; r <= this.nRows; r++) {
      this.cell[r] = [];
      for (let c = 0; c <= this.nCols; c++) this.cell[r][c] = NOTHING;
    }
    if (this.opts.dungeonLayout === "Round") {
      const cr = Math.floor(this.nRows / 2), cc = Math.floor(this.nCols / 2);
      const rad = Math.min(cr, cc);
      for (let r = 0; r <= this.nRows; r++)
        for (let c = 0; c <= this.nCols; c++)
          if (Math.sqrt((r - cr) ** 2 + (c - cc) ** 2) > rad) this.cell[r][c] = BLOCKED;
    }
  }

  _emplaceRooms() {
    if (this.opts.roomLayout === "Dense") this._packRooms();
    else this._scatterRooms();
  }

  _allocRooms() {
    return Math.floor((this.nCols * this.nRows) / (this.opts.roomMax * this.opts.roomMax));
  }

  _scatterRooms() {
    const n = this._allocRooms();
    for (let i = 0; i < n; i++) this._emplaceRoom();
  }

  _packRooms() {
    const n_i = Math.floor(this.nRows / 2), n_j = Math.floor(this.nCols / 2);
    for (let i = 0; i < n_i; i++) {
      for (let j = 0; j < n_j; j++) {
        const r = i * 2 + 1, c = j * 2 + 1;
        if (this.cell[r][c] & ROOM) continue;
        if ((i === 0 || j === 0) && this.randInt(2)) continue;
        this._emplaceRoom({ i, j });
      }
    }
  }

  _setRoom(proto = {}) {
    const base = this.roomBase, radix = this.roomRadix;
    if (proto.height === undefined) {
      if (proto.i !== undefined) {
        let a = Math.floor(this.nRows / 2) - base - proto.i;
        if (a < 0) a = 0;
        proto.height = this.randInt(a < radix ? a : radix) + base;
      } else proto.height = this.randInt(radix) + base;
    }
    if (proto.width === undefined) {
      if (proto.j !== undefined) {
        let a = Math.floor(this.nCols / 2) - base - proto.j;
        if (a < 0) a = 0;
        proto.width = this.randInt(a < radix ? a : radix) + base;
      } else proto.width = this.randInt(radix) + base;
    }
    if (proto.i === undefined) proto.i = this.randInt(Math.floor(this.nRows / 2) - proto.height);
    if (proto.j === undefined) proto.j = this.randInt(Math.floor(this.nCols / 2) - proto.width);
    return proto;
  }

  _soundRoom(r1, c1, r2, c2) {
    const hit = {};
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (this.cell[r][c] & BLOCKED) { hit.blocked = true; return hit; }
        if (this.cell[r][c] & ROOM) hit[(this.cell[r][c] & 0xFFC0) >> 6] = true;
      }
    }
    return hit;
  }

  _emplaceRoom(proto) {
    if (this.nRooms >= 999) return;
    proto = this._setRoom(proto || {});
    const r1 = proto.i * 2 + 1, c1 = proto.j * 2 + 1;
    const r2 = (proto.i + proto.height) * 2 - 1, c2 = (proto.j + proto.width) * 2 - 1;
    if (r1 < 1 || r2 > this.maxRow || c1 < 1 || c2 > this.maxCol) return;
    const hit = this._soundRoom(r1, c1, r2, c2);
    if (hit.blocked || Object.keys(hit).filter(k => k !== "blocked").length > 0) return;
    this.nRooms++;
    const roomId = this.nRooms;
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        this.cell[r][c] |= ROOM | (roomId << 6);
    for (let r = r1 - 1; r <= r2 + 1; r++) {
      if (r >= 0 && r <= this.nRows) {
        if (c1 - 1 >= 0) this.cell[r][c1 - 1] |= PERIMETER;
        if (c2 + 1 <= this.nCols) this.cell[r][c2 + 1] |= PERIMETER;
      }
    }
    for (let c = c1 - 1; c <= c2 + 1; c++) {
      if (c >= 0 && c <= this.nCols) {
        if (r1 - 1 >= 0) this.cell[r1 - 1][c] |= PERIMETER;
        if (r2 + 1 <= this.nRows) this.cell[r2 + 1][c] |= PERIMETER;
      }
    }
    const height = (r2 - r1 + 1) * 10, width = (c2 - c1 + 1) * 10;
    this.rooms[roomId] = {
      id: roomId, row: r1, col: c1,
      north: r1, south: r2, west: c1, east: c2,
      height, width, area: height * width,
      doors: [], content: null
    };
  }

  _openRooms() {
    for (let id = 1; id <= this.nRooms; id++) {
      const room = this.rooms[id];
      if (!room) continue;
      const openings = Math.max(1, Math.floor(Math.sqrt(room.area) / 10));
      this._openRoom(room, openings);
    }
  }

  _openRoom(room, openings) {
    const candidates = [];
    for (let c = room.west; c <= room.east; c += 2) {
      if (room.north - 1 >= 0) candidates.push({ r: room.north - 1, c, dir: "north" });
      if (room.south + 1 <= this.nRows) candidates.push({ r: room.south + 1, c, dir: "south" });
    }
    for (let r = room.north; r <= room.south; r += 2) {
      if (room.west - 1 >= 0) candidates.push({ r, c: room.west - 1, dir: "west" });
      if (room.east + 1 <= this.nCols) candidates.push({ r, c: room.east + 1, dir: "east" });
    }
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = this.randInt(i + 1);
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    let opened = 0;
    for (const cand of candidates) {
      if (opened >= openings) break;
      if (this.cell[cand.r][cand.c] & (ROOM | CORRIDOR | BLOCKED)) continue;
      this.cell[cand.r][cand.c] |= ENTRANCE;
      room.doors.push({ r: cand.r, c: cand.c, dir: cand.dir });
      opened++;
    }
  }

  _corridors() {
    const cont = { Labyrinth: 0, Bent: 0.5, Straight: 0.9 }[this.opts.corridorLayout] ?? 0.5;
    for (let id = 1; id <= this.nRooms; id++) {
      const room = this.rooms[id];
      if (!room || !room.doors.length) continue;
      for (const door of room.doors) this._tunnelFrom(door.r, door.c, door.dir, cont);
    }
    this._connectRooms(cont);
  }

  _tunnelFrom(sr, sc, sdir, cont) {
    const D = { north: [-1, 0], south: [1, 0], west: [0, -1], east: [0, 1] };
    const opp = { north: "south", south: "north", west: "east", east: "west" };
    const names = ["north", "south", "west", "east"];
    let r = sr, c = sc, dir = sdir, steps = 0;
    const maxSteps = this.opts.corridorLayout === "Labyrinth" ? 45 : 25;
    if (!(this.cell[r][c] & ROOM)) this.cell[r][c] |= CORRIDOR;
    while (steps < maxSteps) {
      let cands = this.opts.corridorLayout === "Labyrinth"
        ? names.slice()
        : names.filter(d => d !== opp[dir]);
      const valid = [];
      for (const d of cands) {
        const [dr, dc] = D[d];
        const nr = r + dr, nc = c + dc;
        if (nr <= 0 || nr >= this.nRows || nc <= 0 || nc >= this.nCols) continue;
        if (this.cell[nr][nc] & BLOCKED) continue;
        valid.push(d);
      }
      if (!valid.length) break;
      let next = dir;
      if (valid.includes(dir) && this.rand() < cont) next = dir;
      else {
        for (let i = valid.length - 1; i > 0; i--) {
          const j = this.randInt(i + 1);
          [valid[i], valid[j]] = [valid[j], valid[i]];
        }
        next = valid[0];
      }
      const [dr, dc] = D[next];
      const nr = r + dr, nc = c + dc;
      if (nr <= 0 || nr >= this.nRows || nc <= 0 || nc >= this.nCols) break;
      if (this.cell[nr][nc] & BLOCKED) break;
      if (this.cell[nr][nc] & ROOM) break;
      this.cell[nr][nc] |= CORRIDOR;
      r = nr; c = nc; dir = next; steps++;
    }
  }

  _connectRooms(cont) {
    for (let i = 1; i <= this.nRooms; i++) {
      for (let j = i + 1; j <= this.nRooms; j++) {
        const a = this.rooms[i], b = this.rooms[j];
        if (!a || !b) continue;
        const dist = Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
        if (dist < 35 && this.rand() < 0.45) this._connectTwoRooms(a, b, cont);
      }
    }
  }

  _connectTwoRooms(a, b, cont) {
    const D = { north: [-1, 0], south: [1, 0], west: [0, -1], east: [0, 1] };
    let r = Math.floor((a.north + a.south) / 2);
    let c = Math.floor((a.west + a.east) / 2);
    const tr = Math.floor((b.north + b.south) / 2);
    const tc = Math.floor((b.west + b.east) / 2);
    let dir = Math.abs(tr - r) > Math.abs(tc - c)
      ? (tr > r ? "south" : "north")
      : (tc > c ? "east" : "west");
    let steps = 0;
    while (steps < 80 && (r !== tr || c !== tc)) {
      const preferV = Math.abs(tr - r) >= Math.abs(tc - c);
      const ideal = preferV
        ? (tr > r ? "south" : tr < r ? "north" : (tc > c ? "east" : "west"))
        : (tc > c ? "east" : tc < c ? "west" : (tr > r ? "south" : "north"));
      if (!(this.rand() < cont && this._canStep(r, c, dir))) {
        if (this._canStep(r, c, ideal)) dir = ideal;
        else {
          const opts = ["north", "south", "west", "east"].filter(d => this._canStep(r, c, d));
          if (!opts.length) break;
          opts.sort((d1, d2) => {
            const [a1, b1] = D[d1], [a2, b2] = D[d2];
            return (Math.abs(tr - (r + a1)) + Math.abs(tc - (c + b1))) -
                   (Math.abs(tr - (r + a2)) + Math.abs(tc - (c + b2)));
          });
          dir = opts[0];
        }
      }
      const [dr, dc] = D[dir];
      r += dr; c += dc;
      if (r < 0 || r > this.nRows || c < 0 || c > this.nCols) break;
      if (!(this.cell[r][c] & ROOM)) this.cell[r][c] |= CORRIDOR;
      steps++;
    }
  }

  _canStep(r, c, dir) {
    const D = { north: [-1, 0], south: [1, 0], west: [0, -1], east: [0, 1] };
    const [dr, dc] = D[dir] || [0, 0];
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr > this.nRows || nc < 0 || nc > this.nCols) return false;
    if (this.cell[nr][nc] & BLOCKED) return false;
    return true;
  }

  _finalizeDoors() {
    for (let r = 0; r <= this.nRows; r++) {
      for (let c = 0; c <= this.nCols; c++) {
        this.cell[r][c] &= ~(DOOR | LOCKED | TRAPPED | SECRET | BARS);
      }
    }
    for (let id = 1; id <= this.nRooms; id++) {
      if (this.rooms[id]) this.rooms[id].doors = [];
    }

    const dirs = [
      { name: "north", dr: -1, dc: 0 },
      { name: "south", dr: 1, dc: 0 },
      { name: "west", dr: 0, dc: -1 },
      { name: "east", dr: 0, dc: 1 }
    ];

    for (let id = 1; id <= this.nRooms; id++) {
      const room = this.rooms[id];
      if (!room) continue;

      const candidates = [];
      const perimeter = [];
      for (let c = room.west; c <= room.east; c++) {
        perimeter.push({ r: room.north - 1, c, dir: "north" });
        perimeter.push({ r: room.south + 1, c, dir: "south" });
      }
      for (let r = room.north; r <= room.south; r++) {
        perimeter.push({ r, c: room.west - 1, dir: "west" });
        perimeter.push({ r, c: room.east + 1, dir: "east" });
      }

      for (const p of perimeter) {
        if (p.r < 0 || p.r > this.nRows || p.c < 0 || p.c > this.nCols) continue;
        const val = this.cell[p.r][p.c];
        if (val & BLOCKED) continue;
        if (val & ROOM) continue;

        const isCorridor = !!(val & CORRIDOR) || !!(val & ENTRANCE);
        if (!isCorridor) continue;

        const inwardName = p.dir === "north" ? "south" : p.dir === "south" ? "north" : p.dir === "west" ? "east" : "west";
        const inward = dirs.find(d => d.name === inwardName);
        const ir = p.r + inward.dr, ic = p.c + inward.dc;
        if (ir < 0 || ir > this.nRows || ic < 0 || ic > this.nCols) continue;
        if (!(this.cell[ir][ic] & ROOM)) continue;
        const roomIdHere = (this.cell[ir][ic] & 0xFFC0) >> 6;
        if (roomIdHere !== id) continue;

        const out = dirs.find(d => d.name === p.dir);
        const or_ = p.r + out.dr, oc = p.c + out.dc;
        let connectsOut = !!(val & CORRIDOR);
        if (or_ >= 0 && or_ <= this.nRows && oc >= 0 && oc <= this.nCols) {
          if (this.cell[or_][oc] & OPENSPACE) connectsOut = true;
        }
        if (!connectsOut && !(val & CORRIDOR) && !(val & ENTRANCE)) continue;

        candidates.push(p);
      }

      const seen = new Set();
      const unique = [];
      for (const cand of candidates) {
        const key = cand.r + "," + cand.c;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(cand);
      }

      for (const cand of unique) {
        const roll = this.rand();
        let tipo = "simple";
        let flags = DOOR;
        if (roll < 0.12) { tipo = "secreta"; flags |= SECRET; }
        else if (roll < 0.24) { tipo = "barrotes"; flags |= BARS; }
        else if (roll < 0.40) { tipo = "hierro"; flags |= LOCKED; }
        else if (roll < 0.55) { tipo = "fuerte"; }
        else if (roll < 0.65) { tipo = "piedra"; }
        else if (roll < 0.75) { tipo = "porton"; }
        else if (roll < 0.85) { tipo = "buena"; }
        else { tipo = "simple"; }

        let estado = "normal";
        if (tipo === "secreta") estado = "secreta";
        else if (tipo === "barrotes") estado = "barrotes";
        else if (flags & LOCKED) estado = this.rand() < 0.5 ? "cerradaConLlave" : "atrancada";
        else {
          const er = this.rand();
          if (er < 0.35) estado = "cerrada";
          else if (er < 0.55) estado = "atrancada";
          else if (er < 0.70) estado = "cerradaConLlave";
          else estado = "normal";
        }

        this.cell[cand.r][cand.c] |= flags;
        this.cell[cand.r][cand.c] |= CORRIDOR;

        room.doors.push({ r: cand.r, c: cand.c, dir: cand.dir, tipo, estado });
      }
    }
  }

  _emplaceStairs() {
    const cand = [];
    for (let id = 1; id <= this.nRooms; id++) if (this.rooms[id]) cand.push(id);
    for (let i = 0; i < Math.min(this.opts.addStairs, cand.length); i++) {
      const idx = this.randInt(cand.length);
      const room = this.rooms[cand[idx]];
      const r = this.randInt(room.south - room.north) + room.north;
      const c = this.randInt(room.east - room.west) + room.west;
      this.cell[r][c] |= (i % 2 === 0) ? STAIR_DN : STAIR_UP;
      cand.splice(idx, 1);
    }
  }

  _cleanDungeon() {
    for (let r = 0; r <= this.nRows; r++) {
      for (let c = 0; c <= this.nCols; c++) {
        if (this.cell[r][c] & PERIMETER) {
          let has = false;
          for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr <= this.nRows && nc >= 0 && nc <= this.nCols &&
                (this.cell[nr][nc] & OPENSPACE)) has = true;
          }
          if (!has) this.cell[r][c] &= ~PERIMETER;
        }
      }
    }
  }

  draw(canvas) {
    const ctx = canvas.getContext("2d");
    const cs = this.opts.cellSize;
    canvas.width = (this.nCols + 1) * cs;
    canvas.height = (this.nRows + 1) * cs;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r <= this.nRows; r++) {
      for (let c = 0; c <= this.nCols; c++) {
        const val = this.cell[r][c];
        const x = c * cs, y = r * cs;

        if (val & (ROOM | CORRIDOR)) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y, cs, cs);
          ctx.strokeStyle = "#cccccc";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cs, cs);
        }

        if ((val & DOOR) && !(val & SECRET) && !(val & BARS)) {
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(x + 2, y + 2, cs - 4, cs - 4);
          if (val & LOCKED) {
            ctx.fillStyle = "#c9a227";
            ctx.beginPath();
            ctx.arc(x + cs / 2, y + cs / 2, Math.max(1.5, cs / 6), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (val & SECRET) {
          ctx.fillStyle = "#555555";
          ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
          ctx.strokeStyle = "#888";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 2, y + 2, cs - 4, cs - 4);
        }

        if (val & BARS) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y, cs, cs);
          ctx.strokeStyle = "#666666";
          ctx.lineWidth = Math.max(1, cs / 8);
          const bars = 3;
          for (let i = 1; i <= bars; i++) {
            const bx = x + (cs * i) / (bars + 1);
            ctx.beginPath();
            ctx.moveTo(bx, y + 1);
            ctx.lineTo(bx, y + cs - 1);
            ctx.stroke();
          }
        }

        if (val & STAIR_DN) {
          ctx.fillStyle = "#4444ff";
          ctx.fillRect(x + 3, y + 3, cs - 6, cs - 6);
        }
        if (val & STAIR_UP) {
          ctx.fillStyle = "#44ff44";
          ctx.fillRect(x + 3, y + 3, cs - 6, cs - 6);
        }
      }
    }

    ctx.fillStyle = "#000";
    ctx.font = `${Math.max(8, cs - 4)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let id = 1; id <= this.nRooms; id++) {
      const room = this.rooms[id];
      if (!room) continue;
      const cx = ((room.west + room.east) / 2) * cs + cs / 2;
      const cy = ((room.north + room.south) / 2) * cs + cs / 2;
      ctx.fillText(String(id), cx, cy);
    }
  }

  getRoomData() { return this.rooms.filter(r => r); }
  getSize() { return { rows: this.nRows, cols: this.nCols }; }
}

if (typeof window !== "undefined") {
  window.DungeonGenerator = DungeonGenerator;
}
