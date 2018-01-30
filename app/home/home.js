'use strict';

angular.module('myApp.home', ['ngRoute',
    'myApp.services'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'home/home.html',
            controller: 'HomeCtrl'
        });
    }])

    .controller('HomeCtrl', ['categoryService','$scope', function (categoryService, $scope) {
        $scope.categories = [];
        $scope.test = 'test';
        $scope.displayCategoryContainerSpinner = true;
        $scope.getCategories = function () {
            categoryService.getCategories().then(function (result) {
                $scope.categories = result.data;
                $scope.displayCategoryContainerSpinner = false;
            });
        }

        $scope.getCategories();
    }]);