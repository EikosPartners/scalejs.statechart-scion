/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core',
    './model',
    './state'
], function (
    core,
    model,
    state
) {
    'use strict';

    var // imports
        has = core.object.has,
        array = core.array;

    return function builder() {
        var context,
            root;

        function stateById(stateId) {
            return context.idToStateMap[stateId];
        }

        function resolveStates() {
            array.iter(context.states, function (s) {
                s.ancestors.reverse();
                s.descendants.reverse();
                // resolve states
                s.initial = stateById(s.initial);
                s.history = stateById(s.history);
                s.children = array.map(s.children, stateById);
                s.parent = stateById(s.parent);
                s.ancestors = array.map(s.ancestors, stateById);
                s.descendants = array.map(s.descendants, stateById);
                s.transitions = array.map(s.transitions, function (t) { return context.transitions[t]; });
            });
        }

        function resolveTransitions() {
            array.iter(context.transitions, function (t) {
                t.source = stateById(t.source);
                t.targets = array.map(t.targets, function (targetId) {
                    var target = stateById(targetId);
                    if (!has(target)) {
                        throw new Error('Transition targets state "' + targetId + '" but such state doesn\'t exist.');
                    }
                    return target;
                });

                if (t.targets.length > 0) {
                    t.lca = model.getLCA(t.source, t.targets[0]);
                }
            });
        }

        function build(spec) {
            context  = {
                states: [],
                basicStates: [],
                uniqueEvents: {},
                transitions: [],
                idToStateMap: {},
                onFoundStateIdCallbacks: []
            };

            root = state(spec, [], context);

            resolveStates();
            resolveTransitions();

            return root;
        }

        function getRoot() {
            return root;
        }

        function getStates() {
            return context.states;
        }

        function getTransitions() {
            return context.transitions;
        }

        return {
            build: build,
            getRoot: getRoot,
            getStates: getStates,
            getTransitions: getTransitions
        };
    };
});

