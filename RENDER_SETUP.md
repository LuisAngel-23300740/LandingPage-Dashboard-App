# Guía de Configuración - Render Deployment

## Problema Identificado
El registro funciona correctamente en local, pero falla en Render con "Error interno del servidor".

## Diagnóstico
- ✅ Base de datos Supabase funciona correctamente
- ✅ Tabla `usuarios` existe con estructura correcta
- ✅ Conexión local funciona perfectamente
- ❌ **Variables de entorno no configuradas en Render**

## Solución: Configurar Variables de Entorno en Render

### 1. Acceder al Dashboard de Render
1. Ve a https://dashboard.render.com
2. Selecciona tu servicio web (landingpage-dashboard-app)

### 2. Configurar Environment Variables
En la sección **Environment**, agrega estas variables:

```
SUPABASE_URL=https://fhfwwibnmmibfeosdwmu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZnd3aWJubW1pYmZlb3Nkd211Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAxOTU4MiwiZXhwIjoyMDkzNTk1NTgyfQ.FLXJ-L56p-vTTvoxpXpSxtEw0DObLlv1yO4etl4d8jQ
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZnd3aWJubW1pYmZlb3Nkd211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTk1ODIsImV4cCI6MjA5MzU5NTU4Mn0.PGqRUieD7XiOl3zkqWtXXb61EwaY0c8ZRNJgn0lAtXk
JWT_SECRET=753cf4ff-f51c-4441-b64d-a9f01fcfcc7a
NODE_ENV=production
```

### 3. Verificar Configuración
Después de configurar las variables:

1. **Redeploy automático**: Render debería redeployear automáticamente
2. **Verificar diagnóstico**: Visita `https://landingpage-dashboard-app.onrender.com/api/diagnostics`
3. **Probar registro**: Intenta registrar un usuario nuevamente

### 4. Endpoints de Diagnóstico
- `/api/health` - Verifica conectividad con Supabase
- `/api/diagnostics` - Muestra estado de variables de entorno

### 5. Logs de Render
Si aún hay problemas, revisa los logs en el dashboard de Render para ver los mensajes de error detallados.

## Comandos de Prueba Local
```bash
cd backend
npm run check-db      # Verificar BD
npm run test-register # Probar registro
npm start             # Iniciar servidor
```