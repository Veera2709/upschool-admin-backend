const classServices = require("../services/classServices");

exports.addClass = (req, res, next) => {
    let request = req.body;    
    classServices.addNewClass(request, function (standard_err, standard_response) {
        if (standard_err) {
            res.status(standard_err).json(standard_response);
        } else {
            console.log("Standard Added Successfully");
            res.json(standard_response);
        }
    });
};

exports.fetchClassesBasedonStatus = (req, res, next) => {
    let request = req.body;    
    classServices.getAllClassBasedOnStatus(request, function (fetch_all_class_err, fetch_all_class_response) {
        if (fetch_all_class_err) {
            res.status(fetch_all_class_err).json(fetch_all_class_response);
        } else {
            console.log("Fetch All classes Successfully");
            res.json(fetch_all_class_response);
        }
    });
};

exports.fetchIndividualClass = (req, res, next) => {
    let request = req.body;
    
    classServices.getIndividualClass(request, function (individual_class_err, individual_class_response) {
        if (individual_class_err) {
            res.status(individual_class_err).json(individual_class_response);
        } else {
            console.log("Got Class");
            res.json(individual_class_response);
        }
    });
};

exports.editClass = (req, res, next) => {
    let request = req.body;
    classServices.updateClass(request, function (editClass_err, editClass_response) {
        if (editClass_err) {
            res.status(editClass_err).json(editClass_response);
        } else {
            console.log("Class Edited");
            res.json(editClass_response);
        }
    });
};

exports.toggleClassStatus = (req, res, next) => {
    let request = req.body;    
    classServices.changeClassStatus(request, function (class_status_err, class_status_response) {
        if (class_status_err) {
            res.status(class_status_err).json(class_status_response);
        } else {
            console.log("Class Status Changed to "+ request.data.standard_status +"."); 
            res.json(class_status_response);
        }
    });
};

exports.bulkToggleClassStatus = (req, res, next) => {
    let request = req.body;    
    classServices.changeBulkClassStatus(request, function (bulkStatus_err, bulkStatus_response) {
        if (bulkStatus_err) {
            res.status(bulkStatus_err).json(bulkStatus_response);
        } else {
            console.log("Toggle Bulk Class Status!"); 
            res.json(bulkStatus_response);
        }
    });
};