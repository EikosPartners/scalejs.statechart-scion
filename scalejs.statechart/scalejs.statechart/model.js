/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core',
    './state',
    './stateKind'
], function (
    core,
    state,
    stateKind
) {
    'use strict';

    var // imports
        has = core.object.has,
        enumerable = core.linq.enumerable,
        array = core.array;

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
            root;

        function stateById(stateId) {
            return context.idToStateMap[stateId];
        }

        function getAncestors(s, root) {
            var ancestors,
                index,
                state;

            index = s.ancestors.indexOf(root);
            if (index > -1) {
                return s.ancestors.slice(0, index);
            }
            return s.ancestors;
        }

        function getAncestorsOrSelf(s, root) {
            return [s].concat(getAncestors(s, root));
        }

        function getDescendantsOrSelf(s) {
            return [s].concat(s.descendants);
        }

        function isAncestrallyRelatedTo(s1, s2) {
            //Two control states are ancestrally related if one is child/grandchild of another.
            return getAncestorsOrSelf(s2).indexOf(s1) > -1 ||
                   getAncestorsOrSelf(s1).indexOf(s2) > -1;
        }

        function getLCA(s1, s2) {
            var lca = enumerable
                .from(getAncestors(s1))
                .firstOrDefault(null, function (a) {
                    return a.descendants.indexOf(s2) > -1;
                });

            return lca;
        }

        function isOrthogonalTo(s1, s2) {
            //Two control states are orthogonal if they are not ancestrally
            //related, and their smallest, mutual parent is a Concurrent-state.
            return !isAncestrallyRelatedTo(s1, s2) &&
                   getLCA(s1, s2).kind === stateKind.PARALLEL;
        }


        root = state(spec, [], context);

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
            /*
            array.iter(s.transitions, function (transitionId) {
                var t = context.transitions
                t.source = stateById(t.source);
                t.targets = array.map(t.targets, function (targetId) {
                    var target = stateById(targetId);
                    if (!has(target)) {
                        throw new Error('Transition targets state "' + targetId + '" but such state doesn\'t exist.');
                    }
                    return target;
                });
            });*/
        });

        array.iter(context.transitions, function (t) {
            t.source = stateById(t.source);
            t.targets = array.map(t.targets, function (targetId) {
                var target = stateById(targetId);
                if (!has(target)) {
                    throw new Error('Transition targets state "' + targetId + '" but such state doesn\'t exist.');
                }
                return target;
            });
        });

        // for every transition set it's LCA
        enumerable
            .from(context.transitions)
            .where(function (t) {
                return has(t, 'targets');
            })
            .forEach(function (t) {
                t.lca = getLCA(t.source, t.targets[0]);
            });

        return {
            root: root,
            getLCA: getLCA
        };
    };
});

