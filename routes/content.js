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

    db.collection(categoryPath).findAndModify({ category: "GROUP-DATA" },
        {},
        { $push: { "group-data": { content: content, desc: desc } } },
        { "new": true },
        function (err, records) {
            if (err) {
                res.json(err);
            } else {
                res.json({msg: 'data added successfully'});
            }
        });
});

module.exports = router;
