angular.module("myApp.services", ["ngResource"]).factory("categoryService",
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