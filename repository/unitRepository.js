const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const { successResponse } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');


// Unit : 
exports.insertUnit = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UNIT_DATABASE_ERROR);
            console.log("DBErr", DBErr);
            callback(500, constant.messages.UNIT_DATABASE_ERROR)
        } else {

            let docClient = dynamoDBCall;

            let insert_unit_params = {
                TableName: TABLE_NAMES.upschool_unit_table,
                Item: {
                    "unit_id": helper.getRandomString(),
                    "unit_title": request.data.unit_title,
                    "lc_unit_title": request.data.unit_title.toLowerCase().replace(/ /g,''),
                    "unit_description": request.data.unit_description,
                    "unit_chapter_id": request.data.unit_chapter_id,
                    "unit_status": 'Active',
                    "display_name": request.data.display_name,
                    "common_id": constant.constValues.common_id,
                    "unit_created_ts": helper.getCurrentTimestamp(),
                    "unit_updated_ts": helper.getCurrentTimestamp(),
                }
            }
                DATABASE_TABLE.putRecord(docClient, insert_unit_params, callback);
        }
    });
}
exports.fetchUnitDataByTitle = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UNIT_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UNIT_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_unit_table,

                IndexName: indexName.Indexes.common_id_index,
               
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "lc_unit_title = :lc_unit_title",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":lc_unit_title": request.data.unit_title.toLowerCase().replace(/ /g,'')
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}
exports.fetchSingleUnit = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UNIT_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UNIT_DATABASE_ERROR)
        } else {
            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_unit_table,

                KeyConditionExpression: "unit_id = :unit_id",
                ExpressionAttributeValues: {
                    ":unit_id": request.data.unit_id
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.updateUnit = function (request, callback) {
    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UNIT_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UNIT_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let update_params = {
                TableName: TABLE_NAMES.upschool_unit_table,
                Key: {
                    "unit_id": request.data.unit_id
                },
                UpdateExpression: "set unit_title = :unit_title, lc_unit_title = :lc_unit_title, unit_description = :unit_description, unit_chapter_id = :unit_chapter_id, display_name = :display_name, unit_updated_ts = :unit_updated_ts",
                ExpressionAttributeValues: { 
                    ":unit_title": request.data.unit_title,
                    ":lc_unit_title": request.data.unit_title.toLowerCase().replace(/ /g,''),
                    ":unit_description": request.data.unit_description,
                    ":display_name": request.data.display_name, 
                    ":unit_chapter_id": request.data.unit_chapter_id,
                    ":unit_updated_ts": helper.getCurrentTimestamp(),
                },
            };

            DATABASE_TABLE.updateRecord(docClient, update_params, callback);
        }
    });
}

exports.removeMultiUnit = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UNIT_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UNIT_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;
            let unitDArray = request.data.unit_id;

            console.log("unitDArray : ", unitDArray);

            function loop(i) {
                if (i < unitDArray.length) {
                      console.log("unitDArray[i] : ", unitDArray[i]);

                    let delete_params = {
                        TableName: TABLE_NAMES.upschool_unit_table,
                        Key: {
                            "unit_id": unitDArray[i]
                        }
                    }
        
                    unitDArray[i] === '' || unitDArray[i] === null || unitDArray[i] === undefined ?  callback(400, constant.messages.NO_UNIT_TO_DELETE) : DATABASE_TABLE.deleteMultiRecord(docClient, delete_params, callback);
                    
                    i++;
                    loop(i);
                }else{
                    
                    (i === 0) ? callback(400, constant.messages.NO_UNIT_TO_DELETE) : callback(0, 200);

                }

            }
            loop(0);
        }
    });
}
exports.changeUnitStatus = function (request, callback) { 

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UNIT_DATABASE_ERROR);
            console.log(DBErr); 
            callback(500, constant.messages.UNIT_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let toggle_params = {
                TableName: TABLE_NAMES.upschool_unit_table,
                Key: {
                    "unit_id": request.data.unit_id
                },
                UpdateExpression: "set unit_status = :unit_status, unit_updated_ts = :unit_updated_ts",
                ExpressionAttributeValues: {
            
                    ":unit_updated_ts": helper.getCurrentTimestamp(),
                    ":unit_status": request.data.unit_status
                },
            };
            DATABASE_TABLE.updateRecord(docClient, toggle_params, callback);
        }
    });
}
exports.fetchIdAndNameOfUints = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UNIT_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UNIT_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_unit_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "unit_status = :unit_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":unit_status": "Active"
                },
                ProjectionExpression: ["unit_id", "unit_title"],
            }
            DATABASE_TABLE.queryRecord(docClient, read_params, callback);
        }
    });
}

exports.getUnitsBasedOnStatus = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.UNIT_DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.UNIT_DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let read_params = {
                TableName: TABLE_NAMES.upschool_unit_table,
                IndexName: indexName.Indexes.common_id_index,
                KeyConditionExpression: "common_id = :common_id",
                FilterExpression: "unit_status = :unit_status",
                ExpressionAttributeValues: {
                    ":common_id": constant.constValues.common_id,
                    ":unit_status": request.data.unit_status
                }
            }

            DATABASE_TABLE.queryRecord(docClient, read_params, callback);

        }
    });
}
exports.fetchUnitData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) { 
            console.log("Unit Data Database Error");
            console.log(DBErr); 
            callback(500, constant.messages.DATABASE_ERROR);
        } else { 
            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {}; 
            let unit_array = request.unit_array; 

            if (unit_array.length === 0) { 

                callback(400, constant.messages.NO_UNITS_TO_TOGGLE); 

            } else if (unit_array.length === 1){ 
                let read_params = { 
                    TableName: TABLE_NAMES.upschool_unit_table,
                    KeyConditionExpression: "unit_id = :unit_id", 
                    FilterExpression: "unit_status = :unit_status",
                    ExpressionAttributeValues: {
                        ":unit_id": unit_array[0],
                        ":unit_status": "Active",
                    }, 
                }
    
                DATABASE_TABLE.queryRecord(docClient, read_params, callback);

            } else { 
                console.log("Else");
                unit_array.forEach((element, index) => { 
                    if(index < unit_array.length-1){ 
                        FilterExpressionDynamic = FilterExpressionDynamic + "(unit_id = :unit_id"+ index +" AND unit_status = :unit_status) OR "
                        ExpressionAttributeValuesDynamic[':unit_id'+ index] = element + '' 
                    } else{
                        FilterExpressionDynamic = FilterExpressionDynamic + "(unit_id = :unit_id"+ index +" AND unit_status = :unit_status)"
                        ExpressionAttributeValuesDynamic[':unit_id'+ index] = element;
                    }
                }); 
                ExpressionAttributeValuesDynamic[":unit_status"] = "Active"; 

                let read_params = {
                    TableName: TABLE_NAMES.upschool_unit_table,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }
    
                DATABASE_TABLE.scanRecord(docClient, read_params, callback);
            }
        }
    });
}
exports.fetchUnitDataforMultiDelete = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) { 
            console.log("Unit Data Database Error");
            console.log(DBErr); 
            callback(500, constant.messages.DATABASE_ERROR);
        } else { 
            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {}; 
            let unit_array = request.unit_array; 

            if (unit_array.length === 0) { 

                callback(400, constant.messages.NO_UNITS_TO_TOGGLE); 

            } else if (unit_array.length === 1){ 
                let read_params = { 
                    TableName: TABLE_NAMES.upschool_unit_table,
                    KeyConditionExpression: "unit_id = :unit_id", 
                    FilterExpression: "unit_status = :unit_status",
                    ExpressionAttributeValues: {
                        ":unit_id": unit_array[0],
                        ":unit_status": request.unit_status === "Active" ? "Archived" : "Active",
                    }, 
                }
    
                DATABASE_TABLE.queryRecord(docClient, read_params, callback);

            } else { 
                console.log("Else");
                unit_array.forEach((element, index) => { 
                    if(index < unit_array.length-1){ 
                        FilterExpressionDynamic = FilterExpressionDynamic + "(unit_id = :unit_id"+ index +" AND unit_status = :unit_status) OR "
                        ExpressionAttributeValuesDynamic[':unit_id'+ index] = element + '' 
                    } else{
                        FilterExpressionDynamic = FilterExpressionDynamic + "(unit_id = :unit_id"+ index +" AND unit_status = :unit_status)"
                        ExpressionAttributeValuesDynamic[':unit_id'+ index] = element;
                    }
                });
                console.log("request.unit_status : ", request); 

                ExpressionAttributeValuesDynamic[":unit_status"] = request.unit_status === "Active" ? "Archived" : "Active"; 

                let read_params = {
                    TableName: TABLE_NAMES.upschool_unit_table,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }
    
                DATABASE_TABLE.scanRecord(docClient, read_params, callback);
            }
        }
    });
}
exports.changeMultipleUnitsStatus = async function (final_data, callback) {

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
                
                ItemsObjects[TABLE_NAMES.upschool_unit_table] = putReqs; 

                const req = {
                    RequestItems: ItemsObjects
                }
    
                await docClient.batchWrite(req).promise();
                    console.log("After Unit insertion")
                    callback(0, 200);
            }
        });
    }else{
        callback(0, 200); 
    }
    
}