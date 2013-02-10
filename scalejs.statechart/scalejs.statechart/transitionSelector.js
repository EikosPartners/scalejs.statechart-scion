/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core'
], function (
    core
) {
    'use strict';

    var enumerable = core.linq.enumerable;

    return function transitionSelector() {
        var eventNameReCache = {};

        function eventNameToRe(name) {
            return new RegExp("^" + (name.replace(/\./g, "\\.")) + "(\\.[0-9a-zA-Z]+)*$");
        }

        function retrieveEventRe(name) {
            if (!eventNameReCache[name]) {
                eventNameReCache[name] = eventNameToRe(name);
            }

            return eventNameReCache[name];
        }

        function nameMatch(t, eventNames) {
            var tEvents = t.events,
                f = tEvents.indexOf("*") > -1
                    ? function () { return true; }
                    : function (name) {
                        return enumerable.from(tEvents).any(function (tEvent) {
                            return retrieveEventRe(tEvent).test(name);
                        });
                    };
            return eventNames.filter(f).length;
        }

        return function (state, eventNames, evaluator) {
            return state.transitions.filter(function (t) {
                return (!t.events || nameMatch(t, eventNames)) && (!t.condition || evaluator(t));
            });
        };
    };
});

