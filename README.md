# Sistema de Escrutinio Electoral - Usulután Norte 2024

Sistema web avanzado para el conteo y visualización de votos en tiempo real, diseñado específicamente para la administración electoral de los distritos de **Usulután Norte**, El Salvador.

## 🚀 Características Principales

### Panel Público (Dashboard)
- **Visualización en Tiempo Real**: Gráficos dinámicos (Dona y Barras) que se actualizan instantáneamente mediante Supabase Realtime.
- **Filtros Granulares**: Consulta de resultados por Distrito y por Centro de Votación específico.
- **Métricas de Participación**: Cálculo exacto basado en el padrón electoral oficial (80,680 electores).
- **Alertas de Seguridad**: Indicadores visuales (rojo/verde) que detectan cuando la participación supera el 100% del padrón.
- **Reportes Profesionales**: Generación de reportes PDF globales y por acta, regionalizados y contextuales.

### Panel de Administración
- **Gestión Unificada**: Ingreso de actas por JRV con validación de duplicidad a nivel de distrito.
- **Sesiones Individuales**: Cada usuario administrador gestiona sus propios registros.
- **Modo Edición**: Capacidad de corregir o eliminar actas ingresadas con sincronización automática.
- **Acceso Protegido**: Sistema de autenticación robusto mediante Supabase Auth y acceso oculto (Easter Egg).

## 🛠️ Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Gráficos**: Chart.js para visualizaciones interactivas.
- **Base de Datos & Auth**: Supabase (PostgreSQL + GoTrue).
- **Realtime**: WebSockets para actualizaciones sin recarga de página.
- **Reportes**: jsPDF + AutoTable.

## 📋 Configuración Inicial

1. **Base de Datos**:
   - Ejecutar el script `supabase_setup.sql` en el editor SQL de tu proyecto de Supabase.
   - Esto creará las tablas `actas`, `votos`, `partidos` y `perfiles`, junto con las políticas RLS.

2. **Variables de Entorno**:
   - Configurar `SUPABASE_URL` y `SUPABASE_ANON_KEY` en `supabase.js`.

3. **Partidos Políticos**:
   - Los partidos se cargan automáticamente desde la tabla `partidos`. Puedes editarlos directamente en el dashboard de Supabase para cambiar colores o nombres.

---
> [!IMPORTANT]
> Este sistema ha sido optimizado para un bajo consumo de recursos y una respuesta inmediata del lado del cliente mediante técnicas de *Debouncing* y *Caching*.
