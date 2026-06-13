import {
  ShoppingCart, Car, Home, Smartphone, Gamepad2, Pill, Shirt,
  BookOpen, Gift, CircleHelp, DollarSign, TrendingUp, Zap,
  ArrowLeftRight, Wallet, UtensilsCrossed, Wifi, Dumbbell,
  Banknote, Building2, Coffee, Music, Film, Cloud, Palette,
  Package, Heart
} from 'lucide-react';

export const ICON_MAP = {
  housing:       { Icon: Building2,      color: '#007AFF' },
  groceries:     { Icon: ShoppingCart,   color: '#34C759' },
  transport:     { Icon: Car,            color: '#FF9500' },
  health:        { Icon: Heart,          color: '#FF2D55' },
  entertainment: { Icon: Film,           color: '#AF52DE' },
  clothing:      { Icon: Shirt,          color: '#FF6B81' },
  subscriptions: { Icon: Smartphone,    color: '#5AC8FA' },
  dining:        { Icon: UtensilsCrossed, color: '#FF6900' },
  education:     { Icon: BookOpen,       color: '#5856D6' },
  gifts:         { Icon: Gift,           color: '#FF3B30' },
  other:         { Icon: Package,        color: '#8E8E93' },
  salary:        { Icon: DollarSign,     color: '#34C759' },
  investment:    { Icon: TrendingUp,     color: '#007AFF' },
  extra:         { Icon: Zap,            color: '#FF9500' },
  transfer:      { Icon: ArrowLeftRight, color: '#8E8E93' },
  cash:          { Icon: Banknote,       color: '#30D158' },
  internet:      { Icon: Wifi,           color: '#5AC8FA' },
  gym:           { Icon: Dumbbell,       color: '#FF6900' },
  music:         { Icon: Music,          color: '#FF2D55' },
  coffee:        { Icon: Coffee,         color: '#AC8E68' },
  cloud:         { Icon: Cloud,          color: '#5AC8FA' },
  design:        { Icon: Palette,        color: '#AF52DE' },
};

export default function CategoryIcon({ category, size = 36 }) {
  const entry = ICON_MAP[category] || ICON_MAP.other;
  const { Icon, color } = entry;
  const iconSize = Math.round(size * 0.44);

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: color + '18',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={iconSize} strokeWidth={1.5} color={color} />
    </div>
  );
}
