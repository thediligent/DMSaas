import React from 'react';

import { cn } from '../../lib/utils';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shadcn/card';

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  description: string;
  image?: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  className,
  label,
  description,
  image,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-3xl p-2 ring-2 ring-gray-100 dark:ring-primary/10',
        className,
      )}
      {...props}
    >
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{label}</CardTitle>
        <CardDescription className="max-w-xs text-sm font-semibold tracking-tight text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {image}
        {children}
      </CardContent>
    </div>
  );
};