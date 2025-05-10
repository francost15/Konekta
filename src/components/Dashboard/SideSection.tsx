import React, { ReactNode } from 'react';

interface SideSectionProps {
  title: string;
  children: ReactNode;
}

export const SideSection = ({ title, children }: SideSectionProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}; 