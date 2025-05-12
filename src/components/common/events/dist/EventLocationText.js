"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
// src/components/common/events/EventLocationText.tsx
var material_1 = require("@mui/material");
var LocationOn_1 = require("@mui/icons-material/LocationOn");
var text_1 = require("@/utils/formatting/text");
function EventLocationText(_a) {
    var location = _a.location, geohash = _a.geohash, typographyProps = _a.typographyProps;
    if (!location && !geohash)
        return null;
    // TODO: Fix Nomination Caching and Batch fetching before displaying nice looking address in preview cards
    // const { data: locationData, isLoading } = useLocationInfo(location, geohash);
    var locationData = []; // Placeholder for the actual data fetching logic
    var isLoading = true; // Placeholder for the loading state
    return (React.createElement(material_1.Box, { sx: { display: "flex", mb: 2 } },
        React.createElement(LocationOn_1["default"], { sx: { mr: 1, color: "text.secondary" } }),
        isLoading ? (React.createElement(material_1.Typography, __assign({ variant: "body1", color: "text.secondary" }, typographyProps, { sx: __assign({ whiteSpace: "pre-line" }, typographyProps === null || typographyProps === void 0 ? void 0 : typographyProps.sx) }), text_1.formatTextWithLineBreaks(location))) : (React.createElement(material_1.Typography, __assign({ variant: "body1", color: "text.secondary" }, typographyProps, { sx: __assign({ whiteSpace: "pre-line" }, typographyProps === null || typographyProps === void 0 ? void 0 : typographyProps.sx) }),
            text_1.formatTextWithLineBreaks(locationData === null || locationData === void 0 ? void 0 : locationData.formattedName),
            (locationData === null || locationData === void 0 ? void 0 : locationData.formattedName) && (locationData === null || locationData === void 0 ? void 0 : locationData.formattedAddress) && React.createElement("br", null),
            text_1.formatTextWithLineBreaks(locationData === null || locationData === void 0 ? void 0 : locationData.formattedAddress)))));
}
exports["default"] = EventLocationText;
