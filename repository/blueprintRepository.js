const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

// exports.fetchBluePrintsBasedonStatus = function (request, callback) {

//     console.log("Function")
//     dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
//         if (DBErr) {
//             console.log("Blue Print Database Error");
//             console.log(DBErr);
//             callback(500, constant.messages.DATABASE_ERROR)
//         } else {

//             let docClient = dynamoDBCall;

//             let read_params = {
//                 TableName: TABLE_NAMES.upschool_blueprint_table,
//                 IndexName: indexName.Indexes.common_id_index,
//                 KeyConditionExpression: "common_id = :common_id",
//                 FilterExpression: "blueprint_status = :blueprint_status AND blueprint_type = :blueprint_type",
//                 ExpressionAttributeValues: {
//                     ":common_id": constant.constValues.common_id,
//                     ":blueprint_status": request.data.blueprint_status,
//                     ":blueprint_type" : request.data.blueprint_type
//                 },
//                 ProjectionExpression: ["blueprint_id", "blueprint_name", "description", "test_duration"], 
//             }
//             DATABASE_TABLE.queryRecord(docClient, read_params, callback);
//         }
//     });
// }

exports.fetchBluePrintsBasedonStatus = function (request, callback) {
    console.log("Function");
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Blue Print Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {
            let docClient = dynamoDBCall;

            // Initialize the FilterExpression and ExpressionAttributeValues
            let filterExpression = "blueprint_status = :blueprint_status";
            let expressionAttributeValues = {
                ":common_id": constant.constValues.common_id,
                ":blueprint_status": request.data.blueprint_status
            };

            // Add blueprint_type to the FilterExpression and ExpressionAttributeValues if it's defined
            if (request.data.blueprint_type) {
                filterExpression += " AND blueprint_type = :blueprint_type";
                expressionAttributeValues[":blueprint_type"] = request.data.blueprint_type;
            }

            let read_params = {
                TableName: TABLE_NAMES.upschool_blueprint_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: filterExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ProjectionExpression: ["blueprint_id", "blueprint_name", "description", "test_duration","updated_ts"]
            };

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
};


exports.fetchBlueprintById = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_blueprint_table,

                KeyConditionExpression: "blueprint_id = :blueprint_id",
                ExpressionAttributeValues: {
                    ":blueprint_id": request.data.blueprint_id
                },
                ProjectionExpression: ["blueprint_id", "blueprint_name", "description", "test_duration", "display_name", "sections"], 
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.fetchBluePrintByName = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Group Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_blueprint_table,

                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "lc_blueprint_name = :lc_blueprint_name",
                ExpressionAttributeValues: {
                    ":lc_blueprint_name": request.data.blueprint_name.toLowerCase().replace(/ /g,''), 
                    ":common_id": constant.constValues.common_id,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.insertBluePrint = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let insert_blueprint_params = {
                TableName: TABLE_NAMES.upschool_blueprint_table,
                Item: {
                    "blueprint_id": helper.getRandomString(),
                    "description": request.data.description, 
                    "sections": request.data.sections,
                    "lc_blueprint_name": request.data.blueprint_name.toLowerCase().replace(/ /g,''),
                    "blueprint_name": request.data.blueprint_name,
                    "blueprint_type": request.data.blueprint_type,
                    "blueprint_status": "Active",
                    "display_name": request.data.display_name,
                    "test_duration": request.data.test_duration,
                    "common_id": constant.constValues.common_id,
                    "created_ts": helper.getCurrentTimestamp(),
                    "updated_ts": helper.getCurrentTimestamp(),
                }
            }
            DATABASE_TABLE.putRecord(docClient, insert_blueprint_params, callback);
        }
    });
}
exports.changeBluePrintStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let delete_params = {
                TableName: TABLE_NAMES.upschool_blueprint_table,
                Key: {
                    "blueprint_id": request.data.blueprint_id
                },
                UpdateExpression: "set blueprint_status = :blueprint_status, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
            
                    ":updated_ts": helper.getCurrentTimestamp(),
                    ":blueprint_status": request.data.blueprint_status
                },
            };
            DATABASE_TABLE.updateRecord(docClient, delete_params, callback);
        }
    });
}