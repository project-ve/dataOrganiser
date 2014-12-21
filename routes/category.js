var express = require('express');
var router = express.Router();

/* Add new data category. */
router.get('/add', function(req, res) {
    var db = req.db;
    var categoryPath = req.query.category;
    var parts = categoryPath.split('/');    
    var parentPath = 'categories';
    var newCategory = parts[parts.length - 1];

    if (parts.length > 1) {
        parentPath = parentPath + '.';
        for (var i = 0; i <= parts.length - 2; i++) {
            //exclude the newly added category to get its parent path
            parentPath = parentPath + parts[i];
            (i == parts.length - 2) ? '' : parentPath = parentPath + '.';
        }
    }

    db.collection(parentPath).insert({category: newCategory}, function (err, records) {
        if (err) {
            res.json(err);
        } else {
            // Create a new collection for new category with just single "group-data"
            // record to store contents of that category
            newCategoryPath = parentPath + '.' + newCategory;
            db.collection(newCategoryPath).insert({category: "GROUP-DATA", "group-data": []}, function (err, records) {
                if (err) {
                    res.json(err);
                } else {
                    res.json({msg: 'Category added successfully'});
                }
            });
        }
    });
});

router.get('/all', function(req, res) {
    var db = req.db;
    var parent = req.query.parent;
    var parentPath = 'categories';
    var categoryPath = parent ? ('categories' + '.' + parent.split('/').join('.')) : 'categories';

    db.collection(categoryPath).find().toArray(function (err, items) {
        if (err) {
            res.json(err);
        } else {
            res.json(items);
        }
    });
});

module.exports = router;
