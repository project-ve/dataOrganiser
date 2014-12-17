var express = require('express');
var router = express.Router();

/* Add new data category. */
router.get('/add', function(req, res) {
    var db = req.db;
    var newCategory = req.query.category;

    db.collection('categories').insert({category: newCategory}, function (err, records) {
        if (err) {
            res.json(err);
        } else {
            res.json({msg: 'Category added successfully'});
        }
    });
});

router.get('/all', function(req, res) {
    var db = req.db;
    var newCategory = req.query.category;

    db.collection('categories').find().toArray(function (err, items) {
        if (err) {
            res.json(err);
        } else {
            res.json(items);
        }
    });
});

module.exports = router;
