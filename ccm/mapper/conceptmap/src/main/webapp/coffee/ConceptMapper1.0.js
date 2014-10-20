(function() {
  "use strict";
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.ut = window.ut || {};

  window.ut.tools = window.ut.tools || {};

  window.ut.tools.conceptmapper = window.ut.tools.conceptmapper || {};

  window.ut.tools.conceptmapper.ConceptMapper = (function() {
    function ConceptMapper(configuration, metadataHandler, storageHandler, actionLogger, languageHandler, notificationClient) {
      var logObject, readyForMessages, init, canEdit;
      this.configuration = configuration;
      this.metadataHandler = metadataHandler;
      this.storageHandler = storageHandler;
      this.actionLogger = actionLogger;
      this.languageHandler = languageHandler;
      this.notificationClient = notificationClient;
      this.setConceptMapFromJSON = __bind(this.setConceptMapFromJSON, this);
      this.saveConceptMap = __bind(this.saveConceptMap, this);
      this.saveDialog = __bind(this.saveDialog, this);
      this.loadDialog = __bind(this.loadDialog, this);
      this.setConceptMapFromResource = __bind(this.setConceptMapFromResource, this);
      this.loadConceptMap = __bind(this.loadConceptMap, this);
      this.getConceptMapContentAsJSON = __bind(this.getConceptMapContentAsJSON, this);
      this.deleteConnectionsBetween = __bind(this.deleteConnectionsBetween, this);
      this.connectionExists = __bind(this.connectionExists, this);
      this.onClickEdgeHandler = __bind(this.onClickEdgeHandler, this);
      this.setConceptLinkMode = __bind(this.setConceptLinkMode, this);
      this.setConceptNodeMode = __bind(this.setConceptNodeMode, this);
      this.deleteAll = __bind(this.deleteAll, this);
      this.onClickHandlerTrashcan = __bind(this.onClickHandlerTrashcan, this);
      this.removeConcept = __bind(this.removeConcept, this);
      this.onBlurHandlerInjectParagraph = __bind(this.onBlurHandlerInjectParagraph, this);
      this.onBlurHandlerInjectRelation = __bind(this.onBlurHandlerInjectRelation, this);
      this.onClickHandlerConnectionLabel = __bind(this.onClickHandlerConnectionLabel, this);
      this.onClickHandlerInjectCombobox = __bind(this.onClickHandlerInjectCombobox, this);
      this.appendMenuButton = __bind(this.appendMenuButton, this);
      this.onClickHandlerInjectTextarea = __bind(this.onClickHandlerInjectTextarea, this);
      this.setColor = __bind(this.setColor, this);
      this._initJsPlumb = __bind(this._initJsPlumb, this);
      this._initDnD = __bind(this._initDnD, this);
      this.notificationPremise = __bind(this.notificationPremise, this);
      this._init = __bind(this._init, this);
      this._logAction = __bind(this._logAction, this);
      this.consumeNotification = __bind(this.consumeNotification, this);
      this.configure = __bind(this.configure, this);
      this._autoLoad = __bind(this._autoLoad, this);
      console.log("Initializing ConceptMapper1.0.");
      $("#ut_tools_conceptmapper_toolbar_title").text(languageHandler.getMsg("ut_tools_conceptmapper_toolbar_title"));
      $("#ut_tools_conceptmapper_map_title").text(languageHandler.getMsg("ut_tools_conceptmapper_map_title"));
      $("#ut_tools_conceptmapper_concept_template_text p").text(languageHandler.getMsg("ut_tools_conceptmapper_concept_template_text"));
      $("#ut_tools_conceptmapper_concept_template_selector p").text(languageHandler.getMsg("ut_tools_conceptmapper_concept_template_selector"));
      $("#ut_tools_conceptmapper_concept_template_text").attr("title", languageHandler.getMsg("ut_tools_conceptmapper_concept_template_tooltip"));
      $("#ut_tools_conceptmapper_concept_template_selector").attr("title", languageHandler.getMsg("ut_tools_conceptmapper_concept_template_tooltip"));
      $("#ut_tools_conceptmapper_linkButton").attr("title", languageHandler.getMsg("ut_tools_conceptmapper_linkButton"));
      $("#ut_tools_conceptmapper_trashcan").attr("title", languageHandler.getMsg("ut_tools_conceptmapper_trashcan"));
      $("#ut_tools_conceptmapper_store").attr("title", languageHandler.getMsg("ut_tools_conceptmapper_save_long"));
      this.colorClasses = ["ut_tools_conceptmapper_blue", "ut_tools_conceptmapper_yellow", "ut_tools_conceptmapper_green", "ut_tools_conceptmapper_red", "ut_tools_conceptmapper_orange", "ut_tools_conceptmapper_grey"];
      this.LINK_MODE = "link_mode";
      this.NODE_MODE = "node_mode";
      this.mode = this.NODE_MODE;
      this.isCurrentlyLogging = true;
      this.sourceNode = void 0;
      this.targetNode = void 0;
      this.editingLabel = void 0;
      this.storage = void 0;
      this.readyForMessages = true;
      this.init = false;
      this.canEdit = this.metadataHandler.getEditable();
      this.configure(this.configuration);
      this._initRole();
      logObject = {
        "objectType": "application",
        "id": this.metadataHandler.getGenerator().id
      };
      this._logAction("application_started", logObject);
      $("#ut_tools_conceptmapper_root").show();
      $("#ut_tools_conceptmapper_loadIcon").hide();
    }

    ConceptMapper.prototype._autoLoad = function() {
      var _this = this;
      return this.storageHandler.readLatestResource(this.metadataHandler.getTarget().objectType, function(error, resource) {
        if (error != null) {
          return console.warn(error.message);
        } else {
          return _this.setConceptMapFromResource(resource);
        }
      });
    };

    ConceptMapper.prototype.configure = function(newConfiguration) {
      var _this = this;
      return $.each(newConfiguration, function(id, settings) {
        _this.configuration["" + id].value = settings.value;
        switch (id) {
          case "actionlogging":
            return _this.actionLogger.setLoggingTargetByName("togetherjs");
          case "relations":
            return _this._initJsPlumb();
          case "textarea_concepts":
            return $("#ut_tools_conceptmapper_toolbar_list").find(".ut_tools_conceptmapper_conceptTextarea").each(function(id, template) {
              if (settings.value === "false") {
                return $(template).hide();
              } else {
                return $(template).show();
              }
            });
          case "combobox_concepts":
            return $("#ut_tools_conceptmapper_toolbar_list").find(".ut_tools_conceptmapper_conceptSelector").each(function(id, template) {
              if (settings.value === "false") {
                return $(template).hide();
              } else {
                return $(template).show();
              }
            });
        }
      });
    };

    ConceptMapper.prototype.consumeNotification = function(notification) {
      var _this = this;
      if (this.configuration.debug.value === "true") {
        console.log("ConceptMapper.consumeNotification: received notification: ");
        console.log(notification);
      }
      if (notification.type === "prompt" && this.configuration["show_prompts"].value === "true") {
        $("#ut_tools_conceptmapper_dialog").text(notification.content.text);
        $("#ut_tools_conceptmapper_dialog").dialog({
          title: "Notification",
          resizable: false,
          modal: true,
          autoOpen: false,
          height: 300,
          closeOnEscape: false,
          dialogClass: "ut_tools_conceptmapper_dialog",
          buttons: {
            "Ok": function() {
              return $("#ut_tools_conceptmapper_dialog").dialog("close");
            }
          }
        });
        $('#ut_tools_conceptmapper_dialog').dialog('open');
        return $('.ui-dialog :button').blur();
      } else if (notification.type === "configuration") {
        return this.configure(notification.content.configuration);
      } else {
        return console.log("ConceptMapper: Notification wasn't a 'prompt' or prompting is disabled; doing nothing.");
      }
    };

    ConceptMapper.prototype._logAction = function(verb, object) {
      if (this.isCurrentlyLogging && this.actionLogger) {
        return this.actionLogger.log(verb, object);
      }
    };


    /*
      Gets called first, initializes remaining program depending on role
    */
    ConceptMapper.prototype._initRole = function() {
      var _this = this;
      if(this.canEdit){
        this._init();
      }else{
        if(TogetherJS.running)
          TogetherJS();
        var cid = this.metadataHandler.getInstanceId();
        var gid = this.metadataHandler.getGroupId();
        this.loadConceptMap(cid, gid, function(error,resource){ 
          setTimeout(function(){
            $.each($("#ut_tools_conceptmapper_map .ut_tools_conceptmapper_concept"), function(index, node){
              $(node).draggable("disable");
              $("#ut_tools_conceptmapper_map").find(".ut_tools_conceptmapper_concept").css("opacity", "1.0");
              console.log("Concept Mapper has been initialized in no-edit mode.");
            });
          }, 2000);  
        });
      }
    };

    ConceptMapper.prototype._init = function() {
      var _this = this;
      $("#ut_tools_conceptmapper_linkButton").click(function() {
        if (_this.mode === _this.LINK_MODE) {
          return _this.setMode(_this.NODE_MODE);
        } else {
          return _this.setMode(_this.LINK_MODE);
        }
      });
      $("#ut_tools_conceptmapper_store").click(this.saveDialog);
      this._initDnD();
      this._initJsPlumb();
      this.initIntervals();
      this.initTogetherJS();
      if (this.notificationClient != null) {
        this.notificationClient.register(this.notificationPremise, this.consumeNotification);
        return console.log("ConceptMapper.init: notificationClient found and registered.");
      } else {
        return console.log("ConceptMapper.init: notificationClient not found.");
      }
    };

    ConceptMapper.prototype.notificationPremise = function(notification) {
      return true;
    };

    ConceptMapper.prototype.initIntervals = function(){
      var _this = this;
      setTimeout(function(){
        _this.init = true;
      }, 10000);

      //Saving and synchronizing the concept map in interval
      setInterval(function(){
        if(TogetherJS.running && _this.init && _this.readyForMessages){
          console.log("Sending Concept Map.");
          var conceptMap = _this.getConceptMapContentAsJSON();
          TogetherJS.send({
              type: 'loadMap',
              conceptMap: conceptMap
          });
          _this.saveConceptMap();
        }else{
          console.log("Map has just been deleted, can't send yet.")
        }
      }, 2*60*1000);
    };

    ConceptMapper.prototype.initTogetherJS = function(){
      var _this = this;
      var cid = this.metadataHandler.getInstanceId();
      var gid = this.metadataHandler.getGroupId();

      //closing togetherjs so that findRoom can be set
      if(TogetherJS.running){
        console.log("TogetherJS is running, shutting it down.");
        TogetherJS();
      }

      //Loading existing session-key if a map already exists, create new map and key if not
      this.storageHandler.resourceExists(cid, gid, function(error,exists){
        var __this = _this;
        var _cid = cid;
        var _gid = gid;
        if(exists){
          console.log("Concept Map exists. Now loading...");
          _this.loadConceptMap(_cid, _gid, function(error,resource){
            if(resource){
              console.log("No error when loading concept from DB, joining session");
              var key = __this.metadataHandler.getSession();
              console.log("The session key is: " + key);
              TogetherJS.config("findRoom",key);
              if (!TogetherJS.running){
                console.log("TogetherJS isnt running, firing it up!");
                TogetherJS();
              }
            }
          });
        }else if(!exists){
          console.log("Concpet Map doesn't exist. Generating new session key...")
          var key = ut.commons.utils.generateUUID();
          _this.metadataHandler.setSession(key);
          console.log("The new session key is: " + key);
          _this.saveConceptMap();
          TogetherJS.config("findRoom",key);
          if (!TogetherJS.running){
            console.log("TogetherJS isnt running, firing it up!");
            TogetherJS();
          }
        }
      });

      //sets max session age to 5 month (1 month default)
      TogetherJS.on("ready", function(){
        TogetherJS.refreshUserData();
        var session = TogetherJS.require("session");
        session.MAX_SESSION_AGE = 5*30*24*60*60*1000;
      });
    };

    ConceptMapper.prototype._initDnD = function() {
      var _this = this;
      $("#ut_tools_conceptmapper_toolbar .ut_tools_conceptmapper_concept").draggable({
        helper: "clone",
        cursor: "move",
        containment: "#ut_tools_conceptmapper_root"
      });
      $("#ut_tools_conceptmapper_map").bind('dragover', function(event) {
        return false;
      });
      $("#ut_tools_conceptmapper_map").droppable();
      $("#ut_tools_conceptmapper_map").bind('drop', function(event, ui) {
          if (ui && $(ui.draggable).hasClass("ut_tools_hypothesis_condition")) {
          return false;
        } else if (ui && $(ui.draggable).hasClass("ut_tools_conceptmapper_template")) {
          if (_this.configuration.debug.value === "true") {
            console.log("Concept template dropped. Clone and add to map.");
          }
          if ($(ui.draggable).hasClass("ut_tools_conceptmapper_conceptTextarea")) {
            _this._createConcept(ut.commons.utils.generateUUID(), $(ui.draggable).text(), ui.position.left, ui.position.top, "ut_tools_conceptmapper_conceptTextarea");
          } else if ($(ui.draggable).hasClass("ut_tools_conceptmapper_conceptSelector")) {
            _this._createConcept(ut.commons.utils.generateUUID(), $(ui.draggable).text(), ui.position.left, ui.position.top, "ut_tools_conceptmapper_conceptSelector");
          }
        } else if (event.originalEvent.dataTransfer) {
          if (_this.configuration.drop_external.value === "true") {
            _this._createConcept(ut.commons.utils.generateUUID(), event.originalEvent.dataTransfer.getData("Text"), event.originalEvent.clientX, event.originalEvent.clientY, "ut_tools_conceptmapper_conceptTextarea");
          }
        }
        if($(ui.draggable).hasClass("ut_tools_conceptmapper_concept")){
            var concept = $(ui.draggable);
            var logObject = {
                "objectType": "concept",
                "id": concept.attr('id'),
                "content": concept.text(),
                "x": ui.position.left,
                "y": ui.position.top
            };
            return _this._logAction('updateConcept', logObject);
        }
        return false;
      });

      $("#ut_tools_conceptmapper_trashcan").click(this.onClickHandlerTrashcan);
      $("#ut_tools_conceptmapper_trashcan").droppable({
        accept: ".ut_tools_conceptmapper_concept",
        drop: function(event, ui) {
          var logObject = {
              objectType: 'concept',
              id: $(ui.draggable).attr("id")
          };
          _this._logAction('removeConcept',logObject);
          return _this.removeConcept(ui.draggable);
        }
      });
      $("#ut_tools_conceptmapper_notification").click(function() {
        var notificationConfiguration, notificationPrompt;
        notificationPrompt = {
          type: "prompt",
          content: {
            text: "The selection of pre-defined concepts has been changed."
          }
        };
        notificationConfiguration = {
          type: "configuration",
          content: {
            configuration: {
              concepts: {
                value: ["length", "mass", "time"]
              }
            }
          }
        };
        _this.consumeNotification(notificationPrompt);
        return _this.consumeNotification(notificationConfiguration);
      });
      return $("#ut_tools_conceptmapper_settings").click(function() {
        return new ut.tools.conceptmapper.ConfigDialog(_this.configuration, _this.configure);
      });
    };

    ConceptMapper.prototype._initJsPlumb = function() {
      var jsPlumbDefaults,
        _this = this;
      jsPlumbDefaults = {
        Connector: [
          "Bezier", {
            curviness: 500
          }
        ],
        ConnectorZIndex: 0,
        DragOptions: {
          cursor: "pointer",
          zIndex: 2000
        },
        PaintStyle: {
          strokeStyle: "#00b7cd",
          lineWidth: 4
        },
        EndpointStyle: {},
        Anchor: [
          "Perimeter", {
            shape: "Ellipse"
          }
        ],
        ConnectionOverlays: [
          [
            "Arrow", {
              location: 0.7
            }, {
              foldback: 0.7,
              fillStyle: "#00b7cd",
              width: 20
            }
          ], [
            "Label", {
              label: this.configuration.relations.value[0],
              location: 0.5,
              id: "label"
            }
          ]
        ],
        Detachable: false,
        Reattach: false
      };
      jsPlumb.importDefaults(jsPlumbDefaults);
      jsPlumb.setRenderMode(jsPlumb.SVG);
      jsPlumb.unbind("jsPlumbConnection");

      return jsPlumb.bind("jsPlumbConnection", function(event) {
        var object;
        var __this = _this;
        event.connection.getOverlay("label").bind("click", _this.onClickHandlerConnectionLabel);
        object = {
          "objectType": "relation",
          "id": event.connection.id,
          "content": event.connection.getOverlay("label").getLabel(),
          "source": event.connection.sourceId,
          "target": event.connection.targetId
        };
        return _this._logAction("add", object);
      });
    };

    ConceptMapper.prototype.initConceptMapDropHandler = function() {
      $("#ut_tools_conceptmapper_map").bind('dragover', function(ev) {
        return false;
      });
      $("#ut_tools_conceptmapper_map").droppable();
      return $("#ut_tools_conceptmapper_map").bind('drop', function(event, ui) {
        if (ui && $(ui.draggable).hasClass("ut_tools_hypothesis_condition")) {
          return false;
        } else if (ui && $(ui.draggable).hasClass("ut_tools_conceptmapper_template")) {
          if (this.configuration.debug.value === "true") {
            console.log("Concept template dropped. Clone and add to map.");
          }
        } else if (event.originalEvent.dataTransfer) {
          createConcept(ut.commons.utils.generateUUID(), event.originalEvent.dataTransfer.getData("Text"), event.originalEvent.clientX, event.originalEvent.clientY, "ut_tools_conceptmapper_conceptTextarea");
        }
        return false;
      });
    };

    ConceptMapper.prototype.setColor = function(conceptId, colorClassName) {
      var concept, oldColor, _i, _len, _ref;
      if (conceptId == null) {

      } else {
        concept = $("#" + conceptId);
        if (concept != null) {
          if (colorClassName != null) {
            _ref = this.colorClasses;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              oldColor = _ref[_i];
              concept.removeClass(oldColor);
            }
            return concept.addClass(colorClassName);
          } else {
            return concept.addClass("ut_tools_conceptmapper_blue");
          }
        }
      }
    };

    ConceptMapper.prototype._createConcept = function(id, conceptText, x, y, className, colorClassName) {
      if(this.conceptExists(id)){
          console.log("Prevented making a duplicate of concept " + id);
          return false;
      }else {
          var logObject, newConcept, _this;
          newConcept = $("<div>");
          newConcept.attr('id', id);
          newConcept.addClass("ut_tools_conceptmapper_concept");
          newConcept.append($('<p/>').html(nl2br(conceptText)));
          jsPlumb.draggable(newConcept, {
              containment: "#ut_tools_conceptmapper_root",
              cursor: "move",
              revert: "invalid",
              iframeFix: true,
              delay: 50
          });
          newConcept.css('position', 'absolute');
          newConcept.css('top', y);
          newConcept.css('left', x);
          newConcept.addClass(className);
          if(this.canEdit){
            _this = this;
            if (className === "ut_tools_conceptmapper_conceptTextarea") {
              newConcept.click(this.onClickHandlerInjectTextarea);
            } else {
              newConcept.click(this.onClickHandlerInjectCombobox);
            }
          }

          $("#ut_tools_conceptmapper_map").append(newConcept);
          this.setColor(id, colorClassName);
          if (this.mode === this.LINK_MODE) {
              this.setConceptLinkMode(newConcept);
          } else if (this.mode === this.LINK_MODE) {
              this.setConceptNodeMode(newConcept);
          }
          logObject = {
              "objectType": "concept",
              "id": id,
              "content": conceptText,
              "x": x,
              "y": y,
              "colorName": colorClassName,
              "className": className
          };
          return this._logAction("addConcept", logObject);
      }
    };

    ConceptMapper.prototype.conceptExists = function(conceptId){      
        var exists = false;
        $.each($("#ut_tools_conceptmapper_map .ut_tools_conceptmapper_concept"), function(index, node) {
            if (conceptId === $(node).attr('id')) {
                exists = true;
            }
        });
        return exists;
    };

    ConceptMapper.prototype.onClickHandlerInjectTextarea = function(event) {
      var $p, textarea;
      if (this.mode === this.LINK_MODE) {
        return this.onClickEdgeHandler(event);
      } else if ($(event.target).is("p")) {
        this.selectedConcept = $(event.currentTarget).attr("id");
        $p = $(event.target);
        textarea = $('<textarea/>').val($p.text());
        this.contentBeforeEdit = $p.text();
        textarea.autogrow();
        $p.replaceWith(textarea);
        textarea.on("blur", this.onBlurHandlerInjectParagraph);
        this.appendMenuButton(event.currentTarget);
        return textarea.focus();
      }
    };

    ConceptMapper.prototype.appendMenuButton = function(target) {
      var color, colorItem, deleteItem, index, menu, menuButton, _i, _len, _ref,
        _this = this;
      menuButton = $("<i class='fa fa-gear ut_tools_conceptmapper_menubutton'></i>");
      menu = [];
      _ref = this.colorClasses;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        color = _ref[index];
        colorItem = {
          '&nbsp': {
            className: color,
            onclick: function(menuItem, menu) {
              var classes, _j, _len1;
              classes = $(menuItem).attr('class').split(" ");
              for (_j = 0, _len1 = classes.length; _j < _len1; _j++) {
                color = classes[_j];
                if ($.inArray(color, _this.colorClasses) > -1) {
                    var logObject = {
                        objectType: 'concept',
                        id: _this.selectedConcept,
                        color: color
                    };
                    _this._logAction('updateColor',logObject);
                  _this.setColor(_this.selectedConcept, color);
                  break;
                }
              }
            }
          }
        };
        menu.push(colorItem);
      }
      menu.push($.contextMenu.separator);
      deleteItem = {};
      deleteItem[this.languageHandler.getMsg("ut_tools_conceptmapper_delete")] = function(menuItem, menu) {
          var logObject = {
              objectType: 'concept',
              id: _this.selectedConcept
          };
          _this._logAction('removeConcept',logObject);
        _this.removeConcept($("#" + _this.selectedConcept));
      };
      menu.push(deleteItem);
      $(menuButton).contextMenu(menu, {
        leftClick: true,
        rightClick: true
      });
      $(target).append(menuButton);
      return $(menuButton).show();
    };

    ConceptMapper.prototype.onClickHandlerInjectCombobox = function(event) {
      var $p, inputField;
      if (this.mode === this.LINK_MODE) {
        return this.onClickEdgeHandler(event);
      } else if (!$(event.target).is("div")) {
        this.selectedConcept = $(event.currentTarget).attr("id");
        $p = $(event.target);
        inputField = $('<input/>').val($p.text());
        this.contentBeforeEdit = $p.text();
        inputField.autocomplete({
          source: this.configuration.concepts.value,
          minLength: 0
        });
        $p.replaceWith(inputField);
        inputField.blur(this.onBlurHandlerInjectParagraph);
        inputField.autocomplete('search', '');
        this.appendMenuButton(event.currentTarget);
        return inputField.focus();
      }
    };

    ConceptMapper.prototype.onClickHandlerConnectionLabel = function(label) {
      if(this.canEdit){
        var inputField;
        if ($("#" + label.canvas.id).find("input").length) {
          return $("#" + label.canvas.id).find("input").autocomplete('search', '');
        } else {
          this.editingLabel = label;
          inputField = $('<input/>').val(this.editingLabel.getLabel());
          this.labelBeforeEdit = this.editingLabel.getLabel();
          inputField.autocomplete({
            source: this.configuration.relations.value,
            minLength: 0
          });
          $("#" + label.canvas.id).text("");
          inputField.addClass("_jsPlumb_overlay");
          inputField.css("text-align", "left");
          inputField.css("font-size", "medium");
          $("#" + label.canvas.id).append(inputField);
          inputField.blur(this.onBlurHandlerInjectRelation);
          inputField.autocomplete('search', '');
          inputField.focus();
          return jsPlumb.repaintEverything();
        }
      }
    };

    ConceptMapper.prototype.onBlurHandlerInjectRelation = function(event) {
      var newLabel, object;
      newLabel = nl2br($(event.target).val());
      this.editingLabel.setLabel(newLabel);
      $(event.target).parent().text(this.editingLabel.getLabel());
      $(event.target).remove();
      jsPlumb.repaintEverything();
      if (newLabel !== this.labelBeforeEdit) {
        object = {
          "objectType": "relation",
          "sourceId": this.editingLabel.component.sourceId,
          "targetId": this.editingLabel.component.targetId,
          "content": newLabel
        };
        this._logAction("updateRelation", object);
      }
      this.labelBeforeEdit = "";
      return this.editingLabel = void 0;
    };

    ConceptMapper.prototype.onBlurHandlerInjectParagraph = function(event) {
        var inputElement, newContent, object, p;
      inputElement = $(event.target);
      newContent = nl2br(inputElement.val());
      p = $('<p/>').html(newContent);
      inputElement.replaceWith(p);
      $(".ut_tools_conceptmapper_menubutton").remove();
      jsPlumb.repaintEverything();
      if (newContent !== this.contentBeforeEdit) {
        object = {
          objectType: "concept",
          id: this.selectedConcept,
          content: newContent
        };
        this._logAction("updateText", object);
      }
      return this.contentBeforeEdit = "";
    };

    ConceptMapper.prototype.removeConcept = function(concept) {
      var id, _this = this;
      id = $(concept).attr("id");
      this.deleteConnectionsBetween(id);
      var object;
      $(concept).remove();
      object = {
        "objectType": "concept",
        "id": id
      };     
      return _this._logAction("delete", object);
    };

    ConceptMapper.prototype.onClickHandlerTrashcan = function() {
      var buttons,
        _this = this;
      $("#ut_tools_conceptmapper_dialog").text(this.languageHandler.getMsg("ut_tools_conceptmapper_trash_question"));
      buttons = {};
      buttons[this.languageHandler.getMsg("ut_tools_conceptmapper_yes")] = function() {
        _this._logAction("deleteAll")
        _this.deleteAll();
        return $("#ut_tools_conceptmapper_dialog").dialog("close");
      };
      buttons[this.languageHandler.getMsg("ut_tools_conceptmapper_no")] = function() {
        return $("#ut_tools_conceptmapper_dialog").dialog("close");
      };
      $("#ut_tools_conceptmapper_dialog").dialog({
        title: this.languageHandler.getMsg("ut_tools_conceptmapper_trash_title"),
        resizable: false,
        modal: true,
        autoOpen: false,
        height: 110,
        closeOnEscape: false,
        dialogClass: "ut_tools_conceptmapper_dialog",
        buttons: buttons
      });
      $('#ut_tools_conceptmapper_dialog').dialog('open');
      return $('.ui-dialog :button').blur();
    };

    ConceptMapper.prototype.deleteAll = function() {
      var _this = this;
      return $.each($("#ut_tools_conceptmapper_map .ut_tools_conceptmapper_concept"), function(index, concept) {
        return _this.removeConcept(concept);      
      });
    };

    ConceptMapper.prototype.setMode = function(newMode) {
      var _this = this;
      if (newMode === this.mode) {

      } else {
        switch (newMode) {
          case this.NODE_MODE:
            $("#ut_tools_conceptmapper_map").find(".ut_tools_conceptmapper_concept").each(function(index, concept) {
              return _this.setConceptNodeMode(concept);
            });
            $(".ut_tools_conceptmapper_template").removeClass("ut_tools_conceptmapper_lowLight");
            $("#ut_tools_conceptmapper_linkButton").removeClass("pressedButton");
            $("#ut_tools_conceptmapper_linkButton").addClass("activeButton");
            jsPlumb.unmakeEverySource();
            jsPlumb.unmakeEveryTarget();
            $(this.sourceNode).removeClass("highlight_concept");
            $(this.targetNode).removeClass("highlight_concept");
            this.sourceNode = void 0;
            this.targetNode = void 0;
            return this.mode = newMode;
          case this.LINK_MODE:
            $("#ut_tools_conceptmapper_map").find(".ut_tools_conceptmapper_concept").each(function(index, concept) {
              return _this.setConceptLinkMode(concept);
            });
            $(".ut_tools_conceptmapper_template").addClass("ut_tools_conceptmapper_lowLight");
            $("#ut_tools_conceptmapper_map").find(".ut_tools_conceptmapper_concept").css("opacity", "1.0");
            $("#ut_tools_conceptmapper_linkButton").addClass("pressedButton");
            $("#ut_tools_conceptmapper_linkButton").removeClass("activeButton");
            return this.mode = newMode;
          default:
            return console.log("ConceptMapper.setMode: unrecognized mode " + newMode + " doing nothing.");
        }
      }
    };

    ConceptMapper.prototype.setConceptNodeMode = function(concept) {
      return $(concept).draggable("enable");
    };

    ConceptMapper.prototype.setConceptLinkMode = function(concept) {
      var logObject, _this = this;
      $(concept).draggable("disable");
      jsPlumb.makeSource(concept, {});
      return jsPlumb.makeTarget(concept, {
        dropOptions: {
          hoverClass: "jsPlumbHover"
        },
        beforeDrop: function(params) {
          if (params.sourceId === params.targetId) {
            if (_this.configuration.debug.value === "true") {
              console.log("Creating edges between same source and target is disallowed.");
            }
            return false;
          } else {
            if (_this.connectionExists(params.sourceId, params.targetId)) {
              if (_this.configuration.debug.value === "true") {
                console.log("An edge between concepts already exists -> delete it (instead of create a new one).");
              }
              logObject = {
                objectType: "relation",
                sourceId: params.sourceId,
                targetId: params.targetId
              };
              _this._logAction("deleteExistingRelation",logObject);
              _this.deleteConnectionsBetween(params.sourceId, params.targetId);
              return false;
            } else {
              if (_this.configuration.debug.value === "true") {
                console.log("All conditions met, create a new edge.");
              }
                logObject = {
                    objectType: "relation",
                    sourceId: params.sourceId,
                    targetId: params.targetId
                };
              _this._logAction("addRelation",logObject);
              return true;
            }
          }
        }
      });
    };

    ConceptMapper.prototype.onClickEdgeHandler = function(event) {
        var connection, sourceId, targetId, logObject;
      if (this.sourceNode === void 0) {
        this.sourceNode = event.currentTarget;
        $(this.sourceNode).toggleClass("highlight_concept");
      } else {
        if (event.currentTarget === this.sourceNode) {
          $(event.currentTarget).toggleClass("highlight_concept");
          this.sourceNode = void 0;
        } else {
          this.targetNode = event.currentTarget;
        }
      }
      if ((this.sourceNode !== void 0) && (this.targetNode !== void 0)) {
        sourceId = $(this.sourceNode).attr("id");
        targetId = $(this.targetNode).attr("id");
        if (this.connectionExists(sourceId, targetId)) {
          this.deleteConnectionsBetween(sourceId, targetId);
            logObject = {
                objectType: "relation",
                sourceId: sourceId,
                targetId: targetId
            };
            this._logAction("deleteExistingRelation",logObject);
        } else {
          if (this.configuration.debug.value === "true") {
            console.log("Connection does not exist -> create.");
          }
          connection = jsPlumb.connect({
            source: sourceId,
            target: targetId
          });
            logObject = {
                objectType: "relation",
                sourceId: sourceId,
                targetId: targetId
            };
            this._logAction("addRelation",logObject);
        }
        $(this.sourceNode).removeClass("highlight_concept");
        $(this.targetNode).removeClass("highlight_concept");
        this.sourceNode = void 0;
        this.targetNode = void 0;
        return jsPlumb.repaintEverything();
      }
    };

    ConceptMapper.prototype.connectionExists = function(sourceId, targetId) {
      var existingConnections;
      existingConnections = jsPlumb.getConnections({
        source: sourceId,
        target: targetId
      });
      existingConnections = existingConnections.concat(jsPlumb.getConnections({
        source: targetId,
        target: sourceId
      }));
      return existingConnections.length > 0;
    };

    ConceptMapper.prototype.deleteConnectionsBetween = function(sourceId, targetId) {
      var connection, connections, object, _i, _len, _results;
      connections = jsPlumb.getConnections({
        source: sourceId,
        target: targetId
      });
      connections = connections.concat(jsPlumb.getConnections({
        source: targetId,
        target: sourceId
      }));
      _results = [];
      for (_i = 0, _len = connections.length; _i < _len; _i++) {
        connection = connections[_i];
        jsPlumb.detach(connection);
        object = {
          "objectType": "relation",
          "id": connection.id
        };
        _results.push(this._logAction("delete", object));
      }
      return _results;
    };

    ConceptMapper.prototype.getConceptMapContentAsJSON = function() {
      var conceptMap, concepts, connection, relation, relations, _i, _len, _ref,
        _this = this;
      conceptMap = {};
      concepts = [];
      $.each($("#ut_tools_conceptmapper_map .ut_tools_conceptmapper_concept"), function(index, node) {
        var color, concept, _i, _len, _ref;
        concept = {};
        concept.x = $(node).offset().left;
        concept.y = $(node).offset().top;
        concept.content = $(node).find("p").text();
        concept.id = $(node).attr("id");
        if ($(node).hasClass("ut_tools_conceptmapper_conceptSelector")) {
          concept.type = "ut_tools_conceptmapper_conceptSelector";
        } else {
          concept.type = "ut_tools_conceptmapper_conceptTextarea";
        }
        _ref = _this.colorClasses;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          color = _ref[_i];
          if ($(node).hasClass(color)) {
            concept.colorClass = color;
            break;
          }
        }
        return concepts.push(concept);
      });
      conceptMap.concepts = concepts;
      relations = [];
      _ref = jsPlumb.getConnections();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        connection = _ref[_i];
        relation = {};
        relation.source = connection.sourceId;
        relation.target = connection.targetId;
        relation.id = connection.id;
        relation.content = connection.getOverlay("label").getLabel();
        relations.push(relation);
      }
      conceptMap.relations = relations;
      return conceptMap;
    };

    ConceptMapper.prototype.getConceptMapAsJSon = function() {
      var conceptMap, concepts, connection, relation, relations, _i, _len, _ref;
      conceptMap = {};
      conceptMap.meta = this.meta;
      concepts = [];
      $.each($("#ut_tools_conceptmapper_map .ut_tools_conceptmapper_concept"), function(index, node) {
        var concept;
        concept = {};
        concept.x = $(node).offset().left;
        concept.y = $(node).offset().top;
        concept.content = $(node).find("p").text();
        concept.id = $(node).attr("id");
        if ($(node).hasClass("ut_tools_conceptmapper_conceptSelector")) {
          concept.type = "ut_tools_conceptmapper_conceptSelector";
        } else {
          concept.type = "ut_tools_conceptmapper_conceptTextarea";
        }
        return concepts.push(concept);
      });
      conceptMap.concepts = concepts;
      relations = [];
      _ref = jsPlumb.getConnections();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        connection = _ref[_i];
        relation = {};
        relation.source = connection.sourceId;
        relation.target = connection.targetId;
        relation.id = connection.id;
        relation.content = connection.getOverlay("label").getLabel();
        relations.push(relation);
      }
      conceptMap.relations = relations;
      return conceptMap;
    };

    ConceptMapper.prototype.loadConceptMap = function(cid, gid, cb) {
      var _this = this;
      return this.storageHandler.readResource(cid, gid, function(error, resource) {
        if (resource) {
          return _this.setConceptMapFromResource(resource, cb);
        } else {
          console.warn("Error while reading the resource.");
          cb(error);
        }
      });
    };

    ConceptMapper.prototype.setConceptMapFromResource = function(resource, cb) {
      if (resource.metadata.target.objectType === "conceptMap") {
          this.setConceptMapFromJSON(resource.content);
          this.metadataHandler.setMetadata(resource.metadata);
          cb(null,resource);
      } else {
          alert("Could not load this resource.\nIs it really a concept map file?");
          cb(true);
      }
    };

    ConceptMapper.prototype.saveDialog = function() {
      var buttons, _this = this;
      this.saveConceptMap();
    };

    ConceptMapper.prototype.saveConceptMap = function() {
      var map,
        _this = this;
      map = this.getConceptMapContentAsJSON();
      return this.storageHandler.createResource(map, function(error, resource) {
        if (error) {
          return console.warn(error);
        } else {
          return _this._logAction("save", _this.metadataHandler.getTarget());
        }
      });
    };


    /*
      Delete Map first and wait for a while, this avoids errors with many peers in one session
      The validation of existing concepts could return true shortly after deleting the map

      Checks for existing concepts and connection to avoid duplicates on top of deleting them first
    */

    ConceptMapper.prototype.setConceptMapFromJSON = function(conceptMap) {
      var _this = this;

      this.deleteAll();

      /*  
      There was an error during the deletion of the map on one occasion, effecting every client that tried to load the map
      a reload of the page fixed this, but this 'solution' could result in an infinite reload loop
      the error wasnt reproducible
      try{
        this.deleteAll();
      }catch(error){
        window.location.reload();
      }
      */

      setTimeout(function() {
        var concept, connection, relation, _i, _j, _len, _len1, _ref, _ref1, __this = _this;
        _this.isCurrentlyLogging = false;
        _ref = conceptMap.concepts;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          concept = _ref[_i];
          _this._createConcept(concept.id, concept.content, concept.x, concept.y, concept.type, concept.colorClass);
        }
        _ref1 = conceptMap.relations;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          relation = _ref1[_j];
          if(!_this.connectionExists(relation.source,relation.target)){
            connection = jsPlumb.connect({
              source: relation.source,
              target: relation.target
            });
            connection.id = relation.id;
            connection.getOverlay("label").setLabel(relation.content);
          }
        }
        _this.isCurrentlyLogging = true;
        jsPlumb.repaintEverything();
        
        setTimeout(function(){
          _this.readyForMessages = true;
          console.log("readyForMessages Timer reset.");
        }, 3000);

      }, 1000);
    };
    return ConceptMapper;

  })();

}).call(this);


