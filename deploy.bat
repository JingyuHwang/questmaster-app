@echo off
echo 🚀 QuestMaster 프로덕션 배포를 시작합니다...

echo.
echo 📋 1단계: 타입 체크
call npm run type-check
if %errorlevel% neq 0 (
    echo ❌ TypeScript 타입 오류가 있습니다. 배포를 중단합니다.
    pause
    exit /b 1
)

echo.
echo 🧹 2단계: 기존 빌드 파일 정리
call npm run clean

echo.
echo 🏗️ 3단계: 프로덕션 빌드
call npm run build:prod
if %errorlevel% neq 0 (
    echo ❌ 빌드가 실패했습니다. 배포를 중단합니다.
    pause
    exit /b 1
)

echo.
echo ✅ 빌드 완료! Vercel에 자동 배포됩니다.
echo 📍 배포 상태는 Vercel 대시보드에서 확인하세요.
echo.
pause
