Convenciones de Commits y Ramas

Formato de commit (simplificado estilo Conventional Commits)
- tipo(opcional:alcance): descripción corta en minúsculas
- Cuerpo (opcional): por qué y qué cambió
- Footer (opcional): referencias a issues/PRs

Tipos recomendados
- feat: nueva funcionalidad
- fix: corrección de bug
- chore: tareas de mantenimiento (build, tooling, configs)
- docs: documentación
- refactor: cambios internos sin modificar comportamiento
- style: formato/lint (sin cambios funcionales)
- test: pruebas añadidas/ajustadas
- perf: mejoras de rendimiento
- ci: pipelines/configuración de CI

Ejemplos
- feat(backend): esqueleto de proyecto spring boot
- fix(frontend): manejo de error en fetch
- docs: añade guía de configuración local

Ramas
- main: rama estable para producción
- dev: rama de integración (pre-merge a main)
- feature/*: desarrollo de funcionalidades (ej. feature/drops-checkout)
- fix/*: correcciones específicas (ej. fix/cobrado-depositado)
- chore/*: tareas generales (ej. chore/ci-cache)

Pull Requests
- Título alineado a la convención de commits
- Describir alcance, motivación y notas de prueba

