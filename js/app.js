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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNhcnQvY2FydC5qcyIsImZpbHRlci9maWx0ZXIuanMiLCJzZXJ2aWNlL2NhdGVnb3J5LnNlcnZpY2UuanMiLCJzZXJ2aWNlL3Byb2R1Y3Quc2VydmljZS5qcyIsImhvbWUvaG9tZS5qcyIsInByb2R1Y3QvcHJvZHVjdC5qcyIsImNvbXBvbmVudHMvdmVyc2lvbi9pbnRlcnBvbGF0ZS1maWx0ZXIuanMiLCJjb21wb25lbnRzL3ZlcnNpb24vdmVyc2lvbi1kaXJlY3RpdmUuanMiLCJjb21wb25lbnRzL3ZlcnNpb24vdmVyc2lvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG4vLyBEZWNsYXJlIGFwcCBsZXZlbCBtb2R1bGUgd2hpY2ggZGVwZW5kcyBvbiB2aWV3cywgYW5kIGNvbXBvbmVudHNcclxuYW5ndWxhci5tb2R1bGUoJ215QXBwJywgW1xyXG4gICAgJ25nUm91dGUnLFxyXG4gICAgJ215QXBwLmZpbHRlcicsXHJcbiAgICAnbXlBcHAuaG9tZScsXHJcbiAgICAnbXlBcHAucHJvZHVjdCcsXHJcbiAgICAnbXlBcHAuY2FydCcsXHJcbiAgICAnbXlBcHAudmVyc2lvbicsXHJcbiAgICAnbmdBbmltYXRlJyxcclxuICAgICduZ1Nhbml0aXplJ1xyXG5dKS5jb25maWcoWyckbG9jYXRpb25Qcm92aWRlcicsICckcm91dGVQcm92aWRlcicsIGZ1bmN0aW9uICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIpIHtcclxuICAgICRsb2NhdGlvblByb3ZpZGVyLmhhc2hQcmVmaXgoJyEnKTtcclxuXHJcbiAgICAkcm91dGVQcm92aWRlci5vdGhlcndpc2Uoe3JlZGlyZWN0VG86ICcvaG9tZSd9KTtcclxufV0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnbXlBcHAuY2FydCcsIFsnbmdSb3V0ZSddKVxyXG5cclxuICAgIC5jb25maWcoWyckcm91dGVQcm92aWRlcicsIGZ1bmN0aW9uICgkcm91dGVQcm92aWRlcikge1xyXG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9jYXJ0Jywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2NhcnQvY2FydC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0NhcnRDdHJsJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfV0pXHJcblxyXG4gICAgLmNvbnRyb2xsZXIoJ0NhcnRDdHJsJywgWyckc2NvcGUnLCAnJHdpbmRvdycsIGZ1bmN0aW9uICgkc2NvcGUsICR3aW5kb3cpIHtcclxuICAgICAgICAkc2NvcGUubWluTnVtQ2FydFByb2R1Y3QgPSAwO1xyXG4gICAgICAgICRzY29wZS5tYXhOdW1DYXJ0UHJvZHVjdCA9IDEwO1xyXG4gICAgICAgICRzY29wZS5jYXJ0ID0gSlNPTi5wYXJzZSgkd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2NhcnQnKSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmNhcnQpO1xyXG4gICAgICAgIGlmICgkc2NvcGUuY2FydCA9PT0gbnVsbCB8fCAkc2NvcGUuY2FydCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jYXJ0ID0ge307XHJcbiAgICAgICAgICAgICRzY29wZS5jYXJ0LnByb2R1Y3RzID0gW107XHJcbiAgICAgICAgICAgICRzY29wZS5jYXJ0LnRvdGFsID0gMDtcclxuICAgICAgICAgICAgJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdjYXJ0JywgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLmNhcnQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5jbGVhckNhcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnY2FydCcsIEpTT04uc3RyaW5naWZ5KHtwcm9kdWN0czogW10sIHRvdGFsOiAwfSkpO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FydCA9IEpTT04ucGFyc2UoJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdjYXJ0JykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLnVwZGF0ZUNhcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0b3RhbCA9IDA7XHJcbiAgICAgICAgICAgICRzY29wZS5jYXJ0LnByb2R1Y3RzLmZvckVhY2goZnVuY3Rpb24gKGNhcnRJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICB0b3RhbCArPSBjYXJ0SXRlbS5xdWFudGl0eSAqIGNhcnRJdGVtLml0ZW0ucHJpY2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FydC50b3RhbCA9IHRvdGFsO1xyXG4gICAgICAgICAgICAkc2NvcGUucGVyc2lzdENhcnRMb2NhbGx5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUucGVyc2lzdENhcnRMb2NhbGx5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2NhcnQnLCBKU09OLnN0cmluZ2lmeSgkc2NvcGUuY2FydCkpO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FydCA9IEpTT04ucGFyc2UoJHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdjYXJ0JykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLmRlbGV0ZUNhcnRJdGVtID0gZnVuY3Rpb24gKGNhcnRJdGVtKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb2R1Y3RJbmRleEluQ2FydCA9ICRzY29wZS5jYXJ0LnByb2R1Y3RzLmluZGV4T2YoY2FydEl0ZW0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FydC5wcm9kdWN0cy5zcGxpY2UocHJvZHVjdEluZGV4SW5DYXJ0LCAxKTtcclxuICAgICAgICAgICAgJHNjb3BlLnVwZGF0ZUNhcnQoKTtcclxuICAgICAgICAgICAgJHNjb3BlLnBlcnNpc3RDYXJ0TG9jYWxseSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1dKTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnbXlBcHAuZmlsdGVyJywgW10pXHJcblxyXG4gICAgLmZpbHRlcignZmlsdGVyQ2F0ZWdvcnlBbmRUaXRsZUFuZERlc2NyaXB0aW9uJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHByb2R1Y3RzLCBzZWFyY2hUZXh0LCBjYXRlZ29yeUlkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByb2R1Y3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFzZWFyY2hUZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoVGV4dCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2VhcmNoVGV4dCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9kdWN0cy5maWx0ZXIoZnVuY3Rpb24gKGl0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChpdC50aXRsZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRleHQpIHx8IGl0LmRlc2NyaXB0aW9uLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGV4dClcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5jYXRlZ29yeUlkID09PSBjYXRlZ29yeUlkO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICApIiwiYW5ndWxhci5tb2R1bGUoXCJteUFwcC5jYXRlZ29yeVNlcnZpY2VzXCIsIFtcIm5nUmVzb3VyY2VcIl0pXHJcbiAgICAuZmFjdG9yeShcImNhdGVnb3J5U2VydmljZVwiLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkcmVzb3VyY2UsICRxLCAkaHR0cCkge1xyXG4gICAgICAgICAgICBjb25zdCB1cmwgPSAnaHR0cHM6Ly9lLXNob3AtYmFja2VuZC5oZXJva3VhcHAuY29tJ1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZ2V0Q2F0ZWdvcmllczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSAkaHR0cC5nZXQodXJsICsgJy9jYXRlZ29yaWVzJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZShcIm15QXBwLnByb2R1Y3RTZXJ2aWNlc1wiLCBbXCJuZ1Jlc291cmNlXCJdKVxyXG4gICAgLmZhY3RvcnkoXCJwcm9kdWN0U2VydmljZVwiLFxyXG4gICAgICAgIGZ1bmN0aW9uICgkcmVzb3VyY2UsICRxLCAkaHR0cCkge1xyXG4gICAgICAgICAgICBjb25zdCB1cmwgPSAnaHR0cHM6Ly9lLXNob3AtYmFja2VuZC5oZXJva3VhcHAuY29tJ1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZ2V0UHJvZHVjdHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9taXNlID0gJGh0dHAuZ2V0KHVybCArICcvcHJvZHVjdHMnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBnZXRQcm9kdWN0QnlJZDogZnVuY3Rpb24gKHByb2R1Y3RJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSAkaHR0cC5nZXQodXJsICsgJy9wcm9kdWN0cy8nICsgcHJvZHVjdElkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdteUFwcC5ob21lJywgWyduZ1JvdXRlJywgJ215QXBwLmNhdGVnb3J5U2VydmljZXMnLCAnbXlBcHAucHJvZHVjdFNlcnZpY2VzJ10pXHJcblxyXG4gICAgLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgZnVuY3Rpb24gKCRyb3V0ZVByb3ZpZGVyKSB7XHJcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2hvbWUnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaG9tZS9ob21lLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnSG9tZUN0cmwnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XSlcclxuXHJcbiAgICAuY29udHJvbGxlcignSG9tZUN0cmwnLCBbJ2NhdGVnb3J5U2VydmljZScsICdwcm9kdWN0U2VydmljZScsICckc2NvcGUnLCBmdW5jdGlvbiAoY2F0ZWdvcnlTZXJ2aWNlLCBwcm9kdWN0U2VydmljZSwgJHNjb3BlKSB7XHJcblxyXG4gICAgICAgICRzY29wZS5jdXJyZW50Q2F0ZWdvcnk7XHJcbiAgICAgICAgJHNjb3BlLmNhdGVnb3JpZXMgPSBbXTtcclxuICAgICAgICAkc2NvcGUucHJvZHVjdHMgPSBbXTtcclxuICAgICAgICAkc2NvcGUudGVzdCA9ICd0ZXN0JztcclxuICAgICAgICAkc2NvcGUuZGlzcGxheUNhdGVnb3J5Q29udGFpbmVyU3Bpbm5lciA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLmRpc3BsYXlQcm9kdWN0Q29udGFpbmVyU3Bpbm5lciA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLmdldENhdGVnb3JpZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5U2VydmljZS5nZXRDYXRlZ29yaWVzKCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2F0ZWdvcmllcyA9IHJlc3VsdC5kYXRhO1xyXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5jYXRlZ29yaWVzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY3VycmVudENhdGVnb3J5ID0gJHNjb3BlLmNhdGVnb3JpZXNbMF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGlzcGxheUNhdGVnb3J5Q29udGFpbmVyU3Bpbm5lciA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLmdldFByb2R1Y3RzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwcm9kdWN0U2VydmljZS5nZXRQcm9kdWN0cygpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2R1Y3RzID0gcmVzdWx0LmRhdGE7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGlzcGxheVByb2R1Y3RDb250YWluZXJTcGlubmVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUudXBkYXRlQ2F0ZWdvcnkgPSBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRDYXRlZ29yeSA9IGNhdGVnb3J5O1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUuZ2V0Q2F0ZWdvcmllcygpO1xyXG4gICAgICAgICRzY29wZS5nZXRQcm9kdWN0cygpO1xyXG4gICAgfV0pOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdteUFwcC5wcm9kdWN0JywgWyduZ1JvdXRlJywgJ215QXBwLnByb2R1Y3RTZXJ2aWNlcycsICduZ0FuaW1hdGUnXSlcclxuXHJcbiAgICAuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCBmdW5jdGlvbiAoJHJvdXRlUHJvdmlkZXIpIHtcclxuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvcHJvZHVjdC86cHJvZHVjdElkJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2R1Y3QvcHJvZHVjdC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2R1Y3RDdHJsJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfV0pXHJcblxyXG4gICAgLmNvbnRyb2xsZXIoJ1Byb2R1Y3RDdHJsJywgWyckc2NvcGUnLCAnJGxvY2F0aW9uJywgJ3Byb2R1Y3RTZXJ2aWNlJywgJyR3aW5kb3cnLCBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYXRpb24sIHByb2R1Y3RTZXJ2aWNlLCAkd2luZG93KSB7XHJcblxyXG4gICAgICAgICRzY29wZS51cmwgPSAkbG9jYXRpb24ucGF0aCgpLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgJHNjb3BlLnByb2R1Y3RJZCA9ICRzY29wZS51cmxbMl07XHJcbiAgICAgICAgJHNjb3BlLnByb2R1Y3Q7XHJcbiAgICAgICAgJHNjb3BlLnN1Y2Nlc3NBbGVydCA9IHt0eXBlOiAnc3VjY2VzcycsIG1zZzogJ0l0ZW0gc3VjY2Vzc2Z1bGx5IGFkZGVkIHRvIGNhcnQuJ307XHJcbiAgICAgICAgJHNjb3BlLmRhbmdlckFsZXJ0ID0ge3R5cGU6ICdkYW5nZXInLCBtc2c6ICdJdGVtIGFscmVhZHkgZXhpc3RzIGluIGNhcnQuJ307XHJcbiAgICAgICAgJHNjb3BlLmFsZXJ0cyA9IFtdO1xyXG4gICAgICAgICRzY29wZS5teUludGVydmFsID0gNTAwMDtcclxuICAgICAgICAkc2NvcGUubm9XcmFwU2xpZGVzID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLmFjdGl2ZSA9IDA7XHJcbiAgICAgICAgJHNjb3BlLmNhcnQgPSBKU09OLnBhcnNlKCR3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnY2FydCcpKTtcclxuICAgICAgICBpZiAoJHNjb3BlLmNhcnQgPT09IG51bGwgfHwgJHNjb3BlLmNhcnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FydCA9IHt9O1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FydC5wcm9kdWN0cyA9IFtdO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2FydC50b3RhbCA9IDA7XHJcbiAgICAgICAgICAgICR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnY2FydCcsIEpTT04uc3RyaW5naWZ5KCRzY29wZS5jYXJ0KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5nZXRQcm9kdWN0RGV0YWlscyA9IGZ1bmN0aW9uIChwcm9kdWN0SWQpIHtcclxuICAgICAgICAgICAgcHJvZHVjdFNlcnZpY2UuZ2V0UHJvZHVjdEJ5SWQocHJvZHVjdElkKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9kdWN0ID0gcmVzdWx0LmRhdGE7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucHJvZHVjdCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUucHJvZHVjdEV4aXN0c0luQ2FydCA9IGZ1bmN0aW9uIChwcm9kdWN0KSB7XHJcbiAgICAgICAgICAgIHZhciBleGlzdHMgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5jYXJ0ID09PSBudWxsIHx8ICRzY29wZS5jYXJ0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUuY2FydC5wcm9kdWN0cyA9PT0gbnVsbCB8fCAkc2NvcGUuY2FydC5wcm9kdWN0cyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWV4aXN0cyAmJiBjb3VudGVyIDwgJHNjb3BlLmNhcnQucHJvZHVjdHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5jYXJ0LnByb2R1Y3RzW2NvdW50ZXJdLml0ZW0uaWQgPT09IHByb2R1Y3QuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlcisrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBleGlzdHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuYWRkVG9DYXJ0ID0gZnVuY3Rpb24gKHByb2R1Y3QpIHtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5wcm9kdWN0RXhpc3RzSW5DYXJ0KHByb2R1Y3QpKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYWRkQWxlcnQoJHNjb3BlLmRhbmdlckFsZXJ0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBwcm9kdWN0VG9BZGQgPSB7fTtcclxuICAgICAgICAgICAgICAgIHByb2R1Y3RUb0FkZC5pdGVtID0gcHJvZHVjdDtcclxuICAgICAgICAgICAgICAgIHByb2R1Y3RUb0FkZC5xdWFudGl0eSA9IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmNhcnQucHJvZHVjdHMgPT09IG51bGwgfHwgJHNjb3BlLmNhcnQucHJvZHVjdHMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5jYXJ0LnByb2R1Y3RzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNhcnQudG90YWwgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNhcnQucHJvZHVjdHMucHVzaChwcm9kdWN0VG9BZGQpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNhcnQudG90YWwgKz0gcHJvZHVjdC5wcmljZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5hZGRBbGVydCgkc2NvcGUuc3VjY2Vzc0FsZXJ0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2NhcnQnLCBKU09OLnN0cmluZ2lmeSgkc2NvcGUuY2FydCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLmFkZEFsZXJ0ID0gZnVuY3Rpb24gKGFsZXJ0KSB7XHJcbiAgICAgICAgICAgICRzY29wZS5hbGVydHMgPSBbXTtcclxuICAgICAgICAgICAgJHNjb3BlLmFsZXJ0cy5wdXNoKGFsZXJ0KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAkc2NvcGUuY2xvc2VBbGVydCA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuYWxlcnRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmdvVG9QcmV2U2xpZGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQoXCIjY2Fyb3VzZWxFeGFtcGxlSW5kaWNhdG9yc1wiKS5jYXJvdXNlbChcInByZXZcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5nb1RvTmV4dFNsaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkKFwiI2Nhcm91c2VsRXhhbXBsZUluZGljYXRvcnNcIikuY2Fyb3VzZWwoXCJuZXh0XCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUuZ2V0UHJvZHVjdERldGFpbHMoJHNjb3BlLnByb2R1Y3RJZCk7XHJcbiAgICB9XSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ215QXBwLnZlcnNpb24uaW50ZXJwb2xhdGUtZmlsdGVyJywgW10pXHJcblxyXG4uZmlsdGVyKCdpbnRlcnBvbGF0ZScsIFsndmVyc2lvbicsIGZ1bmN0aW9uKHZlcnNpb24pIHtcclxuICByZXR1cm4gZnVuY3Rpb24odGV4dCkge1xyXG4gICAgcmV0dXJuIFN0cmluZyh0ZXh0KS5yZXBsYWNlKC9cXCVWRVJTSU9OXFwlL21nLCB2ZXJzaW9uKTtcclxuICB9O1xyXG59XSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdteUFwcC52ZXJzaW9uLnZlcnNpb24tZGlyZWN0aXZlJywgW10pXHJcblxyXG4uZGlyZWN0aXZlKCdhcHBWZXJzaW9uJywgWyd2ZXJzaW9uJywgZnVuY3Rpb24odmVyc2lvbikge1xyXG4gIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxtLCBhdHRycykge1xyXG4gICAgZWxtLnRleHQodmVyc2lvbik7XHJcbiAgfTtcclxufV0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnbXlBcHAudmVyc2lvbicsIFtcclxuICAnbXlBcHAudmVyc2lvbi5pbnRlcnBvbGF0ZS1maWx0ZXInLFxyXG4gICdteUFwcC52ZXJzaW9uLnZlcnNpb24tZGlyZWN0aXZlJ1xyXG5dKVxyXG5cclxuLnZhbHVlKCd2ZXJzaW9uJywgJzAuMScpO1xyXG4iXX0=
