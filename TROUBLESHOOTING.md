# 🚨 Troubleshooting: Error Interno del Servidor en Registro

## Problema Actual
Estás recibiendo "Error interno del servidor" al intentar registrar un nuevo usuario, incluso después de configurar las variables de entorno en Render.

## ✅ Lo que ya verificamos
- ✅ Código del backend funciona correctamente localmente
- ✅ Variables de entorno están configuradas en `.env`
- ✅ Conexión con Supabase funciona localmente
- ✅ Endpoint de registro responde correctamente localmente

## 🔍 Pasos de Diagnóstico

### 1. Verificar el estado del despliegue en Render

Ve a tu dashboard de Render y verifica:
- **Build Status**: Debe ser "Live" (verde)
- **Deploy Status**: Debe ser exitoso
- **Logs**: Revisa los logs de build y runtime para errores

### 2. Probar los endpoints de diagnóstico

Una vez que el servicio esté corriendo, prueba estos endpoints:

#### Health Check (prueba conexión con Supabase):
```
GET https://tu-app.onrender.com/api/health
```

#### Environment Diagnostics:
```
GET https://tu-app.onrender.com/api/diagnostics
```

### 3. Ejecutar el script de diagnóstico

Si tienes acceso SSH a Render o puedes ejecutar comandos, corre:
```bash
npm run render-test
```

Este script probará automáticamente todos los endpoints.

### 4. Verificar configuración de variables en Render

En el dashboard de Render, ve a **Environment** y verifica que estas variables estén configuradas:

```
SUPABASE_URL=https://fhfwwibnmmibfeosdwmu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_completo
SUPABASE_ANON_KEY=tu_anon_key_completo
JWT_SECRET=753cf4ff-f51c-4441-b64d-a9f01fcfcc7a
NODE_ENV=production
```

**Importante**: Asegúrate de que no haya espacios extras al final de los valores.

### 5. Verificar logs de Render

En el dashboard de Render, ve a **Logs** y busca:
- Errores de conexión con Supabase
- Errores de variables de entorno faltantes
- Errores de build

### 6. Probar registro manualmente

Usa curl para probar el registro directamente:

```bash
curl -X POST https://tu-app.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test123@example.com","password":"123456"}'
```

## 🔧 Soluciones Comunes

### Problema: Variables no se cargan
**Solución**: Reinicia el servicio en Render después de cambiar variables.

### Problema: Error de CORS
**Solución**: Verifica que el middleware CORS esté habilitado en `server.js`.

### Problema: Base de datos no accesible
**Solución**: Verifica que las credenciales de Supabase sean correctas y que la tabla `usuarios` exista.

### Problema: Puerto incorrecto
**Solución**: Asegúrate de que el servidor use `process.env.PORT` en Render.

## 📞 Siguientes Pasos

1. **Ejecuta el health check**: `GET /api/health`
2. **Revisa los logs de Render**
3. **Verifica las variables de entorno**
4. **Prueba el registro manual con curl**

Si el health check falla, el problema está en la configuración de Render.
Si el health check pasa pero el registro falla, el problema está en la lógica específica del registro.

## 🆘 Si nada funciona

Comparte:
- Los logs de Render (build y runtime)
- El resultado del health check
- El resultado del diagnostics endpoint
- Las variables de entorno configuradas (sin mostrar los valores sensibles)