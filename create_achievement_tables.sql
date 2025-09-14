-- 업적 시스템 테이블 생성

-- achievements 테이블 (업적 마스터 데이터)
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  condition_type VARCHAR(20) NOT NULL,
  condition_value INTEGER NOT NULL,
  ability_type VARCHAR(20),
  reward_exp INTEGER DEFAULT 0,
  rarity VARCHAR(20) DEFAULT 'common',
  unlock_message TEXT,
  category VARCHAR(20) DEFAULT 'progress',
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_achievements 테이블 (사용자 업적 달성 기록)
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, achievement_id)
);

-- RLS 정책 설정
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- achievements는 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read achievements" ON achievements
  FOR SELECT USING (true);

-- user_achievements는 본인만 관리 가능
CREATE POLICY "Users can manage their own achievements" ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

-- 업적 달성 함수
CREATE OR REPLACE FUNCTION unlock_achievement(
  p_user_id UUID,
  p_achievement_id VARCHAR(50),
  p_progress INTEGER DEFAULT 100
)
RETURNS JSONB AS $$
DECLARE
  v_achievement achievements%ROWTYPE;
  v_existing user_achievements%ROWTYPE;
  v_result JSONB;
BEGIN
  -- 업적 정보 가져오기
  SELECT * INTO v_achievement FROM achievements WHERE id = p_achievement_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Achievement not found'
    );
  END IF;
  
  -- 이미 달성된 업적인지 확인
  SELECT * INTO v_existing 
  FROM user_achievements 
  WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
  
  IF FOUND AND v_existing.is_completed THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Achievement already completed'
    );
  END IF;
  
  -- 업적 달성 기록 또는 업데이트
  INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed)
  VALUES (p_user_id, p_achievement_id, p_progress, p_progress >= 100)
  ON CONFLICT (user_id, achievement_id) 
  DO UPDATE SET 
    progress = GREATEST(user_achievements.progress, p_progress),
    is_completed = (GREATEST(user_achievements.progress, p_progress) >= 100),
    unlocked_at = CASE 
      WHEN GREATEST(user_achievements.progress, p_progress) >= 100 AND NOT user_achievements.is_completed 
      THEN NOW() 
      ELSE user_achievements.unlocked_at 
    END;
  
  -- 경험치 보상 지급 (완료 시만)
  IF p_progress >= 100 THEN
    UPDATE users 
    SET total_exp = total_exp + v_achievement.reward_exp
    WHERE id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'achievement', jsonb_build_object(
      'id', v_achievement.id,
      'title', v_achievement.title,
      'description', v_achievement.description,
      'icon', v_achievement.icon,
      'reward_exp', v_achievement.reward_exp,
      'unlock_message', v_achievement.unlock_message
    ),
    'progress', p_progress,
    'is_new_completion', p_progress >= 100 AND (v_existing.progress IS NULL OR v_existing.progress < 100)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 업적 진행도 업데이트 함수
CREATE OR REPLACE FUNCTION update_achievement_progress(
  p_user_id UUID,
  p_achievement_id VARCHAR(50),
  p_progress INTEGER
)
RETURNS JSONB AS $$
BEGIN
  -- 기존 progress보다 높을 때만 업데이트
  INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed)
  VALUES (p_user_id, p_achievement_id, p_progress, p_progress >= 100)
  ON CONFLICT (user_id, achievement_id) 
  DO UPDATE SET 
    progress = GREATEST(user_achievements.progress, p_progress),
    is_completed = (GREATEST(user_achievements.progress, p_progress) >= 100),
    unlocked_at = CASE 
      WHEN GREATEST(user_achievements.progress, p_progress) >= 100 AND NOT user_achievements.is_completed 
      THEN NOW() 
      ELSE user_achievements.unlocked_at 
    END
  WHERE user_achievements.progress < p_progress;
  
  RETURN jsonb_build_object('success', true);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 업적 통계 조회 함수
CREATE OR REPLACE FUNCTION get_user_achievement_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_achievements INTEGER;
  v_completed_achievements INTEGER;
  v_total_exp_from_achievements INTEGER;
  v_completion_rate DECIMAL;
  v_stats JSONB;
BEGIN
  -- 전체 업적 수
  SELECT COUNT(*) INTO v_total_achievements FROM achievements;
  
  -- 완료한 업적 수
  SELECT COUNT(*) INTO v_completed_achievements 
  FROM user_achievements 
  WHERE user_id = p_user_id AND is_completed = true;
  
  -- 업적으로 얻은 총 경험치
  SELECT COALESCE(SUM(a.reward_exp), 0) INTO v_total_exp_from_achievements
  FROM user_achievements ua
  JOIN achievements a ON ua.achievement_id = a.id
  WHERE ua.user_id = p_user_id AND ua.is_completed = true;
  
  -- 완료율 계산
  v_completion_rate := CASE 
    WHEN v_total_achievements > 0 THEN (v_completed_achievements::DECIMAL / v_total_achievements) * 100
    ELSE 0
  END;
  
  -- 카테고리별 통계
  SELECT jsonb_object_agg(
    category,
    jsonb_build_object(
      'total', total_count,
      'completed', completed_count,
      'completion_rate', CASE WHEN total_count > 0 THEN (completed_count::DECIMAL / total_count) * 100 ELSE 0 END
    )
  ) INTO v_stats
  FROM (
    SELECT 
      a.category,
      COUNT(*) as total_count,
      COUNT(ua.achievement_id) FILTER (WHERE ua.is_completed = true) as completed_count
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = p_user_id
    GROUP BY a.category
  ) category_stats;
  
  RETURN jsonb_build_object(
    'total_achievements', v_total_achievements,
    'completed_achievements', v_completed_achievements,
    'completion_rate', v_completion_rate,
    'total_exp_earned', v_total_exp_from_achievements,
    'category_stats', v_stats
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 자동 업적 체크 함수 (퀘스트/습관 완료 시 호출)
CREATE OR REPLACE FUNCTION check_and_update_achievements(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user users%ROWTYPE;
  v_quest_count INTEGER;
  v_max_streak INTEGER;
  v_new_achievements JSONB := '[]'::JSONB;
  v_achievement RECORD;
  v_progress INTEGER;
  v_unlock_result JSONB;
BEGIN
  -- 사용자 정보 가져오기
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  
  -- 완료된 퀘스트 수
  SELECT COUNT(*) INTO v_quest_count
  FROM quests WHERE user_id = p_user_id AND status = 'completed';
  
  -- 최대 스트릭
  SELECT COALESCE(MAX(streak_count), 0) INTO v_max_streak
  FROM habits WHERE user_id = p_user_id;
  
  -- 각 업적 조건 체크
  FOR v_achievement IN 
    SELECT * FROM achievements 
    WHERE id NOT IN (
      SELECT achievement_id FROM user_achievements 
      WHERE user_id = p_user_id AND is_completed = true
    )
  LOOP
    v_progress := 0;
    
    -- 조건별 진행도 계산
    CASE v_achievement.condition_type
      WHEN 'quest_count' THEN
        v_progress := LEAST((v_quest_count * 100.0 / v_achievement.condition_value)::INTEGER, 100);
      WHEN 'level' THEN
        v_progress := LEAST((v_user.level * 100.0 / v_achievement.condition_value)::INTEGER, 100);
      WHEN 'ability_level' THEN
        CASE v_achievement.ability_type
          WHEN 'intelligence' THEN v_progress := LEAST((v_user.intelligence * 100.0 / v_achievement.condition_value)::INTEGER, 100);
          WHEN 'strength' THEN v_progress := LEAST((v_user.strength * 100.0 / v_achievement.condition_value)::INTEGER, 100);
          WHEN 'health' THEN v_progress := LEAST((v_user.health * 100.0 / v_achievement.condition_value)::INTEGER, 100);
          WHEN 'creativity' THEN v_progress := LEAST((v_user.creativity * 100.0 / v_achievement.condition_value)::INTEGER, 100);
          WHEN 'social' THEN v_progress := LEAST((v_user.social * 100.0 / v_achievement.condition_value)::INTEGER, 100);
        END CASE;
      WHEN 'streak' THEN
        v_progress := LEAST((v_max_streak * 100.0 / v_achievement.condition_value)::INTEGER, 100);
      WHEN 'total_exp' THEN
        v_progress := LEAST((v_user.total_exp * 100.0 / v_achievement.condition_value)::INTEGER, 100);
      WHEN 'special' THEN
        -- 특별 업적은 별도 처리 (앱에서 체크)
        CONTINUE;
      ELSE
        CONTINUE;
    END CASE;
    
    -- 진행도 업데이트 (변화가 있을 때만)
    IF v_progress > 0 THEN
      SELECT unlock_achievement(p_user_id, v_achievement.id, v_progress) INTO v_unlock_result;
      
      -- 새로 완료된 업적이면 결과에 추가
      IF (v_unlock_result->>'success')::BOOLEAN AND (v_unlock_result->>'is_new_completion')::BOOLEAN THEN
        v_new_achievements := v_new_achievements || jsonb_build_array(v_unlock_result->'achievement');
      END IF;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'new_achievements', v_new_achievements
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(user_id, is_completed) WHERE is_completed = true;
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);

-- 기본 업적 데이터 삽입 함수
CREATE OR REPLACE FUNCTION insert_default_achievements()
RETURNS void AS $$
BEGIN
  -- 기본 업적들 삽입
  INSERT INTO achievements VALUES
    ('first_steps', '첫 걸음', '첫 번째 퀘스트를 완료하세요', '🎯', 'quest_count', 1, NULL, 50, 'common', '🎉 QuestMaster 여정이 시작되었습니다!', 'progress', false),
    ('quest_hunter', '퀘스트 헌터', '퀘스트 10개를 완료하세요', '🏹', 'quest_count', 10, NULL, 100, 'common', '🏹 진정한 퀘스트 헌터가 되었습니다!', 'progress', false),
    ('quest_master', '퀘스트 마스터', '퀘스트 50개를 완료하세요', '🎖️', 'quest_count', 50, NULL, 300, 'rare', '🎖️ 퀘스트 마스터의 칭호를 얻었습니다!', 'progress', false),
    ('quest_legend', '퀘스트 레전드', '퀘스트 100개를 완료하세요', '🏆', 'quest_count', 100, NULL, 500, 'epic', '🏆 전설적인 퀘스트 수행자가 되었습니다!', 'progress', false),
    ('level_up_5', '신예 모험가', '레벨 5에 도달하세요', '⭐', 'level', 5, NULL, 100, 'common', '⭐ 신예 모험가가 되었습니다!', 'progress', false),
    ('level_up_10', '숙련된 모험가', '레벨 10에 도달하세요', '🌟', 'level', 10, NULL, 200, 'rare', '🌟 숙련된 모험가로 성장했습니다!', 'progress', false),
    ('level_up_25', '베테랑 모험가', '레벨 25에 도달하세요', '💫', 'level', 25, NULL, 500, 'epic', '💫 베테랑 모험가의 경지에 도달했습니다!', 'progress', false),
    ('intelligence_master', '지혜의 현자', '지능을 100까지 올리세요', '🧠', 'ability_level', 100, 'intelligence', 300, 'rare', '🧠 지혜의 현자가 되었습니다!', 'mastery', false),
    ('strength_champion', '힘의 용사', '체력을 100까지 올리세요', '💪', 'ability_level', 100, 'strength', 300, 'rare', '💪 힘의 용사가 되었습니다!', 'mastery', false),
    ('health_guardian', '생명의 수호자', '건강을 100까지 올리세요', '🌿', 'ability_level', 100, 'health', 300, 'rare', '🌿 생명의 수호자가 되었습니다!', 'mastery', false),
    ('creativity_artist', '창조의 예술가', '창의성을 100까지 올리세요', '🎨', 'ability_level', 100, 'creativity', 300, 'rare', '🎨 창조의 예술가가 되었습니다!', 'mastery', false),
    ('social_diplomat', '소통의 달인', '사회성을 100까지 올리세요', '🤝', 'ability_level', 100, 'social', 300, 'rare', '🤝 소통의 달인이 되었습니다!', 'mastery', false),
    ('streak_warrior', '연속의 전사', '7일 연속 습관을 완료하세요', '🔥', 'streak', 7, NULL, 150, 'common', '🔥 연속의 전사가 되었습니다!', 'dedication', false),
    ('streak_master', '불굴의 의지', '30일 연속 습관을 완료하세요', '🔥', 'streak', 30, NULL, 400, 'epic', '🔥 불굴의 의지를 보여주었습니다!', 'dedication', false),
    ('streak_legend', '전설의 꾸준함', '100일 연속 습관을 완료하세요', '🔥', 'streak', 100, NULL, 1000, 'legendary', '🔥 전설적인 꾸준함을 달성했습니다!', 'dedication', false),
    ('perfectionist', '완벽주의자', '모든 능력치를 100까지 올리세요', '✨', 'special', 1, NULL, 1000, 'legendary', '✨ 완벽의 경지에 도달했습니다!', 'special', false),
    ('exp_collector', '경험치 수집가', '총 10,000 경험치를 획득하세요', '💎', 'total_exp', 10000, NULL, 500, 'epic', '💎 경험치 수집의 달인이 되었습니다!', 'special', false),
    ('early_bird', '새벽형 인간', '오전 6시 전에 퀘스트를 완료하세요', '🌅', 'special', 1, NULL, 100, 'rare', '🌅 새벽형 인간이 되었습니다!', 'special', true),
    ('night_owl', '올빼미형 인간', '오후 10시 이후에 퀘스트를 완료하세요', '🦉', 'special', 1, NULL, 100, 'rare', '🦉 올빼미형 인간이 되었습니다!', 'special', true)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 기본 업적 데이터 삽입 실행
SELECT insert_default_achievements();

-- 코멘트 추가
COMMENT ON TABLE achievements IS '업적 마스터 데이터 테이블';
COMMENT ON TABLE user_achievements IS '사용자별 업적 달성 기록 테이블';
COMMENT ON FUNCTION unlock_achievement IS '업적 달성 처리 함수';
COMMENT ON FUNCTION check_and_update_achievements IS '자동 업적 체크 및 업데이트 함수';
COMMENT ON FUNCTION get_user_achievement_stats IS '사용자 업적 통계 조회 함수';