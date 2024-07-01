const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.fetchSectionByClassIdAndName = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Section Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_section_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "client_class_id = :client_class_id AND lc_section_name = :lc_section_name AND school_id = :school_id",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":client_class_id": request.data.client_class_id,
                    ":school_id": request.data.school_id,
                    ":lc_section_name": request.data.section_name.toLowerCase().replace(/ /g,''),
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.insertNewSection = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Section Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let insert_standard_params = {
                TableName: TABLE_NAMES.upschool_section_table,
                Item: {
                    "section_id": helper.getRandomString(), 
                    "school_id": request.data.school_id, 
                    "section_name": request.data.section_name, 
                    "lc_section_name": request.data.section_name.toLowerCase().replace(/ /g,''),
                    "client_class_id": request.data.client_class_id,
                    "section_status": 'Active',
                    "common_id": constant.constValues.common_id,                    
                    "created_ts": helper.getCurrentTimestamp(), 
                    "updated_ts": helper.getCurrentTimestamp(), 
                }
            }

            DATABASE_TABLE.putRecord(docClient, insert_standard_params, callback);
        }
    });
}

exports.editSection = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Section Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;            

            let update_params = {
                TableName: TABLE_NAMES.upschool_section_table,
                Key: {
                    "section_id": request.data.section_id
                },
                UpdateExpression: "set lc_section_name = :lc_section_name, section_name = :section_name, client_class_id = :client_class_id, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":lc_section_name": request.data.section_name.toLowerCase().replace(/ /g,''),
                    ":section_name": request.data.section_name,
                    ":client_class_id": request.data.client_class_id,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.fetchAllSectionBySchoolId = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Section Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_section_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "school_id = :school_id",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":school_id": request.data.school_id,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.getSectionDetailsById = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Section Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_section_table,
                KeyConditionExpression: "section_id = :section_id",
                ExpressionAttributeValues: {
                    ":section_id": request.data.section_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchSectionByClientClassId = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Section Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_section_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "client_class_id = :client_class_id",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":client_class_id": request.data.client_class_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}