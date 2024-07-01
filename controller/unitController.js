const unitServices = require("../services/unitServices");

// Unit : 
exports.addUnit = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    unitServices.addUnit(request, function (unit_err, unit_response) {
        if (unit_err) {
            res.status(unit_err).json(unit_response);
        } else {
            console.log("Unit Added Successfully");
            res.json(unit_response);
        }
    });
};
exports.fetchIndividualUnit = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    unitServices.fetchIndividualUnit(request, function (individual_unit_err, individual_unit_response) {
        if (individual_unit_err) {
            res.status(individual_unit_err).json(individual_unit_response);
        } else {
            console.log("Unit Fetched Successfully");
            res.json(individual_unit_response);
        }
    });
};
exports.editUnit = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    unitServices.editUnit(request, function (edit_unit_err, edit_unit_response) {
        if (edit_unit_err) {
            res.status(edit_unit_err).json(edit_unit_response);
        } else {
            console.log("Unit Edited Successfully");
            res.json(edit_unit_response);
        }
    });
};
exports.toggleUnitStatus = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    unitServices.toggleUnitStatus(request, function (toggle_unit_err, toggle_unit_response) {
        if (toggle_unit_err) {
            res.status(toggle_unit_err).json(toggle_unit_response);
        } else {
            console.log("Unit Status Changed to "+ request.data.unit_status +" Successfully");
            res.json(toggle_unit_response);
        }
    });
};

exports.fetchUnitsBasedonStatus = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    unitServices.fetchUnitsBasedonStatus(request, function (fetch_all_unit_err, fetch_all_unit_response) {
        if (fetch_all_unit_err) {
            res.status(fetch_all_unit_err).json(fetch_all_unit_response);
        } else {
            console.log("Fetch All Units Successfully");
            res.json(fetch_all_unit_response);
        }
    });
};
exports.bulkToggleUnitStatus = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    unitServices.multiUnitToggleStatus(request, function (fetch_all_chapter_err, fetch_all_chapter_response) {
        if (fetch_all_chapter_err) {
            res.status(fetch_all_chapter_err).json(fetch_all_chapter_response);
        } else {
            console.log("Multiple Units toggled Status Successfully");
            res.json(fetch_all_chapter_response);
        }
    });
};