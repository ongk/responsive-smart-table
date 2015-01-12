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

  app.controller('MainCtrl', [ '$scope', MainCtrl ]);

  app.directive('responsiveSmartTable', [ '$window', '$timeout', function($window, $timeout) {

    function link(scope, element, attrs) {

      function initTable() {
        scope.lastWidth = $window.innerWidth;

        if (element.hasClass("action-table")) {
          var actionColHeader = element.find('thead')[0].querySelector('tr:last-child th:last-child');
          var actionColHeaderWidth = actionColHeader.offsetWidth - 2;
          var actionCol = element.find('tbody')[0].querySelector('tr:first-child td:last-child');
          var actionColWidth = actionCol.offsetWidth - 2;
          var largerWidth = Math.max(actionColHeaderWidth, actionColWidth);
          element.css('padding-right', largerWidth + 'px');
          if (actionColHeaderWidth < actionColWidth) {
            element.find('thead')[0].querySelectorAll('tr th:last-child')[1].style.width = (actionColWidth - 14) + 'px';
          } else {
            var actionCols = element.find('tbody')[0].querySelectorAll('tr td:last-child');
            angular.forEach(actionCols, function(col) {
              col.style.width = (largerWidth - 16) + 'px';
            });
          }
        }
      }

      function resizeTableHeights() {
        if (element.hasClass('action-table')) {
          var curWidth = $window.innerWidth;
          if (curWidth !== scope.lastWidth) {
            var expandedRows = element.find('tbody')[0].querySelectorAll('.expanded');
            angular.forEach(expandedRows, function(expandedRow) {
              var summaryRowElt = expandedRow.previousSibling.previousSibling;
              var actionColHeight = expandedRow.offsetTop + expandedRow.offsetHeight - summaryRowElt.offsetTop - 18;
              summaryRowElt.querySelector('td:last-child').style.height = actionColHeight + 'px';
            });

            scope.lastWidth = curWidth;
          }
        }
      }

      angular.element($window).bind('resize', function() {
        resizeTableHeights();
        scope.$apply();
      });

      scope.$on('$destory', function() {
        angular.element($window).off('resize', resizeTableHeights);
      });

      $timeout(initTable, 0);

    }

    return {
      restrict: 'A',
      link: link
    }

  }]);

  app.directive('rstExpandable', function() {

    var link = function(scope, element) {

      element.on('click', function() {

        var summaryRow = element.parent().parent();
        var detailRow = summaryRow.next();
        var table = summaryRow.parent().parent();

        element.toggleClass('fa-chevron-right').toggleClass('fa-chevron-down');
        detailRow.toggleClass('expanded');

        if (table.hasClass('action-table')) {
          var detailRowElt = detailRow[0];
          var summaryRowElt = summaryRow[0];

          if (detailRow.hasClass('expanded')) {
            var actionColHeight = detailRowElt.offsetTop + detailRowElt.offsetHeight - summaryRowElt.offsetTop - 18;
            summaryRowElt.querySelector('td:last-child').style.height = actionColHeight + 'px';
          } else {
            summaryRowElt.querySelector('td:last-child').style.height = 'inherit';
          }
        }
      });

    };

    return {
      restrict: 'A',
      link: link
    }

  });

})();