const digicardServices = require("../services/digicardServices");

exports.addDigiCard = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    digicardServices.addDigiCard(request, function (digicard_err, digicard_response) {
        if (digicard_err) {
            res.status(digicard_err).json(digicard_response);
        } else {
            console.log("DigiCard Added Successfully");
            res.json(digicard_response);
        }
    });
};
exports.fetchIndividualDigiCard = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    digicardServices.fetchIndividualDigiCard(request, function (individual_digicard_err, individual_digicard_response) {
        if (individual_digicard_err) {
            res.status(individual_digicard_err).json(individual_digicard_response);
        } else {
            console.log("DigiCard Fetched Successfully");
            res.json(individual_digicard_response);
        }
    });
};


exports.editDigiCard = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    digicardServices.editDigiCard(request, function (edit_digicard_err, edit_digicard_response) {
        if (edit_digicard_err) {
            res.status(edit_digicard_err).json(edit_digicard_response);
        } else {
            console.log("DigiCard Edited Successfully");
            res.json(edit_digicard_response);
        }
    });
};
exports.toggleDigiCardStatus = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    digicardServices.toggleDigiCardStatus(request, function (delete_digicard_err, delete_digicard_response) {
        if (delete_digicard_err) {
            res.status(delete_digicard_err).json(delete_digicard_response);
        } else {
            console.log("DigiCard Changed Status to "+ request.data.digicard_status +" Successfully");
            res.json(delete_digicard_response);
        }
    });
};

exports.fetchDigiCardsBasedonStatus = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    digicardServices.fetchDigiCardsBasedonStatus(request, function (fetch_all_digicard_err, fetch_all_digicard_response) {
        if (fetch_all_digicard_err) {
            res.status(fetch_all_digicard_err).json(fetch_all_digicard_response);
        } else {
            res.json(fetch_all_digicard_response);
        }
    });
};
exports.fetchDigicardIdAndName = (req, res, next) => {
    let request = req.body;    
    digicardServices.fetchDigiIdAndName(request, function (fetch_digicard_err, fetch_digicard_res) {
        if (fetch_digicard_err) {
            res.status(fetch_digicard_err).json(fetch_digicard_res);
        } else {
            console.log("Got Digicard Name and Id");
            res.json(fetch_digicard_res);
        }
    });
};
exports.bulkToggleDigiCardStatus = (req, res, next) => {
    console.log("Bulk Toggle DigiCard Status");
    console.log(req.body);
    let request = req.body;
    digicardServices.multiDigiCardToggleStatus(request, function (bulkToggle_err, bulkToggle_response) {
        if (bulkToggle_err) {
            res.status(bulkToggle_err).json(bulkToggle_response);
        } else {
            console.log("Bulk User Update !");
            res.json(bulkToggle_response);
        }
    });
};
