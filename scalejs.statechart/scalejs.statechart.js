/*global define*/
define([
    'scalejs!core',
    './scalejs.statechart/statechart',
    './scalejs.statechart/builder'
], function (
    core,
    statechart,
    builder
) {
    'use strict';

    core.registerExtension({
        statechart: {
            statechart: statechart,
            builder: builder
        }
    });
});


