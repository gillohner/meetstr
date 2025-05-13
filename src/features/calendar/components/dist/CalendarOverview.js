"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// src/features/calendar/components/CalendarOverview.tsx
var React = require("react");
var react_1 = require("react");
var react_i18next_1 = require("react-i18next");
var nostr_hooks_1 = require("nostr-hooks");
var material_1 = require("@mui/material");
var nostrUtils_1 = require("@/utils/nostr/nostrUtils");
var useNostrEvent_1 = require("@/hooks/useNostrEvent");
var EventSection_1 = require("@/components/common/events/EventSection");
var eventUtils_1 = require("@/utils/nostr/eventUtils");
var CreateNewEventDialog_1 = require("@/components/common/events/CreateNewEventDialog");
function CalendarOverview(_a) {
    var _this = this;
    var calendarId = _a.calendarId;
    var ndk = nostr_hooks_1.useNdk().ndk;
    var t = react_i18next_1.useTranslation().t;
    var _b = useNostrEvent_1.useNostrEvent(), calendarEvent = _b.event, loading = _b.loading, errorCode = _b.errorCode, fetchEvent = _b.fetchEvent;
    var _c = react_1.useState([]), upcomingEvents = _c[0], setUpcomingEvents = _c[1];
    var _d = react_1.useState([]), pastEvents = _d[0], setPastEvents = _d[1];
    var expectedKinds = react_1.useMemo(function () { return [31924]; }, []);
    react_1.useEffect(function () {
        if (calendarId) {
            fetchEvent(calendarId, expectedKinds);
        }
    }, [calendarId, fetchEvent, expectedKinds]);
    // Handle calendar events fetch
    react_1.useEffect(function () {
        var loadCalendarEvents = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, upcoming, past;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!calendarEvent) return [3 /*break*/, 2];
                        return [4 /*yield*/, nostrUtils_1.fetchCalendarEvents(ndk, calendarEvent)];
                    case 1:
                        _a = _b.sent(), upcoming = _a.upcoming, past = _a.past;
                        setUpcomingEvents(upcoming);
                        setPastEvents(past);
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        loadCalendarEvents();
    }, [calendarEvent, ndk]);
    // Error message handling
    var errorMessage = react_1.useMemo(function () {
        if (!errorCode)
            return null;
        switch (errorCode) {
            case "not_found":
                return t("error.event.notFound");
            case "invalid_kind":
                return t("error.event.invalidKind");
            default:
                return t("error.generic");
        }
    }, [errorCode, t]);
    if (!calendarEvent) {
        if (loading)
            return React.createElement(material_1.Typography, null, t("common.loading"));
        if (errorCode)
            return React.createElement(material_1.Typography, { color: "error" }, errorCode);
        return React.createElement(material_1.Typography, { variant: "h4" }, t("error.event.invalidId"));
    }
    // Extract metadata using the utility function
    var metadata = eventUtils_1.getEventMetadata(calendarEvent);
    console.log("Calendar metadata:", metadata);
    return (React.createElement(material_1.Container, { maxWidth: "lg", sx: { mb: 4 } },
        React.createElement(material_1.Card, { sx: { width: "100%", mb: 4 } },
            React.createElement(material_1.CardMedia, { component: "img", alt: metadata.summary || "", height: "300", image: metadata.image || "", sx: { objectFit: "cover" } }),
            React.createElement(material_1.CardContent, null,
                React.createElement(material_1.Grid, { container: true, spacing: 2, direction: "row" },
                    React.createElement(material_1.Grid, { size: 10 },
                        React.createElement(material_1.Typography, { gutterBottom: true, variant: "h4", component: "div" }, metadata.title || t("error.event.noName")),
                        React.createElement(material_1.Typography, { variant: "body1", color: "text.secondary" }, metadata.summary || "")),
                    React.createElement(material_1.Grid, { size: 2 }, event && React.createElement(CreateNewEventDialog_1["default"], { event: event }))))),
        React.createElement(EventSection_1["default"], { title: t("calendar.upcomingEvents"), events: upcomingEvents, fallbackText: t("calendar.noUpcomingEvents") }),
        React.createElement(EventSection_1["default"], { title: t("calendar.pastEvents"), events: pastEvents, fallbackText: t("calendar.noPastEvents") })));
}
exports["default"] = CalendarOverview;
