const jwt = require('jsonwebtoken');
const constant = require('../constants/constant');
const userRepository = require("../repository/userRepository");
const helper = require('../helper/helper');

exports.validUser = (req, res, next) => {
    let token = req.header('Authorization');
    let request = req.body;
    console.log("Token : ", token);
    console.log("request : ", request);

    jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
        if (err) {
            console.log(err);
            res.status(400).json(constant.messages.INVALID_TOKEN);
        } else {
            let decode_token = helper.decodeJwtToken(token);
            console.log("decode_token", decode_token);

            if (decode_token.user_id && (decode_token.user_role === 'admin') || Array.isArray(decode_token.user_role)) {

                request["user_id"] = decode_token.user_id;
                console.log("user_id : ", request.user_id);

                userRepository.fetchUserDataByUserId(request, function (fetch_user_data_err, fetch_user_data_response) {
                    if (fetch_user_data_err) {
                        console.log(fetch_user_data_err);
                        res.status(400).json(constant.messages.INVALID_TOKEN);
                    } else {
                        console.log(fetch_user_data_response.Items[0].user_jwt, "----------");
                        console.log(token);

                        if (fetch_user_data_response.Items.length > 0) {
                            if (fetch_user_data_response.Items[0].user_jwt === token) {

                                next();
                            } else {
                                res.status(400).json(constant.messages.INVALID_TOKEN);
                            }

                        } else {
                            res.status(400).json(constant.messages.INVALID_TOKEN);
                        }

                    }
                })
            } else {

                request["teacher_id"] = decode_token.teacher_id;
                console.log("teacher_id : ", request.teacher_id);

                userRepository.fetchSchoolUserDataById(request, function (fetch_user_data_err, fetch_user_data_response) {
                    if (fetch_user_data_err) {
                        console.log(fetch_user_data_err);
                        res.status(400).json(constant.messages.INVALID_TOKEN);
                    } else {
                        if (fetch_user_data_response.Items.length > 0) {
                            if (fetch_user_data_response.Items[0].user_jwt === token) {
                                next();
                            } else {
                                res.status(400).json(constant.messages.INVALID_TOKEN);
                            }

                        } else {
                            res.status(400).json(constant.messages.INVALID_TOKEN);
                        }

                    }
                })
            }

        }
    })
};