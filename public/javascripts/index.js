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
    var contentTable = document.querySelector('#content table');
    var recentActivity = document.querySelector('#recentActivity');
    var content = document.querySelector('#content');
    // home
    var start = document.querySelector('#start-button');
    var showContentAddFormButton = document.querySelector('#content-add-show-button');
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
            categories.forEach(function (item) {
                if (item && item !== "GROUP-DATA") {
                    opt = opt + "<li class='list-group-item' id='"+ currentParentPath + item +"'>" + item + "</li>";
                }
            });
            categoryList.innerHTML = opt;
        }
    }

    function updatebreadCrumb() {
        var parts = currentParentPath.split('/');
        var res = '<li id=""><input type="button" value="HOME" id="" class="btn btn-info"></li>' +  '<span> > </span>';;
        var currParent = '';
        parts.forEach(function (level) {
            if (level) {
                currParent = currParent + '/' + level;
                res = res + '<li>' + 
                        '<input type="button" value="'+ level.toUpperCase() +'" id="'+ currParent +'" class="btn btn-info">' +
                        '</li>' + '<span> > </span>';
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
                        if (dataItem) {
                            res = res + "<tr>" +
                                "<td>" + dataItem.desc + "</td>" +
                                "<td>" + dataItem.content + "</td>" +
                                "<td><input type='button' value='delete' id='"+ dataItem.index +"' class='btn btn-danger'></td>" +
                                "</tr>";
                        }
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
            if (parentPath == "") {
                content.style.display = 'none';
                recentActivity.style.display = 'block';
                currentParentPath = parentPath + '/';
                sendAjaxReq('GET', '/category/all?parent=' + sanitizePath(parentPath), updateAllPanes);
            } else {
                currentParentPath = parentPath + '/';
                sendAjaxReq('GET', '/category/all?parent=' + sanitizePath(parentPath), updateAllPanes);
            }
        }
    }

    bcList.addEventListener('click', bcListHandler);

/*---------------------------------------------------------------------------*/

/*-------------------- Category Item click handling -------------------------*/

    function categoryListHandler(e) {
        var parentPath = e.target.id;
        content.style.display = 'block';
        recentActivity.style.display = 'none';
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
        dataInput.value = '';
        dataDesc.value = '';
    }

    addData.addEventListener('click', addContents);

/*---------------------------------------------------------------------------*/

/*-------------------- Delete content click handling -------------------------*/

    function deleteContentsHandler(req) {
        if (req.readyState == 4) {
            sendAjaxReq('GET', '/category/all?parent=' + sanitizePath(currentParentPath), updateContents);
        }
    }

    function deleteHandler(e) {
        if (e.target.classList.contains("btn-danger")) {
            var index = e.target.id;
            var category = sanitizePath(currentParentPath);
            var dataStr = JSON.stringify({index: index, category: category});
            var config = {data: dataStr, contentType: "application/json"};
            sendAjaxReq('POST', '/content/delete', deleteContentsHandler, config);
        }
    }

    contentTable.addEventListener('click', deleteHandler);

/*---------------------------------------------------------------------------*/

/*-------------------- Content form show button click handling --------------*/

    function showContentAdd() {
        var contentAddForm = document.querySelector('#add-contents-form');

        contentAddForm.style.visibility = 'visible';
        showContentAddFormButton.style.visibility = 'hidden';
    }

    showContentAddFormButton.addEventListener('click', showContentAdd);

/*---------------------------------------------------------------------------*/

/*-------------------- Start button click handling --------------------------*/

    function startHandler() {
        var ctgryList = document.querySelector('#ctgry-list-bar');
        var bc = bcList;
        var home = document.querySelector('#home-container');

        recentActivity.style.display = 'block';
        ctgryList.style.display = 'block';
        bc.style.display = 'block';
        home.style.display = 'none';
    }

    start.addEventListener('click', startHandler);

/*---------------------------------------------------------------------------*/

    // update categories on page load
    (function() {
        sendAjaxReq('GET', '/category/all', updateCategories);
        updatebreadCrumb();
    })();
});
