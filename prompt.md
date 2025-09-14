# QuestMaster App - 게이미피케이션 기반 AI 성장 스케줄러

## 제품 요구사항 문서 (PRD)

### 프로젝트 개요
제품명: QuestMaster - 게임화된 개인 스케줄러 앱
비전: 일상 업무와 목표를 RPG 게임처럼 만들어 생산성과 동기 부여를 높이는 개인용 앱

### 핵심 가치 제안
- 할 일을 퀘스트로, 습관을 일일 미션으로 변환
- 5개 능력치 시스템 (지능, 체력, 건강, 창의성, 사회성)
- 경험치, 레벨업, 아바타 커스터마이징으로 성취감 극대화

### 타겟 사용자 (페르소나)
**1차 타겟: 20-30대 자기계발 관심층**
- 목표 설정은 하지만 지속적 실행에 어려움
- 게임 요소에 친숙하고 성취감을 중요시함
- 개인 생산성 도구 사용 경험 있음

**김성장 페르소나 (24세, 취업준비생)**
- 웹소설, 웹툰, 게임 등 판타지 세계관 콘텐츠를 즐김
- 다양한 자기계발에 의지는 있으나 꾸준함 유지 어려움
- Todoist, Habitica 등 다양한 툴 사용 경험 있지만 한계 느낌

### 핵심 기능 (MVP)
1. 사용자 인증 시스템 (Supabase Auth 활용)
2. 퀘스트 관리 (CRUD 기본 기능)
3. 5가지 능력치 시스템 (지능/체력/건강/창의성/사회성)
4. 경험치 & 레벨링 시스템
5. 기본 아바타 시스템
6. 일일/주간 통계 대시보드

### 차별화 포인트
1. **개인화된 성장 서사**: 실제 목표와 게임적 성장을 연동
2. **AI 기반 지능형 비서**: 최적의 일정 추천 및 배치
3. **실질적 보상 연결**: 셀프 기프팅을 통한 현실적 보상

### 환경 요구사항
- **Node.js**: >=18.0.0
- **npm**: >=8.0.0
- **운영체제**: Windows, macOS, Linux

### 기술 스택
- **프론트엔드**: React 18.3.1 + TypeScript 5.6.2 + Vite 5.4.8
- **백엔드**: Supabase 2.45.4 (BaaS)
- **스타일링**: Tailwind CSS 3.4.13
- **폼 관리**: React Hook Form 7.53.0 + Zod 3.23.8
- **라우팅**: React Router DOM 6.26.2
- **아이콘**: Lucide React 0.445.0
- **유틸리티**: clsx 2.1.1, date-fns 4.1.0
- **배포**: Vercel (프론트엔드)

### 성공 지표 (현실적 KPI)
- 개인 사용자 50명 확보 (6개월 내)
- 퀘스트 완료율: 평균 60%
- 앱 사용 지속률: 7일 후 40%
- 기능별 오류율 5% 이하

### 데이터베이스 스키마

#### Users 테이블 (기본)
- id, email, username, level, total_exp 등

#### Quests 테이블
```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  ability_type VARCHAR(20) CHECK (ability_type IN ('intelligence', 'strength', 'health', 'creativity', 'social')),
  exp_reward INTEGER DEFAULT 10,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Habits 테이블
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  ability_type VARCHAR(20) CHECK (ability_type IN ('intelligence', 'strength', 'health', 'creativity', 'social')),
  frequency VARCHAR(20) DEFAULT 'daily',
  streak_count INTEGER DEFAULT 0,
  last_completed_at DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 핵심 게임 로직
```typescript
export const ABILITY_TYPES = ['intelligence', 'strength', 'health', 'creativity', 'social'] as const
export type AbilityType = typeof ABILITY_TYPES[number]

export const EXP_REWARDS = {
  easy: 10,
  medium: 25,
  hard: 50
} as const

export const LEVEL_UP_EXP = (level: number) => 100 * (level ** 1.2)
```

### 중요한 제약 조건
1. **모든 코드는 TypeScript로 작성**
2. **Tailwind CSS 3.4.13 사용** (현재 설정 버전 준수)
3. **Supabase RLS 정책 반드시 적용**
4. **반응형 디자인 필수** (모바일 우선)
5. **접근성 고려** (ARIA 라벨, 키보드 네비게이션)

### 코딩 스타일 가이드
1. **컴포넌트**: React Functional Components + Hooks 사용
2. **상태 관리**: React hooks (useState, useEffect, useReducer)
3. **폼**: React Hook Form + Zod validation 
4. **스타일**: Tailwind CSS utility classes
5. **타입**: TypeScript strict 모드 준수
6. **네이밍**: camelCase (변수/함수), PascalCase (컴포넌트)

### 개발 도구 및 빌드 설정
- **빌드 도구**: Vite 5.4.8
- **PostCSS**: 8.4.47
- **Autoprefixer**: 10.4.20
- **TypeScript**: 5.6.2 (strict 모드)
- **React Types**: @types/react 18.3.11, @types/react-dom 18.3.1

### API 설계 원칙
1. **Supabase REST API** 기본 사용
2. **실시간 업데이트** 필요시 Supabase Realtime 활용
3. **에러 핸들링** 모든 API 호출에 적용
4. **로딩 상태** 사용자 경험 개선
5. **오프라인 지원** 향후 고려사항