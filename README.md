# Amigo Invisible

App web para organizar un amigo invisible en la que cada persona participa desde su propio móvil u ordenador.

**En producción:** https://amigo-invisible-1w5pe.web.app

## Descargas

| Plataforma | Archivo | Notas |
|---|---|---|
| Android 8+ | [AmigoInvisible.apk](https://github.com/danielEstebaranz/amigo-invisible/releases/latest/download/AmigoInvisible.apk) | Permite «instalar apps de esta fuente» al abrirlo |
| Windows 10/11 | [AmigoInvisible.exe](https://github.com/danielEstebaranz/amigo-invisible/releases/latest/download/AmigoInvisible.exe) | Sin instalación. Si sale SmartScreen: *Más información → Ejecutar de todas formas* |
| iPhone, Mac y otros | [Abrir en el navegador](https://amigo-invisible-1w5pe.web.app) | En iPhone: *Compartir → Añadir a pantalla de inicio* |

Página de descargas para compartir: https://amigo-invisible-1w5pe.web.app/descargar

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
- `public/descargar.html` – página de descargas
- `firestore.rules` – reglas de seguridad de la base de datos
- `firebase.json`, `.firebaserc` – configuración de Firebase Hosting
- `android/` – app Android nativa (WebView a pantalla completa, compartir nativo, enlaces de invitación)
- `desktop/` – lanzador de Windows (abre la app en ventana propia con Edge en modo aplicación) y generador de iconos

## Desarrollo y despliegue

Requiere [Firebase CLI](https://firebase.google.com/docs/cli) con sesión iniciada.

```bash
firebase serve --only hosting     # probar en local
firebase deploy                   # publicar web y reglas
```

Compilar las apps (los archivos quedan en `dist/`):

```powershell
.\desktop\build.ps1                                  # AmigoInvisible.exe
cd android; .\gradlew.bat assembleRelease            # app\build\outputs\apk\release\app-release.apk
```

La APK se firma con la clave de depuración local (`~/.android/debug.keystore`). Para publicar actualizaciones que se instalen encima de la versión anterior hay que compilarlas en el mismo equipo o usar la misma clave.

Para publicar una versión nueva, sube los dos archivos a una Release de GitHub con los nombres `AmigoInvisible.apk` y `AmigoInvisible.exe`. Los enlaces de descarga apuntan siempre a la última Release.
