# Reporte de pruebas – Mi Asistente de Ubicación
**Alumno:** Carlos Manuel Pech Medina · **Grupo:** 10C · **Fecha:** ____

## Dispositivos
| | Dispositivo 1 | Dispositivo 2 |
|---|---|---|
| Equipo / modelo | | |
| Sistema operativo | | |
| Navegador y versión | | |
| Tamaño de pantalla | | |
| URL probada (HTTPS) | | |

## Casos de prueba (Aprobó ✔ / Falló ✘)
| # | Caso | Resultado esperado | Disp. 1 | Disp. 2 | Evidencia |
|---|---|---|---|---|---|
| 1 | Primer acceso | Aviso de privacidad; no se piden permisos hasta aceptar | | | Captura 1 |
| 2 | Obtener ubicación (permitir) | Marcador en el mapa, lat/lng y precisión | | | Captura 2 |
| 3 | Ubicación denegada | Mensaje claro con instrucciones; app sigue operativa | | | Captura 3 |
| 4 | Abrir cámara (permitir) | Video en vivo | | | Captura 4 |
| 5 | Tomar foto | Vista previa de la foto | | | Captura 5 |
| 6 | Cámara denegada | Mensaje y alternativa por selección de archivo | | | Captura 6 |
| 7 | Guardar registro | Aparece en lista y marcador en mapa | | | Captura 7 |
| 8 | Persistencia | Tras recargar siguen los registros (IndexedDB, DevTools > Application) | | | Captura 8 |
| 9 | Diseño adaptable | Se ve bien en vertical, horizontal y escritorio | | | Capturas 9–10 |
| 10 | Instalación PWA | Se puede instalar y abre en modo standalone | | | Captura 11 |
| 11 | Sin conexión | La app abre sin red (el mapa puede no cargar mosaicos) | | | Captura 12 |
| 12 | Eliminar un registro / borrar todo | Se eliminan datos y fotos | | | Captura 13 |

## Observaciones y problemas
...

## Conclusiones
...
