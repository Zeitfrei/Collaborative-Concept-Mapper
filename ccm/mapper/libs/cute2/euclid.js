/*  Use with gcc -E -x c -P -C *.h > *.js 
 */


"use strict";

(function() {
    var cute = this.cute;
    var euclid = cute.euclid = {};

    euclid.start = function() {
        var canvas = new cute.Canvas('#canvas');
        var fig1 = new cute.Figure();

        fig1.euclidean(true);
        fig1.display(new cute.Box(200, 200));
        fig1.display(new cute.Line(10, 10, 100, 100));
        canvas.display(fig1, new cute.Point(100,100));

        canvas.render();
    }
}).call(this);
