-- QuestMaster 습관 완료 처리를 위한 Supabase RPC 함수
-- 이 함수는 습관 완료 시 트랜잭션으로 습관 업데이트와 사용자 경험치 업데이트를 처리합니다

CREATE OR REPLACE FUNCTION complete_habit(
  habit_id UUID,
  new_streak_count INTEGER,
  exp_reward INTEGER,
  ability_type TEXT,
  ability_bonus INTEGER,
  completion_date DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_val UUID;
BEGIN
  -- 습관 소유자 확인
  SELECT user_id INTO user_id_val
  FROM habits
  WHERE id = habit_id AND auth.uid() = user_id;

  -- 권한 확인
  IF user_id_val IS NULL THEN
    RAISE EXCEPTION 'Unauthorized or habit not found';
  END IF;

  -- 습관 완료 정보 업데이트
  UPDATE habits
  SET 
    streak_count = new_streak_count,
    last_completed_at = completion_date,
    updated_at = NOW()
  WHERE id = habit_id;

  -- 사용자 경험치 및 능력치 업데이트
  UPDATE users
  SET 
    total_exp = total_exp + exp_reward,
    intelligence = CASE WHEN ability_type = 'intelligence' THEN intelligence + ability_bonus ELSE intelligence END,
    strength = CASE WHEN ability_type = 'strength' THEN strength + ability_bonus ELSE strength END,
    health = CASE WHEN ability_type = 'health' THEN health + ability_bonus ELSE health END,
    creativity = CASE WHEN ability_type = 'creativity' THEN creativity + ability_bonus ELSE creativity END,
    social = CASE WHEN ability_type = 'social' THEN social + ability_bonus ELSE social END,
    level = FLOOR(SQRT(total_exp + exp_reward) / 10) + 1,
    updated_at = NOW()
  WHERE id = user_id_val;
END;
$$;

-- RPC 함수 권한 설정 (인증된 사용자만 실행 가능)
GRANT EXECUTE ON FUNCTION complete_habit TO authenticated;

-- 습관 완료 기록을 위한 테이블 생성 (선택사항 - 상세 기록이 필요한 경우)
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL,
  streak_at_completion INTEGER DEFAULT 0,
  exp_earned INTEGER DEFAULT 0,
  ability_bonus INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habit completions" ON habit_completions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit completions" ON habit_completions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date 
ON habit_completions(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_habits_user_active 
ON habits(user_id, is_active) 
WHERE is_active = true;
