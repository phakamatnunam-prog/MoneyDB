import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  size = 20,
}) => {
  // Safe dynamic lucide icon resolver
  const icons = LucideIcons as Record<string, any>;
  const IconComponent = icons[name] || LucideIcons.CircleDollarSign;
  return <IconComponent size={size} className={className} />;
};
