import {
  ShoppingCart, Car, Home, Smartphone, Gamepad2, Pill, Shirt,
  BookOpen, Gift, HelpCircle, DollarSign, TrendingUp, Zap,
  ArrowLeftRight, Wallet, UtensilsCrossed, Wifi, Dumbbell,
  Banknote, Building2
} from 'lucide-react';

const ICON_MAP = {
  housing: { Icon: Building2, color: '#4F8EF7' },
  groceries: { Icon: ShoppingCart, color: '#00C896' },
  transport: { Icon: Car, color: '#FFB800' },
  health: { Icon: Pill, color: '#FF4757' },
  entertainment: { Icon: Gamepad2, color: '#A855F7' },
  clothing: { Icon: Shirt, color: '#EC4899' },
  subscriptions: { Icon: Smartphone, color: '#06B6D4' },
  dining: { Icon: UtensilsCrossed, color: '#F97316' },
  education: { Icon: BookOpen, color: '#8B5CF6' },
  gifts: { Icon: Gift, color: '#EF4444' },
  other: { Icon: HelpCircle, color: '#6B7280' },
  salary: { Icon: DollarSign, color: '#00C896' },
  investment: { Icon: TrendingUp, color: '#4F8EF7' },
  extra: { Icon: Zap, color: '#FFB800' },
  transfer: { Icon: ArrowLeftRight, color: '#6B7280' },
  cash: { Icon: Banknote, color: '#10B981' },
  internet: { Icon: Wifi, color: '#06B6D4' },
  gym: { Icon: Dumbbell, color: '#F97316' },
};

export default function CategoryIcon({ category, size = 36 }) {
  const entry = ICON_MAP[category] || ICON_MAP.other;
  const { Icon, color } = entry;

  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={size * 0.44} strokeWidth={1.75} color={color} />
    </div>
  );
}
