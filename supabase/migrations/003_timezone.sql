-- TresMeses - Agregar zona horaria al perfil de usuario
-- Ejecutar en Supabase SQL Editor

alter table users
  add column if not exists timezone text not null default 'America/Lima';
