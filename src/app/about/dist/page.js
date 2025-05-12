"use strict";
exports.__esModule = true;
// src/app/about/page.tsx
var React = require("react");
var Container_1 = require("@mui/material/Container");
var Typography_1 = require("@mui/material/Typography");
var Box_1 = require("@mui/material/Box");
var Button_1 = require("@mui/material/Button");
var link_1 = require("next/link");
var ProTip_1 = require("@/components/ProTip");
var Copyright_1 = require("@/components/Copyright");
function About() {
    return (React.createElement(Container_1["default"], { maxWidth: "lg" },
        React.createElement(Box_1["default"], { sx: {
                my: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
            } },
            React.createElement(Typography_1["default"], { variant: "h4", component: "h1", sx: { mb: 2 } }, "Material UI - Next.js example in TypeScript"),
            React.createElement(Box_1["default"], { sx: { maxWidth: "sm" } },
                React.createElement(Button_1["default"], { variant: "contained", component: link_1["default"], href: "/" }, "Go to the home page")),
            React.createElement(ProTip_1["default"], null),
            React.createElement(Copyright_1["default"], null))));
}
exports["default"] = About;
