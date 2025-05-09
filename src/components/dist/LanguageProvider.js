// src/components/LanguageProvider.tsx
"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var i18n_1 = require("@/lib/i18n");
function LanguageProvider(_a) {
    var children = _a.children, serverLang = _a.serverLang;
    react_1.useEffect(function () {
        if (i18n_1["default"].language !== serverLang) {
            i18n_1["default"].changeLanguage(serverLang);
        }
    }, [serverLang]);
    return React.createElement(React.Fragment, null, children);
}
exports["default"] = LanguageProvider;
