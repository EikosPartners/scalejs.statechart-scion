/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core',
    './state'
], function (
    core,
    state
) {
    'use strict';

    var // imports
        has = core.object.has,
        enumerable = core.linq.enumerable;

    return function model(spec) {
        // Creation context that tracks everything created while creating the state.
        // It's created once for root state and then is passed to child states/transitions.
        var context = {
                states: [],
                basicStates: [],
                uniqueEvents: {},
                transitions: [],
                idToStateMap: {},
                onFoundStateIdCallbacks: []
            },
            root = state(spec, [], context);

        return {
            root: root
        };
    };
});

