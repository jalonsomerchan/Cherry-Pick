# GitHub Pages

La app usa rutas relativas para soportar dominio raíz y subrutas.

## Despliegue automático

El repositorio incluye el workflow `.github/workflows/deploy-pages.yml` para publicar la carpeta `dist` en GitHub Pages.

Para activarlo en GitHub:

1. Entra en **Settings > Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions** como fuente.
3. Haz push a `main` o ejecuta manualmente el workflow **Deploy GitHub Pages**.

El workflow ejecuta:

```sh
npm ci
npm test
npm run build
```

Después sube `dist` como artefacto de GitHub Pages.

## Prueba local

```sh
npm run build
python3 -m http.server 8080 -d dist
```

Abre `http://localhost:8080` y comprueba que la navegación, los assets, los idiomas y el juego cargan correctamente.

Evita rutas absolutas duras para assets o navegación interna. Mantén enlaces como `assets/...`, `src/...` o `../assets/...` según la profundidad de la página.
