﻿/*global define,setTimeout,clearTimeout,console*/
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
            is = core.type.is,
            typeOf = core.type.typeOf,
            merge = core.object.merge,
            builder = core.functional.builder,
            //$doAction = core.functional.builder.$doAction,
            stateBuilder,
            transitionBuilder,
            state,
            parallel,
            transition;

        stateBuilder = builder({
            run: function (f, opts) {
                var s = new function state() {}; //ignore jslint

                if (has(opts, 'parallel')) {
                    s.type = 'parallel';
                }

                f(s);

                return s;
            },
            /*
            zero: function () {
                return function () {};
            },*/
            /*
            bind: function (x, f) {
                return function (state) {
                    x(state);
                    var s = f();
                    s(state);
                };
            },*/

            returnValue: function () {
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

                if (typeOf(expr) === 'state') {
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
            },

            missing: function (expr) {
                if (typeof expr === 'function') {
                    return expr;
                }

                throw new Error('Missing builder for expression', expr);
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

        function gotoGeneric(isInternal, targetOrAction, action) {
            return function goto(stateOrTransition) {
                if (typeOf(stateOrTransition) === 'state') {
                    return transition(gotoGeneric(isInternal, targetOrAction, action))(stateOrTransition);
                }

                if (isInternal) {
                    stateOrTransition.type = 'internal';
                }
                if (typeof targetOrAction === 'function') {
                    stateOrTransition.onTransition = targetOrAction;
                } else {
                    stateOrTransition.target = is(targetOrAction, 'array') ? targetOrAction : [targetOrAction];
                    if (action) {
                        stateOrTransition.onTransition = action;
                    }
                }
            };
        }

        function goto(target, action) {
            return gotoGeneric(false, target, action);
        }

        function gotoInternally(target, action) {
            return gotoGeneric(true, target, action);
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

            if (typeof action !== 'function') {
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

            if (action.name.indexOf('goto') !== 0) {
                action = onTransition(action);
            }

            return transition.apply(null, params.concat([action]));
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
                action
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
                action
            );
        }
        /*jslint unparam: false*/

        function initial(value) {
            return function (state) {
                if (state.parallel) {
                    return new Error('`initial` shouldn\'t be specified on parallel region.');
                }

                state.initial = value;
            };
        }

        function statechartBuilder(options) {
            return function statechart() {
                var spec = state.apply(null, arguments);

                //console.log(spec);

                return new scion.Statechart(spec, merge({
                    log: core.log.debug
                }, options));
            };
        }

        return {
            builder: statechartBuilder,
            state: state,
            parallel: parallel,
            initial: initial,
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

