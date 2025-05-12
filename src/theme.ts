// src/theme.ts
"use client";
import { createTheme } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  palette: {
    primary: {
      main: "#F2A900", // Orange color
      light: "#FFB824",
      dark: "#D49000",
      contrastText: "#fff",
    },
    secondary: {
      main: "#9C27B0", // Purple color
      light: "#BA68C8",
      dark: "#7B1FA2",
      contrastText: "#fff",
    },
    mode: "dark",
  },
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: "info" },
              style: {
                backgroundColor: "#F2A900",
              },
            },
          ],
        },
      },
    },
  },
});

export default theme;
