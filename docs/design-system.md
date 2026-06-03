# Design System

Este proyecto usa una UI mobile first con fuentes del sistema y tokens CSS globales en `src/styles/global.css`.

- Los colores, radios, sombras, espaciados y transiciones deben salir de variables `--color-*`, `--radius-*`, `--shadow-*`, `--space-*` y `--transition-*`.
- Todo componente nuevo debe funcionar en light mode y dark mode mediante `prefers-color-scheme`.
- Mantener contraste WCAG AA, foco visible y botones con tamaño táctil suficiente.
- Evitar fuentes externas, CDNs y JavaScript de cliente salvo que sea necesario para interacción real.
- La UI actual se resuelve con CSS nativo y tokens sin clases utilitarias.
