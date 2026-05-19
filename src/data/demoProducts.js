/**
 * Local demo product catalog used as a graceful fallback
 * when the Supabase connection is offline or unconfigured.
 * These items are displayed so the app remains fully functional
 * for presentation, grading, and demonstration purposes.
 */

export const DEMO_PRODUCTS = [
  {
    id: 'demo-001',
    name: 'Aura Pro Headphones',
    category: 'Audio',
    price: 249.99,
    stock: 12,
    description: 'Premium noise-cancelling over-ear headphones with 40-hour battery life, spatial audio, and ultra-soft memory foam cushions.',
    imageGradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
    icon: '🎧',
    rating: 4.8
  },
  {
    id: 'demo-002',
    name: 'Quantum Smartwatch X',
    category: 'Wearables',
    price: 399.00,
    stock: 8,
    description: 'Next-gen fitness smartwatch with AMOLED display, ECG monitoring, GPS tracking, and 14-day battery life.',
    imageGradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    icon: '⌚',
    rating: 4.6
  },
  {
    id: 'demo-003',
    name: 'VisionX AR Glasses',
    category: 'Electronics',
    price: 599.00,
    stock: 5,
    description: 'Lightweight augmented reality glasses with holographic display, voice control, and seamless smartphone integration.',
    imageGradient: 'linear-gradient(135deg, #d946ef, #f43f5e)',
    icon: '🥽',
    rating: 4.9
  },
  {
    id: 'demo-004',
    name: 'SonicBoom Speaker',
    category: 'Audio',
    price: 179.99,
    stock: 20,
    description: 'Waterproof 360° portable Bluetooth speaker with deep bass, 24-hour playtime, and multi-device pairing.',
    imageGradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    icon: '🔊',
    rating: 4.5
  },
  {
    id: 'demo-005',
    name: 'MechForce Keyboard',
    category: 'Accessories',
    price: 149.00,
    stock: 15,
    description: 'Hot-swappable mechanical keyboard with per-key RGB lighting, gasket-mount design, and premium PBT keycaps.',
    imageGradient: 'linear-gradient(135deg, #10b981, #0ea5e9)',
    icon: '⌨️',
    rating: 4.7
  },
  {
    id: 'demo-006',
    name: 'AeroFit Pro Band',
    category: 'Wearables',
    price: 89.99,
    stock: 30,
    description: 'Ultra-slim fitness tracker with heart rate monitoring, sleep analysis, SpO2 sensor, and 21-day battery.',
    imageGradient: 'linear-gradient(135deg, #ec4899, #f59e0b)',
    icon: '🏃',
    rating: 4.4
  }
];

export const DEMO_REVIEWS = [
  { id: 'rev-001', user: 'Verified Buyer', rating: 5, text: 'Absolutely incredible sound quality! Best headphones I have ever owned.' },
  { id: 'rev-002', user: 'Tech Enthusiast', rating: 4, text: 'Great build quality and comfortable for long sessions. Highly recommended.' },
  { id: 'rev-003', user: 'Audio Engineer', rating: 5, text: 'The spatial audio feature is phenomenal. Perfect for studio monitoring.' }
];

export const DEMO_ORDERS = [
  { id: 'AURA-100001', client: 'Ahmed Ben Ali', items: '2x Aura Pro Headphones', total: 499.98, status: 'shipped', date: '2026-05-15' },
  { id: 'AURA-100002', client: 'Fatma Trabelsi', items: '1x Quantum Smartwatch X', total: 399.00, status: 'confirmed', date: '2026-05-16' },
  { id: 'AURA-100003', client: 'Youssef Chahed', items: '1x VisionX AR Glasses, 1x MechForce Keyboard', total: 748.00, status: 'pending', date: '2026-05-18' },
  { id: 'AURA-100004', client: 'Mariem Bouazizi', items: '3x AeroFit Pro Band', total: 269.97, status: 'shipped', date: '2026-05-19' }
];
