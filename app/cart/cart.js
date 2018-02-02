'use strict';

angular.module('myApp.cart', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/cart', {
            templateUrl: 'cart/cart.html',
            controller: 'CartCtrl'
        });
    }])

    .controller('CartCtrl', ['$scope', '$window', function ($scope, $window) {
        $scope.minNumCartProduct = 0;
        $scope.maxNumCartProduct = 10;
        $scope.cart = JSON.parse($window.sessionStorage.getItem('cart'));
        console.log($scope.cart);
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

        $scope.updateCart = function () {
            var total = 0;
            $scope.cart.products.forEach(function (cartItem) {
                total += cartItem.quantity * cartItem.item.price;
            });
            $scope.cart.total = total;
            $scope.persistCartLocally();
        }

        $scope.persistCartLocally = function () {
            $window.sessionStorage.setItem('cart', JSON.stringify($scope.cart));
            $scope.cart = JSON.parse($window.sessionStorage.getItem('cart'));
        }

        $scope.deleteCartItem = function (cartItem) {
            const productIndexInCart = $scope.cart.products.indexOf(cartItem);
            $scope.cart.products.splice(productIndexInCart, 1);
            $scope.updateCart();
            $scope.persistCartLocally();
        }
    }]);