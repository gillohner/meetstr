// src/dist/theme.js
"use client";
"use strict";

exports.__esModule = true;

var styles_1 = require("@mui/material/styles");

var google_1 = require("next/font/google");

var roboto = google_1.Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap"
});
var theme = styles_1.createTheme({
  palette: {
    primary: {
      main: "#DF900F",
      light: "#F2A900",
      dark: "#DF900F",
      contrastText: "#fff"
    },
    secondary: {
      main: "#9C27B0",
      light: "#BA68C8",
      dark: "#7B1FA2",
      contrastText: "#fff"
    },
    mode: "dark"
  },
  colorSchemes: {
    light: true,
    dark: true
  },
  cssVariables: {
    colorSchemeSelector: "class"
  },
  typography: {
    fontFamily: roboto.style.fontFamily
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [{
            props: {
              severity: "info"
            },
            style: {
              backgroundColor: "#F2A900"
            }
          }]
        }
      }
    }
  }
});
exports["default"] = theme;