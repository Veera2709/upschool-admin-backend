const subjectServices = require("../services/subjectServices");

exports.addSubject = (req, res, next) => {
    console.log("Add Subject");
    console.log(req.body);
    let request = req.body;
    subjectServices.addNewSubject(request, function (add_subjects_err, add_subjects_res) {
        if (add_subjects_err) {
            res.status(add_subjects_err).json(add_subjects_res);
        } else {
            console.log("Subject Added!");
            res.json(add_subjects_res);
        }
    });
};

exports.fetchAllSubjects = (req, res, next) => {
    console.log("Fetch All Subject");
    console.log(req.body);
    let request = req.body;
    subjectServices.getActiveArchivedSubject(request, function (fetch_subjects_err, fetch_subjects_res) {
        if (fetch_subjects_err) {
            res.status(fetch_subjects_err).json(fetch_subjects_res);
        } else {
            console.log("Got Subject Data!");
            res.json(fetch_subjects_res);
        }
    });
};

exports.toggleSubjectStatus = (req, res, next) => {
    console.log("Toggle Subject Status");
    console.log(req.body);
    let request = req.body;
    subjectServices.changeSubjectStatus(request, function (subject_status_err, subject_status_res) {
        if (subject_status_err) {
            res.status(subject_status_err).json(subject_status_res);
        } else {
            console.log("Subject Status Changed!");
            res.json(subject_status_res);
        }
    });
};

exports.fetchUnitAndSubject = (req, res, next) => {
    console.log("Fetch Unit And Subject");
    console.log(req.body);
    let request = req.body;
    subjectServices.getUnitAndSubject(request, function (get_unitSubject_err, get_unitSubject_res) {
        if (get_unitSubject_err) {
            res.status(get_unitSubject_err).json(get_unitSubject_res);
        } else {
            console.log("Got Unit and Subject!");
            res.json(get_unitSubject_res);
        }
    });
};

exports.fetchIndividualSubject = (req, res, next) => {
    console.log("Fetch Individual Subject");
    console.log(req.body);
    let request = req.body;
    subjectServices.getIndividualSubject(request, function (get_individual_err, get_individual_res) {
        if (get_individual_err) {
            res.status(get_individual_err).json(get_individual_res);
        } else {
            console.log("Got Subject!");
            res.json(get_individual_res);
        }
    });
};

exports.updateSubject = (req, res, next) => {
    console.log("Update Subject");
    console.log(req.body);
    let request = req.body;
    subjectServices.editSubject(request, function (subject_update_err, subject_update_res) {
        if (subject_update_err) {
            res.status(subject_update_err).json(subject_update_res);
        } else {
            console.log("Subject Updated!");
            res.json(subject_update_res);
        }
    });
};

exports.fetchSubjectIdName = (req, res, next) => {
    console.log("Fetch Subject Id And Name");
    console.log(req.body);
    let request = req.body;
    subjectServices.getIdNAmeOfSubject(request, function (subject_idName_err, subject_idName_res) {
        if (subject_idName_err) {
            res.status(subject_idName_err).json(subject_idName_res);
        } else {
            console.log("Got Subject Id And Name!");
            res.json(subject_idName_res);
        }
    });
};

exports.bulkToggleSubjectStatus = (req, res, next) => {
    console.log("Bulk Toggle Subject Status");
    console.log(req.body);
    let request = req.body;
    subjectServices.toggleBulkSubjectStatus(request, function (bulkToggle_err, bulkToggle_res) {
        if (bulkToggle_err) {
            res.status(bulkToggle_err).json(bulkToggle_res);
        } else {
            console.log("Update Bulk Subject Status Successfully!");
            res.json(bulkToggle_res);
        }
    });
};