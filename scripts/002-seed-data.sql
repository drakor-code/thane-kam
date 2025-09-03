-- Insert default admin user (password: admin123 - will be hashed in production)
INSERT INTO users (id, email, name, password, role, phone, address) VALUES 
('admin_001', 'admin@debtiq.com', 'مدير النظام', '$2b$10$rQZ8kqH5jQZ8kqH5jQZ8kOH5jQZ8kqH5jQZ8kqH5jQZ8kqH5jQZ8k', 'admin', '07901234567', 'بغداد - الكرادة')
ON CONFLICT (email) DO NOTHING;

-- Insert default company settings
INSERT INTO company_settings (id, name, description, currency) VALUES 
('settings_001', 'نظام إدارة الديون - Debt-IQ', 'نظام متكامل لإدارة ديون الشركات والتجار مع العملاء والموردين', 'IQD')
ON CONFLICT (id) DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (id, name, phone, address, email, total_debt, notes, created_by) VALUES 
('supplier_001', 'شركة الأنوار للتجارة', '07701234567', 'بغداد - الكاظمية', 'anwar@company.com', 150000.00, 'مورد رئيسي للمواد الغذائية', 'admin_001'),
('supplier_002', 'مؤسسة النور التجارية', '07801234567', 'البصرة - الزبير', 'noor@trading.com', 75000.00, 'مورد المواد الإنشائية', 'admin_001'),
('supplier_003', 'شركة الفرات للاستيراد', '07901234567', 'أربيل - عنكاوا', 'furat@import.com', 200000.00, 'مورد الأجهزة الإلكترونية', 'admin_001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (id, name, phone, address, email, total_debt, notes, created_by) VALUES 
('customer_001', 'أحمد محمد علي', '07701234568', 'بغداد - الجادرية', 'ahmed@email.com', 50000.00, 'عميل منتظم', 'admin_001'),
('customer_002', 'فاطمة حسن محمود', '07801234568', 'النجف - المركز', 'fatima@email.com', 25000.00, 'عميل جديد', 'admin_001'),
('customer_003', 'محمد عبدالله سالم', '07901234568', 'كربلاء - الحر', 'mohammed@email.com', 80000.00, 'عميل كبير', 'admin_001')
ON CONFLICT (id) DO NOTHING;
