/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core'
], function (
    core
) {
    'use strict';

    var // imports
        has = core.object.has,
        enumerable = core.linq.enumerable;

    return function (opts, parentState, context) {
        function events() {
            var evts,
                tokens;

            if (!has(opts, 'event')) {
                return undefined;
            }

            if (opts.event === "*") {
                return [opts.event];
            }

            tokens = opts.event.trim().split(/\s+/);
            evts = enumerable.from(tokens)
                .select(function (event) {
                    // strip .* form the end
                    if (event.indexOf('.*', event.length - 2) >= 0) {
                        return event.indexOf(0, event.length - 2);
                    }

                    return event;
                })
                .filter('$ !== "*"')
                .forEach(function (event) {
                    context.uniqueEvents[event] = true;
                })
                .toArray();

            return evts;
        }

        function condition() {
            return opts.condition;
        }

        function targets() {
            if (has(opts, 'target')) {
                return opts.target.trim().split(/\s+/);
            }

            return [];
        }

        function action() {
            return opts.action;
        }

        var transition = {
            events: events(),
            condition: condition(),
            source: parentState.id,
            targets: targets(),
            action: action(),
            documentOrder: context.transitions.length,
            id: context.transitions.length
        };

        context.transitions.push(transition);

        return transition;
    };
});

