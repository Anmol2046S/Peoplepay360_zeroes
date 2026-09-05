import React from 'react';
import { StatusBadge } from '../common/Badge';

export const PayrunStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  return <StatusBadge status={status} />;
};
