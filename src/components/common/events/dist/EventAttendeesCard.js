"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
// src/components/common/events/EventAttendeesCard.tsx
var material_1 = require("@mui/material");
var nostr_hooks_1 = require("nostr-hooks");
var nostr_tools_1 = require("nostr-tools");
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var nostr_hooks_2 = require("nostr-hooks");
var EventAttendeesCard = function (_a) {
    var participants = _a.participants, event = _a.event;
    var t = react_i18next_1.useTranslation().t;
    var ndk = nostr_hooks_2.useNdk().ndk;
    var _b = react_1.useState([]), rsvpAccepted = _b[0], setRsvpAccepted = _b[1];
    var _c = react_1.useState([]), rsvpTentative = _c[0], setRsvpTentative = _c[1];
    var _d = react_1.useState([]), rsvpDeclined = _d[0], setRsvpDeclined = _d[1];
    var _e = react_1.useState(true), loading = _e[0], setLoading = _e[1];
    var eventCoordinates = react_1.useMemo(function () {
        if (!event)
            return null;
        var dTag = event.tags.find(function (t) { return t[0] === "d"; });
        return dTag ? event.kind + ":" + event.pubkey + ":" + dTag[1] : null;
    }, [event]);
    react_1.useEffect(function () {
        if (!ndk || !(event === null || event === void 0 ? void 0 : event.id))
            return;
        var filters = [
            {
                kinds: [31925],
                "#e": [event.id]
            },
        ];
        if (eventCoordinates) {
            filters.push({
                kinds: [31925],
                "#a": [eventCoordinates]
            });
        }
        var sub = ndk.subscribe(filters, { closeOnEose: false });
        var timeout = setTimeout(function () { return setLoading(false); }, 2000);
        sub.on("event", function (rsvpEvent) {
            var _a;
            var statusTag = rsvpEvent.tags.find(function (t) { return t[0] === "status"; });
            var status = statusTag === null || statusTag === void 0 ? void 0 : statusTag[1];
            var participant = {
                pubkey: rsvpEvent.pubkey,
                relay: (_a = rsvpEvent.relay) === null || _a === void 0 ? void 0 : _a.url,
                status: status || "accepted"
            };
            setRsvpAccepted(function (prev) { return updateParticipants(prev, participant, "accepted"); });
            setRsvpTentative(function (prev) { return updateParticipants(prev, participant, "tentative"); });
            setRsvpDeclined(function (prev) { return updateParticipants(prev, participant, "declined"); });
        });
        return function () {
            sub.stop();
            clearTimeout(timeout);
        };
    }, [ndk, event === null || event === void 0 ? void 0 : event.id, eventCoordinates]);
    var updateParticipants = function (existing, newPart, status) {
        var filtered = existing.filter(function (p) { return p.pubkey !== newPart.pubkey; });
        return newPart.status === status ? __spreadArrays(filtered, [newPart]) : filtered;
    };
    var categorizedParticipants = react_1.useMemo(function () { return ({
        accepted: __spreadArrays(participants.filter(function (p) { return !p.status; }), rsvpAccepted),
        tentative: rsvpTentative,
        declined: rsvpDeclined
    }); }, [participants, rsvpAccepted, rsvpTentative, rsvpDeclined]);
    var totalAttendees = react_1.useMemo(function () { return categorizedParticipants.accepted.length + categorizedParticipants.tentative.length; }, [categorizedParticipants]);
    return (React.createElement(material_1.Card, { elevation: 3, sx: { mt: 3 } },
        React.createElement(material_1.CardContent, null,
            React.createElement(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 600 } },
                t("event.attendees"),
                " ",
                loading ? "" : "(" + totalAttendees + ")"),
            React.createElement(material_1.Stack, { spacing: 3 },
                React.createElement(AttendanceCategory, { title: t("event.rsvp.accepted"), participants: categorizedParticipants.accepted, loading: loading, color: "success" }),
                React.createElement(AttendanceCategory, { title: t("event.rsvp.tentative"), participants: categorizedParticipants.tentative, loading: loading, color: "warning" }),
                React.createElement(AttendanceCategory, { title: t("event.rsvp.declined"), participants: categorizedParticipants.declined, loading: loading, color: "error" })))));
};
var AttendanceCategory = function (_a) {
    var title = _a.title, participants = _a.participants, loading = _a.loading, color = _a.color;
    return (React.createElement(material_1.Box, { sx: { display: "flex", justifyContent: "flex-start", flexWrap: "wrap" } },
        React.createElement(material_1.Stack, { direction: "row", spacing: 1, alignItems: "center", sx: { mb: 1.5 } },
            React.createElement(material_1.Chip, { label: title, size: "small", color: color }),
            !loading && React.createElement(material_1.Typography, { variant: "caption" },
                "(",
                participants.length,
                ")")),
        React.createElement(material_1.AvatarGroup, { sx: { gap: 1.2 } }, participants.map(function (p) { return (React.createElement(ParticipantAvatar, { key: p.pubkey, pubkey: p.pubkey, status: p.status })); }))));
};
var ParticipantAvatar = function (_a) {
    var _b, _c;
    var pubkey = _a.pubkey, status = _a.status;
    var _d = nostr_hooks_1.useProfile({ pubkey: pubkey }), profile = _d.profile, isLoading = _d.isLoading;
    var npub = react_1.useMemo(function () { return nostr_tools_1.nip19.npubEncode(pubkey); }, [pubkey]);
    return (React.createElement(material_1.Tooltip, { title: (profile === null || profile === void 0 ? void 0 : profile.displayName) || npub },
        React.createElement(material_1.Avatar, { src: profile === null || profile === void 0 ? void 0 : profile.image, sx: {
                cursor: "pointer",
                transition: "transform 0.2s",
                border: function (theme) {
                    return status
                        ? "2px solid " + theme.palette[status === "accepted" ? "success" : status === "tentative" ? "warning" : "error"].main
                        : "none";
                },
                "&:hover": { transform: "scale(1.15)" }
            }, onClick: function () { return window.open("https://njump.me/" + npub, "_blank"); } }, !isLoading &&
            !(profile === null || profile === void 0 ? void 0 : profile.image) &&
            (((_c = (_b = profile === null || profile === void 0 ? void 0 : profile.displayName) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.toUpperCase()) || npub.slice(0, 2)))));
};
exports["default"] = EventAttendeesCard;
