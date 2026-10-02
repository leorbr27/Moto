CREATE TABLE IF NOT EXISTS public.moto_vehicle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year_fabrication INTEGER NOT NULL,
  year_model INTEGER NOT NULL,
  plate TEXT,
  initial_km NUMERIC(12,1) NOT NULL DEFAULT 0,
  fuel_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moto_fuel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE NOT NULL,
  km NUMERIC(12,1) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  price_per_liter NUMERIC(10,3) NOT NULL,
  liters NUMERIC(12,3) NOT NULL,
  fuel_type TEXT,
  station TEXT,
  notes TEXT,
  distance_km NUMERIC(12,1),
  consumption_km_l NUMERIC(12,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moto_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE NOT NULL,
  km NUMERIC(12,1) NOT NULL,
  item TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  maintenance_type TEXT,
  store TEXT,
  phone TEXT,
  next_km NUMERIC(12,1),
  next_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moto_expense (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE NOT NULL,
  km NUMERIC(12,1) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS moto_fuel_km_idx ON public.moto_fuel (km);
CREATE INDEX IF NOT EXISTS moto_fuel_date_idx ON public.moto_fuel (entry_date);
CREATE INDEX IF NOT EXISTS moto_maintenance_km_idx ON public.moto_maintenance (km);
CREATE INDEX IF NOT EXISTS moto_maintenance_date_idx ON public.moto_maintenance (entry_date);
CREATE INDEX IF NOT EXISTS moto_expense_date_idx ON public.moto_expense (entry_date);
