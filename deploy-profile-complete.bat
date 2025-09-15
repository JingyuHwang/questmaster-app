@echo off
cd /d "C:\Users\Herr. Hwang\Documents\mcp\questmaster-app"

echo.
echo =============================================================
echo    Profile Avatar System Complete Update
echo =============================================================
echo.

echo 🔍 TypeScript 타입 체크 중...
npm run type-check

if %errorlevel% equ 0 (
    echo ✅ TypeScript 체크 통과!
    echo.
    
    echo 📋 변경사항 확인:
    git status --short
    echo.
    
    echo ➕ 파일 스테이징:
    git add .
    
    echo 📝 커밋 생성:
    git commit -m "🎨 Complete Profile System: Avatar Persistence + Edit Feature

✨ Avatar System Fixes:
- Avatar equipment now saves to database permanently
- Selected avatars persist across page refreshes and navigation
- Real-time avatar updates with proper state management
- Fixed avatar selection not being saved issue

✨ Profile Edit Feature:
- Fully functional username editing system
- Input validation (max 20 characters, required field)
- Real-time UI updates with edit/cancel functionality
- Database integration with error handling
- Success/error toast notifications

🔧 Technical Improvements:
- Enhanced useAuth hook integration with refetch
- Proper state management for avatar selection
- Database updates for current_avatar_id field
- Form validation and user experience improvements

🎯 User Experience:
- Avatar changes are permanent until user manually changes
- Seamless editing experience with inline form
- Immediate feedback for all user actions
- Professional UI/UX for profile management

Profile system now fully functional!"
    
    echo 🚀 원격 저장소 푸시:
    git push
    
    if %errorlevel% equ 0 (
        echo.
        echo 🎉 =========================
        echo    배포 성공!
        echo =========================
        echo.
        echo ✅ Profile 시스템 완성!
        echo 🎨 아바타 영구 장착 구현
        echo ✏️  프로필 편집 기능 추가
        echo 💾 데이터베이스 연동 완료
        echo.
        echo 🔗 Vercel 자동 배포 진행중...
        echo    https://vercel.com/dashboard
        echo.
        echo 📋 배포 후 테스트:
        echo    1. 아바타 선택 후 다른 페이지 이동
        echo    2. 새로고침 후 아바타 유지 확인
        echo    3. 프로필 편집 버튼 클릭
        echo    4. 사용자명 변경 및 저장
        echo    5. 변경사항 즉시 반영 확인
        echo.
    ) else (
        echo ❌ Git 푸시 실패
    )
) else (
    echo ❌ TypeScript 오류 발견
)

echo.
echo 계속하려면 아무 키나 누르세요...
pause > nul
