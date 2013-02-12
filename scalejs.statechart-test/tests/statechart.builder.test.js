/*global define,describe,expect,it,jasmine*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart.statechart,
        state = core.statechart.builder.state,
        parallel = core.statechart.builder.parallel;

    describe('builder', function () {
        it('empty', function () {
            var spec = statechart(),
                expected = {id: 'root'};

            expect(spec.getSpecification()).toEqual(expected);
        });

        it('single child state', function () {
            var expected = {
                    id: 'root',
                    states: [{
                        id: 'a'
                    }]
                },
                spec = statechart(
                    state('a')
                );

            expect(spec.getSpecification()).toEqual(expected);
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
                spec = statechart(
                    state('a'),
                    state('b'),
                    state('c')
                );

            expect(spec.getSpecification()).toEqual(expected);
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
                spec = statechart(
                    state('a',
                        state('a1'),
                        state('a2')),
                    state('b',
                        state('b1'),
                        state('b2')),
                    state('c')
                );

            expect(spec.getSpecification()).toEqual(expected);
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
                spec = statechart(
                    state('a').onEntry(onEntry)
                );

            expect(spec.getSpecification()).toEqual(expected);
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
                spec = statechart(
                    state('a').onExit(onExit)
                );

            expect(spec.getSpecification()).toEqual(expected);
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
                            target: 'b',
                            condition: condition,
                            action: action
                        }]
                    }, {
                        id: 'b'
                    }]
                },
                spec = statechart(
                    state('a').on('t', condition).goto('b', action),
                    state('b')
                );

            expect(spec.getSpecification()).toEqual(expected);
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
                            target: 'b',
                            condition: condition,
                            action: action
                        }, {
                            condition: condition,
                            target: 'b'
                        }, {
                            condition: condition,
                            action: action
                        }, {
                            condition: condition
                        }, {
                            target: 'b',
                            action: action
                        }, {
                            target: 'b'
                        }, {
                            action: action
                        }]
                    }, {
                        id: 'b'
                    }]
                },
                spec = statechart(
                    state('a')
                        .on('t', condition).goto('b', action)
                        .on(condition).goto('b')
                        .on(condition).goto(action)
                        .on(condition).doNothing
                        .goto('b', action)
                        .goto('b')
                        .goto(action),
                    state('b')
                );

            expect(spec.getSpecification()).toEqual(expected);
        });

        it('parallel states', function () {
            var expected = {
                    id: 'root',
                    states: [{
                        id: 'p',
                        parallel: true,
                        states: [{
                            id: 's1'
                        }, {
                            id: 's2'
                        }]
                    }]
                },
                spec = statechart(
                    parallel('p',
                        state('s1'),
                        state('s2'))
                );

            expect(spec.getSpecification()).toEqual(expected);
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
                spec = statechart({initial: 'd'},
                    state('a',
                        state('b', {initial: true}),
                        state('c')),
                    state('d'));

            expect(spec.getSpecification()).toEqual(expected);
        });

    });
});