"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
// src/components/NostrEventCreation/CreateCalendarForm.tsx
var react_1 = require("react");
var ndk_1 = require("@nostr-dev-kit/ndk");
var nostr_hooks_1 = require("nostr-hooks");
var material_1 = require("@mui/material");
var NostrLogin_1 = require("@/components/NostrLogin");
var react_i18next_1 = require("react-i18next");
function CreateCalendarForm() {
    var t = react_i18next_1.useTranslation().t;
    var _a = react_1.useState(""), title = _a[0], setTitle = _a[1];
    var _b = react_1.useState(""), description = _b[0], setDescription = _b[1];
    var _c = react_1.useState(""), imageUrl = _c[0], setImageUrl = _c[1];
    var _d = react_1.useState([]), calendarRefs = _d[0], setCalendarRefs = _d[1];
    var _e = react_1.useState(""), currentRef = _e[0], setCurrentRef = _e[1];
    var _f = react_1.useState(""), errorMessage = _f[0], setErrorMessage = _f[1]; // New state for error messages
    var ndk = nostr_hooks_1.useNdk().ndk;
    // Add a calendar reference when pressing Enter
    var handleRefKeyDown = react_1.useCallback(function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            var value_1 = currentRef.trim();
            if (!value_1)
                return;
            setCalendarRefs(function (prev) { return __spreadArrays(prev, [value_1]); });
            setCurrentRef("");
        }
    }, [currentRef]);
    // Remove a calendar reference
    var handleDeleteRef = react_1.useCallback(function (index) {
        setCalendarRefs(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
    }, []);
    // Handle publishing the event
    var handlePublish = react_1.useCallback(function () {
        if (!title.trim() || !description.trim()) {
            setErrorMessage(t("createCalendar.error.requiredFields")); // Show error for missing fields
            return;
        }
        var event = new ndk_1.NDKEvent(ndk);
        // Set content to description (as per NIP-52)
        event.content = description;
        // Set kind to NIP-52 calendar kind (31924)
        event.kind = 31924;
        // Populate tags according to NIP-52
        event.tags = [
            ["title", title],
            ["summary", description],
        ];
        // Add image URL if provided
        if (imageUrl.trim()) {
            event.tags.push(["image", imageUrl]);
        }
        // Add calendar references as "a" tags
        calendarRefs.forEach(function (ref) {
            event.tags.push(["a", ref]);
        });
        try {
            event.publish();
        }
        catch (error) {
            console.error("Error publishing event:", error);
            setErrorMessage(t("createCalendar.error.publishFailed")); // Show error for publishing failure
            return;
        }
        // Reset form fields
        setTitle("");
        setDescription("");
        setImageUrl("");
        setCalendarRefs([]);
    }, [title, description, imageUrl, calendarRefs, ndk]);
    return (React.createElement(NostrLogin_1.RequireLogin, null,
        React.createElement(material_1.Paper, { elevation: 3, sx: { p: 3, maxWidth: 900, minWidth: 600, mt: 4 } },
            React.createElement(material_1.Box, { component: "form", noValidate: true, sx: { mt: 3, mb: 2 } },
                errorMessage && (React.createElement(material_1.Alert, { severity: "error", sx: { mb: 2 } }, errorMessage)),
                React.createElement(material_1.Grid, { sx: { mb: 2 } },
                    React.createElement(material_1.TextField, { required: true, fullWidth: true, label: t("createCalendar.titleInput.label"), value: title, onChange: function (e) { return setTitle(e.target.value); } })),
                React.createElement(material_1.Grid, { sx: { mb: 2 } },
                    React.createElement(material_1.TextField, { required: true, fullWidth: true, label: t("createCalendar.descriptionInput.label"), multiline: true, rows: 4, value: description, onChange: function (e) { return setDescription(e.target.value); } })),
                React.createElement(material_1.Grid, { sx: { mb: 2 } },
                    React.createElement(material_1.TextField, { fullWidth: true, label: t("createCalendar.imgUrlInput.label"), value: imageUrl, onChange: function (e) { return setImageUrl(e.target.value); } })),
                React.createElement(material_1.Grid, { sx: { mb: 2 } },
                    React.createElement(material_1.TextField, { fullWidth: true, label: t("createCalendar.calendarReferencesInput.label"), value: currentRef, onChange: function (e) { return setCurrentRef(e.target.value); }, onKeyDown: handleRefKeyDown, placeholder: t("createCalendar.calendarReferencesInput.placeholder"), helperText: t("createCalendar.calendarReferencesInput.helperText"), sx: { mb: 2 } }),
                    React.createElement(material_1.Box, { sx: { display: "flex", flexWrap: "wrap", gap: 1, mb: 2 } }, calendarRefs.map(function (ref, index) { return (React.createElement(material_1.Chip, { key: index, label: ref, onDelete: function () { return handleDeleteRef(index); }, color: "primary", sx: { my: 0.5 } })); }))),
                React.createElement(material_1.Grid, { sx: { mb: 2 } },
                    React.createElement(material_1.Button, { variant: "contained", color: "primary", size: "large", onClick: handlePublish }, t("createCalendar.publish")))))));
}
exports["default"] = CreateCalendarForm;
