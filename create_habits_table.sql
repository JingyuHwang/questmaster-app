-- QuestMaster habits 테이블 생성
-- 기존 users, quests 테이블이 있는 상태에서 habits 테이블만 추가

-- habits 테이블 생성
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  ability_type VARCHAR(20) CHECK (ability_type IN ('intelligence', 'strength', 'health', 'creativity', 'social')),
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  streak_count INTEGER DEFAULT 0,
  last_completed_at DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 활성화
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- 기본 RLS 정책 설정
CREATE POLICY "Users can manage their own habits" ON habits
FOR ALL USING (auth.uid() = user_id);

-- 업데이트 트리거 추가 (updated_at 컬럼은 없지만 나중에 추가할 수 있음)
-- habits 테이블에도 updated_at 컬럼 추가
ALTER TABLE habits ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- habits 테이블에 업데이트 트리거 적용 (기존 함수 재사용)
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 성능 최적화를 위한 인덱스 생성
CREATE INDEX idx_habits_user_active 
ON habits(user_id, is_active) 
WHERE is_active = true;

CREATE INDEX idx_habits_user_frequency 
ON habits(user_id, frequency, is_active) 
WHERE is_active = true;

CREATE INDEX idx_habits_user_date 
ON habits(user_id, last_completed_at) 
WHERE last_completed_at IS NOT NULL;
