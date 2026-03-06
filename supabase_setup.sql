-- Configuración del Esquema de Base de Datos para Sistema Electoral-- ==========================================
-- ELIMINACIÓN PREVIA (LIMPIEZA TOTAL)
-- ==========================================
-- ¡PRECAUCIÓN! Esto borrará todas las tablas indicadas y sus datos.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.crear_perfil_usuario();

DROP TABLE IF EXISTS public.votos CASCADE;
DROP TABLE IF EXISTS public.actas CASCADE;
DROP TABLE IF EXISTS public.partidos CASCADE;
DROP TABLE IF EXISTS public.perfiles CASCADE;

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- CREACIÓN DE TABLAS
-- ==========================================

-- 1. Crear tabla PARTIDOS POLÍTICOS
CREATE TABLE public.partidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    sigla VARCHAR(20) NOT NULL,
    color VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear tabla ACTAS (Por Centro de Votación y JRV)
CREATE TABLE public.actas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centro_votacion VARCHAR(255) NOT NULL,
    jrv INTEGER NOT NULL UNIQUE, -- Una JRV no puede tener dos actas
    departamento VARCHAR(100) NOT NULL,
    zona VARCHAR(100) NOT NULL, -- Nueva columna para la Zona (44 Municipios)
    municipio VARCHAR(100) NOT NULL, -- Aquí se guardará el Distrito (262 distritos)
    user_id UUID REFERENCES auth.users(id) NOT NULL, -- Quién subió el acta
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear tabla VOTOS (Relacionados a un acta y un partido)
CREATE TABLE public.votos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acta_id UUID REFERENCES public.actas(id) ON DELETE CASCADE NOT NULL,
    partido_id UUID REFERENCES public.partidos(id) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(acta_id, partido_id) -- Un partido solo puede tener 1 registro de votos por acta
);

-- 4. Crear tabla PERFILES (para manejar Roles SuperAdmin/Digitador)
CREATE TABLE public.perfiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    rol VARCHAR(50) DEFAULT 'digitador' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- TRIGGERS Y FUNCIONES
-- ==========================================

-- TRIGGER: Auto-crear un perfil al crear un usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.crear_perfil_usuario()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, rol)
  VALUES (new.id, 'digitador');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.crear_perfil_usuario();

-- ==========================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- PERFILES (Solo lectura de tu propio perfil)
CREATE POLICY "Usuarios pueden leer su propio perfil" ON public.perfiles
    FOR SELECT USING (auth.uid() = id);

-- PARTIDOS (Lectura pública)
CREATE POLICY "Partidos son públicos para lectura" ON public.partidos
    FOR SELECT USING (true);

-- ACTAS (Lectura pública)
CREATE POLICY "Actas son públicas para lectura" ON public.actas
    FOR SELECT USING (true);
-- ACTAS (Inserción solo admins/superadmins)
CREATE POLICY "Admins pueden insertar actas" ON public.actas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- ACTAS (Borrado SOLO superadmin)
CREATE POLICY "SuperAdmins pueden borrar actas" ON public.actas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE id = auth.uid() AND rol = 'superadmin'
        )
    );

-- VOTOS (Lectura pública)
CREATE POLICY "Votos son públicos para lectura" ON public.votos
    FOR SELECT USING (true);
-- VOTOS (Inserción solo admins/superadmins)
CREATE POLICY "Admins pueden insertar votos" ON public.votos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- El borrado de votos ocurre automáticamente en cascada al borrar un acta (ON DELETE CASCADE)

-- ==========================================
-- CONFIGURACIÓN DE REALTIME (WebSockets)
-- ==========================================
-- Esto permite que la página escuche cambios en vivo sin recargar
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.actas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votos;

-- ==========================================
-- INSERCIÓN DE DATOS INICIALES (SEEDS)
-- ==========================================
-- Insertar los 10 partidos políticos con sus respectivos colores hex
INSERT INTO public.partidos (nombre, sigla, color) VALUES
    ('Nuevas Ideas', 'NI', '#00A2D3'),
    ('Alianza Republicana Nacionalista', 'ARENA', '#003087'),
    ('Frente Farabundo Martí para la Liberación Nacional', 'FMLN', '#E3000F'),
    ('Gran Alianza por la Unidad Nacional', 'GANA', '#F4A900'),
    ('Nuestro Tiempo', 'NT', '#472F92'),
    ('Vamos', 'VAMOS', '#0072CE'),
    ('Cambio Democrático', 'CD', '#FFCD00'),
    ('Partido Demócrata Cristiano', 'PDC', '#00B259'),
    ('Partido de Concertación Nacional', 'PCN', '#0055A4'),
    ('Fuerza Solidaria', 'FS', '#0093D0');
