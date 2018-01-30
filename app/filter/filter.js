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