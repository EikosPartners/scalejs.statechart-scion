/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.builder.statechart,
        goto = core.state.builder.goto,
        on = core.state.builder.on,
        onEntry = core.state.builder.onEntry,
        onExit = core.state.builder.onExit,
        state = core.state.builder.state,        
        parallel = core.state.builder.parallel;

    describe('statechart hierarchy', function () {
        it('0', function () {
            var sc = statechart(
                    state(goto('a1')),
                    state('a',
                        //state('a1', t({event: 't', target: 'a2'}))
                        state('a1', on('t', goto('a2'))),
                        state('a2'))
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['a2']);
        });

        it('1', function () {
            var sc = statechart(
                    state(goto('a1')),
                    state('a',
                        on('t', goto('b')),
                        state('a1', on('t', goto('a2'))),
                        state('a2')),
                    state('b')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['a2']);
        });

        it('2', function () {
            var sc = statechart(
                    state(goto('a1')),
                    state('a',
                        on('t', goto('a2')),
                        state('a1', on('t', goto('b'))),
                        state('a2')),
                    state('b')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b']);
        });
    });
});