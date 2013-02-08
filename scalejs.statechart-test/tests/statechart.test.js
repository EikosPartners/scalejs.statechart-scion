/*global define,describe,expect,it*/
/*jslint sloppy: true*/
/// <reference path="../Scripts/jasmine.js"/>
define([
    'scalejs!core',
    'scalejs!application'
], function (core, model) {
    var statechart = core.statechart;

    describe('`statechart`', function () {
        describe('extension', function () {
            it('is defined', function () {
                expect(statechart).toBeDefined();
            });
        });

        it('transits to default single state', function () {
            var inS1 = false,
                sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        onEntry: function (context) {
                            inS1 = true;
                        }
                    }]
                });
            sc.start();

            expect(sc.getFullConfiguration()).toEqual(['s1', 'root']);
        });

        it('executes onEntry', function () {
            var inS1 = false,
                sc = statechart({
                    id: 'root',
                    states: [{
                        id: 's1',
                        onEntry: function (context) {
                            inS1 = true;
                        }
                    }]
                });
            sc.start();

            expect(sc.getFullConfiguration()).toEqual(['s1', 'root']);
            //expect(sc.getFullConfiguration()).toEqual(['initial_1', 'root']);
            expect(inS1).toBeTruthy();
        });
    });
});