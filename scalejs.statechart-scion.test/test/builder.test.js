/*global define,describe,expect,it,jasmine*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var state = core.state.builder.state,
        parallel = core.state.builder.parallel,
        initial = core.state.builder.initial,
        onEntry = core.state.builder.onEntry,
        onExit = core.state.builder.onExit,
        on = core.state.builder.on,
        goto = core.state.builder.goto;

    describe('builder', function () {
        it('empty', function () {
            var spec = state(),
                expected = {};

            expect(spec).toEqual(expected);
        });
        
        it('single child state', function () {
            var expected = { id: 'a' },
                spec = state('a');

            expect(spec).toEqual(expected);
        });
         
        
        it('multiple child state', function () {
            var expected = {
                    id: 'root',
                    states: [{
                        id: 'a'
                    }, {
                        id: 'b'
                    }, {
                        id: 'c'
                    }]
                },
                spec = state('root',
                    state('a'),
                    state('b'),
                    state('c'));

            expect(spec).toEqual(expected);
        });
        
        it('nested child states', function () {
            var expected = {
                    id: 'root',
                    states: [{
                        id: 'a',
                        states: [{
                            id: 'a1'
                        }, {
                            id: 'a2'
                        }]
                    }, {
                        id: 'b',
                        states: [{
                            id: 'b1'
                        }, {
                            id: 'b2'
                        }]
                    }, {
                        id: 'c'
                    }]
                },
                spec = state('root',
                    state('a',
                        state('a1'),
                        state('a2')),
                    state('b',
                        state('b1'),
                        state('b2')),
                    state('c'));

            expect(spec).toEqual(expected);
        });
        
        it('state with onEntry', function () {
            var f = jasmine.createSpy(),
                expected = {
                    id: 'root',
                    states: [{
                        id: 'a',
                        onEntry: f
                    }]
                },
                spec = state('root',
                    state('a', 
                        onEntry(f)));

            expect(spec).toEqual(expected);
        });
        
        it('state with onExit', function () {
            var f = jasmine.createSpy(),
                expected = {
                    id: 'root',
                    states: [{
                        id: 'a',
                        onExit: f
                    }]
                },
                spec = state('root',
                    state('a', onExit(f)));

            expect(spec).toEqual(expected);
        });
        
        it('state with transition', function () {
            var condition = jasmine.createSpy(),
                action = jasmine.createSpy(),
                expected = {
                    id: 'root',
                    states: [{
                        id: 'a',
                        transitions: [{
                            event: 't',
                            cond: condition,
                            target: ['b'],
                            onTransition: action
                        }]
                    }, {
                        id: 'b'
                    }]
                },
                spec = state('root',
                    state('a', on('t', condition, goto('b', action))),
                    state('b'));

            expect(spec).toEqual(expected);
        });

        it('state with event-less conditioned transition', function () {
            var condition = jasmine.createSpy(),
                action = jasmine.createSpy(),
                expected = {
                    id: 'root',
                    states: [{
                        id: 'a',
                        transitions: [{
                            cond: condition,
                            onTransition: action
                        }]
                    }]
                },
                spec = state('root', state('a', on(condition, action)));

            expect(spec).toEqual(expected);
        });

        it('state with no event and no condition transition', function () {
            var condition = jasmine.createSpy(),
                action = jasmine.createSpy(),
                expected = {
                    id: 'root',
                    states: [{
                        id: 'a',
                        transitions: [{
                            target: ['b'],
                            onTransition: action
                        }]
                    }, {
                        id: 'b'
                    }]
                },
                spec = state('root', 
                    state('a', goto('b', action)), 
                    state('b'));

            expect(spec).toEqual(expected);
        });
        
        it('state with multiple transitions', function () {
            var condition = jasmine.createSpy(),
                action = jasmine.createSpy(),
                expected = {
                    id: 'root',
                    states: [{
                        id: 'a',
                        transitions: [{
                            event: 't',
                            cond: condition,
                            target: ['b'],
                            onTransition: action
                        }, {
                            cond: condition,
                            target: ['b']
                        }, {
                            cond: condition,
                            onTransition: action
                        }, /*{
                            cond: condition
                        }, */{
                            target: ['b'],
                            onTransition: action
                        }, {
                            target: ['b']
                        }, {
                            onTransition: action
                        }]
                    }, {
                        id: 'b'
                    }]
                },
                spec = state('root',
                    state('a',
                        on('t', condition, goto('b', action)),
                        on(condition, goto('b')),
                        on(condition, action),
                        //on(condition).doNothing
                        goto('b', action),
                        goto('b'),
                        goto(action)),
                    state('b'));

            expect(spec).toEqual(expected);
        });
        
        it('parallel states', function () {
            var expected = {
                    id: 'root',
                    states: [{
                        id: 'p',
                        type: 'parallel',
                        states: [{
                            id: 's1'
                        }, {
                            id: 's2'
                        }]
                    }]
                },
                spec = state('root',
                    parallel('p',
                        state('s1'),
                        state('s2')));

            expect(spec).toEqual(expected);
        });

        it('initial states', function () {
            var expected = {
                    id: 'root',
                    initial: 'd',
                    states: [{
                        id: 'a',
                        states: [{
                            id: 'b',
                            initial: true
                        }, {
                            id: 'c'
                        }]
                    }, {
                        id: 'd'
                    }]
                },
                spec = state('root', //{initial: 'd'},
                    initial('d'),
                    state('a',
                        state('b', initial(true)),
                        state('c')),
                    state('d'))

            expect(spec).toEqual(expected);
        });
    });
});