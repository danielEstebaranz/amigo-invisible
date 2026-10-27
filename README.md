# Amigo Invisible

App web para organizar un amigo invisible en la que cada persona participa desde su propio móvil u ordenador.

**En producción:** https://amigo-invisible-1w5pe.web.app

## Cómo funciona

1. **El organizador crea el grupo** con nombre y límite de precio, y comparte el enlace (WhatsApp, copiar o compartir).
2. **Cada persona se une** desde su dispositivo con su nombre y rellena **sus 5 gustos** en *Mi perfil*.
3. **El organizador sortea**. Nadie se regala a sí mismo y el grupo se cierra.
4. **Cada uno descubre en *Mi amigo*** a quién regala, sus gustos y **recomendaciones personalizadas** dentro del presupuesto. Se actualizan en directo si la otra persona cambia sus gustos.

### Privacidad del sorteo

Al unirse, cada dispositivo genera un par de claves RSA. La clave pública se guarda en el grupo y la privada solo en ese dispositivo. En el sorteo, la asignación de cada persona se cifra con su clave pública, así que en la base de datos solo hay texto cifrado y cada uno solo puede leer la suya. Desde *Mi perfil → Usar mi perfil en otro dispositivo* se puede copiar un enlace personal para abrir el perfil en otro navegador.

## Diseño

Estilo Fluent (Segoe UI, acento `#0078D4`, sombras sutiles, tema claro y oscuro):

- **Escritorio:** barra lateral de navegación y paneles en dos columnas.
- **Móvil:** barra de pestañas inferior y una sola columna.

## Estructura

- `public/index.html` – pantallas de inicio y del grupo
- `public/styles.css` – estilos y diseño adaptable
- `public/app.js` – lógica, Firestore en tiempo real, cifrado y sorteo
- `public/catalog.js` – catálogo de ideas de regalo y motor de recomendaciones
- `public/firebase-config.js` – configuración pública del proyecto web
- `firestore.rules` – reglas de seguridad de la base de datos
- `firebase.json`, `.firebaserc` – configuración de Firebase Hosting

## Desarrollo y despliegue

Requiere [Firebase CLI](https://firebase.google.com/docs/cli) con sesión iniciada.

```bash
firebase serve --only hosting     # probar en local
firebase deploy                   # publicar web y reglas
```
