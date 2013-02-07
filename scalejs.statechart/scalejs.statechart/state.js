/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core',
    './stateKinds',
    './transition'
], function (
    core,
    stateKinds,
    transition
) {
    'use strict';

    var // imports
        has = core.object.has,
        enumerable = core.linq.enumerable,
        array = core.array;

    return function state(spec, ancestors, context) {
        var self = {},
            uniqueIds = {};

        function genId(group) {
            var latestId = uniqueIds[group] || 0,
                nextId = latestId + 1,
                id = group + '_' + nextId;

            uniqueIds[group] = nextId;

            return id;
        }

        function id() {
            var stateId,
                latestId;

            if (has(spec, 'id')) {
                if (context.idToStateMap.hasOwnProperty(spec.id)) {
                    throw {
                        name: 'Illegal Argument',
                        message: 'Duplicate state id `' + spec.id + '`. State id-s must be unique.'
                    };
                }
                stateId = spec.id;
            } else {
                stateId = genId(spec.initial === true ? 'initial' : 'state');
            }

            context.idToStateMap[stateId] = self;

            return stateId;
        }

        function kind() {
            if (has(spec, 'states')) {
                return stateKinds.COMPOSITE;
            }

            if (spec.parallel) {
                return stateKinds.PARALLEL;
            }

            if (spec.history) {
                return stateKinds.HISTORY;
            }

            // spec.initial maybe a boolean indicating the state is initial on the parent,
            // or a string indicating an id of the child state that should be initial
            // Therefore state is initial only if the flag is boolean and is true
            if (spec.initial === true) {
                return stateKinds.INITIAL;
            }
            if (spec.final) {
                return stateKinds.FINAL;
            }

            return stateKinds.BASIC;
        }

        function transitions() {
            if (!has(spec, 'transitions')) {
                return [];
            }

            var transitionIds = enumerable
                .from(spec.transitions)
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
            if (!has(spec, 'states')) {
                return [];
            }

            var nextAncestors = ancestors.concat(self.id),
                states = enumerable
                    .from(spec.states)
                    .select(function (child) {
                        var st = state(child, nextAncestors, context);
                        return st.id;
                    })
                    .toArray();

            return states;
        }

        function initial() {
            var generatedInitial,
                generatedInitialId,
                initials = array.filter(self.children, function (s) {
                    return s.kind === stateKinds.INITIAL;
                });

            if (initials.length > 1) {
                throw new Error('Duplicate initial states in state "' + self.id + '".');
            }

            if (initials.length === 1) {
                return initials[0].id;
            }

            // parallel states and states with no children don't have initial.
            if (self.kind === stateKinds.PARALLEL ||
                    self.children.length === 0) {
                return undefined;
            }

            generatedInitialId = spec.initial || self.children[0];
            generatedInitial = state({
                initial: true,
                transitions: [{
                    target: generatedInitialId
                }]
            }, ancestors.concat(self.id), context);
            self.children.push(generatedInitial);

            return generatedInitial.id;
        }

        self.id = id();
        self.kind = kind();
        self.descendants = [];
        self.children = children();
        self.transitions = transitions();
        self.initial = initial();
        self.onEntry = spec.onEntry;
        self.onExit = spec.onExit;
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

