"use strict";
// src/components/common/events/EventRsvpMenu.tsx
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
var Delete_1 = require("@mui/icons-material/Delete");
var react_i18next_1 = require("react-i18next");
var nostr_hooks_1 = require("nostr-hooks");
var useRsvpHandler_1 = require("@/hooks/useRsvpHandler");
// Keep the styled menu component as is...
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
    var activeUser = nostr_hooks_1.useActiveUser().activeUser;
    var _b = React.useState(null), anchorEl = _b[0], setAnchorEl = _b[1];
    var open = Boolean(anchorEl);
    // Use our new hook
    var _c = useRsvpHandler_1.useRsvpHandler(event), rsvpStatus = _c.rsvpStatus, loading = _c.loading, createRsvp = _c.createRsvp, deleteRsvp = _c.deleteRsvp;
    var handleClick = function (event) {
        setAnchorEl(event.currentTarget);
    };
    var handleClose = function () {
        setAnchorEl(null);
    };
    // Handle RSVP status changes
    var handleRsvp = function (status) {
        createRsvp(status);
        handleClose();
    };
    // Handle RSVP deletion
    var handleDelete = function () {
        deleteRsvp();
        handleClose();
    };
    // Determine button text and color based on current RSVP status
    var getButtonProps = function () {
        if (loading) {
            return {
                text: t("common.loading"),
                color: "primary",
                startIcon: React.createElement(material_1.CircularProgress, { size: 18 })
            };
        }
        switch (rsvpStatus) {
            case "accepted":
                return {
                    text: t("event.rsvp.attending"),
                    color: "success",
                    startIcon: React.createElement(Check_1["default"], null)
                };
            case "tentative":
                return {
                    text: t("event.rsvp.tentative"),
                    color: "warning",
                    startIcon: React.createElement(HelpOutline_1["default"], null)
                };
            case "declined":
                return {
                    text: t("event.rsvp.notAttending"),
                    color: "error",
                    startIcon: React.createElement(Close_1["default"], null)
                };
            default:
                return {
                    text: t("event.rsvp.title"),
                    color: "primary",
                    startIcon: null
                };
        }
    };
    var buttonProps = getButtonProps();
    if (activeUser === undefined)
        return React.createElement(material_1.CircularProgress, { size: 24 });
    if (activeUser === null)
        return null; // Could add login button here
    return (React.createElement(React.Fragment, null,
        React.createElement(material_1.Button, { variant: "contained", color: buttonProps.color, size: "large", onClick: handleClick, endIcon: React.createElement(KeyboardArrowDown_1["default"], null), startIcon: buttonProps.startIcon, disabled: loading, sx: { width: "100%" } }, buttonProps.text),
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
                t("event.rsvp.tentative")),
            React.createElement(material_1.MenuItem, { onClick: function () { return handleRsvp("declined"); }, disabled: loading, sx: function (theme) { return ({
                    backgroundColor: styles_1.alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.dark,
                    "&:hover": {
                        backgroundColor: styles_1.alpha(theme.palette.error.main, 0.2)
                    }
                }); } },
                React.createElement(Close_1["default"], null),
                t("event.rsvp.decline")),
            rsvpStatus && (React.createElement(material_1.MenuItem, { key: "delete", onClick: handleDelete, disabled: loading, sx: function (theme) { return ({
                    borderTop: "1px solid " + theme.palette.divider,
                    backgroundColor: styles_1.alpha(theme.palette.grey[500], 0.1),
                    color: theme.palette.text.primary,
                    "&:hover": {
                        backgroundColor: styles_1.alpha(theme.palette.grey[500], 0.2)
                    }
                }); } },
                React.createElement(Delete_1["default"], null),
                t("event.rsvp.withdraw"))))));
}
exports["default"] = EventRsvpMenu;
