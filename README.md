# 🎮 QuestMaster - 게임화된 개인 스케줄러

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://questmaster-app.vercel.app)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.45.4-green)](https://supabase.com/)

## 🌟 소개

QuestMaster는 일상의 할 일과 습관을 RPG 게임처럼 만들어 생산성과 동기부여를 높이는 게이미피케이션 개인 스케줄러입니다.

### ✨ 주요 기능

- 🎯 **퀘스트 시스템**: 할 일을 재미있는 퀘스트로 변환
- 🏃‍♂️ **습관 트래커**: 일일 미션으로 습관 형성
- ⚡ **5가지 능력치**: 지능, 체력, 건강, 창의성, 사회성
- 🆙 **레벨링 시스템**: 경험치 획득으로 성장 실감
- 👤 **아바타 시스템**: 성취에 따른 아바타 언락
- 🏆 **업적 시스템**: 다양한 도전과제 달성
- 🌙 **다크모드**: 눈에 편한 테마 지원
- 📱 **반응형 UI**: 모든 디바이스 완벽 지원

## 🚀 라이브 데모

**🔗 [QuestMaster 체험하기](https://questmaster-app.vercel.app)**

## 🛠️ 기술 스택

### Frontend
- **React 18.3.1** - UI 라이브러리
- **TypeScript 5.6.2** - 타입 안전성
- **Vite 5.4.8** - 빌드 도구
- **Tailwind CSS 3.4.13** - 스타일링
- **React Router DOM** - 라우팅
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

### Backend
- **Supabase** - BaaS (Backend as a Service)
- **PostgreSQL** - 데이터베이스
- **Row Level Security** - 보안

### 배포
- **Vercel** - 호스팅 플랫폼
- **GitHub** - 버전 관리

## 🏗️ 아키텍처

```
src/
├── components/          # UI 컴포넌트
│   ├── auth/           # 인증 관련
│   ├── quests/         # 퀘스트 기능
│   ├── habits/         # 습관 관리
│   ├── avatar/         # 아바타 시스템
│   ├── achievements/   # 업적 시스템
│   └── ui/            # 공통 UI
├── hooks/              # 커스텀 훅
├── lib/                # 유틸리티
├── pages/              # 페이지 컴포넌트
└── styles/             # 스타일 파일
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.0.0 이상
- npm 8.0.0 이상

### 로컬 개발 환경 설정

1. **저장소 클론**
```bash
git clone https://github.com/yourusername/questmaster-app.git
cd questmaster-app
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# .env 파일 생성
cp .env.example .env

# Supabase 설정값 입력
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **개발 서버 실행**
```bash
npm run dev
```

5. **브라우저에서 확인**
- http://localhost:3000

### 빌드 및 배포

```bash
# 타입 검사
npm run type-check

# 프로덕션 빌드
npm run build

# 로컬에서 프로덕션 미리보기
npm run preview
```

## 🎮 사용법

### 1. 계정 생성
- 이메일로 회원가입
- 이메일 인증 완료

### 2. 퀘스트 생성
- "새 퀘스트" 버튼 클릭
- 제목, 설명, 난이도, 능력치 설정
- 마감일 설정 (선택)

### 3. 습관 추가
- "새 습관" 버튼 클릭
- 일일 미션으로 설정
- 매일 체크인으로 스트릭 쌓기

### 4. 성장 추적
- 대시보드에서 진행 상황 확인
- 능력치별 발전 모니터링
- 레벨업과 업적 달성 즐기기

## 📊 게임 시스템

### 능력치 시스템
- **지능 (Intelligence)**: 학습, 독서, 업무
- **체력 (Strength)**: 운동, 신체 활동
- **건강 (Health)**: 식단, 수면, 건강 관리
- **창의성 (Creativity)**: 창작, 예술, 아이디어
- **사회성 (Social)**: 인간관계, 소통, 네트워킹

### 경험치 & 레벨
- **쉬움**: 10 EXP
- **보통**: 25 EXP  
- **어려움**: 50 EXP
- **레벨업 공식**: `100 × (레벨 ^ 1.2)`

### 아바타 등급
1. **일반 (Common)** - 레벨 1+
2. **고급 (Rare)** - 레벨 10+
3. **영웅 (Epic)** - 레벨 25+
4. **전설 (Legendary)** - 레벨 50+
5. **신화 (Mythic)** - 레벨 100+

## 🏆 업적 시스템

### 카테고리별 업적
- 📋 **퀘스트 마스터**: 퀘스트 완료 관련
- 🔥 **습관의 힘**: 습관 스트릭 관련  
- ⬆️ **레벨 업**: 레벨링 관련
- ⚡ **능력치 전문가**: 특정 능력치 특화
- 🎯 **연속 달성**: 연속 완료 관련
- ⭐ **특별 업적**: 숨겨진 도전과제

## 🛡️ 보안

- **Row Level Security (RLS)** - 데이터 접근 제어
- **JWT 인증** - Supabase Auth 활용  
- **환경 변수 분리** - 민감한 정보 보호
- **HTTPS 강제** - 보안 연결 필수

## 🌐 브라우저 지원

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 📈 성능

- **Lighthouse 점수**: 90+ 목표
- **코드 스플리팅**: React.lazy 활용
- **이미지 최적화**: WebP 형식 지원
- **CDN 활용**: Vercel Edge Network

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork 진행
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 🐛 버그 리포트

버그를 발견했다면 [Issues](https://github.com/yourusername/questmaster-app/issues)에서 다음 정보와 함께 리포트해 주세요:

- 운영체제 및 브라우저 정보
- 재현 단계
- 예상 동작 vs 실제 동작
- 스크린샷 (가능한 경우)

## 📝 라이선스

이 프로젝트는 [MIT License](LICENSE)로 배포됩니다.

## 👥 팀

- **개발자**: QuestMaster Team
- **디자인**: Game UI/UX 전문가
- **기획**: 게이미피케이션 전문가

## 🙏 감사의 말

QuestMaster를 만들 수 있게 도움을 준 모든 오픈소스 프로젝트와 커뮤니티에 감사드립니다.

특별히 감사드리는 프로젝트들:
- [React](https://reactjs.org/) - 강력한 UI 라이브러리
- [Supabase](https://supabase.com/) - 훌륭한 백엔드 서비스
- [Tailwind CSS](https://tailwindcss.com/) - 생산적인 CSS 프레임워크
- [Lucide](https://lucide.dev/) - 아름다운 아이콘
- [Vercel](https://vercel.com/) - 완벽한 배포 플랫폼

## 📞 연락처

- 📧 Email: support@questmaster.app
- 🐦 Twitter: [@QuestMasterApp](https://twitter.com/QuestMasterApp)
- 💬 Discord: [QuestMaster Community](https://discord.gg/questmaster)

---

**QuestMaster로 당신의 일상을 모험으로 바꿔보세요!** 🎮✨
