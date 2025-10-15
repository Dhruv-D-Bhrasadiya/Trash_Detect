-- Add optional hash column to detect duplicate uploads per user
ALTER TABLE public.detections
ADD COLUMN IF NOT EXISTS hash TEXT;

-- Create a unique index per user on (user_id, hash) for non-null hashes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'detections_user_id_hash_key'
  ) THEN
    CREATE UNIQUE INDEX detections_user_id_hash_key
      ON public.detections(user_id, hash)
      WHERE hash IS NOT NULL;
  END IF;
END $$;


