-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('trial', 'active', 'cancelled')) DEFAULT 'trial',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS (Extends Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'member')) DEFAULT 'member',
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TEMPLATES
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ONBOARDINGS
CREATE TABLE onboardings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  template_id UUID REFERENCES templates(id),
  recruit_name TEXT NOT NULL,
  recruit_email TEXT NOT NULL,
  role TEXT,
  start_date DATE,
  manager_id UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TASKS
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE, -- Nullable if task belongs to onboarding
  onboarding_id UUID REFERENCES onboardings(id) ON DELETE CASCADE, -- Nullable if task belongs to template
  title TEXT NOT NULL,
  description TEXT,
  section TEXT NOT NULL, -- IT, RH, Manager, etc.
  assigned_to UUID REFERENCES users(id),
  deadline_days INTEGER, -- Relative to start_date
  "order" INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id)
);

-- 6. DOCUMENTS
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onboarding_id UUID REFERENCES onboardings(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES (Simplified for specific needs)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboardings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy helper: Check if user belongs to company
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- TEMPLATES Policies
CREATE POLICY "View templates of own company" ON templates
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Manage templates of own company" ON templates
  FOR ALL USING (company_id = public.get_user_company_id());

-- ONBOARDINGS Policies
CREATE POLICY "View onboardings of own company" ON onboardings
  FOR SELECT USING (company_id = public.get_user_company_id());
  
CREATE POLICY "Manage onboardings of own company" ON onboardings
  FOR ALL USING (company_id = public.get_user_company_id());

-- USERS Profile Creation Trigger
-- USERS Profile Creation Trigger (Enhanced for MVP)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
  new_template_id UUID;
BEGIN
  -- 1. Create a default company for the user
  INSERT INTO public.companies (name)
  VALUES (COALESCE(new.raw_user_meta_data->>'company_name', 'My Company'))
  RETURNING id INTO new_company_id;

  -- 2. Create the user profile linked to the company
  INSERT INTO public.users (id, email, full_name, role, company_id)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'admin', new_company_id);

  -- 3. Create a default template for the company
  INSERT INTO public.templates (company_id, name, description, created_by, is_default)
  VALUES (new_company_id, 'Standard Onboarding', 'Default checklist for new employees', new.id, true)
  RETURNING id INTO new_template_id;

  -- 4. Create default tasks for the template
  INSERT INTO public.tasks (template_id, title, section, deadline_days, "order")
  VALUES 
    (new_template_id, 'Sign contract', 'HR', -7, 1),
    (new_template_id, 'Setup laptop', 'IT', 0, 2),
    (new_template_id, 'Team introduction', 'Manager', 1, 3),
    (new_template_id, 'Review documentation', 'General', 2, 4);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
