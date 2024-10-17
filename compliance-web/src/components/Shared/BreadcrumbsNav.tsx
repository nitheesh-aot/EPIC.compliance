import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from '@tanstack/react-router';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const BreadcrumbsNav: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <Breadcrumbs sx={{ fontSize: "0.875rem", lineHeight: "1.5rem" }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return isLast ? (
          <Typography variant='body2' key={index} color="text.primary">
            {item.label}
          </Typography>
        ) : (
          <Link
            key={index}
            component={RouterLink}
            to={item.to || '#'}
            underline="hover"
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsNav;
