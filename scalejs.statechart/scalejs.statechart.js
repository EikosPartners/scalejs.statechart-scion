/*global define*/
define([
    'scalejs!core',
    './scalejs.statechart/statechart',
    './scalejs.statechart/builder'
], function (
    core,
    statechart,
    builder
) {
    'use strict';

    var enumerable = core.linq.enumerable,
        has = core.object.has,
        state = builder.state,
        parallel = builder.parallel,
        applicationStatechartSpec,
        applicationStatechart;

    function findState(state, stateId) {
        function allStates(current) {
            if (has(current, 'states')) {
                return enumerable.make(current)
                    .concat(enumerable.from(current.states).selectMany(function (s) {
                        return allStates(s);
                    }));
            }

            return enumerable.make(current);
        }

        var found = allStates(state).firstOrDefault(function (s) { return s.id === stateId; });

        return found;
    }


    function registerState(parentStateId, stateBuilder) {
        if (core.isApplicationStarted()) {
            throw new Error('Can\'t add new state to application that is already running.');
        }

        var state = stateBuilder.toSpec(),
            parent,
            existing;

        parent = findState(applicationStatechartSpec, parentStateId);
        if (!parent) {
            throw new Error('Parent state "' + parentStateId + '" doesn\'t exist');
        }

        if (has(state, 'id')) {
            existing = findState(applicationStatechartSpec, state.id);
            if (existing) {
                throw new Error('State "' + state.id + '" already exists.');
            }
        }

        if (!has(parent, 'states')) {
            parent.states = [];
        }
        parent.states.push(state);
    }

    function raise(eventName, eventData, delay) {
        applicationStatechart.raise(eventName, eventData, delay);
    }

    applicationStatechartSpec = state('scalejs', parallel('root')).toSpec();

    core.onApplicationStarted(function () {
        applicationStatechart = statechart(applicationStatechartSpec);
        applicationStatechart.start();
    });

    core.registerExtension({
        state: {
            registerState: registerState,
            raise: raise,
            statechart: statechart,
            builder: builder
        }
    });
});


