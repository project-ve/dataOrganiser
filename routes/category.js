var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    var db = req.db;
    var path = req.query.path;

    db.collection('categories').insert({category: newCategory}, function (err, records) {
        if (err) {
            res.json(err);
        } else {
            res.json({msg: 'Category added successfully'});
        }
    });
});

/* Add new data category. */
// category can be web
// category can be web/js
// category can be web/js/closures
// 
// if category can be web/js
// 
router.get('/add', function(req, res) {
    var db = req.db;
    var categoryPath = req.query.category;
    var parts = categoryPath.split('/');    
    var parentPath = (parts.length - 1 == 0) ? 'categories' : '';
    var newCategory = parts[parts.length - 1];

    for (var i = 0; i < parts.length - 1; i++) {
        parentPath = parentPath + parts[i];
        (i == parts.length - 2) ? '' : parentPath = parentPath + '.';
    }

    db.collection(parentPath).insert({category: newCategory}, function (err, records) {
        if (err) {
            res.json(err);
        } else {
            res.json({msg: 'Category added successfully'});
        }
    });
});

router.get('/all', function(req, res) {
    var db = req.db;
    var parent = req.query.parent;
    var parentPath = parent ? parent.split('/').join('.') : 'categories';

    db.collection(parentPath).find().toArray(function (err, items) {
        if (err) {
            res.json(err);
        } else {
            res.json(items);
        }
    });
});

module.exports = router;
