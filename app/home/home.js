'use strict';

angular.module('myApp.home', ['ngRoute',
    'myApp.categoryServices',
    'myApp.productServices'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'home/home.html',
            controller: 'HomeCtrl'
        });
    }])

    .controller('HomeCtrl', ['categoryService', 'productService', '$scope', function (categoryService, productService, $scope) {
        $scope.currentCategory;
        $scope.categories = [];
        $scope.products = [];
        $scope.test = 'test';
        $scope.displayCategoryContainerSpinner = true;
        $scope.displayProductContainerSpinner = true;
        $scope.getCategories = function () {
            categoryService.getCategories().then(function (result) {
                $scope.categories = result.data;
                if ($scope.categories !== undefined) {
                    $scope.currentCategory = $scope.categories[0];
                }
                $scope.displayCategoryContainerSpinner = false;
            });
        }
        $scope.getProducts = function () {
            productService.getProducts().then(function (result) {
                $scope.products = result.data;
                $scope.displayProductContainerSpinner = false;
            });
        }
        $scope.updateCategory = function (category) {
            $scope.currentCategory = category;
        }
        $scope.getCategories();
        $scope.getProducts();
    }]);