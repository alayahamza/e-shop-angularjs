'use strict';

angular.module('myApp.cart', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/cart', {
            templateUrl: 'cart/cart.html',
            controller: 'CartCtrl'
        });
    }])

    .controller('CartCtrl', ['$scope', '$window', function ($scope, $window) {
        $scope.cart = JSON.parse($window.sessionStorage.getItem('cart'));
        if ($scope.cart === null || $scope.cart === undefined) {
            $scope.cart = {};
            $scope.cart.products = [];
            $scope.cart.total = 0;
            $window.sessionStorage.setItem('cart', JSON.stringify($scope.cart));
        }

        $scope.clearCart = function () {
            $window.sessionStorage.setItem('cart', JSON.stringify({products: [], total: 0}));
            $scope.cart = JSON.parse($window.sessionStorage.getItem('cart'));
        }
    }]);