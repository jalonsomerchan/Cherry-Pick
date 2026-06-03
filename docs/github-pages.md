# GitHub Pages

La app usa rutas relativas para soportar dominio raíz y subrutas.

Ejemplos:

```sh
npm run build
python3 -m http.server 8080 -d dist
```

Evita rutas absolutas duras para assets o navegación interna. Mantén enlaces como `assets/...`, `src/...` o `../assets/...` según la profundidad de la página.
