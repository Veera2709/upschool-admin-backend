const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.fetchGroupBasedOnTypes = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Group Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_group_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "group_status = :group_status AND group_type = :group_type",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":group_status": request.data.group_status,
                    ":group_type": request.data.group_type,
                },
                ProjectionExpression: ["group_id", "group_name", "group_type", "updated_ts", "group_levels", "group_status","group_question_id","group_description", "display_name"],
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.fetchGroupBasedOnStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Group Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_group_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "group_status = :group_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":group_status": request.data.group_status
                }                
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.fetchGroupByName = function (request, callback) {
    console.log(request)
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Group Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_group_table,

                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "lc_group_name = :lc_group_name",
                ExpressionAttributeValues: {
                    ":lc_group_name": request.data.group_name.toLowerCase().replace(/ /g,''), 
                    ":common_id": constant.constValues.common_id,
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.insertnewGroup = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Group Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let insert_standard_params = {
                TableName: TABLE_NAMES.upschool_group_table,
                Item: {

                    "group_id": helper.getRandomString(), 
                    "group_name": request.data.group_name, 
                    "lc_group_name": request.data.group_name.toLowerCase().replace(/ /g,''), 
                    "group_type": request.data.group_type,
                    "group_status": 'Active',
                    "display_name": request.data.display_name,
                    "group_levels": request.data.group_levels,
                    "group_question_id": request.data.group_question_id,
                    "group_related_digicard": request.data.group_related_digicard,
                    "group_description":request.data.group_description,                    
                    "question_duration":request.data.question_duration,                    
                    "common_id": constant.constValues.common_id,                    
                    "created_ts": helper.getCurrentTimestamp(), 
                    "updated_ts": helper.getCurrentTimestamp(), 
                }
            }

            DATABASE_TABLE.putRecord(docClient, insert_standard_params, callback);
        }
    });
}

exports.fetchGroupById = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Group Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_group_table,
                KeyConditionExpression: "group_id = :group_id",
                ExpressionAttributeValues: {
                    ":group_id": request.data.group_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.toggleGroupStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Group Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let toggle_params = {
                TableName: TABLE_NAMES.upschool_group_table,
                Key: {
                    "group_id": request.data.group_id
                },
                UpdateExpression: "set group_status = :group_status, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":updated_ts": helper.getCurrentTimestamp(),
                    ":group_status": request.data.group_status
                },
            };
            DATABASE_TABLE.updateRecord(docClient, toggle_params, callback);
        }
    });
}

exports.editGroup = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log("Group Data Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;            
            let update_params = {
                TableName: TABLE_NAMES.upschool_group_table,
                Key: {
                    "group_id": request.data.group_id
                },
                UpdateExpression: "set group_name = :group_name, lc_group_name = :lc_group_name, group_type = :group_type, group_levels = :group_levels, group_question_id = :group_question_id, group_related_digicard = :group_related_digicard,group_description = :group_description,question_duration = :question_duration, display_name = :display_name, updated_ts = :updated_ts",
                ExpressionAttributeValues: {
                    ":group_name": request.data.group_name,
                    ":lc_group_name": request.data.group_name.toLowerCase().replace(/ /g,''), 
                    ":group_type": request.data.group_type,
                    ":group_levels": request.data.group_levels,
                    ":group_question_id": request.data.group_question_id,
                    ":group_description": request.data.group_description,
                    ":question_duration": request.data.question_duration,
                    ":subject_description": request.data.subject_description,
                    ":display_name": request.data.display_name,
                    ":group_related_digicard": request.data.group_related_digicard,
                    ":updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.changeMultipleGroupsStatus = async function (final_data, callback) {

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
                
                ItemsObjects[TABLE_NAMES.upschool_group_table] = putReqs; 

                const req = {
                    RequestItems: ItemsObjects
                }
    
                await docClient.batchWrite(req).promise();
                    console.log("After Group insertion")
                    callback(0, 200);
            }
        });
    }else{
        callback(0, 200); 
    }
    
}

exports.fetchGroupsData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) { 
            console.log("DigiCard Data Database Error");
            console.log(DBErr); 
            callback(500, constant.messages.DATABASE_ERROR);
        } else { 
            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {}; 
            let group_array = request.group_array; 

            if (group_array.length === 0) { 

                callback(400, constant.messages.NO_RELATED_DIGICARDS); 

            } else if (group_array.length === 1){ 
                let read_params = { 
                    TableName: TABLE_NAMES.upschool_group_table,
                    KeyConditionExpression: "group_id = :group_id", 
                    // FilterExpression: "digicard_status = :digicard_status", 
                    ExpressionAttributeValues: {
                        ":group_id": group_array[0],
                        // ":digicard_status": "Active",
                    }, 
                }
    
                DATABASE_TABLE.queryRecord(docClient, read_params, callback);

            } else { 
                console.log("Else");
                group_array.forEach((element, index) => { 
                    if(index < group_array.length-1){ 
                        FilterExpressionDynamic = FilterExpressionDynamic + "(group_id = :group_id"+ index +") OR "
                        ExpressionAttributeValuesDynamic[':group_id'+ index] = element + '' 
                    } else{
                        FilterExpressionDynamic = FilterExpressionDynamic + "(group_id = :group_id"+ index +")"
                        ExpressionAttributeValuesDynamic[':group_id'+ index] = element;
                    }
                }); 
                // ExpressionAttributeValuesDynamic[':digicard_status'] = 'Active'

                let read_params = {
                    TableName: TABLE_NAMES.upschool_group_table,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }
    
                DATABASE_TABLE.scanRecord(docClient, read_params, callback);

            }

        }
    });
}

exports.insertManyCases = function (final_data, callback) {

    if (final_data.length > 0) {
        dynamoDbCon.getDB(async function (DBErr, dynamoDBCall) {
            if (DBErr) {
                console.log("Cases Data Database Error");
                console.log(DBErr);
                callback(500, constant.messages.USER_DATA_DATABASE_ERROR);
            } else {

                let docClient = dynamoDBCall;

                const concurrencyLevel = 5; // Choose the number of parallel threads/processes

                const batches = chunkArray(final_data, 25); // Split items into batches of 25
                const promises = [];

                async function batchLoop(i) {
                    if (i < batches.length) {

                        const currentBatches = batches.slice(i, i + concurrencyLevel);
                        let tableName = '';

                        
                        tableName = TABLE_NAMES.upschool_group_table;
                              

                        const batchPromises = await currentBatches.map(async (batch) => {
                            // Make BatchWriteItem request for each batch of items

                            const params = {
                                RequestItems: {
                                }
                            };

                            params.RequestItems[tableName] = await batch.map((item) => ({
                                PutRequest: {
                                    Item: item
                                }
                            }))

                            return await docClient.batchWrite(params).promise();
                        });

                        promises.push(...batchPromises);

                        i += concurrencyLevel;
                        batchLoop(i);
                    } else {
                        await Promise.all(promises);
                        console.log('All items inserted.');
                        callback(0, 200);

                    }
                }
                batchLoop(0);
            }
        });
    }
    else {
        callback(0, 200);
    }
}
