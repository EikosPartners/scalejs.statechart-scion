/*global define,describe,expect,it,jasmine*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var state = core.state.builder.state,
        parallel = core.state.builder.parallel;

    describe('builder', function () {
        it('empty', function () {
            var spec = state().toSpec(),
                expected = {};

            expect(spec).toEqual(expected);
        });

        it('single child state', function () {
            var expected = { id: 'a' },
                spec = state('a').toSpec();

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
                    state('c')).toSpec();

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
                    state('c')).toSpec();

            expect(spec).toEqual(expected);
        });

        it('state with onEntry', function () {
            var onEntry = jasmine.createSpy(),
                expected = {
                    id: 'root',
                    states: [{
                        id: 'a',
                        onEntry: onEntry
                    }]
                },
                spec = state('root',
                    state('a').onEntry(onEntry)).toSpec();

            expect(spec).toEqual(expected);
        });

        it('state with onExit', function () {
            var onExit = jasmine.createSpy(),
                expected = {
                    id: 'root',
                    states: [{
                        id: 'a',
                        onExit: onExit
                    }]
                },
                spec = state('root',
                    state('a').onExit(onExit)).toSpec();

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
                    state('a').on('t', condition).goto('b', action),
                    state('b')).toSpec();

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
                            target: ['b'],
                            cond: condition,
                            onTransition: action
                        }, {
                            cond: condition,
                            target: ['b']
                        }, {
                            cond: condition,
                            onTransition: action
                        }, {
                            cond: condition
                        }, {
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
                    state('a')
                        .on('t', condition).goto('b', action)
                        .on(condition).goto('b')
                        .on(condition).goto(action)
                        .on(condition).doNothing
                        .goto('b', action)
                        .goto('b')
                        .goto(action),
                    state('b')).toSpec();

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
                        state('s2'))).toSpec();

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
                spec = state('root', {initial: 'd'},
                    state('a',
                        state('b', {initial: true}),
                        state('c')),
                    state('d')).toSpec();

            expect(spec).toEqual(expected);
        });

    });
});