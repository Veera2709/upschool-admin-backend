const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const { successResponse } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.getAllTeachersData = function (callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Fetch All Teachers");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.getActiveTeachersData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Fetch All Active Teachers");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "user_status = :user_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":user_status": request.data.user_status
                },
                ProjectionExpression: ["teacher_id", "school_id", "user_dob", "user_email", "user_firstname", "user_lastname", "user_phone_no", "user_role", "user_status", "updated_ts"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.updateTeacher = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("DB ERROR : Update Teacher");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                Key: {
                    "teacher_id": request.data.teacher_id
                },
                UpdateExpression: "set school_id = :school_id, user_dob = :user_dob, user_email = :user_email, user_firstname = :user_firstname, user_lastname = :user_lastname, user_phone_no = :user_phone_no, user_role = :user_role, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":school_id": request.data.school_id,
                    ":user_dob": { yyyy_mm_dd: request.data.user_dob, dd_mm_yyyy: helper.change_dd_mm_yyyy(request.data.user_dob) },
                    ":user_email": request.data.user_email.toLowerCase(),
                    ":user_firstname": request.data.user_firstname,
                    ":user_lastname": request.data.user_lastname,
                    ":user_phone_no": request.data.user_phone_no.toString(),
                    ":user_role": request.data.user_role,
                    ":updated_ts": helper.getCurrentTimestamp()
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}

exports.addMasterAdmin = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("DB ERROR : add Master Admin");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let insert_master_admin_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                Item: {
                    "teacher_id": helper.getRandomString(),
                    "school_id": request.data.school_id.toString(),
                    "user_email": request.data.master_admin_email.toLowerCase(),
                    "user_role": "MasterAdmin",
                    "user_status": "Active",
                    "common_id": constant.constValues.common_id,
                    "created_ts": helper.getCurrentTimestamp(),
                    "updated_ts": helper.getCurrentTimestamp()
                }
            }
            DATABASE_TABLE.putRecord(docClient, insert_master_admin_params, callback);

        }
    });
}

exports.getAdminDataByEmail = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : get Admin Data By Email");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "user_email = :user_email",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":user_email": request.data.master_admin_email.toLowerCase()
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.getMasterAdminDataBySchool = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : get Maste rAdmin Data By School");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "school_id = :school_id AND user_role = :user_role",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":school_id": request.data.school_id,
                    ":user_role": 'MasterAdmin'
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.updateMasterAdmin = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("DB ERROR : Update Teacher");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                Key: {
                    "teacher_id": request.data.master_admin_id
                },
                UpdateExpression: "set user_email = :user_email, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":user_email": request.data.master_admin_email.toLowerCase(),
                    ":updated_ts": helper.getCurrentTimestamp()
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}

exports.changeTeacherStatus = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("ERROR : Change Teacher Status");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                Key: {
                    "teacher_id": request.data.user_id
                },
                UpdateExpression: "set user_status = :user_status, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":user_status": request.data.user_status,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.updateTeacherSectionAllocationInfo = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("DB ERROR : Update Teacher");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                Key: {
                    "teacher_id": request.data.teacher_id
                },
                UpdateExpression: "set teacher_section_allocation = :teacher_section_allocation",
                ExpressionAttributeValues: {
                    ":teacher_section_allocation": request.data.teacher_section_allocation
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}

exports.updateTeacherInfo = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("DB ERROR : Update Teacher");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                Key: {
                    "teacher_id": request.data.teacher_id
                },
                UpdateExpression: "set teacher_info = :teacher_info",
                ExpressionAttributeValues: {
                    ":teacher_info": request.data.teacher_info
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}
exports.getAllTeachersBasedonSchool = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Fetch All Teachers");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let filterExp = "user_status = :user_status AND school_id = :school_id";

            let attributeValues = {
                ":common_id": constant.constValues.common_id,
                ":user_status": request.data.school_status === `Active` ? `Archived` : `Active`,
                ":school_id": request.data.school_id,
            }

            if (request.data.school_status == "Active") {
                filterExp += " AND updated_ts = :updated_ts";
                attributeValues[":updated_ts"] = request.data.sch_archived_ts;
            }

            let read_params = {
                TableName: TABLE_NAMES.upschool_teacher_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: filterExp,
                ExpressionAttributeValues: attributeValues
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.changeMultiTeachersStatus = async function (final_data, callback) {

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

                ItemsObjects[TABLE_NAMES.upschool_teacher_info] = putReqs;

                const req = {
                    RequestItems: ItemsObjects
                }

                await docClient.batchWrite(req).promise();
                console.log("After Teacher Details Updation")
                callback(0, 200);
            }
        });
    } else {
        callback(0, 200);
    }

}
