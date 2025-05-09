"use strict";
// src/components/common/events/EventRsvpMenu/EventRsvpMenu.tsx
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
var React = require("react");
var styles_1 = require("@mui/material/styles");
var material_1 = require("@mui/material");
var Check_1 = require("@mui/icons-material/Check");
var HelpOutline_1 = require("@mui/icons-material/HelpOutline");
var Close_1 = require("@mui/icons-material/Close");
var KeyboardArrowDown_1 = require("@mui/icons-material/KeyboardArrowDown");
var react_i18next_1 = require("react-i18next");
var SnackbarContext_1 = require("@/context/SnackbarContext");
var nostr_hooks_1 = require("nostr-hooks");
var react_1 = require("react");
var ndk_1 = require("@nostr-dev-kit/ndk");
var uuid_1 = require("uuid");
var nostr_hooks_2 = require("nostr-hooks");
var StyledRsvpMenu = styles_1.styled(function (props) { return (React.createElement(material_1.Menu, __assign({ elevation: 0, anchorOrigin: {
        vertical: "bottom",
        horizontal: "right"
    }, transformOrigin: {
        vertical: "top",
        horizontal: "right"
    } }, props))); })(function (_a) {
    var theme = _a.theme;
    return ({
        "& .MuiPaper-root": {
            borderRadius: 6,
            marginTop: theme.spacing(1),
            minWidth: 180,
            boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
            "& .MuiMenu-list": {
                padding: 0
            },
            "& .MuiMenuItem-root": {
                padding: theme.spacing(1.5, 2),
                "& .MuiSvgIcon-root": {
                    fontSize: 20,
                    marginRight: theme.spacing(1.5)
                }
            }
        }
    });
});
function EventRsvpMenu(_a) {
    var event = _a.event;
    var t = react_i18next_1.useTranslation().t;
    var ndk = nostr_hooks_1.useNdk().ndk;
    var showSnackbar = SnackbarContext_1.useSnackbar().showSnackbar;
    var _b = React.useState(false), loading = _b[0], setLoading = _b[1];
    var _c = React.useState(null), anchorEl = _c[0], setAnchorEl = _c[1];
    var open = Boolean(anchorEl);
    var activeUser = nostr_hooks_2.useActiveUser().activeUser;
    var handleClick = function (event) {
        setAnchorEl(event.currentTarget);
    };
    var handleClose = function () {
        setAnchorEl(null);
    };
    var handleRsvp = react_1.useCallback(function (status) {
        var rsvpEvent = new ndk_1.NDKEvent(ndk);
        rsvpEvent.content = status;
        rsvpEvent.kind = 31925;
        console.log("event: ", event.pubkey);
        var aTag = "31922:" + event.pubkey + ":" + event.tagValue("d");
        rsvpEvent.tags = [
            ["a", aTag],
            ["d", uuid_1.v4()],
            ["status", status],
            ["p", activeUser.pubkey],
        ];
        rsvpEvent.publish();
    }, [ndk, activeUser]);
    if (activeUser === undefined)
        return React.createElement(material_1.CircularProgress, { size: 24 });
    // TODO: Add button to login
    if (activeUser === null)
        return null;
    return (React.createElement(React.Fragment, null,
        React.createElement(material_1.Button, { variant: "contained", color: "primary", size: "large", onClick: handleClick, endIcon: React.createElement(KeyboardArrowDown_1["default"], null), sx: { width: "100%" } }, t("event.rsvp.title")),
        React.createElement(StyledRsvpMenu, { anchorEl: anchorEl, open: open, onClose: handleClose },
            React.createElement(material_1.MenuItem, { onClick: function () { return handleRsvp("accepted"); }, disabled: loading, sx: function (theme) { return ({
                    backgroundColor: styles_1.alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.dark,
                    "&:hover": {
                        backgroundColor: styles_1.alpha(theme.palette.success.main, 0.2)
                    }
                }); } },
                React.createElement(Check_1["default"], null),
                t("event.rsvp.accept")),
            React.createElement(material_1.MenuItem, { onClick: function () { return handleRsvp("tentative"); }, disabled: loading, sx: function (theme) { return ({
                    backgroundColor: styles_1.alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.dark,
                    "&:hover": {
                        backgroundColor: styles_1.alpha(theme.palette.warning.main, 0.2)
                    }
                }); } },
                React.createElement(HelpOutline_1["default"], null),
                t("event.rsvp.maybe")),
            React.createElement(material_1.MenuItem, { onClick: function () { return handleRsvp("declined"); }, disabled: loading, sx: function (theme) { return ({
                    backgroundColor: styles_1.alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.dark,
                    "&:hover": {
                        backgroundColor: styles_1.alpha(theme.palette.error.main, 0.2)
                    }
                }); } },
                React.createElement(Close_1["default"], null),
                t("event.rsvp.decline")))));
}
exports["default"] = EventRsvpMenu;
