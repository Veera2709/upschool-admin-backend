const schoolServices = require("../services/schoolServices");

exports.insertSchool = (req, res, next) => {
    console.log("Add School");
    console.log(req.body);
    let request = req.body;
    schoolServices.addingSchool(request, function (insert_school_err, insert_school_response) {
        if (insert_school_err) {
            res.status(insert_school_err).json(insert_school_response);
        } else {
            console.log("School Added");
            res.json(insert_school_response);
        }
    });
};

exports.fetchActiveSchools = (req, res, next) => {
    console.log("Fetch School");
    console.log(req.body);
    let request = {data : {school_status : "Active"}}; 
    schoolServices.getAllSchools(request, function (fetch_schools_err, fetch_schools_response) {
        if (fetch_schools_err) {
            res.status(fetch_schools_err).json(fetch_schools_response);
        } else {
            console.log("Got Schools Details");
            res.json(fetch_schools_response);
        }
    });
};

exports.fetchArchivedSchool = (req, res, next) => {
    console.log("Fetch School");
    console.log(req.body);
    let request = {data : {school_status : "Archived"}}; 
    schoolServices.getAllSchools(request, function (fetch_schools_err, fetch_schools_response) {
        if (fetch_schools_err) {
            res.status(fetch_schools_err).json(fetch_schools_response);
        } else {
            console.log("Got Schools Details");
            res.json(fetch_schools_response);
        }
    });
};

exports.fetchSchoolIdNames = (req, res, next) => {
    console.log("Fetch School Ids");
    console.log(req.body);
    let request = req.body;
    schoolServices.getAllSchoolIds(request, function (fetch_school_ids_err, fetch_school_ids_response) {
        if (fetch_school_ids_err) {
            res.status(fetch_school_ids_err).json(fetch_school_ids_response);
        } else {
            console.log("Got Schools Details");
            res.json(fetch_school_ids_response);
        }
    });
};

exports.toggleSchoolStatus = (req, res, next) => {
    console.log("Change School Status");
    console.log(req.body);
    let request = req.body;
    schoolServices.changeSchoolStatus(request, function (changeSchoolStatus_err, changeSchoolStatus_response) {
        if (changeSchoolStatus_err) {
            res.status(changeSchoolStatus_err).json(changeSchoolStatus_response);
        } else {
            console.log("School Deleted");
            res.json(changeSchoolStatus_response);
        }
    });
};

exports.fetchIndividualSchool = (req, res, next) => {
    console.log("Update School");
    console.log(req.body);
    let request = req.body;
    schoolServices.fetchIndividualSchoolById(request, function (fetch_school_err, fetch_school_response) {
        if (fetch_school_err) {
            res.status(fetch_school_err).json(fetch_school_response);
        } else {
            console.log("Got School Details");
            res.json(fetch_school_response);
        }
    });
};

exports.updateSchool = (req, res, next) => {
    console.log("Update School");
    console.log(req.body);
    let request = req.body;
    schoolServices.updatingSchool(request, function (update_school_err, update_school_response) {
        if (update_school_err) {
            res.status(update_school_err).json(update_school_response);
        } else {
            console.log("School Updated");
            res.json(update_school_response);
        }
    });
};

exports.fetchUpschoolClassesAndClientClasses = (req, res, next) => {
    console.log("Fetch Upschool And Client Class");
    console.log(req.body);
    let request = req.body;
    schoolServices.getAllUpschoolClassWithClientClass(request, function (fetch_class_err, fetch_class_response) {
        if (fetch_class_err) {
            res.status(fetch_class_err).json(fetch_class_response);
        } else {
            console.log("Got Upschool And Client Class Data");
            res.json(fetch_class_response);
        }
    });
};

exports.classSubscribe = (req, res, next) => {
    console.log("Class Subscription");
    console.log(req.body);
    let request = req.body;
    schoolServices.classSubscribtion(request, function (subscribe_err, subscribe_response) {
        if (subscribe_err) {
            res.status(subscribe_err).json(subscribe_response);
        } else {
            console.log("Class Scubscription Completed !");
            res.json(subscribe_response);
        }
    });
};

exports.fetchClassBasedOnSchool = (req, res, next) => {
    console.log("Fetch Classed Based On School");
    console.log(req.body);
    let request = req.body;
    schoolServices.getClassesForSchool(request, function (get_class_err, get_class_response) {
        if (get_class_err) {
            res.status(get_class_err).json(get_class_response);
        } else {
            console.log("Got Classes For School !");
            res.json(get_class_response);
        }
    });
};

exports.setQuizConfiguration = (req, res, next) => {
    console.log("Set Configuration!");
    console.log(req.body);
    let request = req.body;
    schoolServices.setSchoolQuizConfig(request, function (quizConfig_err, quizConfig_response) {
        if (quizConfig_err) {
            res.status(quizConfig_err).json(quizConfig_response);
        } else {
            console.log("Configured !");
            res.json(quizConfig_response);
        }
    });
};

exports.setTestConfiguration = (req, res, next) => {
    console.log("Set Test Configuration!");
    console.log(req.body);
    let request = req.body;
    schoolServices.setSchoolTestConfig(request, (testConfig_err, testConfig_response) => {
        if (testConfig_err) {
            console.error("Error in setTestConfiguration:", testConfig_err);
            res.status(400).json({ error: testConfig_err.message || "An error occurred" });
        } else {
            console.log("Configured!");
            res.json(testConfig_response);
        }
    });
}

exports.schoolubscriptionFeatures = (req, res, next) => {
    console.log("School Subscription Setting!");
    console.log(req.body);
    let request = req.body;
    schoolServices.setSchoolSubscription(request, function (permission_err, permission_response) {
        if (permission_err) {
            res.status(permission_err).json(permission_response);
        } else {
            console.log("Subscription Set !");
            res.json(permission_response);
        }
    });
};

exports.teacherAccess = (req, res, next) => {
    console.log("School teacherAccess Setting!");
    console.log(req.body);
    let request = req.body;
    schoolServices.setTeacherAccess(request, function (permission_err, permission_response) {
        if (permission_err) {
            res.status(permission_err).json(permission_response);
        } else {
            console.log("Subscription Set !");
            res.json(permission_response);
        }
    });
};