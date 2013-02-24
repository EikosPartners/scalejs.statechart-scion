/*global define*/
define([
    'scalejs!core',
    './scalejs.statechart-scion/state'
], function (
    core,
    state
) {
    'use strict';

    core.registerExtension({ state: state });
});


