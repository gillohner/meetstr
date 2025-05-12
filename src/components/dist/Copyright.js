"use strict";
exports.__esModule = true;
// src/components/Copyright.tsx
var React = require("react");
var Typography_1 = require("@mui/material/Typography");
var Link_1 = require("@mui/material/Link");
function Copyright() {
    return (React.createElement(Typography_1["default"], { variant: "body2", align: "center", sx: {
            color: "text.secondary"
        } },
        "Copyright © ",
        React.createElement(Link_1["default"], { color: "inherit", href: "https://mui.com/" }, "Your Website"),
        " ",
        new Date().getFullYear(),
        "."));
}
exports["default"] = Copyright;
