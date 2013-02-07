/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core',
    './transition'
], function (
    core,
    transition
) {
    'use strict';

    var // imports
        has = core.object.has,
        enumerable = core.linq.enumerable,
        array = core.array,
        // vars
        uniqueId = 0,
        stateKinds = {
            BASIC: 0,
            COMPOSITE: 1,
            PARALLEL: 2,
            HISTORY: 3,
            INITIAL: 4,
            FINAL: 5
        };

    return function state(opts, ancestors, context) {
        var self = {};

        function id() {
            var stateId;

            if (has(opts, 'id')) {
                if (context.idToStateMap.hasOwnProperty(opts.id)) {
                    throw {
                        name: 'Illegal Argument',
                        message: 'Duplicate state id `' + opts.id + '`. State id-s must be unique.'
                    };
                }
                stateId = opts.id;
            } else {
                uniqueId += 1;
                stateId = uniqueId;
            }

            context.idToStateMap[stateId] = self;
        }

        function kind() {
            if (has(state, 'states')) {
                return stateKinds.COMPOSITE;
            }

            if (state.parallel) {
                return stateKinds.PARALLEL;
            }

            if (state.history) {
                return stateKinds.HISTORY;
            }

            if (state.initial) {
                return stateKinds.INITIAL;
            }
            if (state.final) {
                return stateKinds.FINAL;
            }

            return stateKinds.BASIC;
        }

        function transitions() {
            if (!has(opts, 'transitions')) {
                return [];
            }

            var transitionIds = enumerable
                .from(opts.transitions)
                .select(function (t) {
                    var trans = transition(t, self, context);
                    return trans.id;
                }).toArray();

            return transitionIds;
        }

        function parent() {
            return ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined;
        }

        function documentOrder() {
            context.states.push(self);

            return context.states.length - 1;
        }

        function basicDocumentOrder() {
            if (self.kind === stateKinds.BASIC ||
                    self.kind === stateKinds.INITIAL ||
                        self.kind === stateKinds.HISTORY) {
                context.basicStates.push(self);

                return context.basicStates.length - 1;
            }
        }

        function children() {
            if (!has(opts, 'states')) {
                return [];
            }

            var states = enumerable
                .from(opts.children)
                .select(function (child) {
                    return state(child, context);
                })
                .toArray();

            return states;
        }

        self.id = id();
        self.kind = kind();
        self.children = children();
        self.transitions = transitions();
        self.onEntry = opts.onEntry;
        self.onExit = opts.onExit;
        self.parent = parent();
        self.documentOrder = documentOrder();
        self.basicDocumentOrder = basicDocumentOrder();
        self.depth = ancestors.length;
        self.ancestors = ancestors.slice();

        //walk back up ancestors and add this state to lists of descendants
        array.iter(ancestors, function (ancestor) {
            context.idToStateMap[ancestor].descendants.push(self.id);
        });

        return self;
    };
});

