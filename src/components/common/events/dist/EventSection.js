"use strict";
exports.__esModule = true;
// src/components/common/events/EventSection.tsx
var react_1 = require("react");
var material_1 = require("@mui/material");
var EventPreviewCard_1 = require("@/components/common/events/EventPreviewCard");
var EventSection = function (_a) {
    var title = _a.title, events = _a.events, fallbackText = _a.fallbackText;
    return (react_1["default"].createElement(material_1.Box, { sx: { mb: 4 } },
        react_1["default"].createElement(material_1.Typography, { variant: "h5", component: "h2", gutterBottom: true }, title),
        react_1["default"].createElement(material_1.Divider, { sx: { mb: 2 } }),
        events.length > 0 ? (react_1["default"].createElement(material_1.Grid, { container: true, spacing: 3 }, events.map(function (event) { return (react_1["default"].createElement(material_1.Grid, { xs: 12, lg: 6, key: event.id || "event-" + event.id, sx: { width: "100%" } },
            react_1["default"].createElement(EventPreviewCard_1["default"], { event: event }))); }))) : (react_1["default"].createElement(material_1.Typography, { variant: "body1" }, fallbackText))));
};
exports["default"] = EventSection;
