const constant = require('../constants/constant');

const scanData = (docClient, params, callback) => {
    docClient.scan(params, (err, data) => {
        if (err) {
            console.log(err);
            callback(err, data);
        } else {
            callback(err, data);
        }
    });
};

const queryData = (docClient, params, callback) => {
    queryWithPagination(docClient, params, (err, data) => {
        if (err) {
            console.log(err);
            callback(err, data);
        } else {
            callback(err, data);
        }
    });
};

const putData = (docClient, params, callback) => {
    docClient.put(params, (err, data) => {
        if (err) {
            console.log(err);
            callback(err, data);
        } else {
            callback(0, 200);
        }
    });
};

const updateData = (docClient, params, callback) => {
    docClient.update(params, (err, data) => {
        if (err) {
            callback(err, data);
        } else {
            callback(0, 200);
        }
    });
};

const deleteData = (docClient, params, callback) => {
    docClient.delete(params, (err, data) => {
        if (err) {
            console.log(err);
            callback(err, data);
        } else {
            callback(0, 200);
        }
    });
};
const deleteMultiData = (docClient, params, callback) => {
    docClient.delete(params, (err, data) => {
        if (err) {
            console.log(err);
            callback(err, data);
        } else {
            // callback(0, 200);
        }
    });
};

let datapack = {
    Items: []
}; 
const queryAllData = async (docClient, params, callback) => {
    const itemsAll = [];

    docClient.query(params, async (err, data) => {
        if (err) {
            console.log(err);
            callback(err, data);
        } else {
            data.Items.forEach(element => { 
                datapack.Items.push(element); 
            }); 
            if (data.LastEvaluatedKey != "undefined" && data.LastEvaluatedKey != undefined) {
                console.log("Scanning for more..."); 
                params.ExclusiveStartKey = data.LastEvaluatedKey; 
                queryAllData(docClient, params, callback); 
            }else{ 
                let response = datapack;
                datapack={
                    Items: []
                };
                callback(err, response);
            }
        }
    });

};

const queryWithPagination = async (docClient, params, callback) => {
    const results = [];
 
    while (true) {
        try {
            const data = await docClient.query(params).promise();
            results.push(...data.Items); 

            if (!data.LastEvaluatedKey) {
                break;
            }

            params.ExclusiveStartKey = data.LastEvaluatedKey;

        } catch (error) {
            console.error('Error querying with pagination:', error);
            console.log(error);
            callback(error, 0);
        }
    }

    callback(0, { Items: results });
};

const queryWithPaginationAndLastkey = async (request, docClient, params, callback) => {
    const results = [];
    while (true) {
        try {
            const data = await docClient.query(params).promise();
            console.log("data : ", data);
            
            results.push(...data.Items);
            if (data.LastEvaluatedKey === "undefined" || data.LastEvaluatedKey === undefined) {
                break;
            }
            params.ExclusiveStartKey = data.LastEvaluatedKey;
        } catch (error) {
            console.error('Error querying with pagination:', error);
            console.log(error);
            callback(error, 0);
        }
    }
    
    console.log("results.length : ", results.length);
    let lastkeys = [
        {
            common_id: constant.constValues.common_id, 
            lastKey : null
        }
    ]; 
    let pageSize = Number(request.data.page_size); 

    if(results.length > 0){
        let finalResults = results.slice(0,Number(request.data.page_size));
        console.log("finalResults.length : ", finalResults.length);

        switch (request.data.user) {
            case constant.users.Teacher:

                for (let i = 0; i < results.length; i += pageSize) {
                    i !== 0 && 
                    lastkeys.push({                       
                        teacher_id: results[i-1].teacher_id, 
                        common_id: constant.constValues.common_id
                    }); 
                }
                break;
            case constant.users.Parent:
                for (let i = 0; i < results.length; i += pageSize) {
                    i !== 0 && 
                    lastkeys.push({
                        parent_id: results[i-1].parent_id, 
                        common_id: constant.constValues.common_id
                    }); 
                }
                break;
            case constant.users.Student: 
                for (let i = 0; i < results.length; i += pageSize) {
                    i !== 0 && 
                    lastkeys.push({
                        student_id: results[i-1].student_id, 
                        common_id: constant.constValues.common_id
                    }); 
                }
                break;
            default:
                break;
        }
        let Response = request.data.start_key === null ? { Items:  finalResults, lastKey: lastkeys, pagesCount: lastkeys.length } : { Items:  finalResults };
    
        callback(0, Response);  
    }else{
        callback(0, { Items: [], lastKey: [] });  
    }
};

exports.DATABASE_TABLE = {
    scanRecord: scanData,
    queryRecord: queryData,
    queryAllRecord: queryAllData,
    putRecord: putData,
    updateRecord: updateData,
    deleteRecord: deleteData,
    deleteMultiRecord: deleteMultiData,
    queryWithPaginationAndLastkey: queryWithPaginationAndLastkey,
    
}