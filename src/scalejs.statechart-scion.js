/*global define*/
define([
    'scalejs!core',
    './scalejs.statechart-scion/state',
    'module'
], function (
    core,
    state,
    module
) {
    'use strict';

    core.registerExtension({ state: state(module.config()) });
});


