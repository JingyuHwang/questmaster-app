@echo off
cd /d "C:\Users\Herr. Hwang\Documents\mcp\questmaster-app"

echo 🔍 TypeScript 타입 체크 재시도...
echo.

npm run type-check

if %errorlevel% equ 0 (
    echo.
    echo ✅ TypeScript 타입 체크 성공!
    echo 🎯 이제 업적 시스템 배포를 진행합니다...
    
    call deploy-achievements.bat
    
) else (
    echo.
    echo ❌ 아직 타입 오류가 있습니다.
    echo 💡 추가 수정이 필요합니다.
)

echo.
pause
