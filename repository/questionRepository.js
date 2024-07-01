const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.fetchPreorPostQuestionsBasedOnStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Question Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_question_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "question_status = :question_status AND question_active_status = :question_active_status AND appears_in = :appears_in",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":question_status": request.data.question_status,
                    ":question_active_status": request.data.question_active_status,
                    ":appears_in": "preOrPost",
                },
                ProjectionExpression: ["question_id", "created_ts", "question_active_status", "question_status", "question_type", "updated_ts", "question_label", "appears_in", "difficulty_level"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.fetchworksheetOrTestQuestionsBasedOnStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Question Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_question_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "question_status = :question_status AND question_active_status = :question_active_status AND appears_in = :appears_in",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":question_status": request.data.question_status,
                    ":question_active_status": request.data.question_active_status,
                    ":appears_in": "worksheetOrTest",
                },
                ProjectionExpression: ["question_id", "created_ts", "question_active_status", "question_status", "question_type", "updated_ts", "question_label", "appears_in", "difficulty_level"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.fetchAllQuestionsBasedonStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Question Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_question_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "question_status = :question_status AND question_active_status = :question_active_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":question_status": request.data.question_status,
                    ":question_active_status": request.data.question_active_status,
                },
                ProjectionExpression: ["question_id", "created_ts", "question_active_status", "question_status", "question_type", "updated_ts", "question_label", "appears_in", "difficulty_level"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.insertnewQuestion = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Question Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let insert_standard_params = {
                TableName: TABLE_NAMES.upschool_question_table,
               
                Item: {
                    "question_id": helper.getRandomString(), 
                    "question_type": request.data.question_type, 
                    "question_voice_note": request.data.question_voice_note, 
                    "question_content": request.data.question_content,
                    "answers_of_question": request.data.answers_of_question,
                    "question_status": request.data.question_status,
                    "show_math_keyboard": request.data.show_math_keyboard,
                    "question_disclaimer": request.data.question_disclaimer,
                    "display_answer": request.data.display_answer,
                    "appears_in": request.data.appears_in,
                    "marks": request.data.marks,
                    "question_source": request.data.question_source,
                    "cognitive_skill": request.data.cognitive_skill,
                    "answer_explanation": request.data.answer_explanation,
                    "question_label" : request.data.question_label.trim(),
                    "lc_question_label" : request.data.question_label.toLowerCase().replace(/ /g,''),
                    "question_category" : request.data.question_category,
                    "difficulty_level" : request.data.difficulty_level,
                    "question_active_status": 'Active',
                    "common_id": constant.constValues.common_id,                    
                    "created_ts": helper.getCurrentTimestamp(), 
                    "updated_ts": helper.getCurrentTimestamp(), 
                }
            }

            DATABASE_TABLE.putRecord(docClient, insert_standard_params, callback);
        }
    });
}

exports.fetchQuestionById = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Question Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_question_table,
                KeyConditionExpression: "question_id = :question_id",
                ExpressionAttributeValues: {
                    ":question_id": request.data.question_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.editQuestion = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Question Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;            

            let update_params = {
                TableName: TABLE_NAMES.upschool_question_table,
                Key: {
                    "question_id": request.data.question_id
                }, 
              
                UpdateExpression: "set question_type = :question_type, question_voice_note = :question_voice_note, question_content = :question_content, answers_of_question = :answers_of_question, question_status = :question_status, updated_ts = :updated_ts, show_math_keyboard = :show_math_keyboard, question_disclaimer = :question_disclaimer, question_label = :question_label, lc_question_label = :lc_question_label, question_category = :question_category, display_answer = :display_answer, appears_in = :appears_in, marks = :marks, question_source = :question_source, cognitive_skill = :cognitive_skill, answer_explanation = :answer_explanation, difficulty_level = :difficulty_level",
                ExpressionAttributeValues: {
                    ":question_type": request.data.question_type, 
                    ":question_voice_note": request.data.question_voice_note, 
                    ":question_content": request.data.question_content, 
                    ":answers_of_question": request.data.answers_of_question,
                    ":question_status": request.data.question_status,
                    ":show_math_keyboard": request.data.show_math_keyboard,
                    ":question_disclaimer": request.data.question_disclaimer,
                    ":question_label" : request.data.question_label.trim(),
                    ":lc_question_label" : request.data.question_label.toLowerCase().replace(/ /g,''),
                    ":question_category" : request.data.question_category,
                    ":display_answer" : request.data.display_answer,
                    ":appears_in" : request.data.appears_in,
                    ":marks" : request.data.marks,
                    ":question_source" : request.data.question_source,
                    ":cognitive_skill" : request.data.cognitive_skill,
                    ":answer_explanation" : request.data.answer_explanation,
                    ":difficulty_level" : request.data.difficulty_level,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.toggleQuestionStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Question Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let toggle_params = {
                TableName: TABLE_NAMES.upschool_question_table,
                Key: {
                    "question_id": request.data.question_id
                },
                UpdateExpression: "set question_active_status = :question_active_status, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":updated_ts": helper.getCurrentTimestamp(),
                    ":question_active_status": request.data.question_active_status
                },
            };
            DATABASE_TABLE.updateRecord(docClient, toggle_params, callback);
        }
    });
}

exports.fetchQuestionByLabel = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Question Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_question_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "lc_question_label = :lc_question_label",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":lc_question_label": request.data.question_label.toLowerCase().replace(/ /g,'')
                },
                ProjectionExpression: ["question_id", "created_ts", "question_active_status", "question_status", "question_type", "updated_ts", "question_label"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.fetchQuestionData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) { 
            console.log("Quesion Data Database Error");
            console.log(DBErr); 
            callback(500, constant.messages.DATABASE_ERROR);
        } else { 
            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {}; 
            let question_array = request.question_array; 

            if (question_array.length === 0) { 

                callback(400, constant.messages.NO_UNITS_TO_TOGGLE); 

            } else if (question_array.length === 1){ 
                let read_params = { 
                    TableName: TABLE_NAMES.upschool_question_table,
                    KeyConditionExpression: "question_id = :question_id", 
                    ExpressionAttributeValues: {
                        ":question_id": question_array[0],
                    }, 
                }
    
                DATABASE_TABLE.queryRecord(docClient, read_params, callback);

            } else { 
                console.log("Else");
                question_array.forEach((element, index) => { 
                    if(index < question_array.length-1){ 
                        FilterExpressionDynamic = FilterExpressionDynamic + "(question_id = :question_id"+ index +") OR "
                        ExpressionAttributeValuesDynamic[':question_id'+ index] = element + '' 
                    } else{
                        FilterExpressionDynamic = FilterExpressionDynamic + "(question_id = :question_id"+ index +")"
                        ExpressionAttributeValuesDynamic[':question_id'+ index] = element;
                    }
                }); 

                let read_params = {
                    TableName: TABLE_NAMES.upschool_question_table,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }
    
                DATABASE_TABLE.scanRecord(docClient, read_params, callback);
            }
        }
    });
}
exports.changeMultipleQuestionsStatus = async function (final_data, callback) {

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
                
                ItemsObjects[TABLE_NAMES.upschool_question_table] = putReqs; 

                const req = {
                    RequestItems: ItemsObjects
                }
    
                await docClient.batchWrite(req).promise();
                    console.log("After Question insertion")
                    callback(0, 200);
            }
        });
    }else{
        callback(0, 200); 
    }
    
}

