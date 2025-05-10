"use strict";
exports.__esModule = true;
exports.formatDateRange = exports.formatDate = void 0;
// src/utils/formatting/formatDate.tsx
// TODO: Add locales
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
var isDatesEqual = function (date1, date2) {
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
};
var formatDateRange = function (startTime, endTime, fallbackText) {
    try {
        var startDate = new Date(parseInt(startTime) * 1000);
        var endDate = endTime ? new Date(parseInt(endTime) * 1000) : null;
        var formattedStartDate = startDate.toLocaleString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
        console.log("month: ", startDate.getMonth());
        if (!endDate) {
            return formattedStartDate;
        }
        if (isDatesEqual(startDate, endDate)) {
            var formattedEndTime = endDate.toLocaleString(undefined, {
                hour: "2-digit",
                minute: "2-digit"
            });
            return formattedStartDate + " - " + formattedEndTime;
        }
        var formattedEndDate = endDate.toLocaleString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2"
        });
        return formattedStartDate + " - " + formattedEndDate;
    }
    catch (e) {
        return fallbackText;
    }
};
exports.formatDateRange = formatDateRange;
