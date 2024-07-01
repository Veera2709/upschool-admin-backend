const groupServices = require("../services/groupServices");

exports.addGroups = (req, res, next) => {
    let request = req.body;
    groupServices.addNewGroup(request, function (addGroup_err, addGroup_response) {
        if (addGroup_err) {
            res.status(addGroup_err).json(addGroup_response);
        } else {
            console.log("Group Added Successfully");
            res.json(addGroup_response);
        }
    });
};

exports.fetchAllGroupsData = (req, res, next) => {
    let request = req.body;
    groupServices.getGoupDataByItsStatusTypes(request, function (fetchGroup_err, fetchGroup_response) {
        if (fetchGroup_err) {
            res.status(fetchGroup_err).json(fetchGroup_response);
        } else {
            console.log("Got groups data!");
            res.json(fetchGroup_response);
        }
    });
};

exports.toggleGroupStatus = (req, res, next) => {
    let request = req.body;
    groupServices.changeGroupStatus(request, function (groupStatus_err, groupStatus_response) {
        if (groupStatus_err) {
            res.status(groupStatus_err).json(groupStatus_response);
        } else {
            console.log("Group status changed!");
            res.json(groupStatus_response);
        }
    });
};

exports.fetchIndividualGroupData = (req, res, next) => {
    let request = req.body;
    groupServices.getIndividualGroupData(request, function (individualGroup_err, individualGroup_response) {
        if (individualGroup_err) {
            res.status(individualGroup_err).json(individualGroup_response);
        } else {
            console.log("Got group data!");
            res.json(individualGroup_response);
        }
    });
};

exports.editGroup = (req, res, next) => {
    let request = req.body;
    groupServices.updateGroupData(request, function (editGroup_err, editGroup_response) {
        if (editGroup_err) {
            res.status(editGroup_err).json(editGroup_response);
        } else {
            console.log("Group edited!");
            res.json(editGroup_response);
        }
    });
};

exports.fetchAllTypesOfGroups = (req, res, next) => {
    let request = req.body;
    groupServices.getAllTypesOfGroups(request, function (allTypeGroup_err, allTypeGroup_response) {
        if (allTypeGroup_err) {
            res.status(allTypeGroup_err).json(allTypeGroup_response);
        } else {
            console.log("Got group data!");
            res.json(allTypeGroup_response);
        }
    });
};

exports.bulkToggleGroupsStatus = (req, res, next) => {
    console.log("Bulk Toggle group Status");
    console.log(req.body);
    let request = req.body;
    groupServices.multiGroupsToggleStatus(request, function (bulkToggle_err, bulkToggle_response) {
        if (bulkToggle_err) {
            res.status(bulkToggle_err).json(bulkToggle_response);
        } else {
            console.log("Bulk group Update !");
            res.json(bulkToggle_response);
        }
    });
};