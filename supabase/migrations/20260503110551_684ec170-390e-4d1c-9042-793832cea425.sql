
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'expense';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'expense';

CREATE OR REPLACE FUNCTION public.validate_goal_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.type NOT IN ('expense', 'income') THEN
    RAISE EXCEPTION 'type must be expense or income';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_goal_type_trg ON public.goals;
CREATE TRIGGER validate_goal_type_trg
BEFORE INSERT OR UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.validate_goal_type();

CREATE OR REPLACE FUNCTION public.validate_category_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.type NOT IN ('expense', 'income') THEN
    RAISE EXCEPTION 'type must be expense or income';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_category_type_trg ON public.categories;
CREATE TRIGGER validate_category_type_trg
BEFORE INSERT OR UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.validate_category_type();

INSERT INTO public.categories (name, icon, color, type) VALUES
  ('Salário', '💼', '142 70% 45%', 'income'),
  ('Freelance', '💻', '160 70% 45%', 'income'),
  ('Aluguel recebido', '🏠', '180 70% 45%', 'income'),
  ('Investimentos', '📈', '200 70% 45%', 'income'),
  ('Presente', '🎁', '320 70% 55%', 'income'),
  ('Venda', '📦', '30 80% 50%', 'income'),
  ('Outros rendimentos', '💡', '50 80% 55%', 'income')
ON CONFLICT DO NOTHING;
