'use strict';

angular.module('myApp.product', ['ngRoute', 'myApp.productServices', 'ngAnimate'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/product/:productId', {
            templateUrl: 'product/product.html',
            controller: 'ProductCtrl'
        });
    }])

    .controller('ProductCtrl', ['$scope', '$location', 'productService', '$window', function ($scope, $location, productService, $window) {

        $scope.url = $location.path().split('/');
        $scope.productId = $scope.url[2];
        $scope.product;
        $scope.successAlert = {type: 'success', msg: 'Item successfully added to cart.'};
        $scope.dangerAlert = {type: 'danger', msg: 'Item already exists in cart.'};
        $scope.alerts = [];
        $scope.myInterval = 5000;
        $scope.noWrapSlides = false;
        $scope.active = 0;
        $scope.cart = JSON.parse($window.sessionStorage.getItem('cart'));
        if ($scope.cart === null || $scope.cart === undefined) {
            $scope.cart = {};
            $scope.cart.products = [];
            $scope.cart.total = 0;
            $window.sessionStorage.setItem('cart', JSON.stringify($scope.cart));
        }
        $scope.getProductDetails = function (productId) {
            productService.getProductById(productId).then(function (result) {
                $scope.product = result.data;
                console.log($scope.product);
            })
        }

        $scope.productExistsInCart = function (product) {
            var exists = false;
            if ($scope.cart === null || $scope.cart === undefined) {
                return false;
            } else if ($scope.cart.products === null || $scope.cart.products === undefined) {
                return false;
            } else {
                var counter = 0;
                while (!exists && counter < $scope.cart.products.length) {
                    if ($scope.cart.products[counter].item.id === product.id) {
                        exists = true;
                    }
                    counter++;
                }
            }
            return exists;
        }

        $scope.addToCart = function (product) {
            if ($scope.productExistsInCart(product)) {
                $scope.addAlert($scope.dangerAlert);
            } else {
                var productToAdd = {};
                productToAdd.item = product;
                productToAdd.quantity = 1;
                if ($scope.cart.products === null || $scope.cart.products === undefined) {
                    $scope.cart.products = [];
                    $scope.cart.total = 0;
                }
                $scope.cart.products.push(productToAdd);
                $scope.cart.total += product.price;
                $scope.addAlert($scope.successAlert);
            }
            $window.sessionStorage.setItem('cart', JSON.stringify($scope.cart));
        }

        $scope.addAlert = function (alert) {
            $scope.alerts = [];
            $scope.alerts.push(alert);
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.goToPrevSlide = function () {
            $("#carouselExampleIndicators").carousel("prev");
        }
        $scope.goToNextSlide = function () {
            $("#carouselExampleIndicators").carousel("next");
        }
        $scope.getProductDetails($scope.productId);
    }]);