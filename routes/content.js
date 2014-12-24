var express = require('express');
var router = express.Router();

/* Add content data for specific category. */
router.post('/add', function(req, res) {
    var db = req.db;
    var category = req.body.category;
    var content = req.body.content;
    var desc = req.body.desc;
    var categoryPath = category.split('/').join('.');    
    categoryPath = 'categories' + '.' + categoryPath;
    
    function addContent(index) {
        db.collection(categoryPath).findAndModify({ category: "GROUP-DATA" },
            {},
            { $push: { "group-data": { content: content, desc: desc, index: index } } },
            { "new": true },
            function (err, records) {
                if (err) {
                    res.json(err);
                } else {
                    res.json({msg: 'data added successfully'});
                }
            });
    }
    db.collection(categoryPath).find({ category: "GROUP-DATA" }).toArray(function (err, items) {
        if (err) {
            res.json(err);
        } else {
            var index = items[0]['group-data'].length;
            addContent(index);
        }
    });
    
});

/* Add content data for specific category. */
router.post('/delete', function(req, res) {
    var db = req.db;
    var category = req.body.category;
    var index = req.body.index;
    var categoryPath = category.split('/').join('.');    
    categoryPath = 'categories' + '.' + categoryPath;
    
    var delObj = {};
    delObj['group-data' + '.' + index] = 1;

    db.collection(categoryPath).update({ category: "GROUP-DATA" }, {$unset : delObj}, function (err) {
        if (err) {
            res.json(err);
        } else {
            res.json({msg: 'Data removed successfully'});
        }
    });
});

module.exports = router;
