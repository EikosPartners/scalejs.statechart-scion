/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core',
    './model',
    './state',
    './builder'
], function (
    core,
    model,
    state,
    builder
) {
    'use strict';

    var // imports
        has = core.object.has,
        array = core.array;

    return function factory() {
        var context,
            spec,
            root;

        function stateById(stateId) {
            return context.idToStateMap[stateId];
        }

        function resolveStates() {
            array.iter(context.states, function (s) {
                s.ancestorIds.reverse();
                s.descendantIds.reverse();
                // resolve states
                s.initial = stateById(s.initialId);
                s.history = stateById(s.history);
                s.children = array.map(s.childrenIds, stateById);
                s.parent = stateById(s.parentId);
                s.ancestors = array.map(s.ancestorIds, stateById);
                s.descendants = array.map(s.descendantIds, stateById);
                s.transitions = array.map(s.transitionIds, function (t) { return context.transitions[t]; });
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

        function createSpec(specOrBuilder) {
            if (arguments.length === 1 && !specOrBuilder.isBuilder) {
                return specOrBuilder;
            }

            var scb = builder.state.apply(null, ['root'].concat(Array.prototype.slice.call(arguments, 0)));

            return scb.state;
        }

        function create() {
            context  = {
                states: [],
                basicStates: [],
                uniqueEvents: {},
                transitions: [],
                idToStateMap: {},
                onFoundStateIdCallbacks: [],
                uniqueIds: {}
            };

            spec = createSpec.apply(null, arguments);
            root = state(spec, [], context);

            resolveStates();
            resolveTransitions();

            return root;
        }

        function getRoot() {
            return root;
        }

        function getSpec() {
            return spec;
        }

        function getStates() {
            return context.states;
        }

        function getTransitions() {
            return context.transitions;
        }

        return {
            create: create,
            getRoot: getRoot,
            getSpec: getSpec,
            getStates: getStates,
            getTransitions: getTransitions
        };
    };
});

