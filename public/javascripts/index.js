document.addEventListener('DOMContentLoaded', function () {

    function sendAjaxReq(method, path, cb, config) {
        var req = new XMLHttpRequest();
        var data = (config && config.data) ? config.data : {};
        var contentType = (config && config.contentType) ? config.contentType : '';
        req.open(method, path, true);
        if (contentType) {
            req.setRequestHeader("Content-type", config.contentType);
        }
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                cb(req);
            }
        };
        req.send(data);
    }

    var addCategory = document.querySelector('#ctgry-button');
    var categoryInput = document.querySelector('#ctgry-input');
    var categoryList = document.querySelector('#ctgry-list');

    function updateCategories(req) {
        if (req.readyState == 4) {
            var data = JSON.parse(req.responseText);
            var opt = '';
            data.forEach(function (i) {
                opt = opt + "<option>" + i.category + "</option>";
            });
            categoryList.innerHTML = opt;
        }
    }

    function addNewCategory(req) {
        if (req.readyState == 4) {
            sendAjaxReq('GET', '/category/all', updateCategories);
            categoryInput.value = '';
        }
    }
    
    function addCategoryHandler() {
        var newCategory = categoryInput.value.trim();
        if (newCategory) {
            sendAjaxReq('GET', '/category/add?category=' + newCategory, addNewCategory)
        }
    }

    addCategory.addEventListener('click', addCategoryHandler);    
});
