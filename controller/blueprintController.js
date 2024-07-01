const blueprintServices = require("../services/blueprintServices");

exports.fetchBlueprintById = (req, res, next) => {
    let request = req.body;    
    blueprintServices.getBlueprintByItsId(request, function (fetch_blueprint_err, fetch_blueprint_response) {
        if (fetch_blueprint_err) {
            res.status(fetch_blueprint_err).json(fetch_blueprint_response);
        } else {
            console.log("Got Blueprint!");
            res.json(fetch_blueprint_response);
        }
    });
};
exports.fetchBluePrintsBasedonStatus = (req, res, next) => {
    let request = req.body;    

    blueprintServices.getBluePrintsBasedonStatus(request, function (blue_prints_err, blue_prints_response) {
        if (blue_prints_err) { 
            res.status(blue_prints_err).json(blue_prints_response);
        } else {
            console.log("Blue Prints Fetched Successfully"); 
            res.json(blue_prints_response);
        }
    });
};
exports.addBluePrint = (req, res, next) => {
    console.log("addBluePrint : ");
    let request = req.body;    

    blueprintServices.addNewBluePrint(request, function (blue_prints_err, blue_prints_response) {
        if (blue_prints_err) { 
            res.status(blue_prints_err).json(blue_prints_response);
        } else {
            console.log("BluePrint Added Successfully"); 
            res.json(blue_prints_response);
        }
    });
};
exports.toggleBluePrintStatus = (req, res, next) => {
    console.log("toggleBluePrintStatus : ");
    let request = req.body;    

    blueprintServices.changeBluePrintStatus(request, function (blue_prints_err, blue_prints_response) {
        if (blue_prints_err) { 
            res.status(blue_prints_err).json(blue_prints_response);
        } else {
            console.log("BluePrint Status Changed Successfully"); 
            res.json(blue_prints_response);
        }
    });
};
exports.fetchIndividualBluePrint = (req, res, next) => {
    console.log("fetchIndividualBluePrint : ");
    let request = req.body;    

    blueprintServices.fetchIndividualBluePrint(request, function (blue_prints_err, blue_prints_response) {
        if (blue_prints_err) { 
            res.status(blue_prints_err).json(blue_prints_response);
        } else {
            console.log("Fetched BluePrint Successfully"); 
            res.json(blue_prints_response);
        }
    });
};