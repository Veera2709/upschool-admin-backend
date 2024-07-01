const teacherServices = require("../services/teacherServices");

exports.teacherSectionAllocation = (req, res, next) => {
    let request = req.body;
    teacherServices.sectionAllocationTeacher(request, function (allocate_err, allocate_response) {
        if (allocate_err) {
            res.status(allocate_err).json(allocate_response);
        } else {
            console.log("Section Allocated For Teacher");
            res.json(allocate_response);
        }
    });
};

exports.fetchTeacherInfoDetails = (req, res, next) => {
    let request = req.body;
    teacherServices.getTeacherInfoDetails(request, function (teacherInfo_err, teacherInfo_response) {
        if (teacherInfo_err) {
            res.status(teacherInfo_err).json(teacherInfo_response);
        } else {
            console.log("Got Teacher Info");
            res.json(teacherInfo_response);
        }
    });
};

exports.fetchTeacherClassAndSection = (req, res, next) => {
    let request = req.body;
    teacherServices.getClassAndSectionOfTeacher(request, function (classSection_err, classSection_response) {
        if (classSection_err) {
            res.status(classSection_err).json(classSection_response);
        } else {
            console.log("Got class and section of teacher!");
            res.json(classSection_response);
        }
    });
};

exports.fetchSubjectForClientClass = (req, res, next) => {
    let request = req.body;
    teacherServices.getSubjectListForClientClass(request, function (classSubject_err, classSubject_response) {
        if (classSubject_err) {
            res.status(classSubject_err).json(classSubject_response);
        } else {
            console.log("Got subject for client class!");
            res.json(classSubject_response);
        }
    });
};

exports.mappingSubjectToTeacher = (req, res, next) => {
    let request = req.body;
    teacherServices.teacherSubjectMapping(request, function (subjectMapping_err, subjectMapping_response) {
        if (subjectMapping_err) {
            res.status(subjectMapping_err).json(subjectMapping_response);
        } else {
            console.log("Teacher - Subject Mapping Completed!");
            res.json(subjectMapping_response);
        }
    });
};

exports.fetchMappedSubjectForTeacher = (req, res, next) => {
    console.log("GET SUBJECT FOR TEACHER");
    let request = req.body;
    teacherServices.getMappedSubjectForTeacher(request, function (teacherSub_err, teacherSub_response) {
        if (teacherSub_err) {
            res.status(teacherSub_err).json(teacherSub_response);
        } else {
            console.log("Got Mapped Subject For Teacher!");
            res.json(teacherSub_response);
        }
    });
};