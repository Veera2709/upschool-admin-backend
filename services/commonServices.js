const dynamoDbCon = require('../awsConfig');
const userRepository = require("../repository/userRepository");
const constant = require('../constants/constant');
const helper = require('../helper/helper');
const { nextTick } = require("process");
const commonRepository = require("../repository/commonRepository");

exports.userLogin = function (request, callback) {

    /** FETCH USER BY EMAIL **/
    userRepository.fetchUserDataByEmail(request, function (user_data_by_email_err, user_data_by_email_response) {
        if (user_data_by_email_err) {
            console.log(user_data_by_email_err);
            callback(user_data_by_email_err, user_data_by_email_response);
        } else {
            if (user_data_by_email_response.Items.length > 0) {
                if(user_data_by_email_response.Items[0].user_status === "Active"){
                    let hashReq = {
                        "salt": user_data_by_email_response.Items[0].user_salt,
                        "password": request.data.user_password
                    }
                    if (user_data_by_email_response.Items[0].user_pwd === helper.hashingPassword(hashReq)) {
                        console.log("Password Validated Successfully");
                        let jwtToken = helper.getJwtToken(user_data_by_email_response.Items[0]);
    
                        request["user_jwt"] = jwtToken;
                        request["user_id"] = user_data_by_email_response.Items[0].user_id;
    
                        console.log("request", request)
    
                        userRepository.updateJwtToken(request, function (update_jwt_err, update_jwt_response) {
                            if (update_jwt_err) {
                                console.log(update_jwt_err);
                                callback(update_jwt_err, update_jwt_response);
                            } else {
                                console.log("Jwt Token Updated Successfully");
                                callback(0, [{ jwt: jwtToken }]);
                            }
                        })
                    } else {
                        console.log("Invalid Password");
                        callback(400, constant.messages.INVALID_PASSWORD);
                    }
                }else{
                    callback(400, constant.messages.USER_DELETED); 
                }

            } else {
                console.log("User Email Doesn't Exists");

                /** FETCH USER BY PHONE NO **/
                userRepository.fetchUserDataByPhoneNo(request, function (user_data_by_phNo_err, user_data_by_phNo_response) {
                    if (user_data_by_phNo_err) {
                        console.log(user_data_by_phNo_err);
                        callback(user_data_by_phNo_err, user_data_by_phNo_response);
                    } else {
                        if (user_data_by_phNo_response.Items.length > 0) {
                            if(user_data_by_phNo_response.Items[0].user_status === "Active"){
                                let hashReq = {
                                    "salt": user_data_by_phNo_response.Items[0].user_salt,
                                    "password": request.data.user_password
                                }
    
                                if (user_data_by_phNo_response.Items[0].user_pwd === helper.hashingPassword(hashReq)) {
                                    console.log("Password Validated Successfully");
                                    let jwtToken = helper.getJwtToken(user_data_by_phNo_response.Items[0]);
    
                                    request["user_jwt"] = jwtToken;
                                    request["user_id"] = user_data_by_phNo_response.Items[0].user_id;
    
                                    console.log("request", request)
    
                                    userRepository.updateJwtToken(request, function (update_jwt_err, update_jwt_response) {
                                        if (update_jwt_err) {
                                            console.log(update_jwt_err);
                                            callback(update_jwt_err, update_jwt_response);
                                        } else {
                                            console.log("Jwt Token Updated Successfully");
                                            callback(0, [{ jwt: jwtToken }]);
                                        }
                                    })
                                } else {
                                    console.log("Invalid Password");
                                    callback(400, constant.messages.INVALID_PASSWORD);
                                }
                            }else{
                                callback(400, constant.messages.USER_DELETED); 
                            }
                        } else {
                            console.log("User Phone Number Doesn't Exists");

                            /** FETCH USER BY USER NAME **/
                            userRepository.fetchUserDataByUserName(request, function (user_data_by_name_err, user_data_by_name_response) {
                                if (user_data_by_name_err) {
                                    console.log(user_data_by_name_err);
                                    callback(user_data_by_name_err, user_data_by_name_response);
                                } else {
                                    if (user_data_by_name_response.Items.length > 0) {
                                        if(user_data_by_name_response.Items[0].user_status === "Active"){
                                            let hashReq = {
                                                "salt": user_data_by_name_response.Items[0].user_salt,
                                                "password": request.data.user_password
                                            }
    
                                            if (user_data_by_name_response.Items[0].user_pwd === helper.hashingPassword(hashReq)) {
                                                console.log("Password Validated Successfully");
                                                let jwtToken = helper.getJwtToken(user_data_by_name_response.Items[0]);
    
                                                request["user_jwt"] = jwtToken;
                                                request["user_id"] = user_data_by_name_response.Items[0].user_id;
    
                                                console.log("request", request)
    
                                                userRepository.updateJwtToken(request, function (update_jwt_err, update_jwt_response) {
                                                    if (update_jwt_err) {
                                                        console.log(update_jwt_err);
                                                        callback(update_jwt_err, update_jwt_response);
                                                    } else {
                                                        console.log("Jwt Token Updated Successfully");
                                                        callback(0, [{ jwt: jwtToken }]);
                                                    }
                                                })
                                            } else {
                                                console.log("Invalid Password");
                                                callback(400, constant.messages.INVALID_PASSWORD);
                                            }
                                        }else{
                                            callback(400, constant.messages.USER_DELETED); 
                                        }
                                    } else {
                                        console.log("User Name Doesn't Exists");
                                        callback(400, constant.messages.USER_DOESNOT_EXISTS);
                                    }
                                }
                            });
                            /** FETCH USER BY USER NAME **/
                        }
                    }
                });
                /** FETCH USER BY PHONE NO **/
            }
        }
    });
    /** END FETCH USER BY EMAIL **/
}

exports.userLogout = function (request, callback) {

    let decode_token = helper.decodeJwtToken(request.token);

    request["user_jwt"] = "";
    request["user_id"] = decode_token.user_id;

    userRepository.updateJwtToken(request, function (update_jwt_err, update_jwt_response) {
        if (update_jwt_err) {
            console.log(update_jwt_err);
            callback(update_jwt_err, update_jwt_response);
        } else {
            console.log("OTP send for login without password");
            callback(0, 200);
        }
    })

}

exports.LoginWithoutPassword = function (request, callback) {
    console.log("LoginWithoutPassword : ", request);
    userRepository.fetchUserDataByEmail(request, function (fetch_user_data_err, fetch_user_data_response) {
        if (fetch_user_data_err) {
            console.log(fetch_user_data_err);
            callback(fetch_user_data_err, fetch_user_data_response);
        } else {
            if (fetch_user_data_response.Items.length > 0) {
                
                if(fetch_user_data_response.Items[0].user_status === "Active"){
                    let user_otp = helper.getRandomOtp().toString();

                    let mailPayload = {
                        "user_otp": user_otp,
                        "toMail": request.data.user_email,
                        "subject": (request.data.otpSubject && request.data.otpSubject === "reset") ? constant.mailSubject.otpForResettingPassword : (request.data.otpSubject && request?.data?.otpSubject === "create") ? constant.mailSubject.otpForCreatingPassword : constant.mailSubject.otpForLogin,
    
                        "mailFor": "Send OTP",
                    };
    
                    /** PUBLISH SNS **/
                    let mailParams = {
                        Message: JSON.stringify(mailPayload),
                        TopicArn: process.env.SEND_OTP_ARN
                    };
    
                    dynamoDbCon.sns.publish(mailParams, function (err, data) {
                        if (err) {
                            console.log("SNS PUBLISH ERROR");
                            console.log(err, err.stack);
                            callback(400, "SNS ERROR");
                        }
                        else {
                            console.log("SNS PUBLISH SUCCESS");
    
                            let user_id = fetch_user_data_response.Items[0].user_id
                            request.data["user_otp"] = user_otp;
                            request.data["user_id"] = user_id;
                            userRepository.updateUserOtp(request, function (update_user_otp_err, update_user_otp_response) {
                                if (update_user_otp_err) {
                                    console.log(update_user_otp_err);
                                    callback(update_user_otp_err, update_user_otp_response);
                                } else {
                                    callback(update_user_otp_err, update_user_otp_response);
                                }
                            })
                        }
                    });
                    /** END PUBLISH SNS **/
                }else{
                    callback(400, constant.messages.USER_DELETED); 
                }
            } else {
                callback(400, constant.messages.USER_DOESNOT_EXISTS);
            }
        }
    });
}

exports.validateOtpForLogin = function (request, callback) {
    console.log("validateOtpForLogin : ", request);

    userRepository.fetchUserDataByEmail(request, function (fetch_user_data_err, fetch_user_data_response) {
        if (fetch_user_data_err) {
            console.log(fetch_user_data_err);
            callback(fetch_user_data_err, fetch_user_data_response);
        } else {
            console.log("fetch_user_data_response", fetch_user_data_response);
            if (fetch_user_data_response.Items.length > 0) {
                if (fetch_user_data_response.Items[0].user_otp === request.data.entered_otp) {

                    let user_reset_otp = helper.getRandomOtp().toString();
                    request.data["user_id"] = fetch_user_data_response.Items[0].user_id
                    request.data["user_reset_otp"] = user_reset_otp;
                    userRepository.resetUserOtp(request, function (reset_user_otp_err, reset_user_otp_response) {
                        if (reset_user_otp_err) {
                            console.log(reset_user_otp_err);
                            callback(reset_user_otp_err, reset_user_otp_response);
                        } else {
                            let jwtToken = helper.getJwtToken(fetch_user_data_response.Items[0]);

                            request["user_jwt"] = jwtToken;
                            request["user_id"] = fetch_user_data_response.Items[0].user_id;

                            console.log("request", request);

                            let firstLogin = (fetch_user_data_response.Items[0].user_pwd && fetch_user_data_response.Items[0].user_pwd != "") ? "No" : "Yes";

                            userRepository.updateJwtToken(request, function (update_jwt_err, update_jwt_response) {
                                if (update_jwt_err) {
                                    console.log(update_jwt_err);
                                    callback(update_jwt_err, update_jwt_response);
                                } else {
                                    console.log("Jwt Token Updated Successfully");
                                    callback(0, [{ jwt: jwtToken, isFirstTimeLogin: firstLogin }]);
                                }
                            })
                        }
                    })

                } else {
                    callback(400, "Invalid OTP")
                }
            } else {
                callback(400, "User Email does not Exits");
            }
        }
    })
}

exports.passwordCreateOrReset = function (request, callback) {
    userRepository.fetchUserDataByEmail(request, function (fetch_user_data_err, fetch_user_data_response) {
        if (fetch_user_data_err) {
            console.log(fetch_user_data_err);
            callback(fetch_user_data_err, fetch_user_data_response);
        } else {
            if (fetch_user_data_response.Items.length > 0) {
                if (request.data.new_password === request.data.confirm_password) {
                    var user_salt = helper.getRandomString();
                    let hashReq = {
                        "salt": user_salt,
                        "password": request.data.new_password
                    }

                    let user_pwd = helper.hashingPassword(hashReq);
                    request.data["user_salt"] = user_salt;
                    request.data["user_pwd"] = user_pwd;

                    request.data["user_id"] = fetch_user_data_response.Items[0].user_id;
                    request.data["user_jwt"] = "";

                    userRepository.resetPassword(request, function (reset_forgot_otp_and_pwd_err, reset_forgot_otp_and_pwd_response) {
                        if (reset_forgot_otp_and_pwd_err) {
                            console.log(reset_forgot_otp_and_pwd_err);
                            callback(reset_forgot_otp_and_pwd_err, reset_forgot_otp_and_pwd_response);
                        } else {
                            console.log("PASSWORD RESET!");
                            callback(0, 200);
                        }
                    })
                }
                else {
                    callback(403, constant.messages.PASSWORD_MISSMATCH);
                }
            } else {
                callback(402, constant.messages.USER_EMAIL_DOESNOT_EXISTS);
            }
        }
    })
}

exports.CheckDataMapping = function (request, callback) {

    let arrayToCheck = request.arrayToCheck;
    let fieldToCheck = request.fieldToCheck;
    let checkId = request.checkId;
    let fieldToPrint = request.fieldToPrint;

    let finalRes = "";

    function fieldArray(j) {
        if (j < fieldToCheck.length) {
            function loopOfArray(i) {
                if (i < arrayToCheck.length) {
                    if(arrayToCheck[i][fieldToCheck[j]])
                    {
                        if ((arrayToCheck[i][fieldToCheck[j]].filter(e => e == checkId)).length > 0) {
                            finalRes += ", " + arrayToCheck[i][fieldToPrint];
                        }
                    }                    
                    i++;
                    loopOfArray(i);
                }
                else {
                    j++;
                    fieldArray(j);
                }
            }
            loopOfArray(0);
        }
        else {
            console.log("FINAL MAPPED RESULT : ", finalRes.slice(1));
            callback(0, finalRes.slice(2));
        }
    }
    fieldArray(0)
}
exports.CheckForMappings = function (request, callback) {

    let arrayToCheck = request.arrayToCheck;
    let fieldToCheck = request.fieldToCheck;
    let checkId = request.checkId;
    let fieldToPrint = request.fieldToPrint;

    let finalRes = "";
    arrayToCheck.map((e, i) => {
        let group_ids;

        if (fieldToCheck === "concept_group_id") {
            group_ids = e[fieldToCheck].advanced.concat(e[fieldToCheck].basic, e[fieldToCheck].intermediate);
        } else if(fieldToCheck === "blueprint_id"){ 
            group_ids = [ e[fieldToCheck] ]
        } else {
            group_ids = e[fieldToCheck]
        }
        let checkMap = group_ids.filter(e => e === checkId);
        checkMap.length > 0 &&
            (
                (i === arrayToCheck.length - 1) ? (finalRes += e[fieldToPrint]) : (finalRes += e[fieldToPrint] + ", ")
            )
    })

    console.log("FINAL MAPPED RESULT : ", finalRes);
    callback(0, finalRes);
}

exports.CheckGroupMappingToConcept = function (request, callback) {

    let arrayToCheck = request.arrayToCheck;
    let fieldToCheck = request.fieldToCheck;
    let checkId = request.checkId;
    let fieldToPrint = request.fieldToPrint;

    let finalRes = "";

    function fieldArray(j) {
        if (j < fieldToCheck.length) {
            function loopOfArray(i) {
                if (i < arrayToCheck.length) {
                    if ((arrayToCheck[i].concept_group_id[fieldToCheck[j].toLowerCase()].filter(e => e == checkId)).length > 0) {
                        finalRes += ", " + arrayToCheck[i][fieldToPrint];
                    }
                    i++;
                    loopOfArray(i);
                }
                else {
                    j++;
                    fieldArray(j);
                }
            }
            loopOfArray(0);
        }
        else {
            console.log("FINAL MAPPED RESULT : ", finalRes.slice(1));
            callback(0, finalRes.slice(2));
        }
    }
    fieldArray(0)
}

exports.deleteDynamoDBData = function (request, callback) {  

    commonRepository.deleteDynamoDBData(request, async function (delete_data_err, delete_data_response) {
        if (delete_data_err) {
            console.log(delete_data_err);
            callback(delete_data_err, delete_data_response);
        } else {
            console.log("Delete Data : ", delete_data_response);
            callback(delete_data_err, delete_data_response);
        }
    })
}
