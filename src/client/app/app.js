(function() {
  'use strict';

  function MainCtrl($scope) {
    $scope.rowCollection = [
        { name: 'm1.nano', vcpus: '2', ram: '64 MB', totalDisk: '0 GB', rootDisk: '0 GB', ephemeralDisk: '0 GB', isPublic: 'Yes' },
        { name: 'm1.small', vcpus: '1', ram: '2048 MB', totalDisk: '20 GB', rootDisk: '20 GB', ephemeralDisk: '0 GB', isPublic: 'Yes' },
        { name: 'm1.medium', vcpus: '1', ram: '4096 MB', totalDisk: '40 GB', rootDisk: '40 GB', ephemeralDisk: '0 GB', isPublic: 'Yes' },
        { name: 'm1.nano', vcpus: '2', ram: '64 MB', totalDisk: '0 GB', rootDisk: '0 GB', ephemeralDisk: '0 GB', isPublic: 'Yes' },
        { name: 'm1.small', vcpus: '1', ram: '2048 MB', totalDisk: '20 GB', rootDisk: '20 GB', ephemeralDisk: '0 GB', isPublic: 'Yes' },
        { name: 'm1.medium', vcpus: '1', ram: '4096 MB', totalDisk: '40 GB', rootDisk: '40 GB', ephemeralDisk: '0 GB', isPublic: 'Yes' }
    ];
  };

  var app = angular.module('app', [ 'smart-table', 'lrDragNDrop' ]);

  app.factory('DOMUtilService', function($rootScope) {

    var domUtils = {
      getElementBox: getElementBox,
      adjustExpandedRows: adjustExpandedRows
    };

    return domUtils;

    function getElementBox(element, orientation) {

      var elementPadBorder = { border: 0, padding: 0 };

      var elementComputedStyle = window.getComputedStyle(element);

      var orientKeys = orientation === 'vertical' ? [ 'top', 'bottom' ] : [ 'left', 'right' ];
      angular.forEach(orientKeys, function(pos, i) {
        var borderKey = 'border-' + pos + '-width';
        var borderValue = parseFloat(elementComputedStyle.getPropertyValue(borderKey));
        elementPadBorder[borderKey] = borderValue;
        elementPadBorder.border += borderValue;

        var padKey = 'padding-' + pos;
        var paddingValue = parseFloat(elementComputedStyle.getPropertyValue(padKey));
        elementPadBorder[padKey] = paddingValue;
        elementPadBorder.padding += paddingValue;
      });

      var widthOrHeight = orientation === 'vertical' ? 'height' : 'width';
      elementPadBorder[widthOrHeight] = parseFloat(elementComputedStyle.getPropertyValue(widthOrHeight));

      return elementPadBorder;
    }

    function adjustExpandedRows(table) {
      var expandedRows = table.find('tbody')[0].querySelectorAll('.expanded');

      if (expandedRows.length > 0) {
        var hasSelection = table.hasClass('select-table');

        var summaryFirstCell = expandedRows[0].previousSibling.previousSibling.querySelector('td:first-child');
        var summaryRowCell = hasSelection ? summaryFirstCell.nextElementSibling : summaryFirstCell;
        var summaryRowCellBox = getElementBox(summaryRowCell, 'vertical');
        var summaryRowCellHeight = summaryRowCellBox.height + summaryRowCellBox.border;

        angular.forEach(expandedRows, function(expandedRow) {
          var summaryRow = expandedRow.previousSibling.previousSibling;
          var expandedFirstCell = expandedRow.querySelector('td:first-child');
          var expandedCell = hasSelection ? expandedFirstCell.nextElementSibling : expandedFirstCell;
          var expandedCellBox = getElementBox(expandedCell, 'vertical');
          var actionColHeight = summaryRowCellHeight + expandedCellBox.height + expandedCellBox.border;
          summaryRow.querySelector('td:last-child').style.height = actionColHeight + 'px';
        });
      }
    }

  });

  app.controller('MainCtrl', [ '$scope', MainCtrl ]);

  app.directive('responsiveSmartTable', [ '$window', '$timeout', 'DOMUtilService', function($window, $timeout, DOMUtilService) {

    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element, attrs) {

      angular.element($window).bind('resize', function() {
        resizeTableHeights();
        scope.$apply();
      });

      scope.$on('$destroy', function() {
        angular.element($window).off('resize', resizeTableHeights);
      });

      $timeout(initTable, 0);

      function initTable() {
        scope.lastWidth = $window.innerWidth;

        if (element.hasClass("action-table")) {
          var actionCol = element.find('tbody')[0].querySelector('tr:first-child td:last-child');
          var actionColBox = DOMUtilService.getElementBox(actionCol, 'horizontal');
          var rightBorderWidth = actionColBox['border-right-width'];
          var actionColWidth = actionCol.scrollWidth;

          var actionColHeader = element.find('thead')[0].querySelector('tr:last-child th:last-child');
          var actionColHeaderBox = DOMUtilService.getElementBox(actionColHeader, 'horizontal');
          var actionColHeaderWidth = actionColHeader.scrollWidth;

          var largerWidth = Math.max(actionColHeaderWidth, actionColWidth) - rightBorderWidth;
          element.css('padding-right', largerWidth + 'px');

          if (actionColHeaderWidth < actionColWidth) {
            actionColHeader.style.width = (actionColBox.width + actionColBox.border) + 'px';
          } else {
            var actionCols = element.find('tbody')[0].querySelectorAll('tr td:last-child');
            angular.forEach(actionCols, function(col) {
              col.style.width = (actionColHeaderBox.width - rightBorderWidth) + 'px';
            });
          }
        }
      }

      function resizeTableHeights() {
        if (element.hasClass('action-table')) {
          var curWidth = $window.innerWidth;
          if (curWidth !== scope.lastWidth) {
            DOMUtilService.adjustExpandedRows(element);
            scope.lastWidth = curWidth;
          }
        }
      }
    }

  }]);

  app.directive('rstExpandable', [ 'DOMUtilService', function(DOMUtilService) {

    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element) {

      element.on('click', function() {

        var summaryRow = element.parent().parent();
        var detailRow = summaryRow.next();
        var table = summaryRow.parent().parent();

        element.toggleClass('fa-chevron-right').toggleClass('fa-chevron-down');
        detailRow.toggleClass('expanded');

        if (table.hasClass('action-table')) {
          var summaryRowElt = summaryRow[0];

          if (!detailRow.hasClass('expanded')) {
            summaryRowElt.querySelector('td:last-child').style.height = 'inherit';
          }

          DOMUtilService.adjustExpandedRows(table);
        }
      });
    }

  }]);

})();