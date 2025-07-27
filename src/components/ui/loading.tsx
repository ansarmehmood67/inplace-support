import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-primary border-t-transparent",
        sizeClasses[size]
      )} />
      <div className={cn(
        "absolute inset-0 animate-pulse rounded-full bg-primary/20",
        sizeClasses[size]
      )} />
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className,
  showPercentage = false 
}) => {
  return (
    <div className={cn("relative", className)}>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-primary rounded-full transition-all duration-300 ease-out relative"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
      {showPercentage && (
        <span className="text-xs text-muted-foreground mt-1 block">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

interface PulseDotsProps {
  className?: string;
}

export const PulseDots: React.FC<PulseDotsProps> = ({ className }) => {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0ms'}} />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '150ms'}} />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '300ms'}} />
    </div>
  );
};

interface ShimmerProps {
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ className }) => {
  return (
    <div className={cn(
      "relative overflow-hidden bg-muted rounded-lg",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};