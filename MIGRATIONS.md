# Sistema de Migraciones para Base de Datos

Este proyecto utiliza Supabase CLI para gestionar las migraciones de la base de datos. La estructura implementada permite mantener un control de versiones de la base de datos y facilita la recreación del esquema completo en cualquier entorno.

## Estructura de Archivos

```
supabase/
  ├── migrations/                    # Directorio de archivos de migración
  │   ├── 00000000000000_baseline.sql # Migración inicial con el esquema base
  │   └── 20250416000000_add_app_settings_data.sql # Migraciones subsecuentes
  └── migration.config.json          # Configuración de migraciones
```

## Herramienta de Migraciones

Se incluye un script `scripts/db-migration.js` que facilita:

1. Crear nuevas migraciones con un timestamp adecuado
2. Aplicar migraciones pendientes
3. Revertir la última migración (con instrucciones)

## Cómo usar

### Requisitos Previos

1. Node.js instalado
2. Supabase CLI instalado: `npm install -g supabase`
3. Configuración de Supabase conectada al proyecto

### Comandos Básicos

Para ejecutar la herramienta de migraciones:

```bash
node scripts/db-migration.js
```

Para aplicar migraciones directamente:

```bash
npx supabase db push
```

### Crear una Nueva Migración

1. Ejecuta la herramienta y selecciona opción 1
2. Dale un nombre descriptivo a la migración
3. Edita el archivo SQL generado en la carpeta `supabase/migrations`

### Convenciones de Nombre

Los archivos de migración siguen este formato:
`<timestamp>_<nombre_descriptivo>.sql`

Ejemplo: `20250416120000_add_user_preferences.sql`

## Buenas Prácticas

1. Cada migración debe ser idempotente cuando sea posible
2. Incluye tanto las instrucciones para aplicar como para revertir cambios
3. Prueba las migraciones en un entorno de desarrollo antes de subirlas

## Tablas en la Base de Datos

El esquema actual incluye:

- `profiles`: Perfiles de usuario
- `urls`: URLs acortadas de usuarios autenticados
- `anonymous_urls`: URLs acortadas de usuarios anónimos
- `analytics`: Analíticas de uso de URLs
- `anonymous_daily_quota`: Cuotas diarias para usuarios anónimos
- `app_settings`: Configuraciones de la aplicación
- `notifications`: Notificaciones para usuarios

## Funciones y Triggers

- `handle_new_user()`: Crea perfiles automáticamente para nuevos usuarios
- `increment_clicks()`: Incrementa contador de clics para URLs
- `increment_anonymous_clicks()`: Incrementa contador de clics para URLs anónimas
- `increment_anonymous_quota()`: Gestiona la cuota diaria para usuarios anónimos

## Restauración Completa de la Base de Datos

Para recrear la base de datos desde cero:

```bash
npx supabase db reset
npx supabase db push
```