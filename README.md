# 📸 Photo Gallery NG Capacitor

Una aplicación móvil multiplataforma desarrollada con **Ionic Framework**, **Angular 22**, y **Capacitor** para gestionar galerías de fotos con funcionalidades nativas de dispositivo, autenticación de usuarios y más.

Potenciada por [Ionic Angular](https://ionicframework.com/docs/angular/overview) (aplicación web) y [Capacitor](https://capacitor.ionicframework.com) (runtime de aplicación nativa).

## ✨ Características Principales

- ✅ **Sistema de Autenticación**: Login seguro con protección de rutas
- 📸 **Galería de Fotos**: Captura, almacenamiento y gestión de imágenes
- 📱 **Multiplataforma**: Ejecutable en iOS, Android y Web
- 🎨 **Interfaz Responsiva**: Componentes Ionic modernos y adaptables
- 🔐 **Guards de Autenticación**: Protección de rutas privadas
- 📊 **Dashboard**: Panel de control con información principal
- 🛍️ **Gestión de Productos**: Módulo para visualizar productos
- ⚡ **PWA Ready**: Soporte para Progressive Web App
- 🎭 **Navegación por Tabs**: Interfaz intuitiva con pestañas
- 💾 **Persistencia de Datos**: Almacenamiento en filesystem y preferencias

## 🔧 Requisitos Previos

| Requisito | Versión |
|-----------|---------|
| **Node.js** | `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0` |
| **npm** | Latest |
| **Ionic CLI** | Global |
| **Capacitor CLI** | 8.5.0 |
| **Xcode** | Última versión (iOS) |
| **Android Studio** | Última versión (Android) |

## 🚀 Instalación Rápida

### 1. Clonar y preparar el proyecto
```bash
git clone <repository-url>
cd MyFirstAPP
npm install
```

### 2. Instalar plataformas móviles (opcional)
```bash
# iOS
npx cap add ios

# Android
npx cap add android
```

### 3. Ejecutar en desarrollo
```bash
npm start
# O con Ionic
ionic serve
```

## 💻 Comandos Disponibles

```bash
# Desarrollo y compilación
npm start              # Inicia servidor de desarrollo
npm run build          # Compila para producción
npm run watch          # Compila en modo watch
ionic serve            # Servidor con Ionic CLI

# Testing y calidad
npm test               # Ejecuta pruebas unitarias
npm run lint           # Validación de código

# Capacitor (Nativo)
npx cap sync           # Sincroniza con plataformas nativas
npx cap open ios       # Abre en Xcode
npx cap open android   # Abre en Android Studio
```

## 📁 Estructura del Proyecto

```
MyFirstAPP/
├── src/
│   ├── app/
│   │   ├── app.component.*        # Componente raíz
│   │   ├── app.routes.ts          # Configuración de rutas
│   │   ├── login-pipe.ts          # Componente de login
│   │   ├── guards/
│   │   │   └── auth.guard.ts      # Protección de rutas
│   │   ├── services/              # Servicios compartidos
│   │   │   ├── photo.service.ts   # Gestión de fotos
│   │   │   └── ...
│   │   ├── dashboard/             # Dashboard page
│   │   ├── productos/             # Módulo de productos
│   │   ├── tabs/                  # Navegación principal
│   │   ├── tab1, tab2, tab3/      # Páginas de tabs
│   │   └── explore-container/     # Componente reutilizable
│   ├── assets/                    # Recursos (imágenes, iconos)
│   ├── environments/              # Configuraciones por ambiente
│   ├── theme/                     # Variables SCSS y temas
│   ├── global.scss                # Estilos globales
│   ├── index.html                 # HTML principal
│   └── main.ts                    # Punto de entrada
├── android/                       # Código nativo Android
├── ios/                          # Código nativo iOS
├── www/                          # Build compilado (generado)
└── ionic.config.json             # Configuración Ionic
```

## 🔐 Sistema de Autenticación

El proyecto implementa un sistema de autenticación robusto:

### AuthGuard (`src/app/guards/auth.guard.ts`)
- Protege las rutas autenticadas (ej: `/tabs`)
- Redirige usuarios no autenticados al login
- Verificación de token/sesión

### LoginComponent (`src/app/login-pipe.ts`)
- Componente de inicio de sesión
- Validación de credenciales
- Gestión de sesión

### Rutas Protegidas
```typescript
/tabs          → Requiere autenticación ✓
/dashboard     → Acceso público
/productos     → Acceso público
/login         → Acceso público
```

## 📦 Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Angular** | 22.0.4 | Framework principal |
| **Ionic** | 9.0.0 | Componentes UI |
| **Capacitor** | 8.5.0 | Acceso APIs nativas |
| **RxJS** | 7.8.0 | Programación reactiva |
| **Axios** | 1.20.0 | Cliente HTTP |
| **Anime.js** | 4.5.0 | Animaciones |
| **TypeScript** | Latest | Lenguaje de programación |
| **SCSS** | Latest | Estilos |

## 🗺️ Rutas de la Aplicación

| Ruta | Componente | Protegida | Descripción |
|------|-----------|-----------|-------------|
| `/` | Redirect | No | Redirecciona a login |
| `/login` | LoginPipe | No | Página de inicio de sesión |
| `/tabs` | Tabs Routes | **Sí** | Navegación principal |
| `/dashboard` | DashboardPage | No | Panel de control |
| `/productos` | ProductosPage | No | Gestión de productos |
| `/**` | Redirect | No | Ruta catchall → login |

## 📸 Funcionalidad de Cámara

La aplicación utiliza **Capacitor Camera API** para:
- Capturar fotos desde la cámara del dispositivo
- Seleccionar imágenes de la galería
- Almacenar permanentemente en filesystem
- Persistir metadatos en preferencias

### APIs Utilizadas
- **Camera**: `@capacitor/camera` (v8.2.3)
- **Filesystem**: `@capacitor/filesystem` (v8.1.3)
- **Preferences**: `@capacitor/preferences` (v8.0.1)

## 🎨 Estilos y Tema

La aplicación utiliza:
- **SCSS** con variables de tema personalizadas
- Archivo central de estilos: `src/theme/variables.scss`
- Estilos globales: `src/global.scss`
- Sistema de componentes Ionic preconstruido

## 🌐 Deployment

### Web
```bash
npm run build
# Archivos compilados en www/
# Desplegar www/ en cualquier servidor web estático
```

### iOS
```bash
npx cap sync
npx cap open ios
# Compilar y ejecutar desde Xcode
# ⚙️ Requiere certificados de firma
```

### Android
```bash
npx cap sync
npx cap open android
# Compilar y ejecutar desde Android Studio
# 🔑 Requiere keystore configurado
```

## 🔍 Desarrollo y Debugging

### Hot Reload en Navegador
```bash
npm start
# Abre http://localhost:4200
```

### Debugging
- **Chrome**: Presiona F12 en el navegador
- **Safari (iOS)**: Usa Safari DevTools con cable conectado
- **Android**: Chrome DevTools vía USB debugging
- **IDEs**: Xcode y Android Studio tienen debuggers integrados

### Proxy Configuration
```javascript
// proxy.conf.json - Configurado para desarrollo
{
  "/api": {
    "target": "http://localhost:3000",
    "changeOrigin": true
  }
}
```

## 📝 Convenciones de Código

```typescript
// Componentes standalone
@Component({
  selector: 'app-example',
  standalone: true,
  template: `...`,
  styleUrls: ['./example.scss']
})
export class ExampleComponent {}

// Servicios inyectables
@Injectable({ providedIn: 'root' })
export class ExampleService {}

// Guards de autenticación
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivateFn {}
```

## 📚 Estructura de Archivos por Tipo

```
*.component.ts      → Componentes Angular
*.service.ts        → Servicios e inyección
*.guard.ts          → Protección de rutas
*.pipe.ts           → Transformadores de datos
*.spec.ts           → Tests unitarios
*.page.ts           → Páginas Ionic
*.routes.ts         → Configuración de rutas
```

## 🔗 Enlaces Útiles

- [📖 Documentación Ionic](https://ionicframework.com/docs)
- [📖 Documentación Angular](https://angular.io/docs)
- [📖 Documentación Capacitor](https://capacitorjs.com/docs)
- [📖 Guía Your First App](https://ionicframework.com/docs/angular/your-first-app)
- [📖 Capacitor Workflow](https://capacitorjs.com/docs/basics/workflow)
- [🎥 Ionic YouTube Channel](https://www.youtube.com/channel/UCvZEi3z-9tNwH-bP_2TcnEA)

## 🐛 Troubleshooting

### El servidor no inicia
```bash
# Limpiar caché de Angular
rm -rf node_modules/.angular
npm start
```

### Problemas con Capacitor
```bash
# Resincronizar plataformas
npx cap sync
npx cap update
```

### Errores de permisos (iOS/Android)
- Verificar `Info.plist` (iOS)
- Verificar `AndroidManifest.xml` (Android)
- Permisos en tiempos de ejecución en Android 6+

## 📄 Licencia

Licensed under the MIT License - ver [LICENSE](./LICENSE) para más detalles.

## 👨‍💻 Autores

- **Ionic Framework Team**
- **Contribuyentes**

---

**Última actualización**: Septiembre 2026
**Versión**: 2.0.0
