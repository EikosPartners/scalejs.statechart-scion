/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.builder.statechart,
        state = core.state.builder.state,
        initial = core.state.builder.initial,
        goto = core.state.builder.goto,
        on = core.state.builder.on,
        parallel = core.state.builder.parallel;

    describe('statechart basic', function () {
        it('0', function () {
            var sc = statechart(initial('a'), state('a'));

            sc.start();

            expect(sc.getConfiguration()).toEqual(['a']);
        });

        it('1', function () {
            var sc = statechart(
                state('initial1',
                    initial(true),
                    goto('a')),
                state('a', on('t', goto('b'))),
                state('b')
            );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b']);
        });

        it('2', function () {
            var sc = statechart(
                    state('initial1', initial(true), goto('a')),
                    state('a', on('t', goto('b'))),
                    state('b', on('t2', goto('c'))),
                    state('c')
                );


            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b']);

            sc.send('t2');
            expect(sc.getConfiguration()).toEqual(['c']);
        });
    });
});
