-- ====================================================================
-- オケカン / リハクル データベーススキーマ (Supabase / PostgreSQL)
-- ====================================================================

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. Profiles (ユーザープロフィール情報)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    part TEXT NOT NULL, -- 主担当パート (e.g. 'Violin', 'Flute', 'Oboe', 'Trumpet', 'Timpani')
    instruments_owned TEXT[] DEFAULT '{}', -- 所有楽器・特殊管 (e.g. ['A管クラリネット', 'バスクラリネット', 'イングリッシュホルン'])
    has_car BOOLEAN DEFAULT FALSE, -- 車出し可否
    teachers TEXT DEFAULT '', -- 師事情報 (e.g. '〇〇先生, △△先生')
    past_conductors TEXT[] DEFAULT '{}', -- 過去共演指揮者 (e.g. ['山田太郎', '佐藤花子'])
    is_pro BOOLEAN DEFAULT FALSE, -- プロ/アマ区分 (TRUE: プロ, FALSE: アマチュア)
    bio TEXT DEFAULT '',
    stripe_customer_id TEXT,
    stripe_connect_account_id TEXT, -- Stripe Connect ID（エキストラ謝礼受取用）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 2. Groups (団体情報)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- 団体名 (e.g. '新交響楽団', '〇〇市民吹奏楽団')
    group_type TEXT NOT NULL CHECK (group_type IN ('orchestra', 'wind_band', 'chamber', 'other')), -- 団体種別
    description TEXT DEFAULT '',
    logo_url TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 2.1. Group Members (団員・メンバー所属情報)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    part TEXT NOT NULL, -- 団内での担当パート
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- --------------------------------------------------------------------
-- 3. Schedules (練習・本番スケジュール)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- 行事名・練習名 (e.g. '第20回定期演奏会 第4回全合奏')
    event_type TEXT NOT NULL DEFAULT 'practice' CHECK (event_type IN ('practice', 'performance', 'section_practice', 'other')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL DEFAULT '', -- 練習場所 / 演奏会場
    pieces TEXT[] DEFAULT '{}', -- 練習/演奏曲目 (e.g. ['チャイコフスキー/交響曲第5番', 'ブラームス/大学式典序曲'])
    score_urls TEXT[] DEFAULT '{}', -- 楽譜PDF共有URL
    recording_urls TEXT[] DEFAULT '{}', -- 合奏録音共有URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 4. Attendances (出欠データ)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'undecided' CHECK (status IN ('attending', 'absent', 'late', 'early_leave', 'undecided')),
    comment TEXT DEFAULT '', -- 欠席理由・連絡事項
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(schedule_id, user_id)
);

-- --------------------------------------------------------------------
-- 5. Offers (リハクル：エキストラオファー)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL, -- 関連する練習/本番日程（任意）
    target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- オファー対象奏者
    part TEXT NOT NULL, -- 依頼パート (e.g. 'Ob.2 / E.H.')
    reward_amount INTEGER NOT NULL CHECK (reward_amount >= 0), -- 提示謝礼額 (JPY)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'escrow_paid', 'completed', 'cancelled')),
    stripe_payment_intent_id TEXT, -- Stripe エスクロー決済Intent ID
    receipt_url TEXT, -- 発行されたPDF領収書URL
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 6. 相性スコア算出関数 (Compatibility Score Calculation)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_compatibility_score(
    p_user_id UUID,
    p_group_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER := 50; -- 基本スコア 50点
    v_user_part TEXT;
    v_user_has_car BOOLEAN;
    v_user_special_instruments_count INTEGER;
    v_user_past_conductors TEXT[];
BEGIN
    -- ユーザー情報取得
    SELECT part, has_car, array_length(instruments_owned, 1), past_conductors
    INTO v_user_part, v_user_has_car, v_user_special_instruments_count, v_user_past_conductors
    FROM public.profiles
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- 加点1: 特殊管所有 (+15点)
    IF v_user_special_instruments_count IS NOT NULL AND v_user_special_instruments_count > 0 THEN
        v_score := v_score + 15;
    END IF;

    -- 加点2: 車出し可能 (+15点)
    IF v_user_has_car IS TRUE THEN
        v_score := v_score + 15;
    END IF;

    -- 加点3: 指揮者実績あり (+10点)
    IF v_user_past_conductors IS NOT NULL AND array_length(v_user_past_conductors, 1) > 0 THEN
        v_score := v_score + 10;
    END IF;

    -- 最大100点、最小0点に補正
    IF v_score > 100 THEN
        v_score := 100;
    END IF;

    RETURN v_score;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 7. 自動 updated_at 更新トリガー
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_attendances_updated_at BEFORE UPDATE ON public.attendances FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------
-- 8. 新規ユーザー作成時の Profiles 自動生成トリガー
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, part)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '新規ユーザー'),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'part', '未設定')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 9. Row Level Security (RLS) ポリシー定義
-- --------------------------------------------------------------------

-- 9.1. Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "プロフィールは認証済みユーザー全員閲覧可能"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "本人のみプロフィール更新可能"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 9.2. Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "グループ情報は認証済みユーザーが参照可能"
    ON public.groups FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "認証済みユーザーはグループ作成可能"
    ON public.groups FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "オーナーおよび管理者のみグループ更新可能"
    ON public.groups FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = groups.id
              AND group_members.user_id = auth.uid()
              AND group_members.role IN ('owner', 'admin')
        )
    );

-- 9.3. Group Members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "グループメンバー一覧は認証済みユーザー閲覧可能"
    ON public.group_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "自分自身の参加またはグループ管理者がメンバー登録可能"
    ON public.group_members FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_members.group_id
              AND gm.user_id = auth.uid()
              AND gm.role IN ('owner', 'admin')
        )
    );

-- 9.4. Schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所属グループのスケジュールを閲覧可能"
    ON public.schedules FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = schedules.group_id
              AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "グループ管理者がスケジュール作成・更新可能"
    ON public.schedules FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = schedules.group_id
              AND gm.user_id = auth.uid()
              AND gm.role IN ('owner', 'admin')
        )
    );

-- 9.5. Attendances
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "同グループメンバーの出欠状況を閲覧可能"
    ON public.attendances FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.schedules s
            JOIN public.group_members gm ON gm.group_id = s.group_id
            WHERE s.id = attendances.schedule_id
              AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "ユーザー本人は自身の出欠を更新・登録可能"
    ON public.attendances FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9.6. Offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "依頼元グループのメンバーまたはオファー対象者がオファーを参照可能"
    ON public.offers FOR SELECT
    TO authenticated
    USING (
        auth.uid() = target_user_id OR
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = offers.group_id
              AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "グループ管理者がオファーを作成・更新可能"
    ON public.offers FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = offers.group_id
              AND gm.user_id = auth.uid()
              AND gm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "オファー対象者はステータスを更新可能（受諾・辞退）"
    ON public.offers FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = target_user_id OR
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = offers.group_id
              AND gm.user_id = auth.uid()
              AND gm.role IN ('owner', 'admin')
        )
    );
