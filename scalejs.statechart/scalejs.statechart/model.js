/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core',
    './stateKinds'
], function (
    core,
    stateKinds
) {
    'use strict';

    var // imports
        enumerable = core.linq.enumerable;

    function getAncestors(state, root) {
        var index;

        index = state.ancestors.indexOf(root);
        if (index > -1) {
            return state.ancestors.slice(0, index);
        }
        return state.ancestors;
    }

    function getAncestorsOrSelf(state, root) {
        return [state].concat(getAncestors(state, root));
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
                getLCA(s1, s2).kind === stateKinds.PARALLEL;
    }

    function isArenaOrthogonal(t1, t2) {
        var t1LCA = t1.targets ? t1.lca : t1.source,
            t2LCA = t2.targets ? t2.lca : t2.source,
            isOrthogonal = isOrthogonalTo(t1LCA, t2LCA);

        return isOrthogonal;
    }

    function getTransitionWithHigherSourceChildPriority(arg) {
        var t1 = arg[0],
            t2 = arg[1];

        //compare transitions based first on depth, then based on document order
        if (t1.source.depth < t2.source.depth) {
            return t2;
        }

        if (t2.source.depth < t1.source.depth) {
            return t1;
        }

        if (t1.documentOrder < t2.documentOrder) {
            return t1;
        }

        return t2;
    }

    return {
        getLCA: getLCA,
        getAncestors: getAncestors,
        getAncestorsOrSelf: getAncestorsOrSelf,
        isArenaOrthogonal: isArenaOrthogonal,
        getTransitionWithHigherSourceChildPriority: getTransitionWithHigherSourceChildPriority
    };
});

