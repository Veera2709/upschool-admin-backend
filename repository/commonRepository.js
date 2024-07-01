const dynamoDbCon = require('../awsConfig');
const { TABLE_NAMES } = require('../constants/tables');
const indexName = require('../constants/indexes');
const { DATABASE_TABLE } = require('./baseRepository');
const { successResponse } = require('./baseRepository');
const helper = require('../helper/helper');
const constant = require('../constants/constant');

exports.fetchBulkData = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {
            let IdArray = request.IdArray;
            let fetchIdName = request.fetchIdName;
            let TableName = request.TableName;

            let filterExpDynamic = fetchIdName + "= :"+ fetchIdName;
            let expAttributeVal = {};
            
            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {};
            
            if(IdArray.length === 1){   

                expAttributeVal[':'+fetchIdName] = IdArray[0];

                let read_params = {
                    TableName: TableName,
                    KeyConditionExpression: ""+fetchIdName+" = :"+fetchIdName+"",
                    ExpressionAttributeValues: expAttributeVal, 
                }

                console.log("READ PARAMS : ", read_params);

                DATABASE_TABLE.queryRecord(docClient, read_params, callback);
            }
            else
            {                 
                IdArray.forEach((element, index) => { 
                    if(index < IdArray.length-1){ 
                        FilterExpressionDynamic = FilterExpressionDynamic + filterExpDynamic + index +" OR "           
                        ExpressionAttributeValuesDynamic[':'+fetchIdName+''+ index] = element + ''                  
                    } else{
                        FilterExpressionDynamic = FilterExpressionDynamic + filterExpDynamic + index +""
                        ExpressionAttributeValuesDynamic[':'+fetchIdName+''+ index] = element;
                    }
                });
                let read_params = {
                    TableName: TableName,
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }
                DATABASE_TABLE.scanRecord(docClient, read_params, callback);
            }
        }
    });
}

exports.BulkInsert = function (final_data, userTable, callback) {

    if(final_data.length > 0)
    {
        dynamoDbCon.getDB(async function (DBErr, dynamoDBCall) {
            if (DBErr) {
                console.log(constant.messages.DATABASE_ERROR);
                console.log(DBErr);
                callback(500, constant.messages.DATABASE_ERROR);
            } else {
    
                let docClient = dynamoDBCall;            
    
                const putReqs = final_data.map(item => ({
                    PutRequest: {
                        Item: item
                    }
                }))
    
                let ItemsObjects = {};
                ItemsObjects[userTable] = putReqs;    
                
                const req = {
                    RequestItems: ItemsObjects
                }
                
                await docClient.batchWrite(req).promise();
                console.log("Bulk Data Added/Updated!")
                callback(0, 200);
            }
        });
    }
    else
    {
        callback(0, 200);
    }
}

exports.fetchBulkDataUsingIndex = function (request, callback) {

    dynamoDbCon.getDB(function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(constant.messages.DATABASE_ERROR);
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {
            let IdArray = request.IdArray;
            let fetchIdName = request.fetchIdName;
            let TableName = request.TableName;

            let filterExpDynamic = fetchIdName + "= :"+ fetchIdName;
            let expAttributeVal = {};
            
            let docClient = dynamoDBCall;
            let FilterExpressionDynamic = "";
            let ExpressionAttributeValuesDynamic = {};
            
            if (IdArray.length === 0) {
                console.log("EMPTY BULK ID");
                callback(0, { Items: [] });
            } 
            else if(IdArray.length === 1){   

                expAttributeVal[':'+fetchIdName] = IdArray[0];
                expAttributeVal[':common_id'] = constant.constValues.common_id;

                let read_params = {
                    TableName: TableName,
                    IndexName: indexName.Indexes.common_id_index,
                    KeyConditionExpression: "common_id = :common_id",
                    FilterExpression: ""+fetchIdName+" = :"+fetchIdName+"",
                    ExpressionAttributeValues: expAttributeVal, 
                }

                // console.log("READ PARAMS : ", read_params);

                DATABASE_TABLE.queryRecord(docClient, read_params, callback);
            }
            else
            {                 
                IdArray.forEach((element, index) => { 
                    if(index < IdArray.length-1){ 
                        FilterExpressionDynamic = FilterExpressionDynamic + filterExpDynamic + index +" OR "           
                        ExpressionAttributeValuesDynamic[':'+fetchIdName+''+ index] = element + ''                  
                    } else{
                        FilterExpressionDynamic = FilterExpressionDynamic + filterExpDynamic + index +""
                        ExpressionAttributeValuesDynamic[':'+fetchIdName+''+ index] = element;
                    }
                });
                ExpressionAttributeValuesDynamic[':common_id'] = constant.constValues.common_id;

                let read_params = {
                    TableName: TableName,
                    IndexName: indexName.Indexes.common_id_index,
                    KeyConditionExpression: "common_id = :common_id",
                    FilterExpression: FilterExpressionDynamic,
                    ExpressionAttributeValues: ExpressionAttributeValuesDynamic,
                }

                // console.log("READ PARAMS : ", read_params);

                DATABASE_TABLE.queryRecord(docClient, read_params, callback);
            }
        }
    });
}

exports.deleteDynamoDBData = function (request, callback) {

    dynamoDbCon.getDB(async function (DBErr, dynamoDBCall) {
        if (DBErr) {
            console.log(" Database Error");
            console.log(DBErr);
            callback(500, constant.messages.DATABASE_ERROR);
        } else {

            let docClient = dynamoDBCall;

            let scanParams = {
                TableName: request.data.table_name,
                ProjectionExpression: request.data.primary_key, // Replace with the primary key attribute(s) of your table
              };
          
              const params = {
                RequestItems: {
                }
            };
            
              do {
                const scanResult = await docClient.scan(scanParams).promise();

                const concurrencyLevel = 5; // Choose the number of parallel threads/processes

                const batches = chunkArray(scanResult.Items, 25); // Split items into batches of 25
                const promises = [];
                let tableName = request.data.table_name; 

                async function batchLoop(i){
                    if(i< batches.length){

                        const currentBatches = batches.slice(i, i + concurrencyLevel);

                        const batchPromises = await currentBatches.map(async (batch) => {
                            // Make BatchWriteItem request for each batch of items
    
                        params.RequestItems[tableName] = await batch.map((item) => ({
                            DeleteRequest: {
                                Key: item
                            }
                        }))
    
                        return await docClient.batchWrite(params).promise();
                        });
    
                        promises.push(...batchPromises);

                        scanParams.ExclusiveStartKey = scanResult.LastEvaluatedKey;

                        i += concurrencyLevel; 
                        batchLoop(i); 
                        
                    }else{
                        console.log("Done : ", i); 
                        await docClient.batchWrite(params).promise();
                    }
                }
                batchLoop(0); 

                // itemsToDelete.push(
                //   ...scanResult.Items.map((item) => ({
                //     DeleteRequest: {
                //       Key: item,
                //     },
                //   }))
                // );
          
                // scanParams.ExclusiveStartKey = scanResult.LastEvaluatedKey;
              } while (typeof scanParams.ExclusiveStartKey !== 'undefined');
              console.log('All items deleted.');

        }
    });
}

// Utility function to split array into chunks
function chunkArray(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }