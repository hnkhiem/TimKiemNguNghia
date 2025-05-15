// src/components/layout/PageContainer.tsx
import React from 'react';

const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="max-w-6xl mx-auto px-4 py-8 w-full">{children}</div>
);

export default PageContainer;
