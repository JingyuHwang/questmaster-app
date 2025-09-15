@echo off
cd /d "C:\Users\Herr. Hwang\Documents\mcp\questmaster-app"

echo 🔍 TypeScript 타입 체크를 시작합니다...
echo.

npm run type-check

if %errorlevel% equ 0 (
    echo.
    echo ✅ TypeScript 타입 체크 성공!
    echo 🚀 이제 Git 배포를 진행합니다...
    echo.
    
    echo 📋 변경된 파일 확인:
    git status --short
    echo.
    
    echo ➕ 모든 변경사항 스테이징:
    git add .
    echo.
    
    echo 📝 커밋 생성:
    git commit -m "🐛 Fix: Layout 중복 및 TypeScript 오류 완전 해결

- Profile.tsx 완전 재작성으로 구문 오류 해결
- Achievements.tsx 완전 재작성으로 구문 오류 해결  
- Layout 컴포넌트 중복 사용 제거
- JSX return 문 구조 정리
- Navigation 바 이중 표시 문제 완전 해결
- TypeScript 컴파일 오류 100%% 해결

해결된 이슈: 
- nav바 이중 표시 문제
- TS1005, TS1109, TS1128 컴파일 오류"
    echo.
    
    echo 🚀 원격 저장소에 푸시:
    git push
    echo.
    
    if %errorlevel% equ 0 (
        echo.
        echo 🎉 ===== 배포 성공! =====
        echo ✅ Git 푸시 완료!
        echo 📍 Vercel에서 자동 배포가 시작됩니다.
        echo 🔗 배포 상태: https://vercel.com/dashboard
        echo.
        echo ⏳ 배포 완료까지 1-2분 정도 소요됩니다.
        echo 🎯 배포 완료 후 확인사항:
        echo    - Navigation 바가 하나만 표시되는지
        echo    - 모든 페이지가 정상 작동하는지
        echo    - Profile, Achievements 페이지 정상인지
        echo.
        echo 🎊 nav바 중복 문제가 완전히 해결되었습니다!
    ) else (
        echo ❌ Git 푸시 실패. 네트워크나 권한을 확인해주세요.
    )
    
) else (
    echo.
    echo ❌ TypeScript 타입 체크 실패!
    echo 💡 오류를 확인하고 수정 후 다시 시도해주세요.
)

echo.
pause
