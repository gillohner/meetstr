// src/providers/ClientProviders.tsx
"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var styles_1 = require("@mui/material/styles");
var v15_appRouter_1 = require("@mui/material-nextjs/v15-appRouter");
var i18n_1 = require("@/lib/i18n");
var theme_1 = require("@/theme");
var InitColorSchemeScript_1 = require("@mui/material/InitColorSchemeScript");
var AppBar_1 = require("@/components/common/layout/AppBar/AppBar");
var CssBaseline_1 = require("@mui/material/CssBaseline");
var nostr_hooks_1 = require("nostr-hooks");
var SnackbarContext_1 = require("@/context/SnackbarContext");
var react_query_1 = require("@tanstack/react-query");
var queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5
        }
    }
});
function ClientProviders(_a) {
    var children = _a.children, serverLang = _a.serverLang;
    var _b = react_1.useState(false), isReady = _b[0], setIsReady = _b[1];
    var i18n = i18n_1.initI18n(serverLang);
    var _c = nostr_hooks_1.useNdk(), initNdk = _c.initNdk, ndk = _c.ndk;
    var loginFromLocalStorage = nostr_hooks_1.useLogin().loginFromLocalStorage;
    react_1.useEffect(function () {
        initNdk({
            explicitRelayUrls: [
                "wss://nostr.swiss-enigma.ch/",
                "wss://relay.damus.io/",
                "wss://relay.nostr.band",
                "wss://multiplexer.huszonegy.world",
            ]
        });
    }, [initNdk]);
    react_1.useEffect(function () {
        ndk === null || ndk === void 0 ? void 0 : ndk.connect(); // This will also reconnect when the instance changes
    }, [ndk]);
    // Login from local storage
    react_1.useEffect(function () {
        loginFromLocalStorage();
    }, [loginFromLocalStorage]);
    return (React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
        React.createElement(v15_appRouter_1.AppRouterCacheProvider, { options: { enableCssLayer: true } },
            React.createElement(react_i18next_1.I18nextProvider, { i18n: i18n },
                React.createElement(styles_1.ThemeProvider, { theme: theme_1["default"] },
                    React.createElement(SnackbarContext_1.SnackbarProvider, null,
                        React.createElement(InitColorSchemeScript_1["default"], { attribute: "class" }),
                        React.createElement(AppBar_1["default"], null),
                        React.createElement(CssBaseline_1["default"], null),
                        children))))));
}
exports["default"] = ClientProviders;
