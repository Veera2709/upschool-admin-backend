const chapterServices = require("../services/chapterServices");

exports.addChapter = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    chapterServices.addChapter(request, function (topic_err, chapter_response) {
        if (topic_err) {
            res.status(topic_err).json(chapter_response);
        } else {
            console.log("Chapter Added Successfully");
            res.json(chapter_response);
        }
    });
};
exports.fetchIndividualChapter = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    chapterServices.fetchIndividualChapter(request, function (individual_chapter_err, individual_chapter_response) {
        if (individual_chapter_err) {
            res.status(individual_chapter_err).json(individual_chapter_response);
        } else {
            console.log("Chapter Fetched Successfully");
            res.json(individual_chapter_response);
        }
    });
};
exports.editChapter = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    chapterServices.editChapter(request, function (edit_chapter_err, edit_chapter_response) {
        if (edit_chapter_err) {
            res.status(edit_chapter_err).json(edit_chapter_response);
        } else {
            console.log("Chapter Edited Successfully");
            res.json(edit_chapter_response);
        }
    });
};
exports.toggleChapterStatus = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    chapterServices.toggleChapterStatus(request, function (delete_chapter_err, delete_chapter_response) {
        if (delete_chapter_err) {
            res.status(delete_chapter_err).json(delete_chapter_response);
        } else {
            console.log("Chapter Chnaged Status to "+ request.data.chapter_status +" Successfully");
            res.json(delete_chapter_response);
        }
    });
};
exports.fetchChaptersBasedonStatus = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    chapterServices.fetchChaptersBasedonStatus(request, function (fetch_all_chapter_err, fetch_all_chapter_response) {
        if (fetch_all_chapter_err) {
            res.status(fetch_all_chapter_err).json(fetch_all_chapter_response);
        } else {
            console.log("Fetch All Chapters Successfully");
            res.json(fetch_all_chapter_response);
        }
    });
};
exports.bulkToggleChapterStatus = (req, res, next) => {
    let request = req.body;
    request["token"] = req.header('Authorization');
    
    chapterServices.multiChapterToggleStatus(request, function (fetch_all_chapter_err, fetch_all_chapter_response) {
        if (fetch_all_chapter_err) {
            res.status(fetch_all_chapter_err).json(fetch_all_chapter_response);
        } else {
            console.log("Multiple Chapters toggled Status Successfully");
            res.json(fetch_all_chapter_response);
        }
    });
};