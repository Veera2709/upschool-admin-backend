const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const { successResponse } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');


// Topic : 
exports.insertTopic = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.TOPIC_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.TOPIC_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let insert_topic_params = {
                TableName: TABLE_NAMES.upschool_topic_table,
                Item: {
                    "topic_id": helper.getRandomString(),
                    "topic_title": request.data.topic_title,
                    "lc_topic_title": request.data.topic_title.toLowerCase().replace(/ /g,''),
                    "topic_description": request.data.topic_description,
                    "topic_concept_id": request.data.topic_concept_id,
                    "pre_post_learning": request.data.pre_post_learning,
                    "related_topics": request.data.related_topics,
                    "common_id": constant.constValues.common_id,
                    // "Level_1": request.data.Level_1,
                    // "Level_2": request.data.Level_2,
                    // "Level_3": request.data.Level_3 === undefined || request.data.Level_3 === "" ? "" : request.data.Level_3, 
                    "topic_quiz_config": request.data.topic_quiz_config,
                    "display_name": request.data.display_name,
                    "topic_status": "Active",
                    "topic_created_ts": helper.getCurrentTimestamp(),
                    "topic_updated_ts": helper.getCurrentTimestamp(),
                }
            }

            DATABASE_TABLE.putRecord(docClient, insert_topic_params, callback);
        }
    });
}
exports.fetchTopicDataByTitle = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.TOPIC_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.TOPIC_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_topic_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "lc_topic_title = :lc_topic_title",
                ExpressionAttributeValues: {
                    ":lc_topic_title": request.data.topic_title.toLowerCase().replace(/ /g,''), 
                    ":common_id": constant.constValues.common_id,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchTopicDataByStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.TOPIC_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.TOPIC_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_topic_table,

                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "topic_status = :topic_status",
                ExpressionAttributeValues: {
                    ":topic_status": request.data.topic_status, 
                    ":common_id": constant.constValues.common_id,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchTopicByID = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.TOPIC_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.TOPIC_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_topic_table,

                KeyConditionExpression: "topic_id = :topic_id",
                ExpressionAttributeValues: {
                    ":topic_id": request.data.topic_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.updateTopic = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.TOPIC_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.TOPIC_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_topic_table,
                Key: {
                    "topic_id": request.data.topic_id
                },
                
                UpdateExpression: "set topic_title = :topic_title, lc_topic_title = :lc_topic_title, topic_description = :topic_description, topic_concept_id = :topic_concept_id, pre_post_learning = :pre_post_learning, related_topics = :related_topics, display_name = :display_name, topic_updated_ts = :topic_updated_ts",
                // Level_1 = :Level_1, Level_2 = :Level_2, Level_3 = :Level_3, 
                ExpressionAttributeValues: {

                    ":topic_title": request.data.topic_title,
                    ":lc_topic_title": request.data.topic_title.toLowerCase().replace(/ /g,''),
                    ":topic_description": request.data.topic_description,
                    ":topic_concept_id": request.data.topic_concept_id,
                    ":pre_post_learning": request.data.pre_post_learning,
                    ":related_topics": request.data.related_topics,
                    // ":Level_1": request.data.Level_1,
                    // ":Level_2": request.data.Level_2,
                    // ":Level_3": request.data.Level_3 === undefined || request.data.Level_3 === "undefined" ? "" : request.data.Level_3, 
                    ":display_name": request.data.display_name, 
                    ":topic_updated_ts": helper.getCurrentTimestamp(), 
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.removeMultiTopic = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.TOPIC_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.TOPIC_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;
            let topicDArray = request.data.topic_id;

            console.log("topicDArray : ", topicDArray);

            function loop(i) {
                if (i < topicDArray.length) {
                      console.log("topicDArray[i] : ", topicDArray[i]);

                    let delete_params = {
                        TableName: TABLE_NAMES.upschool_topic_table,
                        Key: {
                            "topic_id": topicDArray[i]
                        }
                    }
        
                    topicDArray[i] === '' || topicDArray[i] === null || topicDArray[i] === undefined ?  callback(400, constant.messages.NO_TOPIC_TO_DELETE) : DATABASE_TABLE.deleteMultiRecord(docClient, delete_params, callback);
                    
                    i++;
                    loop(i);
                }else{
                
                    (i === 0) ? callback(400, constant.messages.NO_TOPIC_TO_DELETE) : callback(0, 200);

                }

            }
            loop(0);
        }
    });
}
exports.changeTopicStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.TOPIC_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.TOPIC_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let delete_params = {
                TableName: TABLE_NAMES.upschool_topic_table,
                Key: {
                    "topic_id": request.data.topic_id
                },
                UpdateExpression: "set topic_status = :topic_status, topic_updated_ts = :topic_updated_ts",
                ExpressionAttributeValues: {
            
                    ":topic_updated_ts": helper.getCurrentTimestamp(),
                    ":topic_status": request.data.topic_status
                },
            };
            DATABASE_TABLE.updateRecord(docClient, delete_params, callback);
        }
    });
}
exports.getTopicsBasedonStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.TOPIC_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.TOPIC_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_topic_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "topic_status = :topic_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":topic_status": request.data.topic_status
                },

                // ProjectionExpression: ["topic_id", "topic_title", "topic_description", "topic_concept_id", "topic_status", "topic_updated_ts"], 

            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchPreLearningTopicsList = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.TOPIC_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.TOPIC_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_topic_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "pre_post_learning = :pre_post_learning AND topic_status = :topic_status",
                ExpressionAttributeValues: { 
                    ":common_id": constant.constValues.common_id,
                    ":pre_post_learning": "Pre-Learning",
                    ":topic_status": request.data.topic_status
                },
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}

exports.fetchPostLearningTopicsList = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.TOPIC_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.TOPIC_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_topic_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "pre_post_learning = :pre_post_learning AND topic_status = :topic_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":pre_post_learning": "Post-Learning",
                    ":topic_status": request.data.topic_status
                },
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
