'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.filter',
    'myApp.home',
    'myApp.product',
    'myApp.cart',
    'myApp.version',
    'ngAnimate',
    'ngSanitize'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/home'});
}]);

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
'use strict';

angular.module('myApp.home', ['ngRoute', 'myApp.categoryServices', 'myApp.productServices'])

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
'use strict';

angular.module('myApp.filter', [])

    .filter('filterCategoryAndTitleAndDescription', function () {
            return function (products, searchText, categoryId) {
                if (!products) {
                    return [];
                }
                if (!searchText) {
                    searchText = '';
                }
                searchText = searchText.toLowerCase();
                return products.filter(function (it) {
                    return (it.title.toLowerCase().includes(searchText) || it.description.toLowerCase().includes(searchText)
                        ) &&
                        it.categoryId === categoryId;
                });
            }
        }
    )
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
angular.module("myApp.categoryServices", ["ngResource"])
    .factory("categoryService",
        function ($resource, $q, $http) {
            const url = 'https://e-shop-backend.herokuapp.com'
            return {
                getCategories: function () {
                    var deferred = $q.defer();
                    var promise = $http.get(url + '/categories')
                        .then(function (data) {

                            deferred.resolve(data);
                        });

                    return deferred.promise;
                }
            }
        });
angular.module("myApp.productServices", ["ngResource"])
    .factory("productService",
        function ($resource, $q, $http) {
            const url = 'https://e-shop-backend.herokuapp.com'
            return {
                getProducts: function () {
                    var deferred = $q.defer();
                    var promise = $http.get(url + '/products')
                        .then(function (data) {

                            deferred.resolve(data);
                        });

                    return deferred.promise;
                },
                getProductById: function (productId) {
                    var deferred = $q.defer();
                    var promise = $http.get(url + '/products/' + productId)
                        .then(function (data) {

                            deferred.resolve(data);
                        });

                    return deferred.promise;
                }
            }
        });
'use strict';

angular.module('myApp.version.interpolate-filter', [])

.filter('interpolate', ['version', function(version) {
  return function(text) {
    return String(text).replace(/\%VERSION\%/mg, version);
  };
}]);

'use strict';

angular.module('myApp.version.version-directive', [])

.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]);

'use strict';

angular.module('myApp.version', [
  'myApp.version.interpolate-filter',
  'myApp.version.version-directive'
])

.value('version', '0.1');

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNhcnQvY2FydC5qcyIsImhvbWUvaG9tZS5qcyIsImZpbHRlci9maWx0ZXIuanMiLCJwcm9kdWN0L3Byb2R1Y3QuanMiLCJzZXJ2aWNlL2NhdGVnb3J5LnNlcnZpY2UuanMiLCJzZXJ2aWNlL3Byb2R1Y3Quc2VydmljZS5qcyIsImNvbXBvbmVudHMvdmVyc2lvbi9pbnRlcnBvbGF0ZS1maWx0ZXIuanMiLCJjb21wb25lbnRzL3ZlcnNpb24vdmVyc2lvbi1kaXJlY3RpdmUuanMiLCJjb21wb25lbnRzL3ZlcnNpb24vdmVyc2lvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG4vLyBEZWNsYXJlIGFwcCBsZXZlbCBtb2R1bGUgd2hpY2ggZGVwZW5kcyBvbiB2aWV3cywgYW5kIGNvbXBvbmVudHNcclxuYW5ndWxhci5tb2R1bGUoJ215QXBwJywgW1xyXG4gICAgJ25nUm91dGUnLFxyXG4gICAgJ215QXBwLmZpbHRlcicsXHJcbiAgICAnbXlBcHAuaG9tZScsXHJcbiAgICAnbXlBcHAucHJvZHVjdCcsXHJcbiAgICAnbXlBcHAuY2FydCcsXHJcbiAgICAnbXlBcHAudmVyc2lvbicsXHJcbiAgICAnbmdBbmltYXRlJyxcclxuICAgICduZ1Nhbml0aXplJ1xyXG5dKS5jb25maWcoWyckbG9jYXRpb25Qcm92aWRlcicsICckcm91dGVQcm92aWRlcicsIGZ1bmN0aW9uICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIpIHtcclxuICAgICRsb2NhdGlvblByb3ZpZGVyLmhhc2hQcmVmaXgoJyEnKTtcclxuXHJcbiAgICAkcm91dGVQcm92aWRlci5vdGhlcndpc2Uoe3JlZGlyZWN0VG86ICcvaG9tZSd9KTtcclxufV0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnbXlBcHAuY2FydCcsIFsnbmdSb3V0ZSddKVxyXG5cclxuICAgIC5jb25maWcoWyckcm91dGVQcm92aWRlcicsIGZ1bmN0aW9uICgkcm91dGVQcm92aWRlcikge1xyXG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9jYXJ0Jywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2NhcnQvY2FydC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NhcnRDdHJsJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfV0pXHJcblxyXG4gICAgLmNvbnRyb2xsZXIoJ0NhcnRDdHJsJywgWyckc2NvcGUnLCAnJHdpbmRvdycsIGZ1bmN0aW9uICgkc2NvcGUsICR3aW5kb3cpIHtcclxuICAgICAgICAkc2NvcGUuY2FydCA9IEpTT04ucGFyc2UoJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdjYXJ0JykpO1xyXG4gICAgICAgIGlmICgkc2NvcGUuY2FydCA9PT0gbnVsbCB8fCAkc2NvcGUuY2FydCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jYXJ0ID0ge307XHJcbiAgICAgICAgICAgICRzY29wZS5jYXJ0LnByb2R1Y3RzID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5jYXJ0LnRvdGFsID0gMDtcclxuICAgICAgICAgICAgJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdjYXJ0JywgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLmNhcnQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5jbGVhckNhcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnY2FydCcsIEpTT04uc3RyaW5naWZ5KHtwcm9kdWN0czogW10sIHRvdGFsOiAwfSkpO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FydCA9IEpTT04ucGFyc2UoJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdjYXJ0JykpO1xyXG4gICAgICAgIH1cclxuICAgIH1dKTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnbXlBcHAuaG9tZScsIFsnbmdSb3V0ZScsICdteUFwcC5jYXRlZ29yeVNlcnZpY2VzJywgJ215QXBwLnByb2R1Y3RTZXJ2aWNlcyddKVxyXG5cclxuICAgIC5jb25maWcoWyckcm91dGVQcm92aWRlcicsIGZ1bmN0aW9uICgkcm91dGVQcm92aWRlcikge1xyXG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9ob21lJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2hvbWUvaG9tZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDdHJsJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfV0pXHJcblxyXG4gICAgLmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgWydjYXRlZ29yeVNlcnZpY2UnLCAncHJvZHVjdFNlcnZpY2UnLCAnJHNjb3BlJywgZnVuY3Rpb24gKGNhdGVnb3J5U2VydmljZSwgcHJvZHVjdFNlcnZpY2UsICRzY29wZSkge1xyXG5cclxuICAgICAgICAkc2NvcGUuY3VycmVudENhdGVnb3J5O1xyXG4gICAgICAgICRzY29wZS5jYXRlZ29yaWVzID0gW107XHJcbiAgICAgICAgJHNjb3BlLnByb2R1Y3RzID0gW107XHJcbiAgICAgICAgJHNjb3BlLnRlc3QgPSAndGVzdCc7XHJcbiAgICAgICAgJHNjb3BlLmRpc3BsYXlDYXRlZ29yeUNvbnRhaW5lclNwaW5uZXIgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5kaXNwbGF5UHJvZHVjdENvbnRhaW5lclNwaW5uZXIgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5nZXRDYXRlZ29yaWVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjYXRlZ29yeVNlcnZpY2UuZ2V0Q2F0ZWdvcmllcygpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNhdGVnb3JpZXMgPSByZXN1bHQuZGF0YTtcclxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuY2F0ZWdvcmllcyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRDYXRlZ29yeSA9ICRzY29wZS5jYXRlZ29yaWVzWzBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpc3BsYXlDYXRlZ29yeUNvbnRhaW5lclNwaW5uZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5nZXRQcm9kdWN0cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcHJvZHVjdFNlcnZpY2UuZ2V0UHJvZHVjdHMoKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9kdWN0cyA9IHJlc3VsdC5kYXRhO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpc3BsYXlQcm9kdWN0Q29udGFpbmVyU3Bpbm5lciA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLnVwZGF0ZUNhdGVnb3J5ID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50Q2F0ZWdvcnkgPSBjYXRlZ29yeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLmdldENhdGVnb3JpZXMoKTtcclxuICAgICAgICAkc2NvcGUuZ2V0UHJvZHVjdHMoKTtcclxuICAgIH1dKTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnbXlBcHAuZmlsdGVyJywgW10pXHJcblxyXG4gICAgLmZpbHRlcignZmlsdGVyQ2F0ZWdvcnlBbmRUaXRsZUFuZERlc2NyaXB0aW9uJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHByb2R1Y3RzLCBzZWFyY2hUZXh0LCBjYXRlZ29yeUlkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByb2R1Y3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFzZWFyY2hUZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoVGV4dCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2VhcmNoVGV4dCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9kdWN0cy5maWx0ZXIoZnVuY3Rpb24gKGl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChpdC50aXRsZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRleHQpIHx8IGl0LmRlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGV4dClcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5jYXRlZ29yeUlkID09PSBjYXRlZ29yeUlkO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ215QXBwLnByb2R1Y3QnLCBbJ25nUm91dGUnLCAnbXlBcHAucHJvZHVjdFNlcnZpY2VzJywgJ25nQW5pbWF0ZSddKVxyXG5cclxuICAgIC5jb25maWcoWyckcm91dGVQcm92aWRlcicsIGZ1bmN0aW9uICgkcm91dGVQcm92aWRlcikge1xyXG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9wcm9kdWN0Lzpwcm9kdWN0SWQnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZHVjdC9wcm9kdWN0Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnUHJvZHVjdEN0cmwnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XSlcclxuXHJcbiAgICAuY29udHJvbGxlcignUHJvZHVjdEN0cmwnLCBbJyRzY29wZScsICckbG9jYXRpb24nLCAncHJvZHVjdFNlcnZpY2UnLCAnJHdpbmRvdycsIGZ1bmN0aW9uICgkc2NvcGUsICRsb2NhdGlvbiwgcHJvZHVjdFNlcnZpY2UsICR3aW5kb3cpIHtcclxuXHJcbiAgICAgICAgJHNjb3BlLnVybCA9ICRsb2NhdGlvbi5wYXRoKCkuc3BsaXQoJy8nKTtcclxuICAgICAgICAkc2NvcGUucHJvZHVjdElkID0gJHNjb3BlLnVybFsyXTtcclxuICAgICAgICAkc2NvcGUucHJvZHVjdDtcclxuICAgICAgICAkc2NvcGUuc3VjY2Vzc0FsZXJ0ID0ge3R5cGU6ICdzdWNjZXNzJywgbXNnOiAnSXRlbSBzdWNjZXNzZnVsbHkgYWRkZWQgdG8gY2FydC4nfTtcclxuICAgICAgICAkc2NvcGUuZGFuZ2VyQWxlcnQgPSB7dHlwZTogJ2RhbmdlcicsIG1zZzogJ0l0ZW0gYWxyZWFkeSBleGlzdHMgaW4gY2FydC4nfTtcclxuICAgICAgICAkc2NvcGUuYWxlcnRzID0gW107XHJcbiAgICAgICAgJHNjb3BlLm15SW50ZXJ2YWwgPSA1MDAwO1xyXG4gICAgICAgICRzY29wZS5ub1dyYXBTbGlkZXMgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUuYWN0aXZlID0gMDtcclxuICAgICAgICAkc2NvcGUuY2FydCA9IEpTT04ucGFyc2UoJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdjYXJ0JykpO1xyXG4gICAgICAgIGlmICgkc2NvcGUuY2FydCA9PT0gbnVsbCB8fCAkc2NvcGUuY2FydCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jYXJ0ID0ge307XHJcbiAgICAgICAgICAgICRzY29wZS5jYXJ0LnByb2R1Y3RzID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5jYXJ0LnRvdGFsID0gMDtcclxuICAgICAgICAgICAgJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdjYXJ0JywgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLmNhcnQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLmdldFByb2R1Y3REZXRhaWxzID0gZnVuY3Rpb24gKHByb2R1Y3RJZCkge1xyXG4gICAgICAgICAgICBwcm9kdWN0U2VydmljZS5nZXRQcm9kdWN0QnlJZChwcm9kdWN0SWQpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2R1Y3QgPSByZXN1bHQuZGF0YTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5wcm9kdWN0KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5wcm9kdWN0RXhpc3RzSW5DYXJ0ID0gZnVuY3Rpb24gKHByb2R1Y3QpIHtcclxuICAgICAgICAgICAgdmFyIGV4aXN0cyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNhcnQgPT09IG51bGwgfHwgJHNjb3BlLmNhcnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5jYXJ0LnByb2R1Y3RzID09PSBudWxsIHx8ICRzY29wZS5jYXJ0LnByb2R1Y3RzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb3VudGVyID0gMDtcclxuICAgICAgICAgICAgICAgIHdoaWxlICghZXhpc3RzICYmIGNvdW50ZXIgPCAkc2NvcGUuY2FydC5wcm9kdWN0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmNhcnQucHJvZHVjdHNbY291bnRlcl0uaXRlbS5pZCA9PT0gcHJvZHVjdC5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleGlzdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGV4aXN0cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5hZGRUb0NhcnQgPSBmdW5jdGlvbiAocHJvZHVjdCkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLnByb2R1Y3RFeGlzdHNJbkNhcnQocHJvZHVjdCkpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5hZGRBbGVydCgkc2NvcGUuZGFuZ2VyQWxlcnQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHByb2R1Y3RUb0FkZCA9IHt9O1xyXG4gICAgICAgICAgICAgICAgcHJvZHVjdFRvQWRkLml0ZW0gPSBwcm9kdWN0O1xyXG4gICAgICAgICAgICAgICAgcHJvZHVjdFRvQWRkLnF1YW50aXR5ID0gMTtcclxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuY2FydC5wcm9kdWN0cyA9PT0gbnVsbCB8fCAkc2NvcGUuY2FydC5wcm9kdWN0cyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNhcnQucHJvZHVjdHMgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY2FydC50b3RhbCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2FydC5wcm9kdWN0cy5wdXNoKHByb2R1Y3RUb0FkZCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2FydC50b3RhbCArPSBwcm9kdWN0LnByaWNlO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmFkZEFsZXJ0KCRzY29wZS5zdWNjZXNzQWxlcnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnY2FydCcsIEpTT04uc3RyaW5naWZ5KCRzY29wZS5jYXJ0KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuYWRkQWxlcnQgPSBmdW5jdGlvbiAoYWxlcnQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmFsZXJ0cyA9IFtdO1xyXG4gICAgICAgICAgICAkc2NvcGUuYWxlcnRzLnB1c2goYWxlcnQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS5jbG9zZUFsZXJ0ID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hbGVydHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuZ29Ub1ByZXZTbGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJChcIiNjYXJvdXNlbEV4YW1wbGVJbmRpY2F0b3JzXCIpLmNhcm91c2VsKFwicHJldlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLmdvVG9OZXh0U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoXCIjY2Fyb3VzZWxFeGFtcGxlSW5kaWNhdG9yc1wiKS5jYXJvdXNlbChcIm5leHRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5nZXRQcm9kdWN0RGV0YWlscygkc2NvcGUucHJvZHVjdElkKTtcclxuICAgIH1dKTsiLCJhbmd1bGFyLm1vZHVsZShcIm15QXBwLmNhdGVnb3J5U2VydmljZXNcIiwgW1wibmdSZXNvdXJjZVwiXSlcclxuICAgIC5mYWN0b3J5KFwiY2F0ZWdvcnlTZXJ2aWNlXCIsXHJcbiAgICAgICAgZnVuY3Rpb24gKCRyZXNvdXJjZSwgJHEsICRodHRwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVybCA9ICdodHRwczovL2Utc2hvcC1iYWNrZW5kLmhlcm9rdWFwcC5jb20nXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBnZXRDYXRlZ29yaWVzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9ICRodHRwLmdldCh1cmwgKyAnL2NhdGVnb3JpZXMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pOyIsImFuZ3VsYXIubW9kdWxlKFwibXlBcHAucHJvZHVjdFNlcnZpY2VzXCIsIFtcIm5nUmVzb3VyY2VcIl0pXHJcbiAgICAuZmFjdG9yeShcInByb2R1Y3RTZXJ2aWNlXCIsXHJcbiAgICAgICAgZnVuY3Rpb24gKCRyZXNvdXJjZSwgJHEsICRodHRwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVybCA9ICdodHRwczovL2Utc2hvcC1iYWNrZW5kLmhlcm9rdWFwcC5jb20nXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBnZXRQcm9kdWN0czogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSAkaHR0cC5nZXQodXJsICsgJy9wcm9kdWN0cycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdldFByb2R1Y3RCeUlkOiBmdW5jdGlvbiAocHJvZHVjdElkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9ICRodHRwLmdldCh1cmwgKyAnL3Byb2R1Y3RzLycgKyBwcm9kdWN0SWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ215QXBwLnZlcnNpb24uaW50ZXJwb2xhdGUtZmlsdGVyJywgW10pXHJcblxyXG4uZmlsdGVyKCdpbnRlcnBvbGF0ZScsIFsndmVyc2lvbicsIGZ1bmN0aW9uKHZlcnNpb24pIHtcclxuICByZXR1cm4gZnVuY3Rpb24odGV4dCkge1xyXG4gICAgcmV0dXJuIFN0cmluZyh0ZXh0KS5yZXBsYWNlKC9cXCVWRVJTSU9OXFwlL21nLCB2ZXJzaW9uKTtcclxuICB9O1xyXG59XSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdteUFwcC52ZXJzaW9uLnZlcnNpb24tZGlyZWN0aXZlJywgW10pXHJcblxyXG4uZGlyZWN0aXZlKCdhcHBWZXJzaW9uJywgWyd2ZXJzaW9uJywgZnVuY3Rpb24odmVyc2lvbikge1xyXG4gIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxtLCBhdHRycykge1xyXG4gICAgZWxtLnRleHQodmVyc2lvbik7XHJcbiAgfTtcclxufV0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnbXlBcHAudmVyc2lvbicsIFtcclxuICAnbXlBcHAudmVyc2lvbi5pbnRlcnBvbGF0ZS1maWx0ZXInLFxyXG4gICdteUFwcC52ZXJzaW9uLnZlcnNpb24tZGlyZWN0aXZlJ1xyXG5dKVxyXG5cclxuLnZhbHVlKCd2ZXJzaW9uJywgJzAuMScpO1xyXG4iXX0=
