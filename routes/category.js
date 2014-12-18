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

    if (parts.length == 1) {
        db.collection('categories').insert({category: newCategory}, function (err, records) {
            if (err) {
                res.json(err);
            } else {
                res.json({msg: 'Category added successfully'});
            }
        });
    } else {
        var parentPath = '';
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
    }
});

router.get('/all', function(req, res) {
    var db = req.db;
    var parent = req.query.parent;

    if (!parent) {
        db.collection('categories').find().toArray(function (err, items) {
            if (err) {
                res.json(err);
            } else {
                res.json(items);
            }
        });
    } else {
        // var last = parent[parent.length - 1];
        // var first = parent[0];

        // if (first == '/' && last == '/') {
            // parent = parent.substring(1, parent.length - 1);
        // } else if (last == '/') {
            // parent = parent.substring(0, parent.length - 1);
        // } else if (first == '/') {
            // parent = parent.substring(1, parent.length);
        // }

        var parentPath = parent.split('/').join('.');
        db.collection(parentPath).find().toArray(function (err, items) {
            if (err) {
                res.json(err);
            } else {
                res.json(items);
            }
        });
    }
});

module.exports = router;
