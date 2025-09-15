@echo off
cd /d "C:\Users\Herr. Hwang\Documents\mcp\questmaster-app"

echo 🔍 TypeScript 타입 체크를 시작합니다...
echo.

npm run type-check

if %errorlevel% equ 0 (
    echo.
    echo ✅ TypeScript 타입 체크 통과!
    echo 🚀 Git 배포 과정을 진행합니다...
    echo.
    
    echo 📋 Git 상태 확인:
    git status --short
    echo.
    
    echo ➕ 변경사항을 스테이징에 추가:
    git add .
    echo.
    
    echo 📝 커밋 생성:
    git commit -m "🐛 Fix: Layout 컴포넌트 중복 사용 및 TypeScript 오류 해결

- Profile.tsx에서 Layout 중복 import 및 사용 제거
- Achievements.tsx에서 Layout 중복 import 및 사용 제거  
- return 문의 JSX 괄호 정렬 수정
- Navigation 바 이중 표시 문제 완전 해결
- TypeScript 컴파일 오류 해결

해결된 이슈: nav바가 이중으로 나오는 문제 및 TS 오류"
    echo.
    
    echo 🚀 원격 저장소에 푸시:
    git push
    echo.
    
    if %errorlevel% equ 0 (
        echo ✅ Git 푸시 완료!
        echo 📍 Vercel에서 자동 배포가 시작됩니다.
        echo 🔗 배포 상태 확인: https://vercel.com/dashboard
        echo.
        echo ⏳ 배포 완료까지 1-2분 정도 소요됩니다.
        echo 🎉 배포 완료 후 웹사이트를 새로고침하여 nav바 문제가 해결되었는지 확인하세요!
    ) else (
        echo ❌ Git 푸시가 실패했습니다.
    )
) else (
    echo.
    echo ❌ TypeScript 타입 오류가 있습니다. 수정 후 다시 시도해주세요.
)

echo.
pause
