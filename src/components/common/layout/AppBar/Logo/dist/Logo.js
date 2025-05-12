"use strict";
exports.__esModule = true;
// src/components/common/layout/AppBar/Logo/Logo.tsx
var Adb_1 = require("@mui/icons-material/Adb");
var material_1 = require("@mui/material");
function Logo(_a) {
    var _b = _a.isMobile, isMobile = _b === void 0 ? false : _b;
    return (React.createElement(React.Fragment, null,
        React.createElement(Adb_1["default"], { sx: { display: { xs: 'none', md: 'flex' }, mr: 1 } }),
        React.createElement(material_1.Typography, { variant: isMobile ? 'h5' : 'h6', noWrap: true, component: "a", href: "/", sx: {
                mr: 2,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
                display: isMobile ? { xs: 'flex', md: 'none' } : { xs: 'none', md: 'flex' }
            } }, "Dezentralbot")));
}
exports["default"] = Logo;
;
