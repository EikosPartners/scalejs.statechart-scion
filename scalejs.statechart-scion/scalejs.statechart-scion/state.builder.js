/*global define,setTimeout,clearTimeout,console*/
define([
    'scalejs!core',
    'scion'
], function (
    core,
    scion
) {
    'use strict';

    return function (config) {
        var array = core.array,
            has = core.object.has,
            merge = core.object.merge,
            builder = core.functional.builder,
            stateBuilder,
            transitionBuilder,
            state,
            parallel,
            transition;

        stateBuilder = builder({
            run: function (f, opts) {
                var s = {};

                if (has(opts, 'parallel')) {
                    s.parallel = opts.parallel;
                }

                f(s);

                return s;
            },

            zero: function () {
                return function () {};
            },

            combine: function (f, g) {
                return function (state) {
                    f(state);
                    g(state);
                };
            },

            missing: function (expr) {
                if (typeof expr === 'string') {
                    return function (state) {
                        if (state.id) {
                            throw new Error('Can\'t set state id to "' + expr + '". ' +
                                            'state\'s id is already set to "' + state.id + '"');
                        }
                        state.id = expr;
                    };
                }

                if (typeof expr === 'function') {
                    return expr;
                }

                if (expr.id) {
                    return function (state) {
                        if (!state.states) {
                            state.states = [];
                        }
                        state.states.push(expr);
                    };
                }

                throw new Error('Missing builder for expression', expr);
            }
        });

        state = stateBuilder();
        parallel = stateBuilder({ parallel: true });

        transitionBuilder = builder({
            run: function (f) {
                return function (state) {
                    if (!state.transitions) {
                        state.transitions = [];
                    }

                    var t = {};
                    f(t);

                    state.transitions.push(t);
                };
            },

            combine: function (f, g) {
                return function (transition) {
                    f(transition);
                    g(transition);
                };
            }
        });

        transition = transitionBuilder();

        function onEntry(f) {
            return function (state) {
                if (state.onEntry) {
                    throw new Error('Only one `onEntry` action is allowed.');
                }

                if (typeof f !== 'function') {
                    throw new Error('`onEntry` takes a function as a parameter.');
                }

                state.onEntry = f;

                return state;
            };
        }

        function onExit(f) {
            return function (state) {
                if (state.onExit) {
                    throw new Error('Only one `onExit` action is allowed.');
                }

                if (typeof f !== 'function') {
                    throw new Error('`onExit` takes a function as a parameter.');
                }

                state.onExit = f;

                return state;
            };
        }

        function event(eventName) {
            return function (transition) {
                transition.event = eventName;
            };
        }

        function condition(f) {
            return function (transition) {
                transition.cond = f;
            };
        }

        function goto(target) {
            return function (transition) {
                transition.target = target;
            };
        }

        function gotoInternally(target) {
            return function (transition) {
                transition.target = target;
                transition.type = 'internal';
            };
        }

        function onTransition(f) {
            return function (transition) {
                transition.onTransition = f;
            };
        }

        /*jslint unparam: true*/
        function on() {
            var args = array.copy(arguments),
                action = args.pop(),
                params;

            if (args.length > 2) {
                throw new Error('First (optional) argument should be event name, ' +
                                'second (optional) argument should be a condition function');
            }

            if (!(typeof action === 'function')) {
                throw new Error('Last argument should be either `goto` or a funciton.');
            }

            params = args.map(function (a) {
                if (typeof a === 'string') {
                    return event(a);
                }

                if (typeof a === 'function') {
                    return condition(a);
                }

                throw new Error('Transition argument ', a, ' is not supported. ' +
                                'First (optional) argument should be event name, ' +
                                'second (optional) argument should be a condition function');
            });

            return transition.apply(null, params.concat([onTransition(action)]));
        }

        function whenInStates() {
            var args = array.copy(arguments),
                action = args.pop();

            args.forEach(function (arg) {
                if (!(typeof arg === 'string')) {
                    throw new Error('`whenInStates` accepts list of states and either `goto` ' +
                                    'or a function as the last argument.');
                }
            });

            if (!(typeof action === 'function')) {
                throw new Error('Last argument should be either `goto` or a function.');
            }

            return transition(
                condition(function (e, isIn) {
                    return args.every(function (state) {
                        return isIn(state);
                    });
                }),
                onTransition(action)
            );
        }

        function whenNotInStates() {
            var args = array.copy(arguments),
                action = args.pop();

            args.forEach(function (arg) {
                if (!(typeof arg === 'string')) {
                    throw new Error('`whenNotInStates` accepts list of states and either `goto` ' +
                                    'or a function as the last argument.');
                }
            });

            if (!(typeof action === 'function')) {
                throw new Error('Last argument should be either `goto` or a function.');
            }

            return transition(
                condition(function (e, isIn) {
                    return args.every(function (state) {
                        return !isIn(state);
                    });
                }),
                onTransition(action)
            );
        }
        /*jslint unparam: false*/

        function statechartBuilder(options) {
            return function statechart() {
                var createSpec = state.apply(null, arguments),
                    spec = createSpec();

                console.log(spec);

                return new scion.Statechart(spec, merge({
                    log: core.log.debug
                }, options));
            };
        }

        return {
            builder: statechartBuilder,
            state: state,
            parallel: parallel,
            onEntry: onEntry,
            onExit: onExit,
            on: on,
            whenInStates: whenInStates,
            whenNotInStates: whenNotInStates,
            goto: goto,
            gotoInternally: gotoInternally,
            statechart: statechartBuilder({
                logStatesEnteredAndExited: config.logStatesEnteredAndExited,
                log: core.log.debug
            })
        };
    };
});

