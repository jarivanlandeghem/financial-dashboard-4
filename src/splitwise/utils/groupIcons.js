import {
  Home, Plane, Car, Users2, UtensilsCrossed, Gamepad2,
  Briefcase, ShoppingCart, Music, Dumbbell, Wine,
  GraduationCap, Heart, Globe, Tent, Gift,
} from 'lucide-react';

export const GROUP_ICONS = [
  { id: 'home',      Icon: Home,            label: 'Home' },
  { id: 'plane',     Icon: Plane,           label: 'Travel' },
  { id: 'car',       Icon: Car,             label: 'Car' },
  { id: 'users',     Icon: Users2,          label: 'Group' },
  { id: 'food',      Icon: UtensilsCrossed, label: 'Food' },
  { id: 'gamepad',   Icon: Gamepad2,        label: 'Gaming' },
  { id: 'briefcase', Icon: Briefcase,       label: 'Work' },
  { id: 'shopping',  Icon: ShoppingCart,    label: 'Shopping' },
  { id: 'music',     Icon: Music,           label: 'Music' },
  { id: 'fitness',   Icon: Dumbbell,        label: 'Fitness' },
  { id: 'drinks',    Icon: Wine,            label: 'Drinks' },
  { id: 'study',     Icon: GraduationCap,   label: 'Study' },
  { id: 'heart',     Icon: Heart,           label: 'Family' },
  { id: 'globe',     Icon: Globe,           label: 'World' },
  { id: 'tent',      Icon: Tent,            label: 'Camping' },
  { id: 'gift',      Icon: Gift,            label: 'Gifts' },
];

export function getGroupIcon(iconId) {
  return GROUP_ICONS.find(g => g.id === iconId)?.Icon || Users2;
}
