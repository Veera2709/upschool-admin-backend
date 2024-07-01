const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const { successResponse } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.fetchUserDataByEmail = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR);
        } else {
            let docClient = dynamoDBCall;
            console.log("request : ", request);

            let read_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                IndexName: indexName.Indexes.user_email_index,
                KeyConditionExpression: "user_email = :user_email",
                ExpressionAttributeValues: {
                    ":user_email": request.data.user_email.toLowerCase()
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.fetchUserDataByPhoneNo = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                IndexName: indexName.Indexes.user_phone_no_index,
                KeyConditionExpression: "user_phone_no = :user_phone_no",
                ExpressionAttributeValues: {
                    ":user_phone_no": request.data.user_email.toString()
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchUserDataByUserName = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                IndexName: indexName.Indexes.user_name_index,
                KeyConditionExpression: "user_name = :user_name",
                ExpressionAttributeValues: {
                    ":user_name": request.data.user_email
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchSchoolUserDataById = function (request, callback) {
    console.log("fetch School User Data By Id: ", request);

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                KeyConditionExpression: "teacher_id = :teacher_id",
                ExpressionAttributeValues: {
                    ":teacher_id": request.teacher_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchAdminDataById = function (request, callback) {
    console.log("Check Request Repo: ", request);

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                KeyConditionExpression: "teacher_id = :teacher_id",
                ExpressionAttributeValues: {
                    ":teacher_id": request.user_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchUserDataByUserId = function (request, callback) {
    console.log("Check Request Repo: ", request);

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                KeyConditionExpression: "user_id = :user_id",
                ExpressionAttributeValues: {
                    ":user_id": request.user_id
                },
                ProjectionExpression: ["user_id", "user_email", "user_name", "user_phone_no", "user_role", "updated_ts", "user_jwt", "first_name", "last_name", "user_status"]

            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.fetchCMSUserDataByUserId = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                KeyConditionExpression: "user_id = :user_id",
                ExpressionAttributeValues: {
                    ":user_id": request.data.user_id
                },
                ProjectionExpression: ["user_id", "user_email", "user_name", "user_phone_no", "user_role", "updated_ts", "user_jwt", "first_name", "last_name", "user_status", "user_dob"]
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.getIndividualUserByRole = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR)
        } else {

            let tableName = "";
            let keyCondition = ""
            switch (request.data.user_role) {
                case "Parent":
                    tableName = TABLE_NAMES.upschool_parent_info;
                    keyCondition = "parent_id = :user_id";
                    break;
                case "Teacher":
                    tableName = TABLE_NAMES.upschool_teacher_info;
                    keyCondition = "teacher_id = :user_id";
                    break;
                case "Student":
                    tableName = TABLE_NAMES.upschool_student_info;
                    keyCondition = "student_id = :user_id"
                    break;
                default:
                    console.log("DEFAULT ROLE : " + request.data.user_role);
            }

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: tableName,
                KeyConditionExpression: keyCondition,
                ExpressionAttributeValues: {
                    ":user_id": request.data.user_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.updateJwtToken = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Login Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_LOGIN_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                Key: {
                    "user_id": request.user_id
                },
                UpdateExpression: "set user_jwt = :user_jwt, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":user_jwt": request.user_jwt,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}

exports.updateUserOtp = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                Key: {
                    "user_id": request.data.user_id
                },
                UpdateExpression: "set user_otp = :user_otp, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":user_otp": request.data.user_otp,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}

exports.resetUserOtp = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                Key: {
                    "user_id": request.data.user_id
                },
                UpdateExpression: "set user_otp = :user_otp, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":user_otp": request.data.user_reset_otp,
                    ":updated_ts": helper.getCurrentTimestamp()
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}

exports.insertCMSUser = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UPSCHOOL_USER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UPSCHOOL_USER_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;
            let insert_upschool_user_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                Item: {
                    "user_id": helper.getRandomString(),
                    "user_email": request.data.user_email,
                    "first_name": request.data.first_name,
                    "last_name": request.data.last_name,
                    "user_name": request.data.user_name,
                    "lc_user_name": request.data.user_name.toLowerCase().replace(/ /g, ''),
                    "user_phone_no": request.data.user_phone_no,
                    "user_role": request.data.user_role,
                    "user_dob": request.data.user_dob,
                    "user_status": "Active",
                    "common_id": "61692656",
                    "created_ts": helper.getCurrentTimestamp(),
                    "updated_ts": helper.getCurrentTimestamp(),
                }
            }
            console.log("insert_upschool_user_params : ", insert_upschool_user_params);

            DATABASE_TABLE.putRecord(docClient, insert_upschool_user_params, callback);
        }
    });
}
exports.fetchCMSUserByUserName = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UPSCHOOL_USER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UPSCHOOL_USER_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "lc_user_name = :lc_user_name",
                ExpressionAttributeValues: {
                    ":lc_user_name": request.data.user_name.toLowerCase().replace(/ /g, ''),
                    ":common_id": constant.constValues.common_id,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.fetchCMSUserByEmail = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UPSCHOOL_USER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UPSCHOOL_USER_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "user_email = :user_email",
                ExpressionAttributeValues: {
                    ":user_email": request.data.user_email,
                    ":common_id": constant.constValues.common_id,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.fetchCMSUserByPhone = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UPSCHOOL_USER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UPSCHOOL_USER_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "user_phone_no = :user_phone_no",
                ExpressionAttributeValues: {
                    ":user_phone_no": request.data.user_phone_no,
                    ":common_id": constant.constValues.common_id,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.fetchBulkUserssData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UPSCHOOL_USER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UPSCHOOL_USER_DATABASE_ERROR)
        } else {
            let userIdArray = request.data.userIdArray;
            let tableUserID = request.data.tableUserID;
            let userTableName = request.data.userTableName;

            let filterExpDynamic = tableUserID + "= :" + tableUserID;
            let expAttributeVal = {};

            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {};

            if (userIdArray.length === 1) {

                expAttributeVal[':' + tableUserID] = userIdArray[0];

                let read_params = {
                    TableName: userTableName,
                    KeyConditionExpression: "" + tableUserID + " = :" + tableUserID + "",
                    ExpressionAttributeValues: expAttributeVal,
                }

                console.log("READ PARAMS : ", read_params);

                DATABASE_TABLE.queryRecord(docClient, read_params, callback);
            }
            else {
                userIdArray.forEach((element, index) => {
                    if (index < userIdArray.length - 1) {
                        FilterExpressionDynamic = FilterExpressionDynamic + filterExpDynamic + index + " OR "
                        ExpressionAttributeValuesDynamic[':' + tableUserID + '' + index] = element + ''
                    } else {
                        FilterExpressionDynamic = FilterExpressionDynamic + filterExpDynamic + index + ""
                        ExpressionAttributeValuesDynamic[':' + tableUserID + '' + index] = element;
                    }
                });
                let read_params = {
                    TableName: userTableName,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }
                DATABASE_TABLE.scanRecord(docClient, read_params, callback);
            }
        }
    });
}

exports.updateCMSUser = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("User Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                Key: {
                    "user_id": request.data.user_id
                },
                UpdateExpression: "set user_email = :user_email, first_name = :first_name, last_name = :last_name, user_name = :user_name, user_phone_no = :user_phone_no, user_role = :user_role, user_dob = :user_dob, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":user_email": request.data.user_email,
                    ":first_name": request.data.first_name,
                    ":last_name": request.data.last_name,
                    ":user_name": request.data.user_name,
                    ":user_phone_no": request.data.user_phone_no,
                    ":user_role": request.data.user_role,
                    ":user_dob": request.data.user_dob,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}

exports.fetchCMSUsersListBasedonRoleStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.USER_DATA_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "user_status = :user_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":user_status": request.data.user_status
                },
                ProjectionExpression: ["user_id", "user_email", "user_name", "user_phone_no", "user_status", "user_role", "updated_ts"]
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.switchCMSUserStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.USER_DATA_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let toggle_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                Key: {
                    "user_id": request.data.user_id
                },
                UpdateExpression: "set user_status = :user_status, updated_ts = :updated_ts",
                ExpressionAttributeValues: {

                    ":updated_ts": helper.getCurrentTimestamp(),
                    ":user_status": request.data.user_status
                },
            };
            DATABASE_TABLE.updateRecord(docClient, toggle_params, callback);
        }
    });
}

exports.resetPassword = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.USER_DATA_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.USER_DATA_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_users_table,
                Key: {
                    "user_id": request.data.user_id
                },
                UpdateExpression: "set user_jwt = :user_jwt, user_salt = :user_salt, user_pwd = :user_pwd, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":user_jwt": request.data.user_jwt,
                    ":user_salt": request.data.user_salt,
                    ":user_pwd": request.data.user_pwd,
                    ":updated_ts": helper.getCurrentTimestamp()
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}
exports.fetchCMSUserData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Chapter Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {
            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {};
            let cms_user_array = request.data.cms_user_array;

            if (cms_user_array.length === 0) {

                callback(400, constant.messages.NO_CMS_USER_TO_TOGGLE);

            } else if (cms_user_array.length === 1) {
                let read_params = {
                    TableName: TABLE_NAMES.upschool_users_table,
                    KeyConditionExpression: "user_id = :user_id",
                    ExpressionAttributeValues: {
                        ":user_id": cms_user_array[0],
                    },
                }

                DATABASE_TABLE.queryRecord(docClient, read_params, callback);

            } else {
                console.log("Else");
                cms_user_array.forEach((element, index) => {
                    if (index < cms_user_array.length - 1) {
                        FilterExpressionDynamic = FilterExpressionDynamic + "(user_id = :user_id" + index + ") OR "
                        ExpressionAttributeValuesDynamic[':user_id' + index] = element + ''
                    } else {
                        FilterExpressionDynamic = FilterExpressionDynamic + "(user_id = :user_id" + index + ")"
                        ExpressionAttributeValuesDynamic[':user_id' + index] = element;
                    }
                });

                let read_params = {
                    TableName: TABLE_NAMES.upschool_users_table,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }

                DATABASE_TABLE.scanRecord(docClient, read_params, callback);

            }

        }
    });
}
exports.changeMultipleCMSUsersStatus = async function (final_data, callback) {

    if (final_data.length > 0) {
        dynamoDbCon.getDB(async function (DBErr, dynamoDBCall) {
            if (DBErr) {
                console.log(constant.messages.DATABASE_ERROR);
                console.log(DBErr);
                callback(500, constant.messages.DATABASE_ERROR);
            } else {

                let docClient = dynamoDBCall;
                let ItemsObjects = {};

                const putReqs = final_data.map(item => ({
                    PutRequest: {
                        Item: item
                    }
                }))

                ItemsObjects[TABLE_NAMES.upschool_users_table] = putReqs;

                const req = {
                    RequestItems: ItemsObjects
                }

                await docClient.batchWrite(req).promise();
                console.log("After CMS User insertion")
                callback(0, 200);
            }
        });
    } else {
        callback(0, 200);
    }
}
// Duplicate : 
exports.insertManyCases = function (final_data, userTable, callback) {

    if (final_data.length > 0) {
        dynamoDbCon.getDB(async function (DBErr, dynamoDBCall) {
            if (DBErr) {
                console.log("Cases Data Database Error");
                console.log(DBErr);
                callback(500, constant.messages.USER_DATA_DATABASE_ERROR);
            } else {

                let docClient = dynamoDBCall;

                const concurrencyLevel = 5; // Choose the number of parallel threads/processes

                const batches = chunkArray(final_data, 25); // Split items into batches of 25
                const promises = [];

                async function batchLoop(i) {
                    if (i < batches.length) {

                        const currentBatches = batches.slice(i, i + concurrencyLevel);
                        let tableName = '';

                        switch (userTable) {
                            case "Parents":
                                tableName = TABLE_NAMES.upschool_parent_info;
                                break;
                            case "Teachers":
                                tableName = TABLE_NAMES.upschool_teacher_info;
                                break;
                            case "Students":
                                tableName = TABLE_NAMES.upschool_student_info;
                                break;
                            default:
                                console.log("DEFAULT ROLE : " + userTable);
                        }

                        const batchPromises = await currentBatches.map(async (batch) => {
                            // Make BatchWriteItem request for each batch of items

                            const params = {
                                RequestItems: {
                                }
                            };

                            params.RequestItems[tableName] = await batch.map((item) => ({
                                PutRequest: {
                                    Item: item
                                }
                            }))

                            return await docClient.batchWrite(params).promise();
                        });

                        promises.push(...batchPromises);

                        i += concurrencyLevel;
                        batchLoop(i);
                    } else {
                        await Promise.all(promises);
                        console.log('All items inserted.');
                        callback(0, 200);

                    }
                }
                batchLoop(0);
            }
        });
    }
    else {
        callback(0, 200);
    }
}

// Utility function to split array into chunks
function chunkArray(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

exports.searchTeachers = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Section Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let keywordLowerCase = request.data.searchedKeyword.toLowerCase();
            let keywordUpperCase = request.data.searchedKeyword.toUpperCase();
            let capitalisedKeyword = request.data.searchedKeyword.charAt(0).toUpperCase() + request.data.searchedKeyword.slice(1);

            let read_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: 'contains(user_firstname, :user_firstname1) OR contains(user_firstname, :user_firstname2)  OR contains(user_firstname, :user_firstname3) OR contains(user_firstname, :user_firstname4) OR contains(user_lastname, :user_lastname1) OR contains(user_lastname, :user_lastname2)  OR contains(user_lastname, :user_lastname3) OR contains(user_lastname, :user_lastname4) OR contains(user_email, :user_email1) OR contains(user_email, :user_email2)  OR contains(user_email, :user_email3) OR contains(user_email, :user_email4) OR contains(user_phone_no, :user_phone_no1) OR contains(user_phone_no, :user_phone_no2)  OR contains(user_phone_no, :user_phone_no3) OR contains(user_phone_no, :user_phone_no4)',

                // FilterExpression: "user_firstname = :user_firstname OR user_lastname = :user_lastname OR user_email = :user_email OR user_phone_no = :user_phone_no", 
                // user_dob = :user_dob OR 
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":user_firstname1": keywordLowerCase,
                    ":user_firstname2": keywordUpperCase,
                    ":user_firstname3": capitalisedKeyword,
                    ":user_firstname4": request.data.searchedKeyword,

                    ":user_lastname1": keywordLowerCase,
                    ":user_lastname2": keywordUpperCase,
                    ":user_lastname3": capitalisedKeyword,
                    ":user_lastname4": request.data.searchedKeyword,

                    ":user_email1": keywordLowerCase,
                    ":user_email2": keywordUpperCase,
                    ":user_email3": capitalisedKeyword,
                    ":user_email4": request.data.searchedKeyword,

                    ":user_phone_no1": keywordLowerCase,
                    ":user_phone_no2": keywordUpperCase,
                    ":user_phone_no3": capitalisedKeyword,
                    ":user_phone_no4": request.data.searchedKeyword,
                }
            }
            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.searchParents = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Section Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: 'contains(user_firstname, :user_firstname1) OR contains(user_firstname, :user_firstname2)  OR contains(user_firstname, :user_firstname3) OR contains(user_firstname, :user_firstname4) OR contains(user_lastname, :user_lastname1) OR contains(user_lastname, :user_lastname2)  OR contains(user_lastname, :user_lastname3) OR contains(user_lastname, :user_lastname4) OR contains(user_email, :user_email1) OR contains(user_email, :user_email2)  OR contains(user_email, :user_email3) OR contains(user_email, :user_email4) OR contains(user_phone_no, :user_phone_no1) OR contains(user_phone_no, :user_phone_no2)  OR contains(user_phone_no, :user_phone_no3) OR contains(user_phone_no, :user_phone_no4)',

                // FilterExpression: "user_firstname = :user_firstname OR user_lastname = :user_lastname OR user_email = :user_email OR user_phone_no = :user_phone_no", 
                // user_dob = :user_dob OR 
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":user_firstname1": keywordLowerCase,
                    ":user_firstname2": keywordUpperCase,
                    ":user_firstname3": capitalisedKeyword,
                    ":user_firstname4": request.data.searchedKeyword,

                    ":user_lastname1": keywordLowerCase,
                    ":user_lastname2": keywordUpperCase,
                    ":user_lastname3": capitalisedKeyword,
                    ":user_lastname4": request.data.searchedKeyword,

                    ":user_email1": keywordLowerCase,
                    ":user_email2": keywordUpperCase,
                    ":user_email3": capitalisedKeyword,
                    ":user_email4": request.data.searchedKeyword,

                    ":user_phone_no1": keywordLowerCase,
                    ":user_phone_no2": keywordUpperCase,
                    ":user_phone_no3": capitalisedKeyword,
                    ":user_phone_no4": request.data.searchedKeyword,
                }
            }
            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.searchStudents = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Section Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: 'contains(user_firstname, :user_firstname1) OR contains(user_firstname, :user_firstname2)  OR contains(user_firstname, :user_firstname3) OR contains(user_firstname, :user_firstname4) OR contains(user_lastname, :user_lastname1) OR contains(user_lastname, :user_lastname2)  OR contains(user_lastname, :user_lastname3) OR contains(user_lastname, :user_lastname4)',

                // FilterExpression: "user_firstname = :user_firstname OR user_lastname = :user_lastname OR user_email = :user_email OR user_phone_no = :user_phone_no", 
                // user_dob = :user_dob OR 
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":user_firstname1": keywordLowerCase,
                    ":user_firstname2": keywordUpperCase,
                    ":user_firstname3": capitalisedKeyword,
                    ":user_firstname4": request.data.searchedKeyword,

                    ":user_lastname1": keywordLowerCase,
                    ":user_lastname2": keywordUpperCase,
                    ":user_lastname3": capitalisedKeyword,
                    ":user_lastname4": request.data.searchedKeyword,
                }
            }
            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.getPaginatedItems = function (request, callback) {

    dynamoDbCon.getDB(async function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {
            let TableName = "";
            let read_params = {};
            let keywordLowerCase = request.data.searchedKeyword.toLowerCase();
            let keywordUpperCase = request.data.searchedKeyword.toUpperCase();
            let capitalisedKeyword = request.data.searchedKeyword.charAt(0).toUpperCase() + request.data.searchedKeyword.slice(1);

            console.log(request.data.searchedKeyword, keywordLowerCase, keywordUpperCase, capitalisedKeyword);

            switch (request.data.user) {
                case "Teacher":
                    console.log("Teacher : ")
                    TableName = TABLE_NAMES.upschool_teacher_info;
                    read_params = {
                        TableName: TableName,
                        IndexName: indexName.Indexes.common_id_index,
                        KeyConditionExpression: 'common_id = :common_id',
                        FilterExpression: request.data.school_id ? `school_id = :school_id AND user_role = :user_role AND user_status = :user_status AND (contains(user_firstname, :searchedKeyword) OR contains(user_firstname, :keywordLowerCase) OR contains(user_firstname, :keywordUpperCase) OR contains(user_firstname, :capitalisedKeyword) OR contains(user_lastname, :searchedKeyword) OR contains(user_lastname, :keywordLowerCase) OR contains(user_lastname, :keywordUpperCase) OR contains(user_lastname, :capitalisedKeyword) OR contains(user_email, :searchedKeyword) OR contains(user_email, :keywordLowerCase) OR contains(user_email, :keywordUpperCase) OR contains(user_email, :capitalisedKeyword) OR contains(user_phone_no, :searchedKeyword) OR contains(user_phone_no, :keywordLowerCase) OR contains(user_phone_no, :keywordUpperCase) OR contains(user_phone_no, :capitalisedKeyword))` : `user_role = :user_role AND user_status = :user_status AND (contains(user_firstname, :searchedKeyword) OR contains(user_firstname, :keywordLowerCase) OR contains(user_firstname, :keywordUpperCase) OR contains(user_firstname, :capitalisedKeyword) OR contains(user_lastname, :searchedKeyword) OR contains(user_lastname, :keywordLowerCase) OR contains(user_lastname, :keywordUpperCase) OR contains(user_lastname, :capitalisedKeyword) OR contains(user_email, :searchedKeyword) OR contains(user_email, :keywordLowerCase) OR contains(user_email, :keywordUpperCase) OR contains(user_email, :capitalisedKeyword) OR contains(user_phone_no, :searchedKeyword) OR contains(user_phone_no, :keywordLowerCase) OR contains(user_phone_no, :keywordUpperCase) OR contains(user_phone_no, :capitalisedKeyword))`,

                        ExpressionAttributeValues: {
                            ":common_id": constant.constValues.common_id,
                            ":searchedKeyword": request.data.searchedKeyword,
                            ":keywordLowerCase": keywordLowerCase,
                            ":keywordUpperCase": keywordUpperCase,
                            ":capitalisedKeyword": capitalisedKeyword,
                            ":user_role": request.data.user,
                            ":user_status": request.data.user_status,
                            ":school_id": request.data.school_id ? request.data.school_id : undefined
                        },
                        // Limit: request.data.page_size,
                        ExclusiveStartKey: request.data.start_key,
                    }
                    console.log("read_params", read_params);
                    break;
                case "Parent":
                    console.log("Parent : ")
                    TableName = TABLE_NAMES.upschool_parent_info;

                    read_params = {
                        TableName: TableName,
                        IndexName: indexName.Indexes.common_id_index,
                        KeyConditionExpression: 'common_id = :common_id',
                        FilterExpression: request.data.school_id ? `school_id = :school_id AND user_status = :user_status AND (contains(user_firstname, :searchedKeyword) OR contains(user_firstname, :keywordLowerCase) OR contains(user_firstname, :keywordUpperCase) OR contains(user_firstname, :capitalisedKeyword) OR contains(user_lastname, :searchedKeyword) OR contains(user_lastname, :keywordLowerCase) OR contains(user_lastname, :keywordUpperCase) OR contains(user_lastname, :capitalisedKeyword) OR contains(user_email, :searchedKeyword) OR contains(user_email, :keywordLowerCase) OR contains(user_email, :keywordUpperCase) OR contains(user_email, :capitalisedKeyword) OR contains(user_phone_no, :searchedKeyword) OR contains(user_phone_no, :keywordLowerCase) OR contains(user_phone_no, :keywordUpperCase) OR contains(user_phone_no, :capitalisedKeyword))` : `user_status = :user_status AND (contains(user_firstname, :searchedKeyword) OR contains(user_firstname, :keywordLowerCase) OR contains(user_firstname, :keywordUpperCase) OR contains(user_firstname, :capitalisedKeyword) OR contains(user_lastname, :searchedKeyword) OR contains(user_lastname, :keywordLowerCase) OR contains(user_lastname, :keywordUpperCase) OR contains(user_lastname, :capitalisedKeyword) OR contains(user_email, :searchedKeyword) OR contains(user_email, :keywordLowerCase) OR contains(user_email, :keywordUpperCase) OR contains(user_email, :capitalisedKeyword) OR contains(user_phone_no, :searchedKeyword) OR contains(user_phone_no, :keywordLowerCase) OR contains(user_phone_no, :keywordUpperCase) OR contains(user_phone_no, :capitalisedKeyword))`,

                        ExpressionAttributeValues: {
                            ":common_id": constant.constValues.common_id,
                            ":searchedKeyword": request.data.searchedKeyword,
                            ":keywordLowerCase": keywordLowerCase,
                            ":keywordUpperCase": keywordUpperCase,
                            ":capitalisedKeyword": capitalisedKeyword,
                            ":user_status": request.data.user_status,
                            ":school_id": request.data.school_id ? request.data.school_id : undefined
                        },
                        // Limit: request.data.page_size,
                        ExclusiveStartKey: request.data.start_key
                    }
                    break;
                case "Student":
                    console.log("Student : ")
                    TableName = TABLE_NAMES.upschool_student_info;

                    read_params = {
                        TableName: TableName,
                        IndexName: indexName.Indexes.common_id_index,
                        KeyConditionExpression: 'common_id = :common_id',
                        FilterExpression: request.data.school_id ? `school_id = :school_id AND user_status = :user_status AND (contains(user_firstname, :searchedKeyword) OR contains(user_firstname, :keywordLowerCase) OR contains(user_firstname, :keywordUpperCase) OR contains(user_firstname, :capitalisedKeyword) OR contains(user_lastname, :searchedKeyword) OR contains(user_lastname, :keywordLowerCase) OR contains(user_lastname, :keywordUpperCase) OR contains(user_lastname, :capitalisedKeyword))` : `user_status = :user_status AND (contains(user_firstname, :searchedKeyword) OR contains(user_firstname, :keywordLowerCase) OR contains(user_firstname, :keywordUpperCase) OR contains(user_firstname, :capitalisedKeyword) OR contains(user_lastname, :searchedKeyword) OR contains(user_lastname, :keywordLowerCase) OR contains(user_lastname, :keywordUpperCase) OR contains(user_lastname, :capitalisedKeyword))`,

                        ExpressionAttributeValues: {
                            ":common_id": constant.constValues.common_id,
                            ":searchedKeyword": request.data.searchedKeyword,
                            ":keywordLowerCase": keywordLowerCase,
                            ":keywordUpperCase": keywordUpperCase,
                            ":capitalisedKeyword": capitalisedKeyword,
                            ":user_status": request.data.user_status,
                            ":school_id": request.data.school_id ? request.data.school_id : undefined
                        },
                        // Limit: request.data.page_size,
                        ExclusiveStartKey: request.data.start_key
                    }
                    break;
                case 'Admin':
                    TableName = TABLE_NAMES.upschool_teacher_info;
                    console.log("ADMIN PAGINATION");

                    read_params = {
                        TableName: TableName,
                        IndexName: indexName.Indexes.common_id_index,
                        KeyConditionExpression: 'common_id = :common_id',
                        FilterExpression: request.data.school_id ? `school_id = :school_id AND user_status = :user_status AND (user_role = :user_role1 OR user_role = :user_role2) AND (contains(user_email, :searchedKeyword) OR contains(user_email, :keywordLowerCase) OR contains(user_email, :keywordUpperCase) OR contains(user_email, :capitalisedKeyword))` : `user_status = :user_status AND (user_role = :user_role1 OR user_role = :user_role2) AND (contains(user_email, :searchedKeyword) OR contains(user_email, :keywordLowerCase) OR contains(user_email, :keywordUpperCase) OR contains(user_email, :capitalisedKeyword))`,

                        ExpressionAttributeValues: {
                            ":common_id": constant.constValues.common_id,
                            ":user_status": request.data.user_status,
                            ":searchedKeyword": request.data.searchedKeyword,
                            ":keywordLowerCase": keywordLowerCase,
                            ":keywordUpperCase": keywordUpperCase,
                            ":capitalisedKeyword": capitalisedKeyword,
                            ":user_role1": "MasterAdmin",
                            ":user_role2": "SchoolAdmin",
                            ":school_id": request.data.school_id ? request.data.school_id : undefined
                        },
                        // Limit: request.data.page_size,
                        ExclusiveStartKey: request.data.start_key
                    }
                    break;
                default:
                    break;
            }

            let docClient = dynamoDBCall;

            DATABASE_TABLE.queryWithPaginationAndLastkey(request, docClient, read_params, callback);
        }
    });
}
