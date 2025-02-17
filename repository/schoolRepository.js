const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.fetchDataBySchoolName = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                IndexName: indexName.Indexes.lc_school_name_index,
                KeyConditionExpression: "lc_school_name = :lc_school_name",
                ExpressionAttributeValues: {
                    ":lc_school_name": request.data.school_name.toLowerCase().replace(/ /g, '')
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.addingSchool = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;            

            let insert_client_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                Item: {
                    "school_id": request.data.school_id,
                    "lc_school_name": request.data.school_name.toLowerCase().replace(/ /g, ''),
                    "school_name": request.data.school_name.trim(),
                    "school_logo": request.data.school_logo,
                    "subscription_active": request.data.subscription_active,
                    "school_status": "Active",
                    "school_labelling": request.data.school_labelling,
                    "school_contact_info": request.data.school_contact_info,
                    "school_board": request.data.school_board,
                    "common_id": constant.constValues.common_id,
                    "created_ts": helper.getCurrentTimestamp(),
                    "updated_ts": helper.getCurrentTimestamp(),
                }
            }

            DATABASE_TABLE.putRecord(docClient, insert_client_params, callback);
        }
    });
}

exports.getAllSchoolsDetails = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "school_status = :school_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":school_status": request.data.school_status
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchAllClientClassList = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_client_class_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "school_id = :school_id",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":school_id": request.data.school_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchClientClassByUpClassId = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_client_class_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "upschool_class_id = :upschool_class_id",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":upschool_class_id": request.data.class_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.insertManyClientClasses = function (final_data, dataToRemove, callback) {

    if (final_data.length > 0 || dataToRemove.length > 0) {
        dynamoDbCon.getDB(async function (DBErr, dynamoDBCall) {
            if (DBErr) {
                console.log("Cases Data Database Error");
                console.log(DBErr);
                callback(500, constant.messages.USER_DATA_DATABASE_ERROR);
            } else {

                let docClient = dynamoDBCall;
                let putReqs = [];

                if (final_data.length > 0) {
                    putReqs = final_data.map(item => ({
                        PutRequest: {
                            Item: item
                        }
                    }))
                }

                if (dataToRemove.length > 0) {
                    let deleteReqs = dataToRemove.map(removeItem => ({
                        DeleteRequest: {
                            Key: {
                                client_class_id: removeItem.client_class_id
                            }
                        }
                    }))

                    Array.prototype.push.apply(putReqs, deleteReqs);
                }

                let ItemsObjects = {};
                ItemsObjects[TABLE_NAMES.upschool_client_class_table] = putReqs;

                const req = {
                    RequestItems: ItemsObjects
                }


                console.log("FINAL DATA : ", JSON.stringify(req));
                await docClient.batchWrite(req).promise();
                console.log("After User insertion")
                callback(0, 200);
            }
        });
    } else {
        console.log("EMPTY CLASS LIST ARRAY");
        callback(0, 200);
    }

}

exports.getAllSchoolsIdsAndNames = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "school_status = :school_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":school_status": "Active"
                },
                ProjectionExpression: ["school_id", "school_name", "school_board"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.getSchoolDetailsById = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                KeyConditionExpression: "school_id = :school_id",
                ExpressionAttributeValues: {
                    ":school_id": request.data.school_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.updateSchool = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                Key: {
                    "school_id": request.data.school_id
                },
                UpdateExpression: "set lc_school_name = :lc_school_name, school_name = :school_name, school_logo = :school_logo, subscription_active = :subscription_active, school_contact_info = :school_contact_info, school_board = :school_board,  school_labelling = :school_labelling, updated_ts = :updated_ts",

                ExpressionAttributeValues: {
                    ":lc_school_name": request.data.school_name.toLowerCase().replace(/ /g, ''),
                    ":school_name": request.data.school_name.trim(),
                    ":school_logo": request.data.school_logo,
                    ":subscription_active": request.data.subscription_active,
                    ":school_labelling": request.data.school_labelling,
                    ":school_contact_info": request.data.school_contact_info,
                    ":school_board": request.data.school_board,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}

exports.toggleSchoolStatus = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                Key: {
                    "school_id": request.data.school_id
                },
                UpdateExpression: "set school_status = :school_status, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":school_status": request.data.school_status,
                    ":updated_ts": request.data.updated_ts,
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

// exports.setQuizConfig = function (request, callback) {
//     dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
//         if (DBErr) {
//             console.log("School Data Database Error");
//             console.log(DBErr);
//             callback(500, constant.messages.DATABASE_ERROR)
//         } else {

//             let docClient = dynamoDBCall;

//             let update_params = {
//                 TableName: TABLE_NAMES.upschool_school_info_table,
//                 Key: {
//                     "school_id": request.data.school_id
//                 },
//                 UpdateExpression: "set school_quiz_config = :school_quiz_config, updated_ts = :updated_ts",
//                 ExpressionAttributeValues: {
//                     ":school_quiz_config": request.data.school_quiz_config,                    
//                     ":updated_ts": helper.getCurrentTimestamp(),
//                 },
//             };

//             DATABASE_TABLE.updateRecord(docClient, update_params, callback);

//         }
//     });
// }

exports.setPreQuizConfig = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                Key: {
                    "school_id": request.data.school_id
                },
                UpdateExpression: "set pre_quiz_config = :pre_quiz_config, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":pre_quiz_config": request.data.pre_quiz_config,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}
exports.setPostQuizConfig = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                Key: {
                    "school_id": request.data.school_id
                },
                UpdateExpression: "set post_quiz_config = :post_quiz_config, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":post_quiz_config": request.data.post_quiz_config,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.setTestConfig = function (request, callback) {  
    console.log(request.data.test_config);
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;
            let update_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                Key: {
                    "school_id": request.data.school_id
                },
                UpdateExpression: "set test_config = :test_config, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":test_config": request.data.test_config,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };
            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}


exports.settingSubscriptionFeature = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                Key: {
                    "school_id": request.data.school_id
                },
                UpdateExpression: "set school_subscribtion_feature = :school_subscribe_feature, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":school_subscribe_feature": request.data.school_subscribe_feature,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}
exports.settingTeacherAccess = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_school_info_table,
                Key: {
                    "school_id": request.data.school_id
                },
                UpdateExpression: "set teacher_access = :teacher_access, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":teacher_access": request.data.teacher_access,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}