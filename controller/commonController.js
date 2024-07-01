const commonServices = require("../services/commonServices");

exports.userLogin = (req, res, next) => {
    console.log("LOGIN");
    console.log(req.body);
    let request = req.body;

    commonServices.userLogin(request, function (login_err, login_response) {
        if (login_err) {
            res.status(login_err).json(login_response);
        } else {
            console.log("user logged in Successfully");
            res.json(login_response);
        }
    });
};

exports.userLogout = (req, res, next) => {
    console.log("LOGOUT");
    console.log(req.body);
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    commonServices.userLogout(request, function (logout_err, logout_response) {
        if (logout_err) {
            res.status(logout_err).json(logout_response);
        } else {
            console.log("user logged out Successfully");
            res.json(logout_response);
        }
    });
};

exports.userLoginWithoutPassword = (req, res, next) => {
    console.log("LOGIN WITH OTP");
    console.log(req.body);
    let request = req.body;
    commonServices.LoginWithoutPassword(request, function (loginWithoutPasswordErr, loginWithoutPasswordRes) {
        if (loginWithoutPasswordErr) {
            res.status(loginWithoutPasswordErr).json(loginWithoutPasswordRes);
        } else {
            console.log("user logged out successfully");
            res.json(loginWithoutPasswordRes);
        }
    });
};

exports.validateUserOtp = (req, res, next) => {
    console.log("VALIDATE OTP");
    console.log(req.body);
    let request = req.body;
    commonServices.validateOtpForLogin(request, function (validate_forgot_password_err, validate_forgot_password_response) {
        if (validate_forgot_password_err) {
            res.status(validate_forgot_password_err).json(validate_forgot_password_response);
        } else {
            console.log("OTP verified and password updated successfully");
            res.json(validate_forgot_password_response);
        }
    });
};

exports.resetOrCreatePassword = (req, res, next) => {
    console.log("VALIDATE Forgot OTP and Password"); 
    console.log(req.body);
    let request = req.body;
    commonServices.passwordCreateOrReset(request, function (validate_and_reset_password_err, validate_and_reset_password_response) {
        if (validate_and_reset_password_err) {
            res.status(validate_and_reset_password_err).json(validate_and_reset_password_response);
        } else {
            console.log("OTP verified and password updated successfully");
            res.json(validate_and_reset_password_response);
        }
    });
};

exports.deleteDynamoDBData = (req, res, next) => {
    console.log("Delete Items");  
    console.log(req.body);
    let request = req.body;
    commonServices.deleteDynamoDBData(request, function (delete_data_err, delete_data_response) {
        if (delete_data_err) {
            res.status(delete_data_err).json(delete_data_response);
        } else {
            console.log("Data Deleted successfully");
            res.json(delete_data_response);
        }
    });
};
