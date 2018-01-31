'use strict';

angular.module('myApp.product', ['ngRoute', 'myApp.productServices'])

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
        var slides = $scope.slides = [];
        var currIndex = 0;
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
            $scope.alerts.push(alert);
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.addSlide = function () {
            var newWidth = 600 + slides.length + 1;
            slides.push({
                image: '//unsplash.it/' + newWidth + '/300',
                text: ['Nice image', 'Awesome photograph', 'That is so cool', 'I love that'][slides.length % 4],
                id: currIndex++
            });
        };

        $scope.randomize = function () {
            var indexes = generateIndexesArray();
            assignNewIndexesToSlides(indexes);
        };

        for (var i = 0; i < 4; i++) {
            $scope.addSlide();
        }

        // Randomize logic below

        function assignNewIndexesToSlides(indexes) {
            for (var i = 0, l = slides.length; i < l; i++) {
                slides[i].id = indexes.pop();
            }
        }

        function generateIndexesArray() {
            var indexes = [];
            for (var i = 0; i < currIndex; ++i) {
                indexes[i] = i;
            }
            return shuffle(indexes);
        }

        // http://stackoverflow.com/questions/962802#962890
        function shuffle(array) {
            var tmp, current, top = array.length;

            if (top) {
                while (--top) {
                    current = Math.floor(Math.random() * (top + 1));
                    tmp = array[current];
                    array[current] = array[top];
                    array[top] = tmp;
                }
            }

            return array;
        }

        $scope.getProductDetails($scope.productId);
    }]);