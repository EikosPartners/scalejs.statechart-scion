/*global define,setTimeout,clearTimeout*/
define([
    'scalejs!core',
    'scion'
], function (
    core,
    scion
) {
    'use strict';

    var toArray = core.array.toArray,
        defaultBuilder;

    function builder(options) {
        function stateBuilder(state) {
            var builder;

            function onEntry(f) {
                if (state.onEntry) {
                    throw new Error('Only one `onEntry` action is allowed.');
                }

                if (typeof f !== 'function') {
                    throw new Error('`onEntry` takes a function as a parameter.');
                }

                state.onEntry = f;

                return builder;
            }

            function onExit(f) {
                if (state.onExit) {
                    throw new Error('Only one `onExit` action is allowed.');
                }

                if (typeof f !== 'function') {
                    throw new Error('`onExit` takes a function as a parameter.');
                }

                state.onExit = f;

                return builder;
            }

            function startTransition(isInternal) {
                var transition = {};
                if (isInternal) {
                    transition.type = 'internal';
                }

                if (!state.transitions) {
                    state.transitions = [];
                }
                state.transitions.push(transition);

                return transition;
            }

            function transitionGoto(transition, stateOrAction, action) {
                if (!transition) {
                    throw new Error('`transition` is undefined.');
                }

                if (typeof stateOrAction === 'string') {
                    transition.target = stateOrAction.split(' ');
                    if (action) {
                        if (typeof action !== 'function') {
                            throw new Error('`action` must be an action.');
                        }
                        transition.onTransition = action;
                    }

                    return builder;
                }

                if (typeof stateOrAction === 'function') {
                    if (action) {
                        throw new Error('`goto` parameters should be either target id(s) or action function or both.');
                    }
                    transition.onTransition = stateOrAction;

                    return builder;
                }

                throw new Error('`goto` parameters should be either target id(s) or action function or both.');
            }

            function goto(stateOrAction, action) {
                return transitionGoto(startTransition(), stateOrAction, action);
            }

            function gotoInternally(stateOrAction, action) {
                return transitionGoto(startTransition(true), stateOrAction, action);
            }

            function on(eventOrCondition, condition) {
                var transition = startTransition(),
                    transitionBuilder = {
                        doNothing: builder,
                        goto: function (stateOrAction, action) {
                            return transitionGoto(transition, stateOrAction, action);
                        },
                        gotoInternally: function (stateOrAction, action) {
                            transition.type = 'internal';
                            return transitionGoto(transition, stateOrAction, action);
                        }
                    };

                if (typeof eventOrCondition === 'string') {
                    transition.event = eventOrCondition;
                    if (condition !== undefined) {
                        if (typeof condition !== 'function') {
                            throw new Error('`condition` must be a function.');
                        }
                        transition.cond = condition;
                    }

                    return transitionBuilder;
                }

                if (typeof eventOrCondition === 'function') {
                    if (condition !== undefined) {
                        throw new Error('`on` parameters should be either an event name or condition function or both.');
                    }
                    transition.cond = eventOrCondition;

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
                gotoInternally: gotoInternally,
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
                    s.states = toArray(arguments, builderArgsStart).map(function (sb) {
                        return sb.toSpec();
                    });
                }
            }

            return stateBuilder(s);
        }

        function state(id) {
            // if first argument is a string then it's an id
            if (typeof id === 'string') {
                return withState.apply(null, [{id: id}].concat(toArray(arguments, 1)));
            }
            // otherwise it's a builder (e.g. state being created doesn't have an id)
            return withState.apply(null, [{}].concat(toArray(arguments, 0)));
        }

        function parallel(id) {
            // if first argument is a string then it's an id
            if (typeof id === 'string') {
                return withState.apply(null, [{id: id, type: 'parallel'}].concat(toArray(arguments, 1)));
            }
            // otherwise it's a builder (e.g. state being created doesn't have an id)
            return withState.apply(null, [{parallel: true}].concat(toArray(arguments)));
        }

        function statechart() {
            var builder = state.apply(null, arguments);

            //console.log(JSON.stringify(builder.toSpec()));

            return new scion.Statechart(builder.toSpec(), options);
        }

        return {
            state: state,
            parallel: parallel,
            statechart: statechart
        };
    }

    defaultBuilder = builder({
        logStatesEnteredAndExited: false
    });

    return {
        builder: builder,
        state: defaultBuilder.state,
        parallel: defaultBuilder.parallel,
        statechart: defaultBuilder.statechart
    };
});

