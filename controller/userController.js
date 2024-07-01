const userServices = require("../services/userServices");

exports.getUserBulkuploadUrl = (req, res, next) => {
    let request = req.body;
    userServices.getBulkUploadUrl(request, function (get_url_err, get_url_response) {
        if (get_url_err) {
            res.status(get_url_err).json(get_url_response);
        } else {
            console.log("Got Signed Url successfully");
            res.json(get_url_response);
        }
    });
};

exports.bulkUsersUpload = (req, res, next) => {
    let request = req.body;
    let reqToken = req.header('Authorization');
    userServices.usersbulkUpload(request, reqToken, function (bulk_upload_err, bulk_upload_response) {
        if (bulk_upload_err) {
            res.status(bulk_upload_err).json(bulk_upload_response);
        } else {
            console.log("all users inserted successfully");
            res.json(bulk_upload_response);
        }
    });
};

exports.fetchAllUsersData = (req, res, next) => {
    let request =  req.body;    
    userServices.getAllUsersData(request, function (get_all_user_err, get_all_user_response) {
        if (get_all_user_err) {
            res.status(get_all_user_err).json(get_all_user_response);
        } else {
            console.log("Got all users");
            res.json(get_all_user_response);
        }
    });
};

exports.fetchInactiveUsersData = (req, res, next) => {
    let request =  {data : {user_status : "Archived"}};   
    userServices.getAllUsersData(request, function (get_inactive_user_err, get_inactive_user_response) {
        if (get_inactive_user_err) {
            res.status(get_inactive_user_err).json(get_inactive_user_response);
        } else {
            console.log("Got all inactive users");
            res.json(get_inactive_user_response);
        }
    });
};

exports.fetchIndividualUserByRole = (req, res, next) => {
    console.log("Fetch Individual User");
    console.log(req.body);
    let request = req.body;
    userServices.getIndividualUser(request, function (fetch_user_err, fetch_user_response) {
        if (fetch_user_err) {
            res.status(fetch_user_err).json(fetch_user_response);
        } else {
            console.log("Got User Data !");
            res.json(fetch_user_response);
        }
    });
};

exports.updateUsersByRole = (req, res, next) => {
    console.log("Edit User");
    console.log(req.body);
    let request = req.body;
    userServices.editUserByRole(request, function (edit_user_err, edit_user_response) {
        if (edit_user_err) {
            res.status(edit_user_err).json(edit_user_response);
        } else {
            console.log("User Edited !");
            res.json(edit_user_response);
        }
    });
};

exports.toggleUserStatus = (req, res, next) => {
    console.log("Toggle User Status");
    console.log(req.body);
    let request = req.body;
    userServices.ChangeUserStatus(request, function (toggle_user_status_err, toggle_user_status_response) {
        if (toggle_user_status_err) {
            res.status(toggle_user_status_err).json(toggle_user_status_response);
        } else {
            console.log("User Status Changed !");
            res.json(toggle_user_status_response);
        }
    });
};

exports.addCMSUser = (req, res, next) => {
    console.log("request");
    let request = req.body;
    request["token"] = req.header('Authorization');
    userServices.addCMSUser(request, function (user_err, user_response) {
        if (user_err) {
            res.status(user_err).json(user_response);
        } else {
            console.log(" User Added Successfully - Controller");
            res.json(user_response); 
        }
    });
};

exports.bulkToggleUsersStatus = (req, res, next) => {
    console.log("Bulk Toggle User Status");
    console.log(req.body);
    let request = req.body;
    userServices.bulkUserStatusToggle(request, function (bulkToggle_err, bulkToggle_response) {
        if (bulkToggle_err) {
            res.status(bulkToggle_err).json(bulkToggle_response);
        } else {
            console.log("Bulk User Update !");
            res.json(bulkToggle_response);
        }
    });
};

exports.editCMSUser = (req, res, next) => {
    console.log("request");
    let request = req.body;
    request["token"] = req.header('Authorization');
    userServices.editCMSUser(request, function (user_err, user_response) {
        if (user_err) {
            res.status(user_err).json(user_response);
        } else {
            console.log(" User Edited Successfully - Controller");
            res.json(user_response); 
        }
    });
};
exports.fetchIndividualCMSUser = (req, res, next) => {
    let request = req.body;
    console.log("fetchIndividualUser request", request);
    request["token"] = req.header('Authorization');
    userServices.getIndividualCMSUser(request, function (user_err, user_response) {
        if (user_err) {
            res.status(user_err).json(user_response);
        } else {
            console.log(" Single User Fetched Successfully - Controller");
            res.json(user_response); 
        }
    });
};
exports.fetchActiveCMSUsers = (req, res, next) => {

    let request = req.body;
    console.log("fetchAllUsers request", request);
    request["token"] = req.header('Authorization');
    userServices.getActiveCMSUsers(request, function (user_err, user_response) {
        if (user_err) {
            res.status(user_err).json(user_response);
        } else {
            console.log(" Users Fetched Successfully - Controller");
            res.json(user_response); 
        }
    });
};
exports.fetchCMSUsersBasedonRoleStatus = (req, res, next) => {

    let request = req.body;
    console.log("fetchCMSUsersBasedonRoleStatus request", request);
    request["token"] = req.header('Authorization');
    userServices.getCMSUsersBasedonRoleStatus(request, function (user_err, user_response) {
        if (user_err) {
            res.status(user_err).json(user_response);
        } else {
            console.log(""+ request.data.user_type +"s Fetched Successfully");
            res.json(user_response); 
        }
    });
};
exports.toggleCMSUserStatus = (req, res, next) => {

    let request = req.body;
    console.log("toggleUserStatus request", request);
    request["token"] = req.header('Authorization');
    userServices.changeCMSUserStatus(request, function (change_user_status_err, change_user_status_response) {
        if (change_user_status_err) {
            res.status(change_user_status_err).json(change_user_status_response);
        } else {
            console.log(" User Status Changed Successfully - Controller");
            res.json(change_user_status_response); 
        }
    });
};
exports.bulkToggleCMSUserStatus = (req, res, next) => {

    let request = req.body;
    console.log("bulkToggleCMSUserStatus request", request);
    request["token"] = req.header('Authorization');
    userServices.multiToggleCMSUserStatus(request, function (change_user_status_err, change_user_status_response) {
        if (change_user_status_err) {
            res.status(change_user_status_err).json(change_user_status_response);
        } else {
            console.log("CMS Users Status Changed Successfully");
            res.json(change_user_status_response); 
        }
    });
};


exports.searchUsers = (req, res, next) => {

    let request = req.body;
    console.log("searchUsers request", request);
    request["token"] = req.header('Authorization');
    userServices.searchFilter(request, function (search_filter_err, search_filter_response) {
        if (search_filter_err) {
            res.status(search_filter_err).json(search_filter_response);
        } else {
            console.log("Result fetched Successfully");
            res.json(search_filter_response); 
        }
    });
};
exports.usersPagination = (req, res, next) => {

    let request = req.body;
    console.log("usersPagination request", request);
    request["token"] = req.header('Authorization');
    userServices.fetchPaginatedUsers(request, function (pagination_err, pagination_response) {
        if (pagination_err) {
            res.status(pagination_err).json(pagination_response);
        } else {
            console.log("Users fetched Successfully");
            res.json(pagination_response); 
        }
    });
};
