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

    return function state(spec, ancestorIds, context) {
        var self = {
            onEntry: spec.onEntry,
            onExit: spec.onExit,
            depth: ancestorIds.length,
            ancestorIds: array.copy(ancestorIds),
            descendantIds: [],
            childrenIds: [],
            transitionIds: []
        };

        function genId(group) {
            if (ancestorIds.length === 0) {
                return 'root';
            }

            var latestId = context.uniqueIds[group] || 0,
                nextId = latestId + 1,
                id = group + '_' + nextId;

            context.uniqueIds[group] = nextId;

            return id;
        }

        function parentId() {
            self.parentId = ancestorIds.length > 0 ? ancestorIds[ancestorIds.length - 1] : undefined;
        }

        function id() {
            if (has(spec, 'id')) {
                if (context.idToStateMap.hasOwnProperty(spec.id)) {
                    throw {
                        name: 'Illegal Argument',
                        message: 'Duplicate state id `' + spec.id + '`. State id-s must be unique.'
                    };
                }
                self.id = spec.id;
            } else {
                self.id = genId(spec.initial === true ? 'initial' : 'state');
            }

            context.idToStateMap[self.id] = self;
        }

        function kind() {
            var parentState;
            if (spec.parallel) {
                self.kind = stateKinds.PARALLEL;
                return;
            }

            if (has(spec, 'states')) {
                self.kind = stateKinds.COMPOSITE;
                return;
            }

            if (spec.history) {
                self.kind = stateKinds.HISTORY;
                return;
            }

            // spec.initial maybe a boolean indicating the state is initial on the parent,
            // or a string indicating an id of the child state that should be initial
            // Therefore state is initial only if the flag is boolean and is true
            if (spec.initial === true) {
                parentState = context.idToStateMap[self.parentId];
                // set this state as parent's initial
                if (has(parentState, 'initial')) {
                    throw new Error('Duplicate initial states in state "' + self.id + '".');
                }

                if (parentState) {
                    parentState.initialId = self.id;
                }

                self.kind = stateKinds.INITIAL;
                return;
            }

            if (spec.final) {
                self.kind = stateKinds.FINAL;
                return;
            }

            self.kind = stateKinds.BASIC;
        }

        function children() {
            if (!has(spec, 'states')) {
                return;
            }

            var nextAncestorIds = ancestorIds.concat(self.id),
                stateIds = array.map(spec.states, function (child) {
                    var st = state(child, nextAncestorIds, context);
                    return st.id;
                });

            self.childrenIds = stateIds;
        }

        function transitions() {
            if (!has(spec, 'transitions')) {
                return;
            }

            var transitionIds = enumerable
                .from(spec.transitions)
                .select(function (t) {
                    var trans = transition(t, self, context);
                    return trans.id;
                }).toArray();

            self.transitionIds = transitionIds;
        }

        function documentOrder() {
            context.states.push(self);

            self.documentOrder = context.states.length - 1;
        }

        function basicDocumentOrder() {
            if (self.kind === stateKinds.BASIC ||
                    self.kind === stateKinds.INITIAL ||
                        self.kind === stateKinds.HISTORY) {
                context.basicStates.push(self);

                self.basicDocumentOrder = context.basicStates.length - 1;
            }
        }

        function initial() {
            var generatedInitial,
                generatedInitialId;

            // parallel states and states with no children don't have initial.
            if (self.kind === stateKinds.PARALLEL || self.childrenIds.length === 0) {
                return;
            }

            // initialId could've been set by one of the children (marked with initial:true)
            // or it can be specified in spec
            // otherwise first child is default initial
            generatedInitialId = self.initialId || spec.initial || self.childrenIds[0];
            // Generate initial state that would transit to initial state right away.
            // This way we make sure initial state's onEntry is executed.
            generatedInitial = state({
                initial: true,
                transitions: [{
                    target: generatedInitialId
                }]
            }, ancestorIds.concat(self.id), context);

            self.childrenIds.push(generatedInitial.id);
            self.initialId = generatedInitial.id;
        }

        function descendants() {
            array.iter(ancestorIds, function (ancestor) {
                context.idToStateMap[ancestor].descendantIds.push(self.id);
            });
        }

        id();
        parentId();
        kind();
        children();
        transitions();
        initial();
        documentOrder();
        basicDocumentOrder();
        /*
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
        */
        //walk back up ancestors and add this state to lists of descendants
        descendants();

        return self;
    };
});

