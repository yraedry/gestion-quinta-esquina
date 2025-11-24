# Gestión de clases de jiu-jitsu (PWA)

Aplicación React + TypeScript con backend Express + SQLite pensada para gestionar las clases de jiu-jitsu como PWA: invitaciones controladas, altas/bajas de alumnos, lista de espera automática y panel de administración para ajustar aforos.

## Tabla rápida
- 📱 PWA lista para instalar con icono SVG y manifest.
- 🔐 Acceso por invitación (registro/login) y roles diferenciados.
- 📅 Gestión de clases, cupos dinámicos y promoción desde lista de espera.
- 🧭 Arquitectura hexagonal: dominio, aplicación, infraestructura y adaptadores UI/HTTP separados.

## Versiones clave
| Librería | Versión |
| --- | --- |
| React | 18.3.1 |
| TypeScript | 5.6.2 |
| Vite | 5.4.8 |
| Vitest | 2.x (añadido para pruebas unitarias) |

## Cómo empezar
```bash
# instalar dependencias
npm install

# ejecutar frontend (Vite)
npm run dev

# ejecutar backend (Express + SQLite en modo dev)
npm run dev:server
```

## Pruebas
Las reglas de negocio clave están cubiertas con Vitest:

```bash
npm test
```

Estado local: ✅ Preparado (en este entorno las dependencias externas están restringidas; ejecuta el comando anterior tras instalar para ver el OK en tu máquina).

## Arquitectura hexagonal (resumen)
- **Dominio** (`server/domain`): entidades (`ClassSession`, `User`) y contratos de repositorios.
- **Aplicación** (`server/application`): casos de uso (registro, login, listar clases, apuntarse, desapuntarse, actualizar aforo) y servicios de lista de espera.
- **Infraestructura** (`server/infrastructure`): Express, SQLite, seguridad (bcrypt/uuid) y repositorios concretos.
- **Frontend** (`src`): modelos de dominio, servicios de aplicación (auth/clases), adaptador HTTP tipado y componentes React.

## Estructura destacada
```
server/
  domain/              # Modelo de dominio y puertos
  application/         # Casos de uso y servicios
  infrastructure/      # Adaptadores (HTTP, DB, seguridad)
src/
  domain/              # Modelos compartidos con el UI
  application/         # Servicios consumidos por la UI
  infrastructure/      # Cliente HTTP
  ui/                  # Componentes React + estilos
public/                # Manifest e iconos SVG PWA
```

## Licencia
Uso libre para proyectos personales o académicos. El uso comercial requiere permiso y acuerdo económico previo con la autoría.
