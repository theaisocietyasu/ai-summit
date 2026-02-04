'use client';

import React from 'react';
import './GlowEffect.css';

interface GlowEffectProps {
  colors?: string[];
  mode?: 'rotate' | 'pulse' | 'colorShift';
  blur?: 'soft' | 'medium' | 'strong';
  duration?: number;
  scale?: number;
}

export function GlowEffect({
  colors = ['#6a1740', '#4d2386', '#a855f7', '#6a1740'],
  mode = 'rotate',
  blur = 'medium',
  duration = 5,
  scale = 1
}: GlowEffectProps) {
  const blurAmount = blur === 'soft' ? '20px' : blur === 'medium' ? '30px' : '40px';

  const gradientColors = colors.join(', ');

  return (
    <div
      className={`glow-effect glow-effect--${mode}`}
      style={{
        '--glow-colors': `conic-gradient(${gradientColors})`,
        '--glow-blur': blurAmount,
        '--glow-duration': `${duration}s`,
        '--glow-scale': scale,
      } as React.CSSProperties}
    />
  );
}

interface GlowButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  colors?: string[];
  mode?: 'rotate' | 'pulse' | 'colorShift';
  blur?: 'soft' | 'medium' | 'strong';
  duration?: number;
}

export function GlowButton({
  children,
  href,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  colors = ['#6a1740', '#4d2386', '#a855f7', '#6a1740'],
  mode = 'rotate',
  blur = 'soft',
  duration = 3
}: GlowButtonProps) {
  const content = (
    <>
      <GlowEffect colors={colors} mode={mode} blur={blur} duration={duration} scale={0.95} />
      <span className="glow-button-content">{children}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`glow-button ${className}`}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`glow-button ${className} ${disabled ? 'glow-button--disabled' : ''}`}
    >
      {content}
    </button>
  );
}

export default GlowEffect;
