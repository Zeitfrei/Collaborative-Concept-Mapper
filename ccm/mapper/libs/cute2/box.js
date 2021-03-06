/*  $Id$	-*- mode: javascript -*-
 *  
 *  File	box.src
 *  Part of	Cute
 *  Author	Anjo Anjewierden, a.a.anjewierden@utwente.nl
 *  Purpose	Definition of class Box
 *  Works with	SWI-Prolog (www.swi-prolog.org)
 *  
 *  Notice	Copyright (c) 2012  University of Twente
 *  
 *  History	04/07/12  (Created)
 *  		10/07/12  (Last modified)
 */

/*------------------------------------------------------------
 *  Class cute.Box
 *------------------------------------------------------------*/
/*  Use with gcc -E -x c -P -C *.h > *.js 
 */

"use strict";

(function() {
    var cute = this.cute;

    var Box = cute.Box = function (w, h) {
        var b = this;

        cute.Graphical.call(b, 0,0,w,h);
        b._radius = 0;
        b._fill_pattern = undefined;
        b._stops = undefined;

        return this;
    }

    ist.extend(Box, cute.Graphical);

    Box.prototype.stops = function(stops) {
        var b = this;

        if (stops === undefined)
            return b._stops;

        if (b._stops != stops) {
            b._stops = stops;
            b.request_compute();
        }
        return b;
    }

    Box.prototype.render_canvas = function(ctx) {
        var b = this;
        var a = b._area;
        var x = a._x;
        var y = a._y;
        var w = a._w;
        var h = a._h;
        var fill = b._fill_pattern !== undefined;
        var stroke = b._pen > 0;
        var stops = b._stops !== undefined;
        var rounded = b._radius > 0;

        if (stops)
            ctx.gradientBox(x, y, w, h, b._stops);

        if (fill) {
            ctx.fillStyle(b._fill_pattern);
            ctx.fillRect(x, y, w, h);
        }

        if (stroke) {
            ctx.strokeStyle(b._colour);
            ctx.lineWidth(b._pen);
            if (rounded)
                ctx.roundedRect(x, y, w, h, b._radius, fill, stroke);
            else
                ctx.strokeRect(x, y, w, h);
        }

        return b;
    }

    Box.prototype.radius = function(r) {
        if (r) {
            if (r !== this._radius) {
                this._radius = r;
            }
            return this;
        }
        return this._radius;
    }

    Box.prototype.fill_pattern = function(img) {
        if (img) {
            if (img !== this._fill_pattern) {
                this._fill_pattern = img;
            }
            return this;
        }
        return this._fill_pattern;
    }

    Box.prototype.toString = function() {
        var b = this;
        var a = b._area;
        var name = b._name ? (b._name + ': ') : '';

        return name + 'Box(' + [a._x, a._y, a._w, a._h].join(', ') + ') ' +
            'pen(' + b._pen + ') ' +
            'colour(' + b._colour + ')';
    }
}).call(this);
