-- Fix 1: Add missing INSERT policy for profiles table
-- This allows the handle_new_user trigger to create profiles for new users
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Fix 2: Add authorization check to update_user_points function
-- Prevents users from manipulating other users' points
CREATE OR REPLACE FUNCTION public.update_user_points(
  p_user_id UUID,
  p_points INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to modify their own points
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify other users points';
  END IF;
  
  UPDATE public.profiles
  SET points = points + p_points
  WHERE id = p_user_id;
END;
$$;

-- Fix 3: Create secure reward redemption function
-- Validates points server-side and performs atomic transaction
CREATE OR REPLACE FUNCTION public.redeem_reward(
  p_reward_id UUID
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_points INTEGER;
  v_reward_points INTEGER;
  v_reward_title TEXT;
BEGIN
  -- Check user has enough points
  SELECT points INTO v_user_points
  FROM profiles WHERE id = v_user_id;
  
  -- Get reward details
  SELECT points_required, title INTO v_reward_points, v_reward_title
  FROM rewards WHERE id = p_reward_id AND available = true;
  
  IF v_reward_points IS NULL THEN
    RAISE EXCEPTION 'Reward not found or unavailable';
  END IF;
  
  IF v_user_points < v_reward_points THEN
    RAISE EXCEPTION 'Insufficient points: You have % points but need % points', v_user_points, v_reward_points;
  END IF;
  
  -- Check if already redeemed
  IF EXISTS (SELECT 1 FROM user_rewards WHERE user_id = v_user_id AND reward_id = p_reward_id) THEN
    RAISE EXCEPTION 'You have already redeemed this reward';
  END IF;
  
  -- Atomic transaction: insert redemption and deduct points
  INSERT INTO user_rewards (user_id, reward_id)
  VALUES (v_user_id, p_reward_id);
  
  UPDATE profiles
  SET points = points - v_reward_points
  WHERE id = v_user_id;
  
  RETURN json_build_object(
    'success', true,
    'points_remaining', v_user_points - v_reward_points,
    'reward_title', v_reward_title
  );
END;
$$;