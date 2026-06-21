export const GROUP_ICONS = [
  { id: 'home',      icon: 'house.svg',                               label: 'Home' },
  { id: 'plane',     icon: 'airplane.svg',                            label: 'Travel' },
  { id: 'car',       icon: 'car.svg',                                 label: 'Car' },
  { id: 'users',     icon: 'person.2.svg',                            label: 'Group' },
  { id: 'food',      icon: 'fork.knife.svg',                          label: 'Food' },
  { id: 'gamepad',   icon: 'gamecontroller.svg',                      label: 'Gaming' },
  { id: 'briefcase', icon: 'briefcase.svg',                           label: 'Work' },
  { id: 'shopping',  icon: 'cart.svg',                                label: 'Shopping' },
  { id: 'music',     icon: 'headphones.svg',                          label: 'Music' },
  { id: 'fitness',   icon: 'figure.strengthtraining.traditional.svg', label: 'Fitness' },
  { id: 'drinks',    icon: 'wineglass.svg',                           label: 'Drinks' },
  { id: 'study',     icon: 'graduationcap.svg',                       label: 'Study' },
  { id: 'heart',     icon: 'heart.svg',                               label: 'Family' },
  { id: 'globe',     icon: 'globe.svg',                               label: 'World' },
  { id: 'tent',      icon: 'tent.svg',                                label: 'Camping' },
  { id: 'gift',      icon: 'giftcard.svg',                            label: 'Gifts' },
];

export function getGroupIconSvg(iconId) {
  return GROUP_ICONS.find(g => g.id === iconId)?.icon || 'person.2.svg';
}
