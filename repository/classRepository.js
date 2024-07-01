const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.fetchAllUpschoolClass = function (callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("School Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_class_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "class_status = :class_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":class_status": "Active",
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.insertnewClass = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Class Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let insert_standard_params = {
                TableName: TABLE_NAMES.upschool_class_table,
                Item: {

                    "class_id": helper.getRandomString(), 
                    "class_name": request.data.class_name, 
                    "lc_class_name": request.data.class_name.toLowerCase().replace(/ /g,''), 
                    "class_subject_id": request.data.class_subject_id,
                    "common_id": constant.constValues.common_id,
                    "display_name": request.data.display_name,
                    "class_status": 'Active',
                    "created_ts": helper.getCurrentTimestamp(), 
                    "updated_ts": helper.getCurrentTimestamp(), 
                }
            }

            DATABASE_TABLE.putRecord(docClient, insert_standard_params, callback);
        }
    });
}

exports.fetchClassByName = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Class Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_class_table,

                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "lc_class_name = :lc_class_name",
                ExpressionAttributeValues: {
                    ":lc_class_name": request.data.class_name.toLowerCase().replace(/ /g,''), 
                    ":common_id": constant.constValues.common_id,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.getClassByStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Class Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_class_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "class_status = :class_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":class_status": request.data.class_status,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchClassById = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Class Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_class_table,

                KeyConditionExpression: "class_id = :class_id",
                ExpressionAttributeValues: {
                    ":class_id": request.data.class_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.editClass = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Class Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;             

            let update_params = {
                TableName: TABLE_NAMES.upschool_class_table,
                Key: {
                    "class_id": request.data.class_id
                },

                UpdateExpression: "set class_name = :class_name, lc_class_name = :lc_class_name, class_subject_id = :class_subject_id, display_name = :display_name, updated_ts = :updated_ts",
                ExpressionAttributeValues: { 
                    ":class_name": request.data.class_name,
                    ":lc_class_name": request.data.class_name.toLowerCase().replace(/ /g,''), 
                    ":display_name": request.data.display_name, 
                    ":class_subject_id": request.data.class_subject_id,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.removeMultiStandard = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.STANDARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.STANDARD_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;
            let standardDArray = request.data.standard_id;

            console.log("standardDArray : ", standardDArray);

            function loop(i) {
                if (i < standardDArray.length) {
                      console.log("standardDArray[i] : ", standardDArray[i]);

                    let delete_params = {
                        TableName: TABLE_NAMES.upschool_standard_table,
                        Key: {
                            "standard_id": standardDArray[i]
                        }
                    }

                    standardDArray[i] === '' || standardDArray[i] === null || standardDArray[i] === undefined ?  callback(400, constant.messages.NO_STANDARD_TO_DELETE) : DATABASE_TABLE.deleteMultiRecord(docClient, delete_params, callback);

                    i++;
                    loop(i);
                }else{
                    
                    (i === 0) ? callback(400, constant.messages.NO_standard_TO_DELETE) : callback(0, 200);

                }
            }
            loop(0);
        }
    });
}

exports.updateClassStatus = function (request, callback) { 

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Class Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let toggle_params = {
                TableName: TABLE_NAMES.upschool_class_table,
                Key: {
                    "class_id": request.data.class_id
                },
                UpdateExpression: "set class_status = :class_status, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":updated_ts": helper.getCurrentTimestamp(),
                    ":class_status": request.data.class_status
                },
            };
            DATABASE_TABLE.updateRecord(docClient, toggle_params, callback);
        }
    });
}

exports.getIndividualClientClassById = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Class Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_client_class_table,

                KeyConditionExpression: "client_class_id = :client_class_id",
                ExpressionAttributeValues: {
                    ":client_class_id": request.data.client_class_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}