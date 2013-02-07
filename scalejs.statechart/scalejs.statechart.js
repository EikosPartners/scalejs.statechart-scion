/*global define*/
define([
    'scalejs!core',
    './scalejs.statechart/statechart'
], function (
    core,
    statechart
) {
    'use strict';

    core.registerExtension({ statechart: statechart });
});


