"use strict";
exports.__esModule = true;
exports.formatTextWithLineBreaks = void 0;
// src/utils/formatting/text.tsx
var formatTextWithLineBreaks = function (text) {
    if (!text)
        return null;
    return text.split("\n").map(function (line, index, arr) { return (React.createElement("span", { key: index },
        line,
        index !== arr.length - 1 && React.createElement("br", null))); });
};
exports.formatTextWithLineBreaks = formatTextWithLineBreaks;
