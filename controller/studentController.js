const studentServices = require("../services/studentServices");


exports.fetchAllStudents = (req, res, next) => {
    let request =  req.body;    
    studentServices.getAllUsersData(request, function (get_all_student_err, get_all_student_response) {
        if (get_all_student_err) {
            res.status(get_all_student_err).json(get_all_student_response);
        } else {
            console.log("Got all Students");
            res.json(get_all_student_response);
        }
    });
};