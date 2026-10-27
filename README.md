# 🎁 Amigo Invisible

App web para organizar un amigo invisible aleatorio, sin servidor ni dependencias.

## Funciones

- **Grupo**: añade participantes, pon nombre al evento y fija el **límite de precio**.
- **Perfil**: cada persona elige su nombre y escribe sus **5 gustos** (o los añade desde las ideas rápidas). Ve al momento qué ideas le podrían regalar.
- **Sorteo**: reparto aleatorio (con `crypto.getRandomValues`) en el que nadie se regala a sí mismo. Cada persona revela en secreto a quién regala.
- **Recomendaciones personalizadas**: según los gustos de la persona a la que regalas, con precio orientativo y filtradas por el límite de precio. Los gustos que no están en el catálogo generan ideas personalizadas.

Los datos se guardan en el `localStorage` del navegador (un solo dispositivo que se va pasando entre participantes).

## Uso

Abre `index.html` en el navegador, o sírvelo localmente:

```bash
npx serve .
```

## Estructura

- `index.html` – estructura y pestañas
- `styles.css` – estilos (modo claro y oscuro)
- `catalog.js` – catálogo de ideas de regalo y motor de recomendaciones
- `app.js` – estado, sorteo y renderizado
