

const studentRepository = require("../repository/studentRepository");

exports.getAllUsersData = async function (request, callback) {
	console.log(request);
	request.data.user_role == "Student";
		studentRepository.getActiveStudentsData(request, function (All_students_data_err, All_students_data_res) {
			if (All_students_data_err) {
				console.log(All_students_data_err);
				callback(All_students_data_err, All_students_data_res);
			} else {
				callback(All_students_data_err, All_students_data_res.Items);
			}
		})


}