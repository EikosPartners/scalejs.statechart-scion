/*global define,describe,expect,it,jasmine*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.builder.builder({ logStatesEnteredAndExited: true }),
        state = core.state.builder.state,
        parallel = core.state.builder.parallel;

    describe('misc', function () {
        it('when goto to child state of parallel then sibling is exited', function () {
            var onExit = jasmine.createSpy(),
                sc = statechart(
                    parallel('p',
                        state('a',
                            state('a1'),
                            state('a2'))
                            .on('t').goto('a2'),

                        state('b').onExit(onExit))
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['b', 'a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['a2', 'b']);
            expect(onExit).toHaveBeenCalled();
        });

        it('when gotoInternally to child state of parallel then sibling is\'t exited', function () {
            var onExit = jasmine.createSpy(),
                sc = statechart(
                    parallel('p',
                        state('a',
                            state('a1'),
                            state('a2'))
                        .on('t').gotoInternally('a2'),
                        state('b').onExit(onExit))
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['b', 'a1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b', 'a2']);
            expect(onExit).not.toHaveBeenCalled();
        });

        it('when gotoInternally to grand-child then child exits and enters as well', function () {
            var onExit = jasmine.createSpy(),
                sc = statechart(
                    state('a',
                        state('b',
                            state('b1'),
                            state('b2')))
                    .on('t').gotoInternally('b2')
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['b1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b2']);
            expect(onExit).not.toHaveBeenCalled();
        });

        it('when gotoInternally to child then parent doesn\'t exit and enters', function () {
            var onExit = jasmine.createSpy(),
                sc = statechart(
                    state('a',
                        state('b',
                            state('b1'),
                            state('b2'))
                        .on('t').gotoInternally('b2'))
                );

            sc.start();
            expect(sc.getConfiguration()).toEqual(['b1']);

            sc.send('t');
            expect(sc.getConfiguration()).toEqual(['b2']);
            expect(onExit).not.toHaveBeenCalled();
        });

    });
});
