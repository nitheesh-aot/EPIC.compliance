import { Box, Typography } from "@mui/material";
import { BCDesignTokens } from "epic.theme";
import ParagraphWithReadMore from "@/components/Shared/ParagraphWithReadMore";
import PageLink from "@/components/Shared/PageLink";

export default function FileProfileProperty({
  propertyName,
  propertyValue,
  size = "default",
  expandable = false,
  linksList,
  linkRoute,
}: {
  propertyName: string;
  propertyValue?: string;
  size?: "small" | "default";
  expandable?: boolean;
  linksList?: string[];
  linkRoute?: string;
}) {
  return (
    <Box display={"flex"} gap={size === "small" ? 4 : 2} marginBottom={1}>
      <Typography
        variant="body1"
        color={BCDesignTokens.typographyColorPlaceholder}
        width={size === "small" ? 120 : 180}
      >
        {propertyName}
      </Typography>
      {expandable ? (
        <ParagraphWithReadMore
          maxHeight={84}
          renderTypography={
            <Typography variant="body1" display={"flex"} flex={1}>
              {propertyValue ?? ""}
            </Typography>
          }
        />
      ) : linksList ? (
        <Box display={"flex"} gap={1}>
          {linksList.map((link, index) => (
            <Box
              key={index}
              sx={{
                ":not(:last-child)::after": {
                  content: '", "',
                },
              }}
            >
              <PageLink to={`${linkRoute}/${link}`} linkText={link} />
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" display={"flex"} flex={1}>
          {propertyValue ?? ""}
        </Typography>
      )}
    </Box>
  );
}
