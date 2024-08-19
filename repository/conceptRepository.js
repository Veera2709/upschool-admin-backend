const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.getConceptBasedOnStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Concept Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_concept_blocks_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "concept_status = :concept_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":concept_status": request.data.concept_status
                },
                ProjectionExpression: ["concept_id", "concept_title", "concept_digicard_id", "concept_group_id", "concept_question_id","updated_ts"],
                // ProjectionExpression: ["concept_id", "concept_title", "concept_digicard_id", "concept_group_id", "concept_question_id"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchConceptByName = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Concept Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_concept_blocks_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "lc_concept_title = :lc_concept_title",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":lc_concept_title": request.data.concept_title.toLowerCase().replace(/ /g,'')
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.insertConcept = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Concept Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let insert_client_params = {
                TableName: TABLE_NAMES.upschool_concept_blocks_table,
                Item: {
                    "concept_id": helper.getRandomString(),
                    "concept_title": request.data.concept_title,
                    "lc_concept_title": request.data.concept_title.toLowerCase().replace(/ /g,''),
                    "concept_digicard_id": request.data.concept_digicard_id,
                    "concept_group_id" : request.data.concept_group_id,
                    "concept_keywords": request.data.concept_keywords,
                    "related_concept": request.data.related_concept,
                    "concept_status": "Active",
                    "display_name": request.data.display_name, 
                    "common_id": constant.constValues.common_id,
                    "concept_question_id": request.data.concept_question_id, 
                    "created_ts": helper.getCurrentTimestamp(),
                    "updated_ts": helper.getCurrentTimestamp(),
                }
            }

            DATABASE_TABLE.putRecord(docClient, insert_client_params, callback);
        }
    });
}
exports.toggleConceptStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Concept Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_concept_blocks_table,
                Key: {
                    "concept_id": request.data.concept_id
                },
                UpdateExpression: "set concept_status = :concept_status, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":concept_status": request.data.concept_status,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.fetchIdAndNameOfConcepts = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Concept Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_concept_blocks_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "concept_status = :concept_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":concept_status": "Active"
                },
                ProjectionExpression: ["concept_id", "concept_title", "display_name"],
            }
            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.getIndividualConcept = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Concept Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_concept_blocks_table,
                KeyConditionExpression: "concept_id = :concept_id",
                ExpressionAttributeValues: {
                    ":concept_id": request.data.concept_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.updateConcept = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Concept Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_concept_blocks_table,
                Key: {
                    "concept_id": request.data.concept_id
                },
                UpdateExpression: "set concept_title = :concept_title, lc_concept_title = :lc_concept_title, concept_digicard_id = :concept_digicard_id, concept_keywords = :concept_keywords, related_concept = :related_concept, concept_group_id = :concept_group_id, display_name = :display_name, concept_question_id = :concept_question_id, updated_ts = :updated_ts",
                
                ExpressionAttributeValues: {
                    ":concept_title": request.data.concept_title,
                    ":lc_concept_title": request.data.concept_title.toLowerCase().replace(/ /g,''),
                    ":concept_digicard_id": request.data.concept_digicard_id,
                    ":concept_group_id" : request.data.concept_group_id,
                    ":concept_keywords": request.data.concept_keywords,
                    ":related_concept": request.data.related_concept,
                    ":display_name": request.data.display_name, 
                    ":concept_question_id": request.data.concept_question_id, 
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}
exports.fetchConceptData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) { 
            console.log("Unit Data Database Error");
            console.log(DBErr); 
            callback(500, constant.messages.DATABASE_ERROR);
        } else { 
            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {}; 
            let concept_array = request.concept_array; 

            if (concept_array.length === 0) { 

                callback(400, constant.messages.NO_CONCEPT_TO_TOGGLE); 

            } else if (concept_array.length === 1){ 
                let read_params = { 
                    TableName: TABLE_NAMES.upschool_concept_blocks_table,
                    KeyConditionExpression: "concept_id = :concept_id", 
                    ExpressionAttributeValues: {
                        ":concept_id": concept_array[0],
                    }, 
                }
    
                DATABASE_TABLE.queryRecord(docClient, read_params, callback);

            } else { 
                console.log("Else");
                concept_array.forEach((element, index) => { 
                    if(index < concept_array.length-1){ 
                        FilterExpressionDynamic = FilterExpressionDynamic + "(concept_id = :concept_id"+ index +") OR "
                        ExpressionAttributeValuesDynamic[':concept_id'+ index] = element + '' 
                    } else{
                        FilterExpressionDynamic = FilterExpressionDynamic + "(concept_id = :concept_id"+ index +")"
                        ExpressionAttributeValuesDynamic[':concept_id'+ index] = element;
                    }
                }); 

                let read_params = {
                    TableName: TABLE_NAMES.upschool_concept_blocks_table,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }
    
                DATABASE_TABLE.scanRecord(docClient, read_params, callback);

            }

        }
    });
}
exports.changeMultipleConceptsStatus = async function (final_data, callback) {

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
                
                ItemsObjects[TABLE_NAMES.upschool_concept_blocks_table] = putReqs; 

                const req = {
                    RequestItems: ItemsObjects
                }
    
                await docClient.batchWrite(req).promise();
                    console.log("After Concept Block insertion")
                    callback(0, 200);
            }
        });
    }else{
        callback(0, 200); 
    }
    
}