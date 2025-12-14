#!/bin/sh
# ============================================================
# PRE-COMMIT HOOK: Verificar sincronización v6.0/ → docs/
# ============================================================
# Este hook advierte si hay diferencias entre v6.0/ y docs/
# en archivos críticos antes de hacer commit.
#
# Para instalar: cp pre-commit-check.sh .git/hooks/pre-commit
# ============================================================

echo "🔍 Verificando sincronización v6.0/ → docs/..."

# Archivos críticos a verificar
CRITICAL_FILES="index.html service-worker.js manifest.json"

DESYNC=0

for file in $CRITICAL_FILES; do
    if [ -f "v6.0/$file" ] && [ -f "docs/$file" ]; then
        if ! diff -q "v6.0/$file" "docs/$file" > /dev/null 2>&1; then
            echo "⚠️  DESINCRONIZADO: $file"
            DESYNC=1
        fi
    fi
done

if [ $DESYNC -eq 1 ]; then
    echo ""
    echo "============================================================"
    echo "⚠️  ADVERTENCIA: Archivos desincronizados entre v6.0/ y docs/"
    echo "============================================================"
    echo ""
    echo "Ejecuta: .\\sync-to-docs.ps1"
    echo "O copia manualmente los archivos modificados."
    echo ""
    echo "¿Continuar con el commit de todos modos? (s/N)"
    read -r response
    if [ "$response" != "s" ] && [ "$response" != "S" ]; then
        echo "❌ Commit cancelado. Sincroniza primero."
        exit 1
    fi
fi

echo "✅ Verificación completada"
exit 0
