@echo off
cd /d "%~dp0"
echo.
echo ====================================
echo  SERVIDOR HTTP - APP INVENTARIO
echo ====================================
echo.
echo Directorio: %CD%
echo Puerto: 8001
echo URL: http://localhost:8001/inventario_v6.0_portable.html
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
python -m http.server 8001
pause
