/*global define,describe,expect,it,jasmine*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.builder.statechart,
        state = core.state.builder.state,
        parallel = core.state.builder.parallel;

    describe('onExit', function () {
        describe('`state`', function () {
            it('when child transits to itself parent is not exited', function () {
                var sExit = jasmine.createSpy('`x` onExit'),
                    bExit = jasmine.createSpy('`b` onExit'),
                    aExit = jasmine.createSpy('`a` onExit'),
                    sc = statechart(
                        state('s',
                            state('a').onExit(aExit).on('t').goto('a'),
                            state('b').onExit(bExit)).onExit(sExit)
                    );

                sc.start();
                expect(sc.getConfiguration()).toEqual(['a']);

                sc.send('t');
                expect(sc.getConfiguration()).toEqual(['a']);

                expect(aExit).toHaveBeenCalled();
                expect(bExit).not.toHaveBeenCalled();
                expect(sExit).not.toHaveBeenCalled();
            });

            it('when parent internally transits to already active child it is not exited', function () {
                var sExit = jasmine.createSpy('`s` onExit'),
                    bExit = jasmine.createSpy('`b` onExit'),
                    aExit = jasmine.createSpy('`a` onExit'),
                    sc = statechart(
                        state('s',
                            state('a').onExit(aExit),
                            state('b').onExit(bExit)
                            ).onExit(sExit).on('t').gotoInternally('a')
                    );

                sc.start();
                expect(sc.getConfiguration()).toEqual(['a']);

                sc.send('t');
                expect(sc.getConfiguration()).toEqual(['a']);

                expect(aExit).toHaveBeenCalled();
                expect(bExit).not.toHaveBeenCalled();
                expect(sExit).not.toHaveBeenCalled();
            });

            it('when grand-parent internally transits to already active grand-child it is not exited but child\'s parent is', function () {
                var s1Exit = jasmine.createSpy('`grand parent onExit`'),
                    s2Exit = jasmine.createSpy('`parent onExit`'),
                    bExit = jasmine.createSpy('`sibling onExit`'),
                    aExit = jasmine.createSpy('`child onExit`'),
                    sc = statechart(
                        state('s1',
                            state('s2',
                                state('a').onExit(aExit),
                                state('b').onExit(bExit)
                                ).onExit(s2Exit)).onExit(s1Exit).on('t').gotoInternally('a')
                    );

                sc.start();
                expect(sc.getConfiguration()).toEqual(['a']);

                sc.send('t');
                expect(sc.getConfiguration()).toEqual(['a']);

                expect(aExit).toHaveBeenCalled();
                expect(bExit).not.toHaveBeenCalled();
                expect(s1Exit).not.toHaveBeenCalled();
                expect(s2Exit).not.toHaveBeenCalled();
            });

            it('when parent externally transits to already active child it is exited', function () {
                var sExit = jasmine.createSpy('`s` onExit'),
                    bExit = jasmine.createSpy('`b` onExit'),
                    aExit = jasmine.createSpy('`a` onExit'),
                    sc = statechart(
                        state('s',
                            state('a').onExit(aExit),
                            state('b').onExit(bExit)
                            ).onExit(sExit).on('t').goto('a')
                    );

                sc.start();
                expect(sc.getConfiguration()).toEqual(['a']);

                sc.send('t');
                expect(sc.getConfiguration()).toEqual(['a']);

                expect(aExit).toHaveBeenCalled();
                expect(bExit).not.toHaveBeenCalled();
                expect(sExit).toHaveBeenCalled();
            });
        });

        describe('`parallel`', function () {
            it('when child internally transits to itself parent is not exited', function () {
                var pExit = jasmine.createSpy('`p` onExit'),
                    bExit = jasmine.createSpy('`b` onExit'),
                    sc = statechart(
                        parallel('p',
                            state('a').on('t').gotoInternally('a'),
                            state('b').onExit(bExit)
                            ).onExit(pExit)
                    );

                sc.start();
                expect(sc.getConfiguration()).toEqual(['b', 'a']);

                sc.send('t');
                expect(sc.getConfiguration()).toEqual(['a', 'b']);

                expect(bExit).not.toHaveBeenCalled();
                expect(pExit).not.toHaveBeenCalled();
            });

            it('when child externally transits to itself parent is exited', function () {
                var pExit = jasmine.createSpy('`p` onExit'),
                    bExit = jasmine.createSpy('`b` onExit'),
                    sc = statechart(
                        parallel('p',
                            state('a').on('t').gotoInternally('a'),
                            state('b').onExit(bExit)
                            ).onExit(pExit)
                    );

                sc.start();
                expect(sc.getConfiguration()).toEqual(['b', 'a']);

                sc.send('t');
                expect(sc.getConfiguration()).toEqual(['a', 'b']);

                expect(bExit).toHaveBeenCalled();
                expect(pExit).toHaveBeenCalled();
            });

            it('when parent internally transits to one of the active children both children remain active', function () {
                var pExit = jasmine.createSpy('`p` onExit'),
                    bExit = jasmine.createSpy('`b` onExit'),
                    aExit = jasmine.createSpy('`a` onExit'),
                    sc = statechart(
                        parallel('p',
                            state('a').onExit(aExit),
                            state('b').onExit(bExit)
                            ).onExit(pExit).on('t').gotoInternally('a')
                    );

                sc.start();
                expect(sc.getConfiguration()).toEqual(['b', 'a']);

                sc.send('t');
                expect(sc.getConfiguration()).toEqual(['b', 'a']);
            });

            it('when parent internally transits to one of the active children neither parent nor child\'s siblings are exited', function () {
                var pExit = jasmine.createSpy('`p` onExit'),
                    bExit = jasmine.createSpy('`b` onExit'),
                    aExit = jasmine.createSpy('`a` onExit'),
                    sc = statechart(
                        parallel('p',
                            state('a').onExit(aExit),
                            state('b').onExit(bExit)
                            ).onExit(pExit).on('t').gotoInternally('a')
                    );

                sc.start();
                expect(sc.getConfiguration()).toEqual(['b', 'a']);

                sc.send('t');
                expect(sc.getConfiguration()).toEqual(['b', 'a']);

                expect(aExit).toHaveBeenCalled();
                expect(bExit).not.toHaveBeenCalled();
                expect(pExit).not.toHaveBeenCalled();
            });

            it('when parent externally transits to one of the active children it is exited', function () {
                var pExit = jasmine.createSpy('`p` onExit'),
                    bExit = jasmine.createSpy('`b` onExit'),
                    aExit = jasmine.createSpy('`a` onExit'),
                    sc = statechart(
                        parallel('p',
                            state('a').onExit(aExit),
                            state('b').onExit(bExit)
                            ).onExit(pExit).on('t').goto('a')
                    );

                sc.start();
                expect(sc.getConfiguration()).toEqual(['b', 'a']);

                sc.send('t');
                expect(sc.getConfiguration()).toEqual(['a', 'b']);

                expect(aExit).toHaveBeenCalled();
                expect(bExit).toHaveBeenCalled();
                expect(pExit).toHaveBeenCalled();
            });
        });
    });
});