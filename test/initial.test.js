/*global define,describe,expect,it,jasmine*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core) {
    var statechart = core.state.statechart;

    describe('statechart initial', function () {
        it('transits to single child state', function () {
            var onEntry = jasmine.createSpy(),
                sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        onEntry: onEntry
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s1']);
            expect(onEntry).toHaveBeenCalled();
        });

        it('transits to first child when no initial state is specified', function () {
            var onEntry = jasmine.createSpy(),
                sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        onEntry: onEntry
                    }, {
                        id: 's2'
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s1']);
            expect(onEntry).toHaveBeenCalled();
        });

        it('transits to initial state as specified on the parent', function () {
            var onEntry = jasmine.createSpy(),
                sc = statechart({
                    id: 'root',
                    initial: 's2',
                    states: [{
                        id: 's1'
                    }, {
                        id: 's2',
                        onEntry: onEntry
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s2']);
            expect(onEntry).toHaveBeenCalled();
        });

        it('transits to initial state specified as a boolean flag on a child', function () {
            var onEntry = jasmine.createSpy(),
                sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1'
                    }, {
                        id: 's2',
                        initial: true,
                        onEntry: onEntry
                    }]
                });
            sc.start();

            expect(sc.getConfiguration()).toEqual(['s2']);
            expect(onEntry).toHaveBeenCalled();
        });
    });
});