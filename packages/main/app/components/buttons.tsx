import React from 'react';

interface ButtonProps {}

export default function Button({
  className,
  children,
}: React.PropsWithChildren<React.ButtonHTMLAttributes<ButtonProps>>) {
  return <button className={className}>{children}</button>;
}
