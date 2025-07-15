// src/app/about/page.tsx
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ProTip from "@/components/ProTip";

export default function About() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Meetstr is an open source project built by
        <Typography variant="h6" component="h1" sx={{ mb: 2 }}>
          Zap Me
        </Typography>
        <Box sx={{ maxWidth: "sm" }}></Box>
        <ProTip />
      </Box>
    </Container>
  );
}
