const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const { successResponse } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.getAllStudentsData = function (callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Fetch All Students");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_student_info,
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

exports.getActiveStudentsData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Fetch All Active Students");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_student_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "user_status = :user_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":user_status": request.data.user_status
                },
                ProjectionExpression: ["student_id", "school_id", "user_dob", "user_email", "user_firstname", "user_lastname", "user_role", "user_status", "updated_ts"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchStudentByRollNo = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Fetch Student By Roll No");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_student_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "class_id = :class_id AND section_id = :section_id AND roll_no = :roll_no",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":class_id": request.data.class_id,
                    ":section_id": request.data.section_id,
                    ":roll_no": request.data.roll_no.replace(/ /g,'')
                },
                ProjectionExpression: ["student_id", "school_id", "class_id", "user_email", "user_firstname", "user_lastname", "user_role", "user_status", "section_id", "roll_no"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.updateStudent = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("DB ERROR : Update Student");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_student_info,
                Key: {
                    "student_id": request.data.student_id
                },
                UpdateExpression: "set user_dob = :user_dob, user_firstname = :user_firstname, user_lastname = :user_lastname, user_role = :user_role, class_id = :class_id, parent_id = :parent_id, section_id = :section_id, school_id = :school_id, updated_ts = :updated_ts, roll_no = :roll_no",

                // user_email = :user_email, user_phone_no = :user_phone_no, 
                ExpressionAttributeValues: {
                    ":user_dob": { yyyy_mm_dd : request.data.user_dob, dd_mm_yyyy : helper.change_dd_mm_yyyy(request.data.user_dob)},
                    ":user_firstname": request.data.user_firstname,
                    ":user_lastname": request.data.user_lastname,
                    ":roll_no": request.data.roll_no.replace(/ /g,''),
                    // ":user_email": request.data.user_email.toLowerCase(),
                    // ":user_phone_no": request.data.user_phone_no,
                    ":user_role": request.data.user_role,
                    ":class_id": request.data.class_id,
                    ":parent_id": request.data.parent_id,
                    ":section_id": request.data.section_id,
                    ":school_id": request.data.school_id,
                    ":updated_ts": helper.getCurrentTimestamp()
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);

        }
    });
}

exports.changeStudentStatus = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("ERROR : Change Student Status");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_student_info,
                Key: {
                    "student_id": request.data.user_id
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
exports.getAllStudentsBasedonSchool = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Fetch All Active Students");
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

            if(request.data.school_status == "Active")
            {
                filterExp += " AND updated_ts = :updated_ts";
                attributeValues[":updated_ts"] = request.data.sch_archived_ts;
            }

            let read_params = {
                TableName: TABLE_NAMES.upschool_student_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: filterExp,
                ExpressionAttributeValues: attributeValues
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.changeMultiStudentsStatus = async function (final_data, callback) {

    if(final_data.length > 0){
        dynamoDbCon.getDB( async function (DBErr, dynamoDBCall) {
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
                
                ItemsObjects[TABLE_NAMES.upschool_student_info] = putReqs; 

                const req = {
                    RequestItems: ItemsObjects
                }
    
                await docClient.batchWrite(req).promise();
                    console.log("After Students Details Updation")
                    callback(0, 200);
            }
        });
    }else{
        callback(0, 200); 
    } 
}
exports.fetchAllStudentsList = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Students Database Error"); 
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_student_info,
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
