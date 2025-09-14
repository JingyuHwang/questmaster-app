-- 아바타 관련 테이블 생성

-- user_avatars 테이블 (사용자가 언락한 아바타들)
CREATE TABLE IF NOT EXISTS user_avatars (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  avatar_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, avatar_id)
);

-- RLS 정책 설정
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own avatars" ON user_avatars
  FOR ALL USING (auth.uid() = user_id);

-- users 테이블에 current_avatar_id 컬럼 추가 (이미 있다면 무시)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'current_avatar_id'
  ) THEN
    ALTER TABLE users ADD COLUMN current_avatar_id VARCHAR(50);
  END IF;
END $$;

-- 아바타 장착 함수
CREATE OR REPLACE FUNCTION equip_avatar(
  p_user_id UUID,
  p_avatar_id VARCHAR(50)
)
RETURNS void AS $$
BEGIN
  -- 해당 사용자의 모든 아바타를 장착 해제
  UPDATE user_avatars 
  SET is_equipped = FALSE 
  WHERE user_id = p_user_id;
  
  -- 선택한 아바타를 장착
  UPDATE user_avatars 
  SET is_equipped = TRUE 
  WHERE user_id = p_user_id AND avatar_id = p_avatar_id;
  
  -- users 테이블의 current_avatar_id 업데이트
  UPDATE users 
  SET current_avatar_id = p_avatar_id 
  WHERE id = p_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to equip avatar: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 아바타 언락 함수 (조건 체크 포함)
CREATE OR REPLACE FUNCTION unlock_avatar(
  p_user_id UUID,
  p_avatar_id VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
  v_user users%ROWTYPE;
  v_result JSONB;
  v_is_first_avatar BOOLEAN;
BEGIN
  -- 사용자 정보 가져오기
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "User not found"}'::JSONB;
  END IF;
  
  -- 이미 언락된 아바타인지 확인
  IF EXISTS (
    SELECT 1 FROM user_avatars 
    WHERE user_id = p_user_id AND avatar_id = p_avatar_id
  ) THEN
    RETURN '{"success": false, "error": "Avatar already unlocked"}'::JSONB;
  END IF;
  
  -- 첫 번째 아바타인지 확인
  SELECT NOT EXISTS (
    SELECT 1 FROM user_avatars WHERE user_id = p_user_id
  ) INTO v_is_first_avatar;
  
  -- 아바타 언락
  INSERT INTO user_avatars (user_id, avatar_id, is_equipped)
  VALUES (p_user_id, p_avatar_id, v_is_first_avatar);
  
  -- 첫 번째 아바타인 경우 users 테이블도 업데이트
  IF v_is_first_avatar THEN
    UPDATE users 
    SET current_avatar_id = p_avatar_id 
    WHERE id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'avatar_id', p_avatar_id,
    'is_first', v_is_first_avatar
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 통계 조회 함수 (아바타 언락 조건 체크용)
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user users%ROWTYPE;
  v_quest_count INTEGER;
  v_max_streak INTEGER;
  v_result JSONB;
BEGIN
  -- 사용자 기본 정보
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  
  -- 완료된 퀘스트 수
  SELECT COUNT(*) INTO v_quest_count
  FROM quests 
  WHERE user_id = p_user_id AND status = 'completed';
  
  -- 최대 습관 스트릭
  SELECT COALESCE(MAX(streak_count), 0) INTO v_max_streak
  FROM habits 
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'level', v_user.level,
    'total_exp', v_user.total_exp,
    'intelligence', v_user.intelligence,
    'strength', v_user.strength,
    'health', v_user.health,
    'creativity', v_user.creativity,
    'social', v_user.social,
    'completed_quests', v_quest_count,
    'max_streak', v_max_streak
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN '{"error": "Failed to get user stats"}'::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_equipped ON user_avatars(user_id, is_equipped) WHERE is_equipped = true;

-- 기본 아바타 데이터 삽입 (선택사항 - 앱에서 처리할 수도 있음)
COMMENT ON TABLE user_avatars IS '사용자가 언락한 아바타 정보를 저장하는 테이블';
COMMENT ON FUNCTION equip_avatar IS '아바타 장착 처리 함수';
COMMENT ON FUNCTION unlock_avatar IS '아바타 언락 처리 함수';
COMMENT ON FUNCTION get_user_stats IS '아바타 언락 조건 체크를 위한 사용자 통계 조회 함수';