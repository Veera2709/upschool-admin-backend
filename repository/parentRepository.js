const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const { successResponse } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.getAllParentsData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Fetch All Parents");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_parent_info,
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

exports.getParentByPhoneAndSchoolId = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Get parent by phone and school ID");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_parent_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "school_id = :school_id AND user_phone_no = :user_phone_no",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":school_id": request.data.school_id,
                    ":user_phone_no": request.data.user_phone_no,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.getActiveParentsData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Fetch All Active Parents");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_parent_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "user_status = :user_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":user_status": request.data.user_status
                },
                // ProjectionExpression: ["parent_id", "school_id", "user_dob", "updated_ts"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.updateParent = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("DB ERROR : Update Parent");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_parent_info,
                Key: {
                    "parent_id": request.data.parent_id
                },
                UpdateExpression: "set school_id = :school_id, user_dob = :user_dob, user_email = :user_email, user_firstname = :user_firstname, user_lastname = :user_lastname, user_phone_no = :user_phone_no, user_role = :user_role, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":school_id": request.data.school_id,
                    ":user_dob": { yyyy_mm_dd : request.data.user_dob, dd_mm_yyyy : helper.change_dd_mm_yyyy(request.data.user_dob)},
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

exports.changeParentStatus = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("ERROR : change parent status");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_parent_info,
                Key: {
                    "parent_id": request.data.user_id
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

exports.getParentDetailsById = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("ERROR : change parent status");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_parent_info,
                KeyConditionExpression: "parent_id = :parent_id",
                ExpressionAttributeValues: {
                    ":parent_id": request.data.parent_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.getAllParentssBasedonSchool = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Database Error : Fetch All Parents");
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
                TableName: TABLE_NAMES.upschool_parent_info,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: filterExp,
                ExpressionAttributeValues: attributeValues
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.changeMultiParentsStatus = async function (final_data, callback) {

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
                
                ItemsObjects[TABLE_NAMES.upschool_parent_info] = putReqs; 

                const req = {
                    RequestItems: ItemsObjects
                }
    
                await docClient.batchWrite(req).promise();
                    console.log("After Parents Details Updation")
                    callback(0, 200);
            }
        });
    }else{
        callback(0, 200); 
    }
    
}