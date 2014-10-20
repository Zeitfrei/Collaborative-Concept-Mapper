// Generated by CoffeeScript 1.6.3
(function() {
  "use strict";
  var EventEmitter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ut = window.ut || {};

  ut.commons = ut.commons || {};

  EventEmitter = window.EventEmitter;

  ut.commons.DataStore = (function(_super) {
    __extends(DataStore, _super);

    function DataStore() {
      this.datas = {};
    }

    DataStore.prototype.addData = function(category, data) {
      var _base;
      if ((_base = this.datas)[category] == null) {
        _base[category] = [];
      }
      if (typeof data.title === "undefined" && data.metadata.target.displayName) {
        data.title = data.metadata.target.displayName;
      }
      return this.datas[category].push(data);
    };

    DataStore.prototype.getDatas = function(category) {
      var _base;
      return (_base = this.datas)[category] != null ? (_base = this.datas)[category] : _base[category] = [];
    };

    DataStore.prototype.getData = function(category, title) {
      var data, _i, _len, _ref;
      _ref = this.getDatas(category);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        if (data.title === title) {
          return data;
        }
      }
      return null;
    };

    DataStore.prototype.getCategories = function() {
      var array, id, _ref, _results;
      _ref = this.datas;
      _results = [];
      for (id in _ref) {
        array = _ref[id];
        _results.push(id);
      }
      return _results;
    };

    DataStore.prototype.sendLoadEvent = function(data) {
      return this.emitEvent("loadData", [data]);
    };

    return DataStore;

  })(EventEmitter);

}).call(this);

/*
//@ sourceMappingURL=dataStore.map
*/
