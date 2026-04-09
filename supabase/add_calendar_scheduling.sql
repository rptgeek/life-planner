-- Add calendar scheduling columns to tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS google_event_id TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_google_event_id ON public.tasks(google_event_id);
