const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const { successResponse } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');


exports.insertDigiCard = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DIGICARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DIGICARD_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let insert_digicard_params = {
                TableName: TABLE_NAMES.upschool_digi_card_table,
                Item: {
                    "digi_card_id": helper.getRandomString(),
                    "digi_card_excerpt": request.data.digi_card_excerpt === undefined ? "" : request.data.digi_card_excerpt,
                    "digi_card_content": request.data.digi_card_content === undefined ? "" : request.data.digi_card_content, 
                    "digi_card_files": request.data.digi_card_files,
                    "lc_digi_card_title": request.data.digi_card_title.toLowerCase().replace(/ /g,''),
                    "digi_card_title": request.data.digi_card_title,
                    "digicard_image": request.data.digicard_image,
                    "digicard_voice_note": request.data.digicard_voice_note === undefined ? "" : request.data.digicard_voice_note,
                    "digicard_document": request.data.digicard_document === undefined ? "" : request.data.digicard_document, 
                    "digi_card_keywords": request.data.digi_card_keywords,
                    "related_digi_cards": request.data.related_digi_cards,
                    "digicard_status": "Active",
                    "display_name": request.data.display_name,
                    "common_id": "61692656",
                    "digi_card_created_ts": helper.getCurrentTimestamp(),
                    "digi_card_updated_ts": helper.getCurrentTimestamp(),
                }
            }
            DATABASE_TABLE.putRecord(docClient, insert_digicard_params, callback);
        }
    });
}

exports.fetchDigicardDataByName = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DIGICARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DIGICARD_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_digi_card_table,

                IndexName: indexName.Indexes.lc_digi_card_title_index,
                KeyConditionExpression: "lc_digi_card_title = :lc_digi_card_title",
                ExpressionAttributeValues: {
                    ":lc_digi_card_title": request.data.digi_card_title.toLowerCase().replace(/ /g,''),
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.fetchDigiCardByID = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DIGICARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DIGICARD_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_digi_card_table,

                KeyConditionExpression: "digi_card_id = :digi_card_id",
                ExpressionAttributeValues: {
                    ":digi_card_id": request.data.digi_card_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.updateDigiCard = function (request, callback) {
    console.log("updateDigiCard : ", request);

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DIGICARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DIGICARD_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_digi_card_table,
                Key: {
                    "digi_card_id": request.data.digi_card_id
                },
                UpdateExpression: "set digi_card_content = :digi_card_content, digi_card_excerpt = :digi_card_excerpt, digi_card_files = :digi_card_files, digi_card_title = :digi_card_title, lc_digi_card_title = :lc_digi_card_title, digicard_image = :digicard_image, digicard_voice_note = :digicard_voice_note, digicard_document = :digicard_document, digi_card_keywords = :digi_card_keywords, display_name = :display_name, related_digi_cards = :related_digi_cards, digi_card_updated_ts = :digi_card_updated_ts",
                ExpressionAttributeValues: {
                    ":digi_card_content": request.data.digi_card_content === undefined ? "" : request.data.digi_card_content,
                    ":digi_card_excerpt": request.data.digi_card_excerpt === undefined ? "" : request.data.digi_card_excerpt,
                    ":digi_card_files": request.data.digi_card_files,
                    ":lc_digi_card_title": request.data.digi_card_title.toLowerCase().replace(/ /g,''),
                    ":digi_card_title": request.data.digi_card_title,
                    ":digicard_image": request.data.digicard_image,
                    ":digicard_voice_note": request.data.digicard_voice_note === undefined ? "" : request.data.digicard_voice_note,
                    ":digicard_document": request.data.digicard_document === undefined ? "" : request.data.digicard_document,
                    ":digi_card_keywords": request.data.digi_card_keywords,
                    ":display_name": request.data.display_name, 
                    ":related_digi_cards": request.data.related_digi_cards,
                    ":digi_card_updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.removeMultiDigiCard = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DIGICARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DIGICARD_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;
            let digicardIDArray = request.data.digi_card_id;

            function loop(i) {
                if (i < digicardIDArray.length) {

                    let delete_params = {
                        TableName: TABLE_NAMES.upschool_digi_card_table,
                        Key: {
                            "digi_card_id": digicardIDArray[i]
                        }
                    }
                    // digicardIDArray[i] === '' || digicardIDArray[i] === null || digicardIDArray[i] === undefined ? callback(400, constant.messages.NO_DIGICARD_TO_DELETE) : ;
                    DATABASE_TABLE.deleteMultiRecord(docClient, delete_params, callback);
                    i++;
                    loop(i);
                }else{

                    callback(0, 200);

                }

            }
            loop(0);
        }
    });
}

exports.changeDigiCardStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DIGICARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DIGICARD_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let delete_params = {
                TableName: TABLE_NAMES.upschool_digi_card_table,
                Key: {
                    "digi_card_id": request.data.digi_card_id
                },
                UpdateExpression: "set digicard_status = :digicard_status, digi_card_updated_ts = :digi_card_updated_ts",
                ExpressionAttributeValues: {
            
                    ":digi_card_updated_ts": helper.getCurrentTimestamp(),
                    ":digicard_status": request.data.digicard_status
                },
            };
            DATABASE_TABLE.updateRecord(docClient, delete_params, callback);
        }
    });
}
exports.changeMultipleDigiCardStatus = async function (final_data, callback) {

    if(final_data.length > 0){
        dynamoDbCon.getDB( async function (DBErr, dynamoDBCall) {
            if (DBErr) {
                console.log(constant.messages.DIGICARD_DATABASE_ERROR);
                console.log(DBErr);
                callback(500, constant.messages.DIGICARD_DATABASE_ERROR);
            } else {
    
                let docClient = dynamoDBCall;
                let ItemsObjects = {};
    
                const putReqs = final_data.map(item => ({
                    PutRequest: {
                        Item: item
                    }
                }))
                
                ItemsObjects[TABLE_NAMES.upschool_digi_card_table] = putReqs; 

                const req = {
                    RequestItems: ItemsObjects
                }
    
                await docClient.batchWrite(req).promise();
                    console.log("After DigiCard insertion")
                    callback(0, 200);
            }
        });
    }else{
        callback(0, 200); 
    }
    
}

exports.fetchDigiCardsListBasedonStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DIGICARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DIGICARD_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_digi_card_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "digicard_status = :digicard_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":digicard_status": request.data.digicard_status,
                },

                ProjectionExpression: ["digi_card_id", "digi_card_title", "digicard_image", "digicard_status", "digi_card_updated_ts"],
            }
            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.checkForExistence = function (digi_card_id, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DIGICARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DIGICARD_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_digi_card_table,

                KeyConditionExpression: "digi_card_id = :digi_card_id",
                ExpressionAttributeValues: {
                    ":digi_card_id": digi_card_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchIdAndNameOfDigicards = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DIGICARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DIGICARD_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_digi_card_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "digicard_status = :digicard_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":digicard_status": "Active"
                },
                ProjectionExpression: ["digi_card_id", "digi_card_title"],
            }
            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.fetchDigiCardData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) { 
            console.log("DigiCard Data Database Error");
            console.log(DBErr); 
            callback(500, constant.messages.DATABASE_ERROR);
        } else { 
            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {}; 
            let digi_card_array = request.digi_card_array; 

            if (digi_card_array.length === 0) { 

                callback(400, constant.messages.NO_RELATED_DIGICARDS); 

            } else if (digi_card_array.length === 1){ 
                let read_params = { 
                    TableName: TABLE_NAMES.upschool_digi_card_table,
                    KeyConditionExpression: "digi_card_id = :digi_card_id", 
                    // FilterExpression: "digicard_status = :digicard_status", 
                    ExpressionAttributeValues: {
                        ":digi_card_id": digi_card_array[0],
                        // ":digicard_status": "Active",
                    }, 
                }
    
                DATABASE_TABLE.queryRecord(docClient, read_params, callback);

            } else { 
                console.log("Else");
                digi_card_array.forEach((element, index) => { 
                    if(index < digi_card_array.length-1){ 
                        FilterExpressionDynamic = FilterExpressionDynamic + "(digi_card_id = :digi_card_id"+ index +") OR "
                        ExpressionAttributeValuesDynamic[':digi_card_id'+ index] = element + '' 
                    } else{
                        FilterExpressionDynamic = FilterExpressionDynamic + "(digi_card_id = :digi_card_id"+ index +")"
                        ExpressionAttributeValuesDynamic[':digi_card_id'+ index] = element;
                    }
                }); 
                // ExpressionAttributeValuesDynamic[':digicard_status'] = 'Active'

                let read_params = {
                    TableName: TABLE_NAMES.upschool_digi_card_table,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }
    
                DATABASE_TABLE.scanRecord(docClient, read_params, callback);

            }

        }
    });
}
exports.changeLockStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DIGICARD_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DIGICARD_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_digi_card_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "digicard_status = :digicard_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":digicard_status": "Active"
                },
                ProjectionExpression: ["digi_card_id", "digi_card_title"],
            }
            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}