"use strict";
exports.__esModule = true;
exports.SectionHeader = void 0;
// src/components/common/layout/SectionHeader.tsx
var material_1 = require("@mui/material");
exports.SectionHeader = function (_a) {
    var title = _a.title;
    return (React.createElement(material_1.Typography, { variant: "subtitle1", gutterBottom: true, color: "text.primary" }, title));
};
exports["default"] = exports.SectionHeader;
