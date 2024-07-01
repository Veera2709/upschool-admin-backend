const topicServices = require("../services/topicServices");

// Topic : 
exports.addTopic = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    topicServices.addTopic(request, function (topic_err, topic_response) {
        if (topic_err) {
            res.status(topic_err).json(topic_response);
        } else {
            console.log("Topic Added Successfully");
            res.json(topic_response);
        }
    });
};
exports.fetchIndividualTopic = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    topicServices.fetchIndividualTopic(request, function (individual_topic_err, individual_topic_response) {
        if (individual_topic_err) {
            res.status(individual_topic_err).json(individual_topic_response);
        } else {
            console.log("Topic Fetched Successfully");
            res.json(individual_topic_response);
        }
    });
};
exports.editTopic = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    topicServices.editTopic(request, function (edit_topic_err, edit_topic_response) {
        if (edit_topic_err) {
            res.status(edit_topic_err).json(edit_topic_response);
        } else {
            console.log("Topic Edited Successfully");
            res.json(edit_topic_response);
        }
    });
};
exports.toggleTopicStatus = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    topicServices.toggleTopicStatus(request, function (delete_topic_err, delete_topic_response) {
        if (delete_topic_err) {
            res.status(delete_topic_err).json(delete_topic_response);
        } else {
            console.log("Topic Chanegd Status to "+ request.data.topic_status +" Successfully"); 
            res.json(delete_topic_response);
        }
    });
};
exports.fetchTopicsBasedonStatus = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    topicServices.fetchTopicsBasedonStatus(request, function (fetch_all_topic_err, fetch_all_topic_response) {
        if (fetch_all_topic_err) {
            res.status(fetch_all_topic_err).json(fetch_all_topic_response);
        } else {
            console.log("Fetch All topics Successfully");
            res.json(fetch_all_topic_response);
        }
    });
};

exports.fetchPreLearningTopics = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    topicServices.fetchPreLearningTopics(request, function (fetch_all_topic_err, fetch_all_topic_response) {
        if (fetch_all_topic_err) {
            res.status(fetch_all_topic_err).json(fetch_all_topic_response);
        } else {
            console.log("Fetch All PreLearning topics Successfully");
            res.json(fetch_all_topic_response);
        }
    });
};
exports.fetchPostLearningTopics = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    topicServices.fetchPostLearningTopics(request, function (fetch_all_topic_err, fetch_all_topic_response) {
        if (fetch_all_topic_err) {
            res.status(fetch_all_topic_err).json(fetch_all_topic_response);
        } else {
            console.log("Fetch All PostLearning topics Successfully");
            res.json(fetch_all_topic_response);
        }
    });
};

exports.bulkToggleTopicStatus = (req, res, next) => {
    let request = req.body;    
    topicServices.toggleBulkTopicStatus(request, function (bulkStatus_err, bulkStatus_response) {
        if (bulkStatus_err) {
            res.status(bulkStatus_err).json(bulkStatus_response);
        } else {
            console.log("Changed Bulk Topics Status!");
            res.json(bulkStatus_response);
        }
    });
};
