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
        has = core.object.has,
        enumerable = core.linq.enumerable,
        array = core.array;

    function getAncestors(state, root) {
        var ancestors,
            index;

        index = state.ancestors.indexOf(root);
        if (index > -1) {
            return state.ancestors.slice(0, index);
        }
        return state.ancestors;
    }

    function getAncestorsOrSelf(state, root) {
        return [state].concat(getAncestors(state, root));
    }

    function getDescendantsOrSelf(state) {
        return [state].concat(state.descendants);
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


    return {
        getLCA: getLCA,
        getAncestors: getAncestors,
        getAncestorsOrSelf: getAncestorsOrSelf,
        isArenaOrthogonal: isArenaOrthogonal
    };
});

