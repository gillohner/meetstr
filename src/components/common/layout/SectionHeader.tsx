// src/components/common/layout/SectionHeader.tsx
import { Typography } from "@mui/material";

export const SectionHeader = ({ title }: { title: string }) => (
  <Typography variant="subtitle1" gutterBottom color="text.primary">
    {title}
  </Typography>
);

export default SectionHeader;
