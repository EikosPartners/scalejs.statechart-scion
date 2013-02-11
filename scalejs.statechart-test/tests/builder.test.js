/*global define,describe,expect,it,jasmine*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.statechart,
        enumerable = core.linq.enumerable;

    describe('builder', function () {
        it('empty', function () {
            var sc = statechart({
                    id: 'root'
                }),
                states = sc.builder.getStates(),
                transitions = sc.builder.getTransitions();

            expect(enumerable.from(states).select('$.id').toArray()).toEqual(['root']);
            expect(transitions).toEqual([]);
        });

        it('states with no id-s', function () {
            var sc = statechart({
                    states: [{
                        states: [{
                        }]
                    }, {
                    }]
                }),
                states = sc.builder.getStates();

            expect(enumerable.from(states).orderBy('$.depth').select('$.id').toArray())
                .toEqual(['root', 'state_1', 'state_3', 'initial_2', 'state_2', 'initial_1']);
        });

        it('no initial state is specified', function () {
            var sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1'
                    }, {
                        id: 's2'
                    }]
                }),
                states = sc.builder.getStates(),
                transitions = sc.builder.getTransitions();

            expect(enumerable.from(states).select('$.id').toArray()).toEqual(['s1', 's2', 'initial_1', 'root']);
            expect(enumerable.from(transitions).select('$.source.id').toArray()).toEqual(['initial_1']);
            expect(enumerable.from(transitions).select('$.targets.length').toArray()).toEqual([1]);
            expect(enumerable.from(transitions).select('$.targets[0].id').toArray()).toEqual(['s1']);
        });

        it('initial state is specified on the parent', function () {
            var sc = statechart({
                    id: 'root',
                    initial: 's2',
                    states: [{
                        id: 's1'
                    }, {
                        id: 's2'
                    }]
                }),
                states = sc.builder.getStates(),
                transitions = sc.builder.getTransitions();

            expect(enumerable.from(states).select('$.id').toArray()).toEqual(['s1', 's2', 'initial_1', 'root']);
            expect(enumerable.from(transitions).select('$.source.id').toArray()).toEqual(['initial_1']);
            expect(enumerable.from(transitions).select('$.targets.length').toArray()).toEqual([1]);
            expect(enumerable.from(transitions).select('$.targets[0].id').toArray()).toEqual(['s2']);
        });

        it('initial state is specified as a flag on child state', function () {
            var sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1'
                    }, {
                        id: 's2',
                        initial: true
                    }]
                }),
                states = sc.builder.getStates(),
                transitions = sc.builder.getTransitions();

            expect(enumerable.from(states).select('$.id').toArray()).toEqual(['s1', 's2', 'initial_1', 'root']);
            expect(enumerable.from(transitions).select('$.source.id').toArray()).toEqual(['initial_1']);
            expect(enumerable.from(transitions).select('$.targets.length').toArray()).toEqual([1]);
            expect(enumerable.from(transitions).select('$.targets[0].id').toArray()).toEqual(['s2']);
        });

        it('transition with a `test.*` pattern', function () {
            var sc = statechart({
                    states: [{
                        transitions: [{
                            event: 'test.*',
                            target: 's2'
                        }]
                    }, {
                        id: 's2',
                        initial: true
                    }]
                }),
                states = sc.builder.getStates(),
                transitions = sc.builder.getTransitions();

            expect(enumerable.from(states).select('$.id').toArray()).toEqual(['state_1', 's2', 'initial_1', 'root']);
            expect(transitions[0].events).toEqual(['test']);
        });

        it('transition with a `*` pattern', function () {
            var sc = statechart({
                    states: [{
                        transitions: [{
                            event: '*',
                            target: 's2'
                        }]
                    }, {
                        id: 's2',
                        initial: true
                    }]
                }),
                states = sc.builder.getStates(),
                transitions = sc.builder.getTransitions();

            expect(enumerable.from(states).select('$.id').toArray()).toEqual(['state_1', 's2', 'initial_1', 'root']);
            expect(transitions[0].events).toEqual(['*']);
        });

        it('parallel state', function () {
            var sc = statechart({
                    initial: 'p',
                    states: [{
                        id: 'p',
                        parallel: true,
                        states: [{
                            id: 'a'
                            //initial: true
                        }, {
                            id: 'b'
                        }]
                    }]
                }),
                states = sc.builder.getStates();
            expect(enumerable.from(states).select('$.id').toArray()).toEqual(['a', 'b', 'p', 'initial_1', 'root']);
            expect(states[2].kind).toBe(2);
        });
    });
});