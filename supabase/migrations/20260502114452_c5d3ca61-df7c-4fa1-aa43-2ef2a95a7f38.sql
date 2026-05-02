-- Add type column to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'expense';

-- Validation trigger to ensure only allowed values
CREATE OR REPLACE FUNCTION public.validate_transaction_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.type NOT IN ('expense', 'income') THEN
    RAISE EXCEPTION 'type must be expense or income';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_transaction_type_trigger ON public.transactions;
CREATE TRIGGER validate_transaction_type_trigger
BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.validate_transaction_type();

CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date 
ON public.transactions (user_id, type, created_at DESC);