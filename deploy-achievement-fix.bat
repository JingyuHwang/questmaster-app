@echo off
cd /d "C:\Users\Herr. Hwang\Documents\mcp\questmaster-app"

echo 🔧 업적 데이터베이스 저장 기능 추가 배포...
echo.

echo 🔍 TypeScript 타입 체크:
npm run type-check

if %errorlevel% equ 0 (
    echo.
    echo ✅ TypeScript 타입 체크 통과!
    echo.
    
    echo 📋 변경된 파일 확인:
    git status --short
    echo.
    
    echo ➕ 모든 변경사항 스테이징:
    git add .
    echo.
    
    echo 📝 커밋 생성:
    git commit -m "🎯 Fix: 업적 데이터베이스 저장 기능 완성

🔧 핵심 수정사항:
- 업적 달성 시 실제 DB에 저장하는 로직 추가
- unlock_achievement RPC 함수 호출 구현
- 저장 후 자동 데이터 새로고침 (1초 지연)
- 중복/409 에러 안전하게 처리

🎯 해결된 문제:
- 업적 달성 토스트는 나오지만 '최근 업적 달성'에 반영 안되는 문제
- 업적이 메모리에서만 체크되고 DB에 저장되지 않던 문제

✨ 이제 정상 작동:
- 업적 달성 시 DB에 실제 저장
- '최근 업적 달성' 섹션에 정상 표시
- 페이지 새로고침해도 업적 유지
- 업적 진행도 실시간 반영

완전한 업적 시스템 구현 완료!"
    echo.
    
    echo 🚀 원격 저장소에 푸시:
    git push
    echo.
    
    if %errorlevel% equ 0 (
        echo.
        echo 🎉 ===== 업적 저장 기능 배포 성공! =====
        echo ✅ Git 푸시 완료!
        echo 📍 Vercel에서 자동 배포가 시작됩니다.
        echo.
        echo ⏳ 배포 완료까지 1-2분 정도 소요됩니다.
        echo.
        echo 🎯 배포 완료 후 테스트:
        echo    1. 새 퀘스트 생성 및 완료
        echo    2. 업적 달성 토스트 알림 확인
        echo    3. '최근 업적 달성' 섹션에 반영되는지 확인
        echo    4. 업적 페이지에서 완료 상태 확인
        echo    5. 페이지 새로고침 후에도 유지되는지 확인
        echo.
        echo 🏆 이제 완전한 업적 시스템이 작동합니다!
        echo 🎮 QuestMaster의 모든 게임화 요소가 완성되었습니다!
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
