/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core, model, builder) {
    var statechart = core.statechart,
        enumerable = core.linq.enumerable;

    describe('`builder`', function () {
        it('empty', function () {
            var sc = statechart({
                    id: 'root'
                }),
                states = sc.builder.getStates(),
                transitions = sc.builder.getTransitions();

            expect(states.length).toBe(1);
            expect(states[0].id).toBe('root');
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
            expect(states.length).toBe(4);
            expect(enumerable.from(states).select('$.id').toArray()).toEqual(['s1', 's2', 'initial_1', 'root']);
            expect(transitions.length).toBe(1);
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
            expect(states.length).toBe(4);
            expect(enumerable.from(states).select('$.id').toArray()).toEqual(['s1', 's2', 'initial_1', 'root']);
            expect(transitions.length).toBe(1);
            expect(enumerable.from(transitions).select('$.source.id').toArray()).toEqual(['initial_1']);
            expect(enumerable.from(transitions).select('$.targets.length').toArray()).toEqual([1]);
            expect(enumerable.from(transitions).select('$.targets[0].id').toArray()).toEqual(['s2']);
        });

        it('initial state is specified as a flag on child state', function () {
            return;
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
            expect(states.length).toBe(4);
            expect(enumerable.from(states).select('$.id').toArray()).toEqual(['s1', 's2', 'initial_1', 'root']);
            expect(transitions.length).toBe(1);
            expect(enumerable.from(transitions).select('$.source.id').toArray()).toEqual(['initial_1']);
            expect(enumerable.from(transitions).select('$.targets.length').toArray()).toEqual([1]);
            expect(enumerable.from(transitions).select('$.targets[0].id').toArray()).toEqual(['s2']);
        });
    });
});