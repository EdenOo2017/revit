var express = require('express');
const request = require('request');
var morgan = require('morgan');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var test = require('assert');
var jwt = require('jsonwebtoken');
var config = require('./config');
var bodyParser = require('body-parser');
var UserData = require('./mongoose.model');
var UserAuthoData = require('./mongoose.users');
var ObjectID = require('mongodb').ObjectID;
var UserUpdateStatus = require('./mongoose.updateStatus');

module.exports = function (url, req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            return res.send("Cannot connect to DB");
        }

        db.listCollections({ name: 'Progress Claim' })
            .next(function (err, collinfo) {
                if (collinfo) {

                    UserUpdateStatus.count({}, function (err, count) {
                        if (err) {
                            return res.send("Document count error!");
                        }

                        if (count == 0) {
                            res.send("Empty Document");
                        } else {

                            var a = req.body.Category;
                            var b = req.body.ObjectId;

                            if (a == null || b == null) {
                                res.send("Check request body!")
                            }

                            UserUpdateStatus.find({ "BLOCK.ProjectName": "Taus South Project" }).sort({ _id: -1 }).limit(1).then(function (doc) {
                                if (doc.length === 0) {
                                    return res.status(404).send("Element Not Found!");
                                }

                                var block = doc[0].BLOCK;
                                var LastDocumentId = doc[0]._id;

                                //console.log(LastDocumentId);

                                let data = {}; 
                                let updateTime = {};                               
                                var checker = null;

                                var d = new Date();
                                var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
                                var nd = new Date(utc + (3600000 * 8));
                                var updateDate = nd.toLocaleDateString() + "T" + (nd.toLocaleTimeString());

                                //#region.................................................................

                                for (var i = 0; i < block.length; i++) {
                                    var level = block[i].Level;

                                    for (var j = 0; j < level.length; j++) {
                                        var category = level[j].Category;

                                        for (var k = 0; k < category.length; k++) {

                                            var element = null;

                                            if (a == "StructuralFoundation") {
                                                element = category[k].StructuralFoundation;
                                            }
                                            if (a == "Column") {
                                                element = category[k].Column;
                                            }
                                            if (a == "Beam") {
                                                element = category[k].Beam;
                                            }

                                            if (element != null) {
                                                for (var l = 0; l < element.length; l++) {

                                                    if ((element[l].ObjectId).toString() == b) {
                                                        checker = true;
                                                        var status = parseInt(element[l].status);                                                       
                                                        data["BLOCK.0.Level." + j + ".Category." + k + "." + a + "." + l + ".status"] = (status + 1).toString();
                                                        updateTime["BLOCK.0.Level." + j + ".Category." + k + "." + a + "." + l + ".DateTime"] = updateDate;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                if (checker == true) {
                                    var merged_object = JSON.parse((JSON.stringify(data) + JSON.stringify(updateTime)).replace(/}{/g,","))
                                    UserUpdateStatus.update({ "_id": ObjectID(LastDocumentId) }, {$set: merged_object} ).sort({ _id: -1 }).limit(1).then(function (doc) {
                                        if (doc.length === 0) {
                                            res.status(200).send("Error");
                                        }

                                        res.status(200).send("OK");

                                        //  console.log(data);
                                        // console.log(updateTime);
                                        // console.log(merged_object);
                                    });
                                } else {
                                    return res.status(404).send("Element Not Found!");
                                }

                                //#endregion.......................................................................................
                            });
                        }
                    });
                }
            });

        db.close();

    });
}