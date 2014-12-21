document.addEventListener('DOMContentLoaded', function () {

    // categories
    var addCategory = document.querySelector('#ctgry-button');
    var categoryInput = document.querySelector('#ctgry-input');
    var categoryList = document.querySelector('#ctgry-list');
    var categories = [];
    // bread crumb
    var bcList = document.querySelector('#bread-crumb-container');
    // content
    var addData = document.querySelector('#content-button');
    var dataInput = document.querySelector('#content-data');
    var dataDesc = document.querySelector('#content-desc');
    // global
    var currentParentPath = '';


/*-------------------- Helper functions -------------------------------------*/

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

/*---------------------------------------------------------------------------*/

/*-------------------- Generic ----------------------------------------------*/

    function updateCategories(req) {
        if (req.readyState == 4) {
            var data = JSON.parse(req.responseText);
            categories = [];
            data.forEach(function (item) {
                categories.push(item.category);
            });
            categories = categories.sort();

            var opt = '';
            categories.forEach(function (i) {
                if (i) {
                    opt = opt + "<li id='"+ currentParentPath + i +"'>" + i + "</li>";
                }
            });
            categoryList.innerHTML = opt;
        }
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

    function updateContents(req){
        if (req.readyState == 4) {
            var data = JSON.parse(req.responseText);
            var res = '';
            data.forEach(function (child) {
                if (child.category == "GROUP-DATA") {
                    var resNode = document.querySelector("#content tbody");
                    child["group-data"].forEach(function (dataItem) {
                        res = res + "<tr>" +
                            "<td>" + dataItem.desc + "</td>" +
                            "<td>" + dataItem.content + "</td>" +
                            "<td><input type='button' value='delete'></td>" +
                            "</tr>";
                    });
                    resNode.innerHTML = res;
                }
            });
        }
    }

    function updateAllPanes(req) {
        // Call this on click
        // 1. bread crumbs
        // 2. category list items
        // Update bread crumbs, category list items and contents table
        updateCategories(req);
        updatebreadCrumb();
        updateContents(req);
    }

/*---------------------------------------------------------------------------*/

/*-------------------- Add a new category -----------------------------------*/

    function addCategorySuccess(req) {
        if (req.readyState == 4) {
            sendAjaxReq('GET', '/category/all?parent=' + sanitizePath(currentParentPath), updateCategories);
        }
    }
    
    function addCategoryHandler() {
        var newCategory = categoryInput.value.trim();
        var alreadyExists = categories.indexOf(newCategory) > -1;
        if (newCategory && !alreadyExists) {
            var newCategoryPath = currentParentPath + newCategory;
            sendAjaxReq('GET', '/category/add?category=' + sanitizePath(newCategoryPath), addCategorySuccess);
        }
        categoryInput.value = '';
    }

    addCategory.addEventListener('click', addCategoryHandler);

/*---------------------------------------------------------------------------*/

/*-------------------- Bread Crumb click handling ---------------------------*/

    function bcListHandler(e) {
        var parentPath = e.target.id;
        // update currentParentPath
        if (parentPath !== 'bread-crumb-container') {
            currentParentPath = parentPath + '/';
            sendAjaxReq('GET', '/category/all?parent=' + sanitizePath(parentPath), updateAllPanes);
        }
    }

    bcList.addEventListener('click', bcListHandler);

/*---------------------------------------------------------------------------*/

/*-------------------- Category Item click handling -------------------------*/

    function categoryListHandler(e) {
        var parentPath = e.target.id;
        // update currentParentPath
        currentParentPath = parentPath + '/';
        sendAjaxReq('GET', '/category/all?parent=' + sanitizePath(parentPath), updateAllPanes);
    }

    categoryList.addEventListener('click', categoryListHandler);

/*---------------------------------------------------------------------------*/

/*-------------------- Add contents click handling --------------------------*/

    function addContentsHandler(req) {
        if (req.readyState == 4) {
            sendAjaxReq('GET', '/category/all?parent=' + sanitizePath(currentParentPath), updateContents);
            dataInput.value = '';
            dataDesc.value = '';
        }
    }

    function addContents() {
        var data = dataInput.value.trim();
        var desc = dataDesc.value.trim();
        var category = sanitizePath(currentParentPath);
  
        if (data && desc) {
            var dataStr = JSON.stringify({content: data, desc: desc, category: category});
            var config = {data: dataStr, contentType: "application/json"};
            sendAjaxReq('POST', '/content/add', addContentsHandler, config);
        }
    }

    addData.addEventListener('click', addContents);

/*---------------------------------------------------------------------------*/

    // update categories on page load
    (function() {
        sendAjaxReq('GET', '/category/all', updateCategories);
        updatebreadCrumb();
    })();
});
