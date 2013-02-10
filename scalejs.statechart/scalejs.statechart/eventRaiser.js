/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core'
], function (
    core
) {
    'use strict';

    var // imports
        has = core.object.has,
        is = core.type.is,
        log = core.log.debug;

    return function eventRaiser(raiseEvent) {
        function create(eventName, data) {
            if (!is(eventName, 'string')) {
                throw {
                    name: 'Illegal Argument',
                    message: '`eventName` must be a string.'
                };
            }

            return {name : eventName, data : data};
        }

        function doRaise(eventName, data, delay, raiser) {
            var event = create(eventName, data);

            log('raising event ' + event.name + ' with content', event.data, 'after delay ', delay);

            if (has(delay) && delay > 0) {
                setTimeout(function () {
                    raiser(event);
                }, delay);
            } else {
                raiser(event);
            }
        }

        function raise(eventName, dataOrDelay, delay, raiser) {
            if (is(dataOrDelay, 'number')) {
                doRaise(eventName, {}, dataOrDelay, raiser);
                return;
            }

            if (is(dataOrDelay, 'object')) {
                doRaise(eventName, dataOrDelay, delay, raiser);
                return;
            }

            throw {
                name: 'Illegal Argument',
                message: '`dataOrDelay` must be either a number indicating the delay or an event data object.'
            };
        }

        return function (eventName, dataOrDelay, delay) {
            raise(eventName, dataOrDelay, delay, raiseEvent);
        };
    };
});

