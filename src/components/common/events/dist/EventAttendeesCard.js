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
    var _b = react_1.useState([]), rsvpParticipants = _b[0], setRsvpParticipants = _b[1];
    var _c = react_1.useState(true), loading = _c[0], setLoading = _c[1];
    // Get event coordinates for a tag filtering
    var eventCoordinates = react_1.useMemo(function () {
        if (!event)
            return null;
        var dTag = event.tags.find(function (t) { return t[0] === "d"; });
        var dValue = dTag ? dTag[1] : "";
        return event.kind + ":" + event.pubkey + ":" + dValue;
    }, [event]);
    // Fetch RSVPs using NDK directly
    react_1.useEffect(function () {
        if (!ndk || !(event === null || event === void 0 ? void 0 : event.id))
            return;
        var filters = [];
        // Add filter for e tag references
        filters.push({
            kinds: [31925],
            "#e": [event.id]
        });
        // Add filter for a tag references if available
        if (eventCoordinates) {
            filters.push({
                kinds: [31925],
                "#a": [eventCoordinates]
            });
        }
        var sub = ndk.subscribe(filters, { closeOnEose: false });
        var timeout = setTimeout(function () { return setLoading(false); }, 2000);
        sub.on("event", function (rsvpEvent) {
            setRsvpParticipants(function (prev) {
                var _a;
                return __spreadArrays(prev, [
                    {
                        pubkey: rsvpEvent.pubkey,
                        relay: (_a = rsvpEvent.relay) === null || _a === void 0 ? void 0 : _a.url,
                        role: "rsvp"
                    },
                ]);
            });
        });
        return function () {
            sub.stop();
            clearTimeout(timeout);
        };
    }, [ndk, event === null || event === void 0 ? void 0 : event.id, eventCoordinates]);
    // Combine and deduplicate participants
    var allParticipants = react_1.useMemo(function () {
        var participantMap = new Map();
        participants.forEach(function (p) { return participantMap.set(p.pubkey, p); });
        rsvpParticipants.forEach(function (p) {
            if (!participantMap.has(p.pubkey)) {
                participantMap.set(p.pubkey, p);
            }
        });
        return Array.from(participantMap.values());
    }, [participants, rsvpParticipants]);
    return (React.createElement(material_1.Card, { elevation: 3, sx: { mt: 3 } },
        React.createElement(material_1.CardContent, null,
            React.createElement(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 600 } },
                t("event.attendees"),
                " ",
                loading ? "" : "(" + allParticipants.length + ")"),
            React.createElement(material_1.Box, { sx: {
                    display: "flex",
                    justifyContent: "flex-start",
                    width: "100%"
                } },
                React.createElement(material_1.AvatarGroup, { sx: {
                        gap: 1.2,
                        flexWrap: "wrap"
                    } }, allParticipants.map(function (participant) { return (React.createElement(ParticipantAvatar, { key: participant.pubkey, pubkey: participant.pubkey })); }))))));
};
var ParticipantAvatar = function (_a) {
    var _b, _c;
    var pubkey = _a.pubkey;
    var _d = nostr_hooks_1.useProfile({ pubkey: pubkey }), profile = _d.profile, isLoading = _d.isLoading;
    var npub = react_1.useMemo(function () { return nostr_tools_1.nip19.npubEncode(pubkey); }, [pubkey]);
    var handleClick = function () {
        window.open("https://njump.me/" + npub, "_blank");
    };
    if (isLoading) {
        return React.createElement(material_1.Avatar, { sx: { bgcolor: "grey.300" } });
    }
    return (React.createElement(material_1.Tooltip, { title: (profile === null || profile === void 0 ? void 0 : profile.displayName) || npub },
        React.createElement(material_1.Avatar, { src: profile === null || profile === void 0 ? void 0 : profile.image, onClick: handleClick, sx: {
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.15)" }
            } }, !(profile === null || profile === void 0 ? void 0 : profile.image) && (((_c = (_b = profile === null || profile === void 0 ? void 0 : profile.displayName) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.toUpperCase()) || npub.slice(0, 2)))));
};
exports["default"] = EventAttendeesCard;
