const conceptServices = require("../services/conceptServices");

exports.fetchAllConcepts = (req, res, next) => {
    console.log("Fetch All Concepts");
    console.log(req.body);
    let request = req.body;
    conceptServices.getActiveArchivedConcepts(request, function (fetch_concepts_err, fetch_concepts_response) {
        if (fetch_concepts_err) {
            res.status(fetch_concepts_err).json(fetch_concepts_response);
        } else {
            console.log("Got All Concepts");
            res.json(fetch_concepts_response);
        }
    });
};

exports.addConcepts = (req, res, next) => {
    console.log("Add Concepts");
    console.log(req.body);
    let request = req.body;
    conceptServices.addNewConcept(request, function (add_concepts_err, add_concepts_response) {
        if (add_concepts_err) {
            res.status(add_concepts_err).json(add_concepts_response);
        } else {
            console.log("Concept Added!");
            res.json(add_concepts_response);
        }
    });
};

exports.toggleConceptStatus = (req, res, next) => {
    console.log("Change Concept Status");
    console.log(req.body);
    let request = req.body;
    conceptServices.changeConceptStatus(request, function (toggle_err, toggle_response) {
        if (toggle_err) {
            res.status(toggle_err).json(toggle_response);
        } else {
            console.log("Concept Status Changed!");
            res.json(toggle_response);
        }
    });
};

exports.fetchDigicardAndConcept = (req, res, next) => {
    let request = req.body;    
    conceptServices.getDigicardAndConcept(request, function (fetch_digiconcept_err, fetch_digiconcept_res) {
        if (fetch_digiconcept_err) {
            res.status(fetch_digiconcept_err).json(fetch_digiconcept_res);
        } else {
            console.log("Got Digicard And Concept");
            res.json(fetch_digiconcept_res);
        }
    });
};

exports.fetchIndividualConcept = (req, res, next) => {
    let request = req.body;    
    conceptServices.getIndividualConcept(request, function (get_individualConcept_err, get_individualConcept_res) {
        if (get_individualConcept_err) {
            res.status(get_individualConcept_err).json(get_individualConcept_res);
        } else {
            console.log("Got Concept");
            res.json(get_individualConcept_res);
        }
    });
};

exports.updateConcept = (req, res, next) => {
    let request = req.body;    
    conceptServices.editConcept(request, function (editConcept_err, editConcept_res) {
        if (editConcept_err) {
            res.status(editConcept_err).json(editConcept_res);
        } else {
            console.log("Conept Updated!");
            res.json(editConcept_res);
        }
    });
};
exports.bulkToggleConceptStatus = (req, res, next) => {
    let request = req.body;    
    conceptServices.multiConceptToggleStatus(request, function (multi_delete_concept_err, multi_delete_concept_res) {
        if (multi_delete_concept_err) {
            res.status(multi_delete_concept_err).json(multi_delete_concept_res);
        } else {
            console.log("Multiple Concepts Toggled Status!");
            res.json(multi_delete_concept_res);
        }
    });
};