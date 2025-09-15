#!/bin/bash

echo "🚀 QuestMaster Git 배포 과정을 시작합니다..."
echo ""

echo "📋 1단계: 현재 위치 확인"
pwd
echo ""

echo "📋 2단계: Git 상태 확인"
git status
echo ""

echo "➕ 3단계: 모든 변경사항을 스테이징 영역에 추가"
git add .
echo ""

echo "📊 4단계: 스테이징된 파일 확인"
git status --short
echo ""

echo "📝 5단계: 변경사항 커밋"
git commit -m "🐛 Fix: Layout 컴포넌트 중복 사용 문제 해결

- Profile.tsx에서 Layout 중복 import 및 사용 제거
- Achievements.tsx에서 Layout 중복 import 및 사용 제거  
- Navigation 바 이중 표시 문제 완전 해결
- App.tsx에서 이미 Layout으로 감싸고 있어서 페이지별 Layout 불필요

해결된 이슈: nav바가 이중으로 나오는 문제"
echo ""

echo "🚀 6단계: 원격 저장소에 푸시"
git push
echo ""

echo "✅ Git 푸시 완료!"
echo "📍 Vercel에서 자동 배포가 시작됩니다."
echo "🔗 배포 상태: https://vercel.com/dashboard"
echo ""
echo "⏳ 배포 완료까지 1-2분 정도 소요됩니다."
