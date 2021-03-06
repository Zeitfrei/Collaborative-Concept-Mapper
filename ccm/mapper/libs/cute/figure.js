/*  $Id$	-*- mode: javascript -*-
 *  
 *  File	figure.src
 *  Part of	Cute
 *  Author	Anjo Anjewierden, a.a.anjewierden@utwente.nl
 *  Purpose	Definition of class Figure
 *  Works with	SWI-Prolog (www.swi-prolog.org)
 *  
 *  Notice	Copyright (c) 2012-2014  University of Twente
 *  
 *  History	04/07/12  (Created)
 *  		10/07/12  (Last modified)
 */

/*------------------------------------------------------------
 *  Class Figure
 *------------------------------------------------------------*/
/*  Use with gcc -E -x c -P -C *.h > *.js 
 */

"use strict";

(function() {
    var cute = this.cute;

    var Figure = cute.Figure = function() {
        var fig = this;

        cute.Graphical.call(fig);

        fig._level = 0;
        fig._offset = new cute.Point(0,0);
        fig._graphicals = [];
        fig._bad_bounding_box = false;
//        fig._recompute = [];
        fig._background = null;
        fig._pen = 0;
        fig._border = 0;
        fig._radius = 0;
        fig._grid = undefined;

        fig.request_compute(true);

        return fig;
    }

    ist.extend(Figure, cute.Graphical);

    Figure.prototype.toString = function() {
        var fig = this;
        var fx = fig._offset ? fig._offset._x : 'undefined';
        var fy = fig._offset ? fig._offset._y : 'undefined';

        return 'Figure(' + fx + ' ' + fy + ') [' + fig._area + ']';
    }

    Figure.prototype.print_tree = function(depth) {
        var fig = this;
        var tab = '';
        var display;

        depth = (depth === undefined ? 0 : depth);

        for (var d=0; d<depth; d++)
            tab += '  ';

        if (fig._displayed)
            display = '';
        else
            display = '*hidden*';

        if (fig.pp)
            ist.printf(tab + display + ' [' + fig.area() + '] ' + fig + ' ' + fig.pp());
        else
            ist.printf(tab + display + ' [' + fig.area() + '] ' + fig);

        for (var i=0; i<fig._graphicals.length; i++)
            fig._graphicals[i].print_tree(depth+1);

        return fig;
    }

    Figure.prototype.unlink = function() {
        var f = this;
        var grs = f._graphicals;

        for (var i=0; i<grs.length; i++)
            grs[i].figure(null);
        cute.Graphical.prototype.unlink.call(f);

        return null;
    }


    /*------------------------------------------------------------
     *  Repaint management
     *------------------------------------------------------------*/

    Figure.prototype.request_compute = function(val) {
        var f = this;

        f._bad_bounding_box = true;
        cute.Graphical.prototype.request_compute.call(f, val);

        return f;
    }

    Figure.prototype.compute_graphicals = function() {
        var f = this;
//        var a = f._recompute;

/*
        if (a === undefined) {	// TBD - Why?
            return f;
        }

        for (var i=0; i<a.length; i++) {
            var gr = a[i];
            if (gr)
                gr.Compute();
        }
        f._recompute = [];
*/

        return f;
    }

    /*------------------------------------------------------------
     *  Display / Erase
     *------------------------------------------------------------*/

    Figure.prototype.clear = function(how) {
        var f = this;
        var grs = new Array();

        for (var i=0; i<f._graphicals.length; i++)
            grs.push(f._graphicals[i]);

        if (how === 'free') {
            for (var i=0; i<grs.length; i++)
                grs[i].free();
        }
        else if (how === 'erase') {
            for (var i=0; i<grs,length; i++)
                if (grs[i]) f.erase(grs[i]);
        }

        f._graphicals = [];

        return f;
    }

    Figure.prototype.free = function() {
        var f = this;

        f.clear('free');
        f.unlink();

        return f;
    }

    Figure.prototype.display = function(gr, pos) {
        var f = this;

        if (pos)
            gr.set(pos._x, pos._y, undefined, undefined);
        gr.figure(f);
        gr.displayed(true);

        return f;
    }

    Figure.prototype.append = function(gr) {
        var f = this;

        if (f._graphicals === undefined) // TBD -- why
            f._graphicals = [];

/*
        if (f._recompute === undefined)	// TBD -- why?
            f._recompute = [];
*/

        f._graphicals.push(gr);
        gr._figure = f;
        if (!gr._request_compute) {
//            f._recompute.push(gr);
            if (!f._request_compute)
                f.request_compute();
        }
        if (gr._displayed)
            f.displayed_graphical(gr, true);
        gr.reparent();

        return f;
    }


    Figure.prototype.erase = function(gr) {
        var f = this;

        if (gr._figure === f) {
            var i;

            if (gr._displayed)
                f.displayed_graphical(gr, false);
//            f._recompute.delete_element(gr);
/*            for (var i=0; i<f._recompute.length; i) {
                if (f._recompute[i] === gr) {
                    f._recompute.splice(i, 1);
                    continue;
                }
                i++;
            }
*/
            gr._figure = null;
            f._graphicals.delete_element(gr);
            for (var i=0; i<f._graphicals.length; i) {
                if (f._graphicals[i] === gr) {
                    f._graphicals.splice(i, 1);
                    continue;
                }
                i++;
            }

            gr.reparent();
        }
        return f;
    }

    Figure.prototype.displayed_graphical = function(gr, val) {
        var f = this;
    //  var old = gr._displayed;

        gr._displayed = val;
        if (gr instanceof Figure)
            Figure.prototype.update_connections.call(gr, f._level);
        else
            gr.update_connections(f._level);

        f.request_compute();
    //  gr._displayed = old;

        return f;
    }


    Figure.prototype.expose = function(gr, gr2) {
        var f = this;

        if (gr._figure !== f || (gr2 && gr2._figure !== f))
            return f;
        if (gr2) {
            f._graphicals.delete_element(gr);
            f._graphicals.push(gr);
        } else
            f._graphicals = move_after_array(f._graphicals, gr, gr2);
        f.request_compute();

        return f;
    }


    Figure.prototype.hide = function(gr, gr2) {
        var f = this;

        if (gr._figure !== f || (gr2 && gr2._figure !== f))
            return f;
        if (gr2) {
            f._graphicals.delete_element(gr);
            f._graphicals = f._graphicals.splice(0, 0, gr);
        } else
            f._graphicals = move_after_array(f._graphicals, gr, gr2);
        f.request_compute();

        return f;
    }

    Figure.prototype.graphicals = function() {
        return this._graphicals;
    }

    /*------------------------------------------------------------
     *  Selection
     *------------------------------------------------------------*/

    Figure.prototype.offset = function() {
        var fig = this;

        return new cute.Point(fig._offset._x, fig._offset._y);
    }

    /*------------------------------------------------------------
     *  Event handling
     *------------------------------------------------------------*/

    Figure.prototype.event = function(ev, ex, ey) {
        var f = this;

        if (f._active) {
            var x = ex - f._offset._x;
            var y = ey - f._offset._y;
            var grs = f._graphicals;

            for (var i=grs.length; i>0; i--) {
                var gr = grs[i-1];

                if (gr._displayed && gr.in_event_area(x,y) && gr.event(ev,x,y))
                    return true;
            }
            return cute.Graphical.prototype.event.call(f, ev, x, y);
        }

        return false;
    }

    Figure.prototype.pointed_objects = function(ex, ey, array) {
        var f = this;

        if (f._active && f.in_event_area(ex, ey)) {
            var x = ex - f._offset._x;
            var y = ey - f._offset._y;
            var grs = f._graphicals;

            array.push(f);

            for (var i=grs.length; i>0; i--) {
                var gr = grs[i-1];

                gr.pointed_objects(x, y, array);
            }
        }

        return f;
    }


    /*------------------------------------------------------------
     *  Membership
     *------------------------------------------------------------*/

    Figure.prototype.member = function(name) {
        var fig = this;
        var grs = fig._graphicals;

        for (var i=0; i<grs.length; i++) {
            if (grs[i]._name == name)
                return grs[i];
        }

        return false;
    }


    /*------------------------------------------------------------
     *  Geometry
     *------------------------------------------------------------*/

    Figure.prototype.update_connections = function(level) {
        var f = this;
        var grs = f._graphicals;

        for (var i=0; i<grs.length; i++)
            grs[i].update_connections(level);
        cute.Graphical.prototype.update_connections.call(f, level);
        return f;
    }

    Figure.prototype.geometry = function(x, y, w, h) {
        var f = this;
        var a = f._area;

        cute.Graphical.prototype.Compute.call(f);

        if (!x) x = a._x;
        if (!y) y = a._y;

        if (x != a._x || y != a._y) {
            var dx = x - a._x;
            var dy = y - a._y;
            var ax = a._x, ay = a._y, aw = a._w, ah = a._h;

            if (!f._offset) {
                ist.printf('offset for ' + f + ' undefined');
                f._offset = new cute.Point(0,0);
            }
            f._offset._x = f._offset._x + dx;
            f._offset._y = f._offset._y + dy;
            a._x = x;
            a._y = y;

            if (ax != a._x || ay != a._y || aw != a._w || ah != a._h)
                f.changed_area(ax, ay, aw, ah);

            f.update_connections(f._level-1);
        }

        return this;
    }


    Figure.prototype.compute = function() {
        var f = this;

        if (f._request_compute) {
            if (f._pen !== 0 || f._background) {
                f.compute_graphicals();
                f.compute_bounding_box();
            } else {
                f.compute_graphicals();
                f.compute_bounding_box();
            }
            f._request_compute = false;
        }

        return f;
    }


    Figure.prototype.background = function(bg) {
        var f = this;

        if (bg === undefined)
            return f._background;

        if (f._background !== bg) {
            f._background = bg;
            f.request_compute();
        }
        return f;
    }

    Figure.prototype.radius = function(radius) {
        var f = this;

        if (radius) {
            if (f._radius !== radius) {
                f._radius = radius;
                f.request_compute(true);
            }
            return this;
        }
        return f._radius;
    }


    Figure.prototype.border = function(border) {
        var f = this;

        if (border) {
            if (f._border !== border) {
                f._border = border;
                f.request_compute();
            }
            return this;
        }
        return f._border;
    }


    Figure.prototype.update_bounding_box = function() {
        var f = this;
        var a = f._area;
        var grs = f._graphicals;
        var ax = a._x, ay = a._y, aw = a._w, ah = a._h;

        a.clear();
        for (var i=0; i<grs.length; i++) {
            var gr = grs[i];

            if (gr._displayed) {
                gr.Compute();
                a.union_normalised(gr._area);
            }
        }
        a.relative_move(f._offset);

        return (ax !== a._x || ay !== a._y || aw !== a._w || ah !== a._h);
    }

    Figure.prototype.compute_bounding_box = function() {
        var f = this;

        if (f._bad_bounding_box) {
            var a = f._area;
            var ox = a._x, oy = a._y, ow = a._w, oh = a._h;

            if (f.update_bounding_box()) {
                if (f._figure) {
                    f._figure.request_compute();
                    cute.Graphical.prototype.update_connections.call(f, f._level-1);
                }
            }

            f._bad_bounding_box = false;

            if (f._border)
                f._area.increase(f._border);
            if (ox !== a._x || oy !== a._y || ow !== a._w || oh !== a._h)
                f.changed_area(ox, oy, ow, oh);
        }
        return f;
    }


    Figure.prototype.grid = function(gap) {
        var fig = this;

        if (gap === undefined)
            return fig._grid;
        fig._grid = gap;

        return fig;
    }

    /*  Draw a grid (for debugging of coordinates).
     */
    Figure.prototype.draw_grid = function(ctx, gap) {
        var fig = this;
        var canvas = fig.device();
        var w = canvas.width();
        var h = canvas.height();

        for (var x=0; x<w; x+=gap)
            for (var y=0; y<h; y+=gap) {
                ctx.line(0, y, w, y);
                ctx.line(x, 0, x, h);
            }

        return fig;
    }

    Figure.prototype.render_canvas = function(ctx, canvas) {
        var f = this;

        if (f._displayed === false) {
            return f;
        }

        var a = f._area;
        var ox = f._offset._x;
        var oy = f._offset._y;
        var x = f._area._x;
        var y = f._area._y;
        var grs = f._graphicals;
        var tx = x-ox;
        var ty = y-oy;
        var fill = false;
        var stroke = false;

        if (f._grid)
            f.draw_grid(ctx, f._grid);

        if (f._pen > 0) {
            ctx.lineWidth(f._pen);
            ctx.strokeStyle(f._colour);
            stroke = true;
        }
        if (f._background) {
            fill = true;
            ctx.fillStyle(f._background);
        }
        if (fill)
            ctx.fillRect(x, y, a._w, a._h);
        if (stroke)
            ctx.strokeRect(x, y, a._w, a._h);

        ctx.save();
        ctx.translate(ox, oy);

        for (var i=0; i<grs.length; i++) {
            var gr = grs[i];

            gr.Compute();
            if (gr._displayed)
                gr.render_canvas(ctx, canvas);
        }

        ctx.restore();

        return f;
    }
}).call(this);
