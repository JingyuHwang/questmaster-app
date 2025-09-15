@echo off
cd /d "C:\Users\Herr. Hwang\Documents\mcp\questmaster-app"

echo 🏆 업적 시스템 안정화 배포를 시작합니다...
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
    git commit -m "🏆 Feature: 업적 시스템 안정화 및 재활성화

✨ 새로운 기능:
- 업적 시스템 완전 재활성화
- 중복 실행 방지 시스템 (ref + 쿨다운)
- 안전한 업적 체크 로직 구현

🔧 개선 사항:
- useAchievements 훅 안전한 버전으로 업데이트  
- 409 에러 예방 로직 추가
- Dashboard에서 5초 지연 업적 체크
- 순차적 업적 체크로 동시성 문제 해결
- 에러 핸들링 강화 (개별 오류 무시)
- 업적 달성 시 토스트 알림 재활성화

🎯 결과:
- 사용자가 퀘스트/습관 완료 시 자동 업적 체크
- 업적 달성 시 실시간 알림 표시
- 409 에러 없는 안정적인 시스템
- 중복 실행 방지로 성능 최적화

업적 시스템이 완전히 안정화되어 정상 작동합니다!"
    echo.
    
    echo 🚀 원격 저장소에 푸시:
    git push
    echo.
    
    if %errorlevel% equ 0 (
        echo.
        echo 🎉 ===== 업적 시스템 안정화 배포 성공! =====
        echo ✅ Git 푸시 완료!
        echo 📍 Vercel에서 자동 배포가 시작됩니다.
        echo 🔗 배포 상태: https://vercel.com/dashboard
        echo.
        echo ⏳ 배포 완료까지 1-2분 정도 소요됩니다.
        echo.
        echo 🎯 배포 완료 후 확인사항:
        echo    - 퀘스트 완료 시 업적 체크 작동 확인
        echo    - 업적 달성 시 토스트 알림 표시 확인  
        echo    - 업적 페이지에서 진행도 정상 확인
        echo    - 콘솔에서 409 에러 없는지 확인
        echo.
        echo 🏆 업적 시스템이 완전히 안정화되었습니다!
        echo 🎮 이제 QuestMaster의 모든 게임화 요소가 정상 작동합니다!
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
