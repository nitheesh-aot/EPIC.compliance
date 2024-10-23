import React from "react";
import { Link as RouterLink } from "@tanstack/react-router";
import { Link } from "@mui/material";

interface PageLinkProps {
  to: string;
  params?: { [key: string]: string };
  linkText?: string;
  underline?: "none" | "hover" | "always";
}

const PageLink: React.FC<PageLinkProps> = ({
  to,
  params,
  linkText,
  underline = "hover",
}) => {
  const generatePath = (path: string, params?: { [key: string]: string }) => {
    if (!params) return path;
    return Object.keys(params).reduce((acc, key) => {
      return acc.replace(`$${key}`, params[key]);
    }, path);
  };

  return (
    <Link
      component={RouterLink}
      to={generatePath(to, params)}
      underline={underline}
    >
      {linkText || (params && params[Object.keys(params)[0]])}
    </Link>
  );
};

export default PageLink;
