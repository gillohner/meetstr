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
var material_1 = require("@mui/material");
var date_1 = require("@/utils/formatting/date");
var AccessTime_1 = require("@mui/icons-material/AccessTime");
var react_i18next_1 = require("react-i18next");
function EventTimeDisplay(_a) {
    var startTime = _a.startTime, endTime = _a.endTime, typographyProps = _a.typographyProps;
    var t = react_i18next_1.useTranslation().t;
    var formattedDateRange = date_1.formatDateRange(startTime, endTime, t("error.event.invalidDate", "Invalid date"));
    return (React.createElement(material_1.Box, { sx: { display: "flex", alignItems: "center", mb: 2 } },
        React.createElement(AccessTime_1["default"], { sx: { mr: 1, color: "text.secondary" } }),
        React.createElement(material_1.Typography, __assign({ variant: "body1", color: "text.secondary" }, typographyProps), formattedDateRange)));
}
exports["default"] = EventTimeDisplay;
