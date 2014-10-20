// Generated by CoffeeScript 1.6.3
(function() {
  "use strict";
  var initialMetadata;

  initialMetadata = {
    "actor": {
      "objectType": "person",
      "id": "f25d7eff-8859-49ed-85e9-e7c1f92bc334",
      "displayName": "anonymized"
    },
    "target": {
      "objectType": "experiment",
      "id": "9383fbbe-e071-49b2-9770-46ddc4f8cd6e",
      "displayName": "buoyancy experiment"
    },
    "generator": {
      "objectType": "application",
      "url": "http://go-lab.gw.utwente.nl/experiments/...",
      "id": "04123e9e-14d0-447b-a851-805b9262d9a6",
      "displayName": "Splash and EDT"
    },
    "provider": {
      "objectType": "study",
      "url": "http://go-lab.gw.utwente.nl/experiments/...",
      "id": "0f8184db-53ba-4868-9208-896c3d7c25bb",
      "displayName": "Siswa1"
    }
  };

  new golab.ils.metadata.MetadataHandler(initialMetadata, function(error, metadataHandler) {
    var actionLogger, logObject;
    metadataHandler.setActor({
      "objectType": "person",
      "id": "f25d7eff-8859-49ed-85e9-e7c1f9212345",
      "displayName": "Lars"
    });
    actionLogger = new ut.commons.actionlogging.ActionLogger(metadataHandler);
    actionLogger.setLoggingTargetByName("dufftown");
    logObject = {
      "objectType": "someObject",
      "id": "someId",
      "content": "the content of the object"
    };
    actionLogger.log("add", logObject);
    logObject = {
      "objectType": "someObject",
      "id": "someId",
      "content": {
        "variableName": "x",
        "value": "1234.093",
        "testStructure": {
          "deeper": {
            "f": "x^2",
            "f'": "1/2x"
          }
        }
      }
    };
    return actionLogger.log("change", logObject);
  });

}).call(this);

/*
//@ sourceMappingURL=logTest.map
*/
