# Generador de Mazmorras en Español

Generador procedural de mazmorras aleatorias inspirado en [donjon.bin.sh](https://donjon.bin.sh/fantasy/dungeon/).

Produce mapas visuales, descripciones detalladas de habitaciones (puertas, trampas, monstruos, tesoros, características y trucos), monstruos errantes y permite **exportar a PDF**.

## Características

- Interfaz completamente en español
- Algoritmo de generación de layout basado en el código abierto de drow (CC BY-NC 3.0)
- Opciones de tamaño, forma, densidad de habitaciones, estilo de pasillos, etc.
- Contenido de habitaciones generado en español (features, trampas, monstruos genéricos OSR/5e-light, tesoro)
- Mapa visual (Canvas)
- Exportación a PDF con mapa + clave + descripciones de habitaciones
- Seed para reproducibilidad

## Uso

1. Abre `index.html` en un navegador moderno (o usa GitHub Pages).
2. Configura las opciones.
3. Pulsa **Generar Mazmorra**.
4. Revisa el mapa y las descripciones.
5. Exporta a PDF.

## Demo / GitHub Pages

Habilita GitHub Pages en Settings → Pages → Source: Deploy from branch `main` / root.

Luego estará disponible en:

`https://maxnannij.github.io/generador-mazmorras-es/`

## Créditos y Licencia

- Algoritmo de layout original por **drow** (donjon.bin.sh) — [CC BY-NC 3.0](http://creativecommons.org/licenses/by-nc/3.0/)
- Contenido de monstruos y trampas inspirado en tablas OGL / SRD
- Implementación en español y mejoras: Maxi Nanni + Grok

Este proyecto se distribuye bajo los términos de la licencia CC BY-NC 3.0 respecto al algoritmo de layout. El resto del código (UI, contenido en español, exportador PDF) se ofrece bajo MIT.

## Estructura del proyecto

```
├── index.html          # Interfaz principal
├── css/
│   └── style.css
├── js/
│   ├── dungeon.js      # Generador de layout + mapa
│   ├── content.js      # Tablas de contenido en español
│   └── app.js          # Lógica de la aplicación + PDF
├── assets/
└── README.md
```

## Roadmap

- [ ] Más motivos (Undead, Aberrant, etc.)
- [ ] Tablas de monstruos más completas por nivel
- [ ] Estilos de mapa adicionales
- [ ] Soporte para cavernas (cellular automata)
- [ ] Exportar a JSON / Foundry VTT

---

Hecho con ❤️ para la comunidad de rol en español.
