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
                }
            }
        });