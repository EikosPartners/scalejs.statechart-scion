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

    describe('external `raise`', function () {
        it('wnen called with event name proper event is raised', function () {
            var sc = statechart(
                    state('a', on('t', goto('b'))),
                    state('b')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b']);
        });

        it('wnen called with event object proper event is raised', function () {
            var sc = statechart(
                    state('a', on('t', goto('b'))),
                    state('b')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send({name: 't'});
            expect(sc.getConfiguration()).toEqual(['b']);
        });

        it('wnen called with event name and data proper event is raised', function () {
            var sc = statechart(
                    state('a', on('t', function (e) { return e.data.n === 5; }), goto('b')),
                    state('b')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t', {n: 5});
            expect(sc.getConfiguration()).toEqual(['b']);
        });

        it('wnen called with event object with data proper event is raised', function () {
            var sc = statechart(
                    state('a', on('t', function (e) { return e.data.n === 5; }, goto('b'))),
                    state('b')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send({name: 't', data: {n: 5}});
            expect(sc.getConfiguration()).toEqual(['b']);
        });

        it('wnen called with delay raised at time specified', function () {
            var sc = statechart(
                    state('a', on('t', function (e) { return e.data.n === 5; }, goto('b'))),
                    state('b')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['a']);

            sc.send('t', {n: 5}, {delay: 100});
            expect(sc.getConfiguration()).toEqual(['a']);

            waits(100);
            runs(function () {
                expect(sc.getConfiguration()).toEqual(['b']);
            });
        });

    });
});