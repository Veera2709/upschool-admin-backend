const uuid = require("uuidv4");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const dynamoDbCon = require('../awsConfig');

const excelEpoc = new Date(1900, 0, 0).getTime();
const msDay = 86400000;

exports.getCurrentTimestamp = () => new Date().toISOString();

exports.getRandomString = function () {
    let group_random_user_id = crypto.randomBytes(20).toString("hex");
    return uuid.fromString(group_random_user_id);
}
exports.getSignedURL = async function (Key) {

    console.log("getSignedURL Key : ", Key);

    let URL_EXPIRATION_SECONDS = 300;
    let s3Params = {
        Bucket: process.env.BUCKET_NAME,
        Key,
        Expires: URL_EXPIRATION_SECONDS,
    }
    let uploadURL = await dynamoDbCon.s3.getSignedUrlPromise('getObject', s3Params)
    console.log({ uploadURL });
    return uploadURL;
}
exports.getRandomOtp = function () {
    return Math.floor(100000 + Math.random() * 900000);
}

exports.getEncryptedPassword = function (password) {
    let encrypt_key = crypto.createCipher('aes-128-cbc', process.env.SECRET_KEY);
    let encrypted_password = encrypt_key.update(password, 'utf8', 'hex')
    encrypted_password += encrypt_key.final('hex');
    return encrypted_password;
}

exports.getDecryptedPassword = function (password) {
    let decrypt_key = crypto.createDecipher('aes-128-cbc', process.env.SECRET_KEY);
    let decrypted_password = decrypt_key.update(password, 'hex', 'utf8')
    decrypted_password += decrypt_key.final('utf8');
    return decrypted_password;
}

exports.getJwtToken = function (request) {
    return jwt.sign({ user_id: request.user_id, user_role: request.user_role }, process.env.SECRET_KEY)
}

exports.decodeJwtToken = function (token) {
    return jwt_decode(token);
}

exports.hashingPassword = function (hashReq) {
    let givenPassword = hashReq.salt + hashReq.password;
    let hashedPassword = crypto.createHash('sha256').update(givenPassword).digest('base64');
    return hashedPassword;
}

exports.change_dd_mm_yyyy = function (givenDate) {
    console.log("GIVEN DATE : ", givenDate);
    if (givenDate && givenDate != undefined && givenDate.replace(/ /g, '') != "" && givenDate.toString().includes('-')) {
        let splitedDate = givenDate.split("-");
        let dd_mm_yyyy = splitedDate[2] + "-" + splitedDate[1] + "-" + splitedDate[0];
        return dd_mm_yyyy;
    }
    else {
        return "00-00-0000";
    }
}

exports.checkEmpty = async function (rowVal) {
    return (rowVal && rowVal != undefined && rowVal.toString().replace(/ /g, '') != "" && rowVal != null && rowVal != "null" && rowVal != "undefined") === true ? true : false;
}

exports.validateRows = async function (sheetName, rowVal) {

    if (sheetName === "Parents") {
        return (await exports.checkEmpty(rowVal[0]) && await exports.checkEmpty(rowVal[1]) && await exports.checkEmpty(rowVal[2]) && await exports.checkEmpty(rowVal[3]) && await exports.checkEmpty(rowVal[4]) === true) ? true : false;
    }
    else if (sheetName === "Teachers") {
        return (await exports.checkEmpty(rowVal[0]) && await exports.checkEmpty(rowVal[1]) && await exports.checkEmpty(rowVal[2]) && await exports.checkEmpty(rowVal[3]) && await exports.checkEmpty(rowVal[4]) === true) ? true : false;
    }
    else if (sheetName === "Students") {
        return (await exports.checkEmpty(rowVal[0]) && await exports.checkEmpty(rowVal[1]) && await exports.checkEmpty(rowVal[2]) && await exports.checkEmpty(rowVal[3]) && await exports.checkEmpty(rowVal[4]) && await exports.checkEmpty(rowVal[5]) && await exports.checkEmpty(rowVal[6]) && await exports.checkEmpty(rowVal[7]) === true) ? true : false;
    }
    else {
        console.log("DEFAULT SHEET NAME");
        return false;
    }
}

exports.validateQuestionRows = async function (sheetName, rowVal) {
    if (sheetName === "Objective") {
        return (await Promise.all(rowVal.slice(0, 24).map(exports.checkEmpty))).every(val => val === true);
    }
    else if (sheetName === "Teachers") {
        return (await Promise.all(rowVal.slice(0, 13).map(exports.checkEmpty))).every(val => val === true);
    }
    else if (sheetName === "Subjective") {
        return (await Promise.all(rowVal.slice(0, 12).map(exports.checkEmpty))).every(val => val === true);
    } else {
        console.log("DEFAULT SHEET NAME");
        return false;
    }
}

exports.getS3SignedUrl = async function (fileKey) {

    let Key = fileKey;
    let URL_EXPIRATION_SECONDS = 600;

    // Get signed URL from S3
    let s3Params = {
        Bucket: process.env.BUCKET_NAME,
        Key,
        Expires: URL_EXPIRATION_SECONDS,
    }

    let signedS3URL = await dynamoDbCon.s3.getSignedUrlPromise('getObject', s3Params)
    console.log({ signedS3URL })

    return signedS3URL;
}

exports.PutObjectS3SigneUdrl = async function (requestFileName, folderName) {

    let file_type = requestFileName.split(".");
    let file_ext = '.' + file_type[file_type.length - 1];

    let URL_EXPIRATION_SECONDS = 300;
    let randomID = exports.getRandomString();
    let Key = `${folderName}/${randomID}` + file_ext;

    // Get signed URL from S3
    let s3Params = {
        Bucket: process.env.BUCKET_NAME,
        Key,
        Expires: URL_EXPIRATION_SECONDS,
        ContentType: exports.getMimeType(file_ext),
        ACL: 'public-read'
    }

    let uploadURL = await dynamoDbCon.s3.getSignedUrlPromise('putObject', s3Params);

    return { uploadURL: uploadURL, Key: Key };
}

exports.sortDataBasedOnTimestamp = function (j, data) {
    let orderedData = data;
    function getSortedData(i) {
        if (i < data.Items.length) {
            let today = new Date(data.Items[i].case_created_ts);
            let y = today.getFullYear();
            let m = today.getMonth() + 1;
            let newM = m < 12 ? '0' + m : m;
            let d = today.getDate();
            let newD = d < 10 ? '0' + d : d;
            let h = today.getHours();
            let newH = h < 10 ? '0' + h : h;
            let mt = today.getMinutes();
            let newMt = mt < 10 ? '0' + mt : mt;
            let sec = today.getSeconds();
            let newSec = sec < 10 ? '0' + sec : sec;
            let ts = y + "" + newM + "" + newD + "" + newH + "" + newMt + "" + newSec;
            let timeerds = parseInt(ts);
            data.Items[i].order_id = timeerds;
            i++;
            getSortedData(i);
        } else {
            data.Items.sort(function (a, b) {
                return b.order_id - a.order_id;
            });
            return orderedData;
        }
    }
    getSortedData(j);
    return orderedData;
}

exports.findDuplicatesInArrayOfObjects = function (reqArray, checkField) {
    console.log(reqArray);
    const lookup = reqArray.reduce((a, e) => {
        a[e[checkField]] = ++a[e[checkField]] || 0;
        return a;
    }, {});

    let duplicates = reqArray.filter(e => lookup[e[checkField]]);

    return duplicates;
}

exports.findDuplicateObjectwithSameKeyValue = function (reqArray, checkField) {
    let duplicateValue = [];
    let seen = new Set();
    let hasDuplicates = reqArray.some(function (currentObject) {
        let duplicateStatus = seen.size === seen.add(currentObject[checkField[0]] + currentObject[checkField[1]]).size;
        if (duplicateStatus === true) {
            console.log(duplicateStatus);
            duplicateValue.push(currentObject);
        }
    });

    return duplicateValue;
}

exports.getDifferenceBetweenTwoArrays = function (actualArr, checkArr, fieldCheck) {
    // A comparer used to determine if two entries are equal.
    const isSameUser = (actualArr, checkArr) => actualArr[fieldCheck[0]] === checkArr[fieldCheck[0]] && actualArr[fieldCheck[1]] === checkArr[fieldCheck[1]] && actualArr[fieldCheck[2]] === checkArr[fieldCheck[2]];

    // Get items that only occur in the left Arr,
    // using the compareFunction to determine equality.
    const onlyInLeft = (left, right, compareFunction) =>
        left.filter(leftValue =>
            !right.some(rightValue =>
                compareFunction(leftValue, rightValue)));

    const onlyInA = onlyInLeft(actualArr, checkArr, isSameUser);
    // const onlyInB = onlyInLeft(checkArr, actualArr, isSameUser);

    // const result = [...onlyInA, ...onlyInB];

    return onlyInA;
}

exports.concatTwoInfo = function (infoToReplace, infoDifference) {

    infoDifference.forEach(function (diffInfo) {
        infoToReplace.push({
            info_id: diffInfo.info_id,
            client_class_id: diffInfo.client_class_id,
            section_id: diffInfo.section_id,
            subject_id: diffInfo.subject_id,
            info_status: "Archived"
        });
    });

    return infoToReplace;
}

exports.strToLowercase = (str) => str.toLowerCase();

const isNullOrEmpty = (str) => !str;

exports.isNullOrEmpty = isNullOrEmpty;

exports.isEmptyObject = (val) => isNullOrEmpty(val) || (val && Object.keys(val).length === 0);

exports.isEmptyArray = (val) => val && !val.length;

const removeDuplicates = (arr) => [...new Set(arr)];

exports.removeDuplicates = removeDuplicates;

exports.reverse = (arr) => [...arr].reverse();

exports.extractValue = (arr, prop) => removeDuplicates(arr.map(item => item[prop]));

exports.parseStr = (str, replaceStr = "") => isNullOrEmpty(str) ? replaceStr : str;

exports.hasText = (str) => !!(str && str.trim() !== "");

exports.hasNoText = (str) => !(str && str.trim() !== "");

exports.sortArrayOfObjects = (arr, keyToSort, direction) => {
    if (direction === 'none') return arr;

    const compare = (objectA, objectB) => {
        const valueA = objectA[keyToSort]
        const valueB = objectB[keyToSort]

        if (valueA === valueB) return 0;

        if (valueA > valueB) {
            return direction === 'ascending' ? 1 : -1
        } else {
            return direction === 'ascending' ? -1 : 1
        }
    }

    return arr.slice().sort(compare)
}

exports.sortByDate = (arr, keyToSort) => arr.sort((a, b) => new Date(b[keyToSort]) - new Date(a[keyToSort]));

exports.getExtType = function (file_type) {
    let file_ext;
    switch (file_type) {
        case 'image/jpeg':
            file_ext = '.jpg';
            break;

        case 'text/plain':
            file_ext = '.txt';
            break;

        case 'text/html':
            file_ext = '.html';
            break;

        case 'text/css':
            file_ext = '.css';
            break;

        case 'image/png':
            file_ext = '.png';
            break;

        case 'application/pdf':
            file_ext = '.pdf';
            break;

        case 'application/json':
            file_ext = '.json';
            break;

        case 'application/octet-stream':
            file_ext = '.docx';
            break;

        case 'application/msword':
            file_ext = '.doc';
            break;

        case 'application/vnd.ms-excel':
            file_ext = '.xls';
            break;

        case 'application/vnd.ms-powerpoint':
            file_ext = '.ppt';
            break;

        case "application/zip":
            file_ext = ".zip";
            break;

        case "application/x-zip-compressed":
            file_ext = ".zip";
            break;

        case "multipart/x-zip":
            file_ext = ".zip"
            break;
    }
    return file_ext;
}

exports.getMimeType = function (file_ext) {
    let file_mime;
    switch (file_ext) {
        case '.jpg':
            file_mime = 'image/jpeg';
            break;

        case '.jpeg':
            file_mime = 'image/jpeg';
            break;

        case '.txt':
            file_mime = 'text/plain';
            break;

        case '.html':
            file_mime = 'text/html';
            break;

        case '.css':
            file_mime = 'text/css';
            break;

        case '.png':
            file_mime = 'image/png';
            break;

        case '.pdf':
            file_mime = 'application/pdf';
            break;

        case '.json':
            file_mime = 'application/json';
            break;

        case '.docx':
            file_mime = 'application/octet-stream';
            break;

        case '.doc':
            file_mime = 'application/msword';
            break;

        case '.xls':
            file_mime = 'application/vnd.ms-excel';
            break;

        case '.xlsx':
            file_mime = 'application/vnd.ms-excel';
            break;

        case '.ppt':
            file_mime = 'application/vnd.ms-powerpoint';
            break;

        case '.zip':
            file_mime = 'application/zip';
            break;
    }
    return file_mime;
}

exports.excelDateToJavascriptDate = function (excelDate) {
    return new Date(excelEpoc + excelDate * msDay);
}

exports.convertNumberToAlphabet = function (number) {
    return (number + 9).toString(36).toUpperCase();
}

exports.validateEmail = function (email) {
    // let regX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 
    let regX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return email.match(regX);
}

exports.prePostArray = ['Pre / Post', 'Pre/Post', 'pre/post', 'pre / post'];

exports.worksheetOrTestArray = ['Worksheet / Test', 'Worksheet/Test', 'worksheet/test', 'worksheet / test'];



