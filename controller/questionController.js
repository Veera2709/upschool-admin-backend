const questionServices = require("../services/questionServices");

exports.addQuestions = (req, res, next) => {
    let request = req.body;
    questionServices.addNewQuestion(request, function (addQuestion_err, addQuestion_response) {
        if (addQuestion_err) {
            res.status(addQuestion_err).json(addQuestion_response);
        } else {
            console.log("Question Added Successfully");
            res.json(addQuestion_response);
        }
    });
};

exports.fetchAllQuestionsData = (req, res, next) => {
    let request = req.body;
    questionServices.getAllQuestionsData(request, function (fetchQuestion_err, fetchQuestion_response) {
        if (fetchQuestion_err) {
            res.status(fetchQuestion_err).json(fetchQuestion_response);
        } else {
            console.log("Got all Questions");
            res.json(fetchQuestion_response);
        }
    });
};

exports.fetchIndividualQuestionData = (req, res, next) => {
    let request = req.body;
    questionServices.getIndividualQuestionData(request, function (individualQuestion_err, individualQuestion_response) {
        if (individualQuestion_err) {
            res.status(individualQuestion_err).json(individualQuestion_response);
        } else {
            console.log("Got Individual Question Data");
            res.json(individualQuestion_response);
        }
    });
};

exports.editQuestion = (req, res, next) => {
    let request = req.body;
    questionServices.updateQuestion(request, function (editQuestion_err, editQuestion_response) {
        if (editQuestion_err) {
            res.status(editQuestion_err).json(editQuestion_response);
        } else {
            console.log("Question Edited!");
            res.json(editQuestion_response);
        }
    });
};

exports.toggleQuestionStatus = (req, res, next) => {
    let request = req.body;
    questionServices.deleteRestoreQuestion(request, function (toggleQuestion_err, toggleQuestion_response) {
        if (toggleQuestion_err) {
            res.status(toggleQuestion_err).json(toggleQuestion_response);
        } else {
            console.log("Question Status Changed!");
            res.json(toggleQuestion_response);
        }
    });
};
exports.bulkToggleQuestionStatus = (req, res, next) => {
    let request = req.body;
    questionServices.multiToggleQuestionStatus(request, function (toggleQuestion_err, toggleQuestion_response) {
        if (toggleQuestion_err) {
            res.status(toggleQuestion_err).json(toggleQuestion_response);
        } else {
            console.log("Multiple Questions Status Changed!");
            res.json(toggleQuestion_response);
        }
    });
};

exports.questionBulkUpload = (req, res, next) => {
    let request = req.body;
    questionServices.questionBulkUpload(request, function (bulkUploadQuestion_err, bulkQuestionUpload_response) {
        if (bulkUploadQuestion_err) {
            res.status(bulkUploadQuestion_err).json(bulkQuestionUpload_response);
        } else {
            console.log("Bulk Upload Completed successfully");
            res.json(bulkQuestionUpload_response);
        }
    });
};
