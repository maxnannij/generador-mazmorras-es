/**
 * Generador de mazmorras basado en BSP (Binary Space Partition)
 * Inspirado en Adrian104/Dungeon-Generator (MIT) y el estilo donjon.bin.sh
 * Puertas solo en aberturas reales habitación ↔ pasillo.
 */
const TILE_VOID = 0;
const TILE_WALL = 1;
const TILE_FLOOR = 2;
const TILE_CORRIDOR = 3;
const TILE_DOOR = 4;
const TILE_SECRET = 5;
const TILE_BARS = 6;
const TILE_STAIR_UP = 7;
const TILE_STAIR_DN = 8;

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
      cellSize: 12,
      maxDepth: 5,
      minLeafSize: 8
    }, opts);
    this.nRooms = 0;
    this.rooms = [];
    this.grid = [];
    this.nRows = 0;
    this.nCols = 0;
    this.rng = this._mulberry32(this.opts.seed >>> 0);
  }

  _mulberry32(a) {
    return function () {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  rand(max = 1) { return this.rng() * max; }
  randInt(max) { return Math.floor(this.rand(max)); }
  randRange(min, max) { return min + this.randInt(max - min + 1); }

  create() {
    this.nRows = Math.max(15, this.opts.nRows | 0);
    this.nCols = Math.max(15, this.opts.nCols | 0);
    if (this.nRows % 2 === 0) this.nRows++;
    if (this.nCols % 2 === 0) this.nCols++;

    this.nRooms = 0;
    this.rooms = [];
    this.grid = [];
    for (let r = 0; r < this.nRows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.nCols; c++) this.grid[r][c] = TILE_WALL;
    }

    const root = {
      x: 1, y: 1,
      w: this.nCols - 2,
      h: this.nRows - 2,
      depth: 0,
      left: null, right: null,
      room: null
    };
    this._split(root);
    this._placeRooms(root);
    this._connectTree(root);
    this._assignDoorTypes();
    if (this.opts.addStairs > 0) this._placeStairs();
    return this;
  }

  _split(node) {
    const minLeaf = this.opts.minLeafSize || 8;
    const maxDepth = this.opts.maxDepth || 5;
    if (node.depth >= maxDepth) return;
    if (node.w < minLeaf * 2 && node.h < minLeaf * 2) return;

    let horizontal;
    if (node.w < minLeaf * 2) horizontal = true;
    else if (node.h < minLeaf * 2) horizontal = false;
    else if (node.w > node.h * 1.25) horizontal = false;
    else if (node.h > node.w * 1.25) horizontal = true;
    else horizontal = this.rand() < 0.5;

    if (horizontal) {
      const min = minLeaf;
      const max = node.h - minLeaf;
      if (max <= min) return;
      const cut = this.randRange(min, max);
      node.left = { x: node.x, y: node.y, w: node.w, h: cut, depth: node.depth + 1, left: null, right: null, room: null };
      node.right = { x: node.x, y: node.y + cut, w: node.w, h: node.h - cut, depth: node.depth + 1, left: null, right: null, room: null };
    } else {
      const min = minLeaf;
      const max = node.w - minLeaf;
      if (max <= min) return;
      const cut = this.randRange(min, max);
      node.left = { x: node.x, y: node.y, w: cut, h: node.h, depth: node.depth + 1, left: null, right: null, room: null };
      node.right = { x: node.x + cut, y: node.y, w: node.w - cut, h: node.h, depth: node.depth + 1, left: null, right: null, room: null };
    }
    this._split(node.left);
    this._split(node.right);
  }

  _placeRooms(node) {
    if (!node) return;
    if (node.left || node.right) {
      this._placeRooms(node.left);
      this._placeRooms(node.right);
      return;
    }

    const margin = 1;
    const minR = Math.max(3, this.opts.roomMin || 3);
    const maxR = Math.max(minR, this.opts.roomMax || 9);

    let rw = this.randRange(minR, Math.min(maxR, node.w - margin * 2));
    let rh = this.randRange(minR, Math.min(maxR, node.h - margin * 2));
    if (rw < 3 || rh < 3) return;
    if (node.w - rw < margin * 2 || node.h - rh < margin * 2) {
      rw = Math.max(3, node.w - margin * 2);
      rh = Math.max(3, node.h - margin * 2);
    }

    const rx = node.x + this.randRange(margin, Math.max(margin, node.w - rw - margin));
    const ry = node.y + this.randRange(margin, Math.max(margin, node.h - rh - margin));

    if (this.opts.roomLayout !== "Dense" && node.depth > 2 && this.rand() < 0.15) return;

    this.nRooms++;
    const id = this.nRooms;
    for (let r = ry; r < ry + rh; r++) {
      for (let c = rx; c < rx + rw; c++) {
        if (r >= 0 && r < this.nRows && c >= 0 && c < this.nCols) this.grid[r][c] = TILE_FLOOR;
      }
    }

    const room = {
      id,
      row: ry, col: rx,
      north: ry, south: ry + rh - 1,
      west: rx, east: rx + rw - 1,
      height: rh * 10, width: rw * 10, area: rh * rw * 100,
      cx: rx + Math.floor(rw / 2),
      cy: ry + Math.floor(rh / 2),
      doors: [], content: null
    };
    this.rooms[id] = room;
    node.room = room;
  }

  _nodeCenter(node) {
    if (node.room) return { x: node.room.cx, y: node.room.cy };
    if (node.left && node.right) {
      const a = this._nodeCenter(node.left);
      const b = this._nodeCenter(node.right);
      if (a && b) return { x: Math.floor((a.x + b.x) / 2), y: Math.floor((a.y + b.y) / 2) };
      return a || b;
    }
    return { x: node.x + Math.floor(node.w / 2), y: node.y + Math.floor(node.h / 2) };
  }

  _connectTree(node) {
    if (!node || (!node.left && !node.right)) return;
    this._connectTree(node.left);
    this._connectTree(node.right);
    if (node.left && node.right) {
      const a = this._nodeCenter(node.left);
      const b = this._nodeCenter(node.right);
      if (a && b) this._carveCorridor(a.x, a.y, b.x, b.y);
    }
  }

  _carveCorridor(x1, y1, x2, y2) {
    const bent = this.opts.corridorLayout === "Bent" || this.opts.corridorLayout === "Labyrinth";
    const labyrinth = this.opts.corridorLayout === "Labyrinth";

    let horizontalFirst = this.rand() < 0.5;
    if (this.opts.corridorLayout === "Straight") {
      horizontalFirst = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
    }

    const carve = (cx, cy) => {
      if (cy < 0 || cy >= this.nRows || cx < 0 || cx >= this.nCols) return;
      const t = this.grid[cy][cx];
      if (t === TILE_WALL || t === TILE_VOID) this.grid[cy][cx] = TILE_CORRIDOR;
    };

    const stepToward = (from, to) => (to > from ? 1 : to < from ? -1 : 0);

    const carveLine = (ax, ay, bx, by) => {
      let cx = ax, cy = ay;
      while (cx !== bx || cy !== by) {
        if (labyrinth && this.rand() < 0.25) {
          if (this.rand() < 0.5 && cy !== by) cy += stepToward(cy, by);
          else if (cx !== bx) cx += stepToward(cx, bx);
          else cy += stepToward(cy, by);
        } else {
          if (cx !== bx) cx += stepToward(cx, bx);
          else cy += stepToward(cy, by);
        }
        carve(cx, cy);
        this._maybePlaceDoor(cx, cy);
      }
    };

    carve(x1, y1);
    this._maybePlaceDoor(x1, y1);

    if (bent || labyrinth) {
      if (horizontalFirst) {
        carveLine(x1, y1, x2, y1);
        carveLine(x2, y1, x2, y2);
      } else {
        carveLine(x1, y1, x1, y2);
        carveLine(x1, y2, x2, y2);
      }
    } else {
      carveLine(x1, y1, x2, y2);
    }
  }

  _maybePlaceDoor(x, y) {
    if (y < 0 || y >= this.nRows || x < 0 || x >= this.nCols) return;
    if (this.grid[y][x] !== TILE_CORRIDOR && this.grid[y][x] !== TILE_FLOOR) return;

    const dirs = [
      { dx: 0, dy: -1, name: "north" },
      { dx: 0, dy: 1, name: "south" },
      { dx: -1, dy: 0, name: "west" },
      { dx: 1, dy: 0, name: "east" }
    ];

    for (const d of dirs) {
      const nx = x + d.dx, ny = y + d.dy;
      if (ny < 0 || ny >= this.nRows || nx < 0 || nx >= this.nCols) continue;
      if (this.grid[ny][nx] !== TILE_FLOOR) continue;
      if (this.grid[y][x] === TILE_FLOOR) continue;

      const room = this._roomAt(nx, ny);
      if (!room) continue;

      const already = room.doors.some(p =>
        p.dir === d.name && Math.abs(p.r - y) + Math.abs(p.c - x) <= 1
      );
      if (already) continue;
      if (room.doors.length >= 4) continue;

      this.grid[y][x] = TILE_DOOR;
      room.doors.push({ r: y, c: x, dir: d.name, tipo: "simple", estado: "normal" });
    }
  }

  _roomAt(x, y) {
    for (let id = 1; id <= this.nRooms; id++) {
      const room = this.rooms[id];
      if (!room) continue;
      if (y >= room.north && y <= room.south && x >= room.west && x <= room.east) return room;
    }
    return null;
  }

  _assignDoorTypes() {
    for (let id = 1; id <= this.nRooms; id++) {
      const room = this.rooms[id];
      if (!room) continue;
      for (const door of room.doors) {
        const roll = this.rand();
        if (roll < 0.12) {
          door.tipo = "secreta"; door.estado = "secreta";
          this.grid[door.r][door.c] = TILE_SECRET;
        } else if (roll < 0.24) {
          door.tipo = "barrotes"; door.estado = "barrotes";
          this.grid[door.r][door.c] = TILE_BARS;
        } else if (roll < 0.40) {
          door.tipo = "hierro";
          door.estado = this.rand() < 0.5 ? "cerradaConLlave" : "atrancada";
        } else if (roll < 0.55) {
          door.tipo = "fuerte";
          door.estado = this.rand() < 0.5 ? "cerrada" : "atrancada";
        } else if (roll < 0.65) {
          door.tipo = "piedra"; door.estado = "atrancada";
        } else if (roll < 0.75) {
          door.tipo = "porton"; door.estado = "normal";
        } else if (roll < 0.85) {
          door.tipo = "buena";
          door.estado = this.rand() < 0.4 ? "cerrada" : "normal";
        } else {
          door.tipo = "simple";
          door.estado = this.rand() < 0.4 ? "cerrada" : "normal";
        }
      }
    }
  }

  _placeStairs() {
    const ids = [];
    for (let id = 1; id <= this.nRooms; id++) if (this.rooms[id]) ids.push(id);
    for (let i = 0; i < Math.min(this.opts.addStairs, ids.length); i++) {
      const idx = this.randInt(ids.length);
      const room = this.rooms[ids[idx]];
      const r = this.randRange(room.north, room.south);
      const c = this.randRange(room.west, room.east);
      this.grid[r][c] = (i % 2 === 0) ? TILE_STAIR_DN : TILE_STAIR_UP;
      ids.splice(idx, 1);
    }
  }

  draw(canvas) {
    const ctx = canvas.getContext("2d");
    const cs = this.opts.cellSize || 12;
    canvas.width = this.nCols * cs;
    canvas.height = this.nRows * cs;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < this.nRows; r++) {
      for (let c = 0; c < this.nCols; c++) {
        const t = this.grid[r][c];
        const x = c * cs, y = r * cs;

        if (t === TILE_FLOOR || t === TILE_CORRIDOR || t === TILE_DOOR ||
            t === TILE_SECRET || t === TILE_BARS || t === TILE_STAIR_UP || t === TILE_STAIR_DN) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y, cs, cs);
          ctx.strokeStyle = "#cccccc";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cs, cs);
        }

        if (t === TILE_DOOR) {
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(x + 2, y + 2, cs - 4, cs - 4);
        }
        if (t === TILE_SECRET) {
          ctx.fillStyle = "#555555";
          ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
          ctx.strokeStyle = "#888";
          ctx.strokeRect(x + 2, y + 2, cs - 4, cs - 4);
        }
        if (t === TILE_BARS) {
          ctx.strokeStyle = "#666666";
          ctx.lineWidth = Math.max(1, cs / 8);
          for (let i = 1; i <= 3; i++) {
            const bx = x + (cs * i) / 4;
            ctx.beginPath();
            ctx.moveTo(bx, y + 1);
            ctx.lineTo(bx, y + cs - 1);
            ctx.stroke();
          }
        }
        if (t === TILE_STAIR_DN) {
          ctx.fillStyle = "#4444ff";
          ctx.fillRect(x + 3, y + 3, cs - 6, cs - 6);
        }
        if (t === TILE_STAIR_UP) {
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
      ctx.fillText(String(id), room.cx * cs + cs / 2, room.cy * cs + cs / 2);
    }
  }

  getRoomData() { return this.rooms.filter(r => r); }
  getSize() { return { rows: this.nRows, cols: this.nCols }; }
}

if (typeof window !== "undefined") {
  window.DungeonGenerator = DungeonGenerator;
}
