-- ========================================================
-- SUPABASE POSTGRESQL SCHEMA FOR AURA E-SHOP (LAB 6 CAPSTONE)
-- ========================================================

-- Enable UUID Generator extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'client')),
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Security Policies
CREATE POLICY "Allow public select access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Automated PostgreSQL Trigger Function for Signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'admin@example.com' THEN 'admin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Signup Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  stock INT DEFAULT 10 CHECK (stock >= 0),
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Security Policies
CREATE POLICY "Allow anyone to read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin full control on products" ON public.products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'returned', 'canceled')),
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Security Policies
CREATE POLICY "Allow users to read their own orders" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
CREATE POLICY "Allow authenticated users to create orders" ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to update orders" ON public.orders FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products ON DELETE SET NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC(10, 2) NOT NULL
);

-- Enable RLS on Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order Items Security Policies
CREATE POLICY "Allow users to read their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ))
  )
);
CREATE POLICY "Allow insertion of order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- 6. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews Security Policies
CREATE POLICY "Allow public select on reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow auth users to post reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ========================================================
-- SEED INITIAL PREMIUM PRODUCTS
-- ========================================================
INSERT INTO public.products (id, name, description, price, stock, category, image_url)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Aura Sound-Pro Headphones', 'Immersive sound isolating headphones with active noise cancellation and an outstanding 45-hour battery life.', 249.99, 12, 'Audio', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'),
('22222222-2222-2222-2222-222222222222', 'Zenith OLED Smartwatch', 'Track your vitals with medical grade precision on a vibrant high-definition AMOLED screen.', 189.99, 8, 'Wearables', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'),
('33333333-3333-3333-3333-333333333333', 'Horizon VR Elite Headset', 'Experience true immersion with 4K resolution per eye, wide field of view, and adaptive hand controllers.', 499.99, 5, 'Electronics', 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500&q=80'),
('44444444-4444-4444-4444-444444444444', 'Prime Mechanical Keyboard', 'Gasket-mounted customizable hot-swappable keyboard with tactile linear switches and solid aluminum chassis.', 129.99, 20, 'Accessories', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80');

-- ========================================================
-- SEED INITIAL REVIEWS
-- ========================================================
INSERT INTO public.reviews (id, product_id, rating, comment)
VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 5, 'Absolutely love these! Best sound isolating headset I have ever owned.'),
('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 4, 'Very comfortable, but charging cable is a bit short.'),
('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 5, 'Vibrant colors and very accurate sleep trackers.'),
('c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 5, 'Stunning display resolution! A revolution in VR.');
