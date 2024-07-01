const sectionServices = require("../services/sectionServices");

exports.addSection = (req, res, next) => {
    let request = req.body;
    sectionServices.addNewSection(request, function (addSection_err, addSection_response) {
        if (addSection_err) {
            res.status(addSection_err).json(addSection_response);
        } else {
            console.log("Section Added Successfully");
            res.json(addSection_response);
        }
    });
};

exports.editSection = (req, res, next) => {
    let request = req.body;
    sectionServices.updateSection(request, function (updateSection_err, updateSection_response) {
        if (updateSection_err) {
            res.status(updateSection_err).json(updateSection_response);
        } else {
            console.log("Section updated Successfully");
            res.json(updateSection_response);
        }
    });
};

exports.fetchSchoolSection = (req, res, next) => {
    let request = req.body;
    sectionServices.getSchoolSections(request, function (fetchSection_err, fetchSection_response) {
        if (fetchSection_err) {
            res.status(fetchSection_err).json(fetchSection_response);
        } else {
            console.log("Got Section Data");
            res.json(fetchSection_response);
        }
    });
};

exports.fetchSectionById = (req, res, next) => {
    let request = req.body;
    sectionServices.getSectionById(request, function (singleSection_err, singleSection_response) {
        if (singleSection_err) {
            res.status(singleSection_err).json(singleSection_response);
        } else {
            console.log("Got Section Data");
            res.json(singleSection_response);
        }
    });
};

exports.fetchSectionByClientClassId = (req, res, next) => {
    let request = req.body;
    sectionServices.getSectionByClientClassId(request, function (ClientClassSection_err, ClientClassSection_response) {
        if (ClientClassSection_err) {
            res.status(ClientClassSection_err).json(ClientClassSection_response);
        } else {
            console.log("Got Section Data For Client Class");
            res.json(ClientClassSection_response);
        }
    });
};