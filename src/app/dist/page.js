"use strict";
exports.__esModule = true;
// src/app/page.tsx
var React = require("react");
var Container_1 = require("@mui/material/Container");
var Typography_1 = require("@mui/material/Typography");
var Box_1 = require("@mui/material/Box");
var Link_1 = require("@mui/material/Link");
var link_1 = require("next/link");
var ProTip_1 = require("@/components/ProTip");
var Copyright_1 = require("@/components/Copyright");
function Home() {
    return (React.createElement(Container_1["default"], { maxWidth: "lg" },
        React.createElement(Box_1["default"], { sx: {
                my: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
            } },
            React.createElement(Typography_1["default"], { variant: "h4", component: "h1", sx: { mb: 2 } }, "Material UI - Next.js App Router example in TypeScript"),
            React.createElement(Link_1["default"], { href: "/about", color: "secondary", component: link_1["default"] }, "Go to the about page"),
            React.createElement(ProTip_1["default"], null),
            React.createElement(Copyright_1["default"], null))));
}
exports["default"] = Home;
