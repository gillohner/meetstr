"use strict";
exports.__esModule = true;
exports.formatDate = void 0;
// src/utils/formatting/formatDate.tsx
var formatDate = function (timestamp, fallbackText) {
    try {
        var date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    }
    catch (e) {
        return fallbackText;
    }
};
exports.formatDate = formatDate;
