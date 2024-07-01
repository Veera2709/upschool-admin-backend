const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.fetchSubjectByName = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Subject Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_subject_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "lc_subject_title = :lc_subject_title",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":lc_subject_title": request.data.subject_title.toLowerCase().replace(/ /g,'')
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.insertSubject = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let insert_chapter_params = {
                TableName: TABLE_NAMES.upschool_subject_table,
                Item: {
                    "subject_id": helper.getRandomString(),
                    "subject_unit_id": request.data.subject_unit_id,
                    "subject_title": request.data.subject_title,
                    "lc_subject_title": request.data.subject_title.toLowerCase().replace(/ /g,''),
                    "subject_keyword": request.data.subject_keyword,                    
                    "related_subject": request.data.related_subject,
                    "subject_description": request.data.subject_description,
                    "subject_status": "Active",
                    "display_name": request.data.display_name,
                    "common_id": constant.constValues.common_id,
                    "created_ts": helper.getCurrentTimestamp(),
                    "updated_ts": helper.getCurrentTimestamp(),
                }
            }
            DATABASE_TABLE.putRecord(docClient, insert_chapter_params, callback);
        }
    });
}

exports.getSubjectBasedOnStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Subject Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_subject_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "subject_status = :subject_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":subject_status": request.data.subject_status
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.toggleSubjectStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Subject Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_subject_table,
                Key: {
                    "subject_id": request.data.subject_id
                },
                UpdateExpression: "set subject_status = :subject_status, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":subject_status": request.data.subject_status,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.fetchIdAndNameOfSubjects = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Subject Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_subject_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "subject_status = :subject_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":subject_status": "Active"
                },
                ProjectionExpression: ["subject_id", "subject_title"],
            }
            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.getSubjetById = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Subject Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_subject_table,
                KeyConditionExpression: "subject_id = :subject_id",
                ExpressionAttributeValues: {
                    ":subject_id": request.data.subject_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.updateSubject = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Subject Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_subject_table,
                Key: {
                    "subject_id": request.data.subject_id
                },
                UpdateExpression: "set subject_title = :subject_title, lc_subject_title = :lc_subject_title, subject_unit_id = :subject_unit_id, subject_keyword = :subject_keyword, related_subject = :related_subject, display_name = :display_name, subject_description = :subject_description, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":subject_title": request.data.subject_title,
                    ":lc_subject_title": request.data.subject_title.toLowerCase().replace(/ /g,''),
                    ":subject_unit_id": request.data.subject_unit_id,
                    ":subject_keyword": request.data.subject_keyword,
                    ":related_subject": request.data.related_subject,
                    ":display_name": request.data.display_name, 
                    ":subject_description": request.data.subject_description,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.fetchBulkSubjectData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Subject Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {};
            
            if(request.length === 1){ 
                let read_params = {
                    TableName: TABLE_NAMES.upschool_subject_table,
                    KeyConditionExpression: "subject_id = :subject_id",
                    FilterExpression: "subject_status = :subject_status",
                    ExpressionAttributeValues: {
                        ":subject_id": request[0],
                        ":subject_status": "Active",
                    }, 
                    ProjectionExpression: ["subject_id", "subject_title"],               
                }
                DATABASE_TABLE.queryRecord(docClient, read_params, callback);
            }
            else
            {                 
                request.forEach((element, index) => { 
                    if(index < request.length-1){ 
                        FilterExpressionDynamic = FilterExpressionDynamic + "(subject_id = :subject_id"+ index +" AND subject_status = :subject_status) OR "           
                        ExpressionAttributeValuesDynamic[':subject_id'+ index] = element + ''                  
                    } else{
                        FilterExpressionDynamic = FilterExpressionDynamic + "(subject_id = :subject_id"+ index +" AND subject_status = :subject_status)"
                        ExpressionAttributeValuesDynamic[':subject_id'+ index] = element;
                    }
                });
                ExpressionAttributeValuesDynamic[":subject_status"] = "Active"; 

                let read_params = {
                    TableName: TABLE_NAMES.upschool_subject_table,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                    ProjectionExpression: ["subject_id", "subject_title"],           
                }
                DATABASE_TABLE.scanRecord(docClient, read_params, callback);
            }
        }
    });
}