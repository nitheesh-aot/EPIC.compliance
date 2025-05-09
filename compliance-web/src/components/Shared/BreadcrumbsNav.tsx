import React from "react";
import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "@tanstack/react-router";
import { KeyboardBackspaceRounded } from "@mui/icons-material";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  caseFileNumber?: string;
}

const BreadcrumbsNav: React.FC<BreadcrumbsProps> = ({
  items,
  caseFileNumber,
}) => {
  return (
    <Box height={"1.5rem"}>
      {caseFileNumber ? (
        <Link
          component={RouterLink}
          to={`/ce-database/case-files/${caseFileNumber}`}
          underline="hover"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <KeyboardBackspaceRounded />
          Back to Case File {caseFileNumber}
        </Link>
      ) : (
        <Breadcrumbs sx={{ fontSize: "0.875rem", lineHeight: "1.5rem" }}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return isLast ? (
              <Typography variant="body2" key={index} color="text.primary">
                {item.label}
              </Typography>
            ) : (
              <Link
                key={index}
                component={RouterLink}
                to={item.to || "#"}
                underline="hover"
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
    </Box>
  );
};

export default BreadcrumbsNav;
