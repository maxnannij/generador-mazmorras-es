/**
 * Generador de layout de mazmorras
 * Basado en el algoritmo de drow (donjon.bin.sh) - CC BY-NC 3.0
 * Adaptado e implementado en JavaScript
 */

const NOTHING   = 0x00000000;
const BLOCKED   = 0x00000001;
const ROOM      = 0x00000002;
const CORRIDOR  = 0x00000004;
const PERIMETER = 0x00000010;
const ENTRANCE  = 0x00000020;
const DOOR      = 0x00020000;
const LOCKED    = 0x00040000;
const TRAPPED   = 0x00080000;
const SECRET    = 0x00100000;
const STAIR_DN  = 0x00400000;
const STAIR_UP  = 0x00800000;
const LABEL     = 0xFF000000;

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
      removeDeadends: 50,
      addStairs: 2,
      cellSize: 12
    }, opts);

    this.nRooms = 0;
    this.rooms = [];
    this.cell = [];
    this.rng = this._mulberry32(this.opts.seed);
  }

  _mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  rand(max = 1) {
    return this.rng() * max;
  }

  randInt(max) {
    return Math.floor(this.rand(max));
  }

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
    this._labelRooms();
    this._corridors();
    if (this.opts.addStairs > 0) this._emplaceStairs();
    this._cleanDungeon();

    return this;
  }

  _initCells() {
    this.cell = [];
    for (let r = 0; r <= this.nRows; r++) {
      this.cell[r] = [];
      for (let c = 0; c <= this.nCols; c++) {
        this.cell[r][c] = NOTHING;
      }
    }

    if (this.opts.dungeonLayout === "Round") {
      const centerR = Math.floor(this.nRows / 2);
      const centerC = Math.floor(this.nCols / 2);
      const radius = Math.min(centerR, centerC);
      for (let r = 0; r <= this.nRows; r++) {
        for (let c = 0; c <= this.nCols; c++) {
          const d = Math.sqrt((r - centerR) ** 2 + (c - centerC) ** 2);
          if (d > radius) this.cell[r][c] = BLOCKED;
        }
      }
    }
  }

  _emplaceRooms() {
    if (this.opts.roomLayout === "Dense") {
      this._packRooms();
    } else {
      this._scatterRooms();
    }
  }

  _allocRooms() {
    const dungeonArea = this.nCols * this.nRows;
    const roomArea = this.opts.roomMax * this.opts.roomMax;
    return Math.floor(dungeonArea / roomArea);
  }

  _scatterRooms() {
    const n = this._allocRooms();
    for (let i = 0; i < n; i++) {
      this._emplaceRoom();
    }
  }

  _packRooms() {
    const n_i = Math.floor(this.nRows / 2);
    const n_j = Math.floor(this.nCols / 2);
    for (let i = 0; i < n_i; i++) {
      for (let j = 0; j < n_j; j++) {
        const r = (i * 2) + 1;
        const c = (j * 2) + 1;
        if (this.cell[r][c] & ROOM) continue;
        if ((i === 0 || j === 0) && this.randInt(2)) continue;
        this._emplaceRoom({ i, j });
      }
    }
  }

  _setRoom(proto = {}) {
    const base = this.roomBase;
    const radix = this.roomRadix;

    if (proto.height === undefined) {
      if (proto.i !== undefined) {
        let a = Math.floor(this.nRows / 2) - base - proto.i;
        if (a < 0) a = 0;
        const r = a < radix ? a : radix;
        proto.height = this.randInt(r) + base;
      } else {
        proto.height = this.randInt(radix) + base;
      }
    }
    if (proto.width === undefined) {
      if (proto.j !== undefined) {
        let a = Math.floor(this.nCols / 2) - base - proto.j;
        if (a < 0) a = 0;
        const r = a < radix ? a : radix;
        proto.width = this.randInt(r) + base;
      } else {
        proto.width = this.randInt(radix) + base;
      }
    }
    if (proto.i === undefined) {
      proto.i = this.randInt(Math.floor(this.nRows / 2) - proto.height);
    }
    if (proto.j === undefined) {
      proto.j = this.randInt(Math.floor(this.nCols / 2) - proto.width);
    }
    return proto;
  }

  _soundRoom(r1, c1, r2, c2) {
    const hit = {};
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (this.cell[r][c] & BLOCKED) {
          hit.blocked = true;
          return hit;
        }
        if (this.cell[r][c] & ROOM) {
          const id = (this.cell[r][c] & 0x0000FFC0) >> 6;
          hit[id] = true;
        }
      }
    }
    return hit;
  }

  _emplaceRoom(proto) {
    if (this.nRooms >= 999) return;
    proto = this._setRoom(proto || {});

    const r1 = (proto.i * 2) + 1;
    const c1 = (proto.j * 2) + 1;
    const r2 = ((proto.i + proto.height) * 2) - 1;
    const c2 = ((proto.j + proto.width) * 2) - 1;

    if (r1 < 1 || r2 > this.maxRow) return;
    if (c1 < 1 || c2 > this.maxCol) return;

    const hit = this._soundRoom(r1, c1, r2, c2);
    if (hit.blocked) return;
    const hitList = Object.keys(hit).filter(k => k !== "blocked");
    if (hitList.length > 0) return;

    this.nRooms++;
    const roomId = this.nRooms;

    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        this.cell[r][c] |= ROOM | (roomId << 6);
      }
    }

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

    const height = ((r2 - r1) + 1) * 10;
    const width = ((c2 - c1) + 1) * 10;

    this.rooms[roomId] = {
      id: roomId,
      row: r1, col: c1,
      north: r1, south: r2, west: c1, east: c2,
      height, width,
      area: height * width,
      doors: [],
      content: null
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
      const { r, c } = cand;
      if (this.cell[r][c] & (ROOM | CORRIDOR | BLOCKED)) continue;

      this.cell[r][c] |= ENTRANCE | DOOR;
      room.doors.push({ r, c, dir: cand.dir });
      opened++;
    }
  }

  _labelRooms() {}

  _corridors() {
    for (let id = 1; id <= this.nRooms; id++) {
      const room = this.rooms[id];
      if (!room || room.doors.length === 0) continue;
      for (const door of room.doors) {
        this._tunnelFrom(door.r, door.c, door.dir);
      }
    }
    this._connectRooms();
  }

  _tunnelFrom(r, c, dir) {
    const dirs = {
      north: [-1, 0],
      south: [1, 0],
      west: [0, -1],
      east: [0, 1]
    };
    let [dr, dc] = dirs[dir] || [0, 0];
    let nr = r + dr;
    let nc = c + dc;
    let steps = 0;
    const maxSteps = 15;

    while (steps < maxSteps && nr > 0 && nr < this.nRows && nc > 0 && nc < this.nCols) {
      if (this.cell[nr][nc] & (ROOM | BLOCKED)) break;
      this.cell[nr][nc] |= CORRIDOR;
      if (this.opts.corridorLayout === "Bent" && this.rand() < 0.3) {
        const turn = this.rand() < 0.5 ? "left" : "right";
        if (dir === "north" || dir === "south") {
          dir = turn === "left" ? "west" : "east";
        } else {
          dir = turn === "left" ? "south" : "north";
        }
        const d = dirs[dir];
        dr = d[0]; dc = d[1];
      }
      nr += dr;
      nc += dc;
      steps++;
    }
  }

  _connectRooms() {
    for (let i = 1; i <= this.nRooms; i++) {
      for (let j = i + 1; j <= this.nRooms; j++) {
        const a = this.rooms[i];
        const b = this.rooms[j];
        if (!a || !b) continue;
        const dist = Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
        if (dist < 30 && this.rand() < 0.4) {
          this._connectTwoRooms(a, b);
        }
      }
    }
  }

  _connectTwoRooms(a, b) {
    let r = Math.floor((a.north + a.south) / 2);
    let c = Math.floor((a.west + a.east) / 2);
    const tr = Math.floor((b.north + b.south) / 2);
    const tc = Math.floor((b.west + b.east) / 2);

    while (c !== tc) {
      if (!(this.cell[r][c] & ROOM)) this.cell[r][c] |= CORRIDOR;
      c += (tc > c) ? 1 : -1;
      if (c < 0 || c > this.nCols) break;
    }
    while (r !== tr) {
      if (!(this.cell[r][c] & ROOM)) this.cell[r][c] |= CORRIDOR;
      r += (tr > r) ? 1 : -1;
      if (r < 0 || r > this.nRows) break;
    }
  }

  _emplaceStairs() {
    const candidates = [];
    for (let id = 1; id <= this.nRooms; id++) {
      if (this.rooms[id]) candidates.push(id);
    }
    for (let i = 0; i < Math.min(this.opts.addStairs, candidates.length); i++) {
      const idx = this.randInt(candidates.length);
      const room = this.rooms[candidates[idx]];
      const r = this.randInt(room.south - room.north) + room.north;
      const c = this.randInt(room.east - room.west) + room.west;
      this.cell[r][c] |= (i % 2 === 0) ? STAIR_DN : STAIR_UP;
      candidates.splice(idx, 1);
    }
  }

  _cleanDungeon() {
    for (let r = 0; r <= this.nRows; r++) {
      for (let c = 0; c <= this.nCols; c++) {
        if (this.cell[r][c] & PERIMETER) {
          let hasOpen = false;
          for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr <= this.nRows && nc >= 0 && nc <= this.nCols) {
              if (this.cell[nr][nc] & OPENSPACE) hasOpen = true;
            }
          }
          if (!hasOpen) this.cell[r][c] &= ~PERIMETER;
        }
      }
    }
  }

  draw(canvas, style = "standard") {
    const ctx = canvas.getContext("2d");
    const cs = this.opts.cellSize;
    canvas.width = (this.nCols + 1) * cs;
    canvas.height = (this.nRows + 1) * cs;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r <= this.nRows; r++) {
      for (let c = 0; c <= this.nCols; c++) {
        const val = this.cell[r][c];
        const x = c * cs;
        const y = r * cs;

        if (val & (ROOM | CORRIDOR)) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y, cs, cs);
          ctx.strokeStyle = "#cccccc";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cs, cs);
        }

        if (val & DOOR) {
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(x + 2, y + 2, cs - 4, cs - 4);
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

    ctx.fillStyle = "#000000";
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

  getRoomData() {
    return this.rooms.filter(r => r);
  }

  getSize() {
    return { rows: this.nRows, cols: this.nCols };
  }
}

if (typeof window !== "undefined") {
  window.DungeonGenerator = DungeonGenerator;
}
