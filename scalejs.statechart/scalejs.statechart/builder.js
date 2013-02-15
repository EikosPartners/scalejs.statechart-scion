/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core'
], function (
    core
) {
    'use strict';

    var // imports
        is = core.type.is,
        has = core.object.has,
        //merge = core.object.merge,
        array = core.array;

    function stateBuilder(state) {
        var builder;

        function onEntry(f) {
            if (has(state, 'onEntry')) {
                throw new Error('Only one `onEntry` action is allowed.');
            }

            if (!is(f, 'function')) {
                throw new Error('`onEntry` takes a function as a parameter.');
            }

            state.onEntry = f;

            return builder;
        }

        function onExit(f) {
            if (has(state, 'onExit')) {
                throw new Error('Only one `onExit` action is allowed.');
            }

            if (!is(f, 'function')) {
                throw new Error('`onExit` takes a function as a parameter.');
            }

            state.onExit = f;

            return builder;
        }

        function startTransition() {
            var transition = {};

            if (!has(state, 'transitions')) {
                state.transitions = [];
            }
            state.transitions.push(transition);

            return transition;
        }

        function transitionGoto(transition, stateOrAction, action) {
            if (!transition) {
                throw new Error('`transition` is undefined.');
            }

            if (is(stateOrAction, 'string')) {
                transition.target = stateOrAction;
                if (has(action)) {
                    if (!is(action, 'function')) {
                        throw new Error('`action` must be an action.');
                    }
                    transition.action = action;
                }

                return builder;
            }

            if (is(stateOrAction, 'function')) {
                if (has(action)) {
                    throw new Error('`goto` parameters should be either target id(s) or action function or both.');
                }
                transition.action = stateOrAction;

                return builder;
            }

            throw new Error('`goto` parameters should be either target id(s) or action function or both.');
        }

        function goto(stateOrAction, action) {
            return transitionGoto(startTransition(), stateOrAction, action);
        }


        function on(eventOrCondition, condition) {
            var transition = startTransition(),
                transitionBuilder = {
                    doNothing: builder,
                    goto: function (stateOrAction, action) {
                        return transitionGoto(transition, stateOrAction, action);
                    }
                };

            if (is(eventOrCondition, 'string')) {
                transition.event = eventOrCondition;
                if (has(condition)) {
                    if (!is(condition, 'function')) {
                        throw new Error('`condition` must be a function.');
                    }
                    transition.condition = condition;
                }

                return transitionBuilder;
            }

            if (is(eventOrCondition, 'function')) {
                if (has(condition)) {
                    throw new Error('`on` parameters should be either an event name or condition function or both.');
                }
                transition.condition = eventOrCondition;

                return transitionBuilder;
            }

            throw new Error('`on` parameters should be either an event name or condition function or both.');
        }

        function toSpec() {
            return state;
        }

        builder = {
            isBuilder: true,
            onEntry: onEntry,
            onExit: onExit,
            on: on,
            goto: goto,
            toSpec: toSpec
        };

        return builder;
    }

    function withState(s, opts) {
        var builderArgsStart = 1;

        if (arguments.length > 1) {
            if (!opts.isBuilder) {
                builderArgsStart = 2;
                if (opts.initial) {
                    if (s.parallel) {
                        return new Error('`initial` shouldn\'t be specified on parallel region.');
                    }
                    s.initial = opts.initial;
                }
                if (opts.parallel) {
                    s.parallel = opts.parallel;
                }
            }

            if (arguments.length > builderArgsStart) {
                s.states = array.toArray(arguments).slice(builderArgsStart).map(function (sb) {
                    return sb.toSpec();
                });
            }
        }

        return stateBuilder(s);
    }

    function state(id) {
        // if first argument is a string then it's an id
        if (is(id, 'string')) {
            return withState.apply(null, [{id: id}].concat(array.toArray(arguments, 1)));
        }
        // otherwise it's a builder (e.g. state being created doesn't have an id)
        return withState.apply(null, [{}].concat(array.toArray(arguments)));
    }

    function parallel(id) {
        // if first argument is a string then it's an id
        if (is(id, 'string')) {
            return withState.apply(null, [{id: id, parallel: true}].concat(array.toArray(arguments, 1)));
        }
        // otherwise it's a builder (e.g. state being created doesn't have an id)
        return withState.apply(null, [{parallel: true}].concat(array.toArray(arguments)));
    }

    return {
        state: state,
        parallel: parallel
    };
});

