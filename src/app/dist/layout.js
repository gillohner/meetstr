"use strict";
exports.__esModule = true;
// src/app/layout.tsx
var headers_1 = require("next/headers");
var ClientProviders_1 = require("@/providers/ClientProviders");
var react_1 = require("react");
function RootLayout(_a) {
    var children = _a.children;
    var headersList = react_1.use(headers_1.headers());
    var langHeader = headersList.get("x-lang") || "en";
    return (React.createElement("html", { lang: langHeader, suppressHydrationWarning: true },
        React.createElement("body", null,
            React.createElement(ClientProviders_1["default"], { serverLang: langHeader }, children))));
}
exports["default"] = RootLayout;
