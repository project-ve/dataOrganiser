document.addEventListener('DOMContentLoaded', function () {

    var addCategory = document.querySelector('#ctgry-button');
    var categoryInput = document.querySelector('#ctgry-input');
    var categoryList = document.querySelector('#ctgry-list');
    var bcList = document.querySelector('#breadCrumbContainer')
    var categories = [];
    var currentParentPath = '';
    
    // Helper method to send AJAX requests
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

    function sanitizePath(path) {
        if (path.startsWith('/'))
            path = path.substring(1, path.length);
        if (path.endsWith('/'))
            path = path.substring(0, path.length - 1);
        return path;
    }

    function updatebreadCrumb() {
        var parts = currentParentPath.split('/');
        var res = '<li id="">/ </li>' +  '<span> > </span>';;
        var currParent = '';
        parts.forEach(function (level) {
            if (level) {
                currParent = currParent + '/' + level;
                res = res + '<li id="'+ currParent +'">' + level.toUpperCase() + '</li>' +
                      '<span> > </span>';
            }
        });
        bcList.innerHTML = res;
    }

    function updateCategories(req) {
        if (req.readyState == 4) {
            var data = JSON.parse(req.responseText);
            categories = [];
            data.forEach(function (item) {
                categories.push(item.category.toUpperCase());
            });
            categories = categories.sort();

            var opt = '';
            categories.forEach(function (i) {
                if (i) {
                    opt = opt + "<li id='"+ currentParentPath + i +"'>" + i + "</li>";
                }
            });
            categoryList.innerHTML = opt;
            updatebreadCrumb();
        }
    }

    function addNewCategory(req) {
        if (req.readyState == 4) {
            sendAjaxReq('GET', '/category/all?parent=' + sanitizePath(currentParentPath), updateCategories);
            categoryInput.value = '';
        }
    }
    
    function addCategoryHandler() {
        var newCategory = categoryInput.value.trim();
        var alreadyExists = categories.indexOf(newCategory) > -1;
        if (newCategory && !alreadyExists) {
            sendAjaxReq('GET', '/category/add?category=' + sanitizePath(currentParentPath + newCategory), addNewCategory)
        } else {
            categoryInput.value = '';
        }
    }

    function getSubCategories(e) {
        var parentPath = e.target.id;
        // update currentParentPath
        if (parentPath !== 'breadCrumbContainer') { // ignore ul
            currentParentPath = parentPath + '/';
            sendAjaxReq('GET', '/category/all?parent=' + sanitizePath(parentPath), updateCategories);
        }
    }

    // ATTACH EVENT HANDLERS

    addCategory.addEventListener('click', addCategoryHandler);
    categoryList.addEventListener('click', getSubCategories);
    bcList.addEventListener('click', getSubCategories);

    // update categories on page load
    (function() {
        sendAjaxReq('GET', '/category/all', updateCategories);
    })();
});
