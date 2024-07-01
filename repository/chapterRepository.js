const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const { successResponse } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.insertChapter = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.CHAPTER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.CHAPTER_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let insert_chapter_params = {
                TableName: TABLE_NAMES.upschool_chapter_table,
                Item: {
                    "chapter_id": helper.getRandomString(),
                    "chapter_description": request.data.chapter_description,
                    "prelearning_topic_id": request.data.prelearning_topic_id,
                    "postlearning_topic_id": request.data.postlearning_topic_id,
                    "lc_chapter_title": request.data.chapter_title.toLowerCase().replace(/ /g,''),
                    "chapter_title": request.data.chapter_title,
                    // "is_locked": request.data.is_locked,
                    "chapter_status": "Active",
                    "display_name": request.data.display_name,
                    "common_id": constant.constValues.common_id,
                    "chapter_created_ts": helper.getCurrentTimestamp(),
                    "chapter_updated_ts": helper.getCurrentTimestamp(),
                }
            }
            DATABASE_TABLE.putRecord(docClient, insert_chapter_params, callback);
        }
    });
}

exports.fetchChapterDataByName = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.CHAPTER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.CHAPTER_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_chapter_table,

                IndexName: indexName.Indexes.lc_chapter_title_index,
                KeyConditionExpression: "lc_chapter_title = :lc_chapter_title",
                ExpressionAttributeValues: {
                    ":lc_chapter_title": request.data.chapter_title.toLowerCase().replace(/ /g,''),
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchChapterByID = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.CHAPTER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.CHAPTER_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_chapter_table,

                KeyConditionExpression: "chapter_id = :chapter_id",
                ExpressionAttributeValues: {
                    ":chapter_id": request.data.chapter_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.updateChapter = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.CHAPTER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.CHAPTER_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_chapter_table,
                Key: {
                    "chapter_id": request.data.chapter_id
                },
                UpdateExpression: "set prelearning_topic_id = :prelearning_topic_id, chapter_description = :chapter_description, postlearning_topic_id = :postlearning_topic_id, chapter_title = :chapter_title, lc_chapter_title = :lc_chapter_title, display_name = :display_name, chapter_updated_ts = :chapter_updated_ts",
                ExpressionAttributeValues: {
                    ":prelearning_topic_id": request.data.prelearning_topic_id,
                    ":chapter_description": request.data.chapter_description,
                    ":postlearning_topic_id": request.data.postlearning_topic_id,
                    ":lc_chapter_title": request.data.chapter_title.toLowerCase().replace(/ /g,''),
                    ":chapter_title": request.data.chapter_title,
                    ":display_name": request.data.display_name, 
                    ":chapter_updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.removeMultiChapter = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.CHAPTER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.CHAPTER_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;
            let chapterIDArray = request.data.chapter_id;

            function loop(i) {
                if (i < chapterIDArray.length) {

                    let delete_params = {
                        TableName: TABLE_NAMES.upschool_chapter_table,
                        Key: {
                            "chapter_id": chapterIDArray[i]
                        }
                    }
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

exports.changeChapterStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.CHAPTER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.CHAPTER_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let delete_params = {
                TableName: TABLE_NAMES.upschool_chapter_table,
                Key: {
                    "chapter_id": request.data.chapter_id
                },
                UpdateExpression: "set chapter_status = :chapter_status, chapter_updated_ts = :chapter_updated_ts",
                ExpressionAttributeValues: {
            
                    ":chapter_updated_ts": helper.getCurrentTimestamp(),
                    ":chapter_status": request.data.chapter_status
                },
            };
            DATABASE_TABLE.updateRecord(docClient, delete_params, callback);
        }
    });
}

exports.getChaptersBasedOnStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.CHAPTER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.CHAPTER_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_chapter_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "chapter_status = :chapter_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":chapter_status": request.data.chapter_status
                }
            }
            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.checkForExistence = function (chapter_id, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.CHAPTER_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.CHAPTER_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_chapter_table,

                KeyConditionExpression: "chapter_id = :chapter_id",
                ExpressionAttributeValues: {
                    ":chapter_id": chapter_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.fetchChapterData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) { 
            console.log("Chapter Data Database Error");
            console.log(DBErr); 
            callback(500, constant.messages.DATABASE_ERROR);
        } else { 
            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {}; 
            let chapter_array = request.chapter_array; 

            if (chapter_array.length === 0) { 

                callback(400, constant.messages.NO_CHAPTERS_TO_TOGGLE); 

            } else if (chapter_array.length === 1){ 
                let read_params = { 
                    TableName: TABLE_NAMES.upschool_chapter_table,
                    KeyConditionExpression: "chapter_id = :chapter_id", 
                    ExpressionAttributeValues: {
                        ":chapter_id": chapter_array[0],
                    }, 
                }
    
                DATABASE_TABLE.queryRecord(docClient, read_params, callback);

            } else { 
                console.log("Else");
                chapter_array.forEach((element, index) => { 
                    if(index < chapter_array.length-1){ 
                        FilterExpressionDynamic = FilterExpressionDynamic + "(chapter_id = :chapter_id"+ index +") OR "
                        ExpressionAttributeValuesDynamic[':chapter_id'+ index] = element + '' 
                    } else{
                        FilterExpressionDynamic = FilterExpressionDynamic + "(chapter_id = :chapter_id"+ index +")"
                        ExpressionAttributeValuesDynamic[':chapter_id'+ index] = element;
                    }
                }); 

                let read_params = {
                    TableName: TABLE_NAMES.upschool_chapter_table,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }
    
                DATABASE_TABLE.scanRecord(docClient, read_params, callback);

            }

        }
    });
}
exports.changeMultipleChaptersStatus = async function (final_data, callback) {

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
                
                ItemsObjects[TABLE_NAMES.upschool_chapter_table] = putReqs; 

                const req = {
                    RequestItems: ItemsObjects
                }
    
                await docClient.batchWrite(req).promise();
                    console.log("After Chapter insertion")
                    callback(0, 200);
            }
        });
    }else{
        callback(0, 200); 
    }
    
}