# ferias-frontend

Descripción
-----------
Repositorio frontend de la aplicación "ferias-frontend" creado con Create React App (TypeScript). Contiene la interfaz de usuario y los assets.

Tecnologías principales
-----------------------
- React 19
- TypeScript
- react-scripts 5
- Axios
- react-router-dom

Requisitos previos
------------------
- Git
- Node.js 18.x LTS (recomendado)
- npm >= 8 o yarn
- Opcional: nvm para gestionar versiones de Node

Clonar
------
Usando HTTPS:

```bash
git clone https://github.com/USERNAME/REPO.git
cd ferias-frontend
```

Usando SSH:

```bash
git clone git@github.com:USERNAME/REPO.git
cd ferias-frontend
```

Reemplaza `USERNAME/REPO` por la ruta real del repositorio.

Instalación
-----------
Instalar dependencias:

```bash
npm install
# o
# yarn install
```

Variables de entorno
--------------------
Si la aplicación necesita configuración (por ejemplo la URL de la API), crea un archivo `.env.local` en la raíz con variables de ejemplo:

```bash
REACT_APP_API_URL=http://localhost:8000
```

Asegúrate de no versionar datos sensibles.

Scripts útiles
--------------
- `npm start` — Ejecuta la app en modo desarrollo (http://localhost:3000)
- `npm test` — Ejecuta el runner de tests en modo watch
- `npm run build` — Crea la versión de producción en la carpeta `build`
- `npm run eject` — Eject (operación irreversible)

Ejecutar en desarrollo
----------------------
Ejecutar el servidor de desarrollo:

```bash
npm start
```

La app recargará automáticamente al editar archivos.

Ejecutar tests
--------------

```bash
npm test
```

Build y despliegue
------------------
Generar build de producción:

```bash
npm run build
```

Servir la build localmente (ejemplo con `serve`):

```bash
npx serve -s build -l 5000
```

Desplegar la carpeta `build/` a servicios como Vercel, Netlify o Surge.

Nota para Windows
-----------------
Si el puerto 3000 está en uso, cambiarlo:

- PowerShell:

```powershell
$env:PORT=3001; npm start
```

- CMD:

```cmd
set PORT=3001&& npm start
```

Resolución de problemas comunes
-------------------------------
- Errores de dependencias: borrar `node_modules` y `package-lock.json`, luego `npm install`.
- Puerto 3000 en uso: usar la variable PORT como se indicó arriba.
- Limpiar cache de npm: `npm cache clean --force`.
- Problemas de versión de Node: usar `nvm` para cambiar de versión.

Contribuir
----------
1. Haz fork del repositorio
2. Crea una rama (`feature/nueva-funcion`)
3. Realiza cambios y push
4. Abre un Pull Request describiendo los cambios

Documentación adicional
-----------------------
Existe el archivo `DOCUMENTACION_CLONAR.md` con una guía extendida de clonación e instalación.

Licencia
--------
Revisa el archivo `LICENSE` en la raíz del repositorio (si existe) para detalles de la licencia.

Contacto y soporte
------------------
Para problemas o dudas, abre un issue en el repositorio de GitHub.

---

Archivo actualizado: README.md
