# i18n Guide

La fuente de verdad de textos está en `src/i18n/translations.js`.

- El idioma por defecto es `es` y funciona en `/`.
- Los idiomas secundarios funcionan como `/{locale}/`.
- Los textos visibles deben vivir en el objeto `translations`.
- Toda clave nueva debe añadirse a todos los idiomas configurados.
- Usa `data-i18n` y `data-i18n-attr` para textos y atributos que se hidratan desde `src/scripts/cherryGame.js`.
