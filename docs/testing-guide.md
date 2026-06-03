# Testing Guide

Los tests smoke viven en `tests/smoke.test.mjs` y deben ser simples, robustos y poco frágiles.

Comprueban:

- que existen ficheros clave de la app;
- que las traducciones están alineadas;
- que la UI referencia assets con rutas relativas;
- que el juego mantiene datos de dificultad y sprites.
- que la cinta transportadora mueve las cerezas de arriba hacia abajo.

Ejecuta:

```sh
npm test
npm run build
```
