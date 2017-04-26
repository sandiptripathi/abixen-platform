/**
 * Copyright (c) 2010-present Abixen Systems. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

(function () {

    'use strict';

    angular
        .module('webContentServiceWebContentModule')
        .controller('WebContentServiceWebContentDetailsController', WebContentServiceWebContentDetailsController);

    WebContentServiceWebContentDetailsController.$inject = [
        '$scope',
        '$state',
        '$stateParams',
        '$log',
        'Structure',
        'WebContent',
        'responseHandler'
    ];

    function WebContentServiceWebContentDetailsController($scope, $state, $stateParams, $log,Structure, WebContent, responseHandler) {
        $log.log('WebContentServiceWebContentDetailsController');

        var webContentDetails = this;
            webContentDetails.rows = {
            row: []
          };

        webContentDetails.row = function (rowId, name,type) {
            return {
                rowId: rowId,
                type: type,
                name: name,
                value:''
            };

        };

        angular.extend(webContentDetails, new AbstractDetailsController(webContentDetails, WebContent, responseHandler, $scope,
            {
                entityId: $stateParams.id,
                getValidators: getValidators,
                onSuccessSaveForm: onSuccessSaveForm
            }
        ));
        getStructures();

        $scope.$watch('webContentDetails.entity.structure',function () {

          webContentDetails.rows = {row: []};
          if(webContentDetails.entity.structure!=null)
          webContentDetails.rows =  webContentDetails.transform.xmlToRow(webContentDetails.entity.structure.content);
          console.log(webContentDetails.rows);
          console.log( webContentDetails.test);

        });

        webContentDetails.transform = {
            rowToXml : function (rows) {
                var xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><fields></fields>";
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xmlString, "text/xml");
                var elements  = xmlDoc.getElementsByTagName("fields");
                rows.row.forEach(function (rowElement) {
                    var node = xmlDoc.createElement("field");
                    node.setAttribute('name', rowElement.name);
                    node.setAttribute('value', rowElement.content.value);
                    elements[0].appendChild(node);
                });
                var serializer = new XMLSerializer();
                return serializer.serializeToString(xmlDoc);
            },
            xmlToRow : function (xmlString) {
                var  rows = {row: []};
                    var parser = new DOMParser();
                    var xmlDoc = parser.parseFromString(xmlString, "text/xml");
                    var elements = xmlDoc.getElementsByTagName("field");
                    for (var i = 0; i < elements.length; i++) {
                        var row = webContentDetails.row(i,
                            elements[i].getAttribute('name'),
                            elements[i].getAttribute('type'));
                        rows.row.push(row);
                    }
                return rows;
            }
        };

        function onSuccessSaveForm() {
            $state.go('application.webContentService.webContent.list');
        }
        function getStructures() {
            Structure.queryAll().$promise.then(onQueryResult);

            function onQueryResult(structures) {
                webContentDetails.structures = structures;
            }
        }

        function getValidators() {
            var validators = [];

            validators['name'] =
                [
                    new NotNull(),
                    new Length(6, 255)
                ];

            validators['content'] =
                [
                    new NotNull()
                ];

            return validators;
        }

    }
})();
