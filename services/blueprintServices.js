const blueprintRepository = require("../repository/blueprintRepository");  
const testQuestionPaperRepository = require("../repository/testQuestionPaperRepository");  
const commonServices = require("./commonServices");
const constant = require('../constants/constant');
const helper = require('../helper/helper');

exports.getBlueprintByItsId = (request, callback) => {    
    blueprintRepository.fetchBlueprintById(request, function (singleBlueprint_err, singleBlueprint_res) {
        if (singleBlueprint_err) {
            console.log(singleBlueprint_err);
            callback(singleBlueprint_err, singleBlueprint_res);
        } else {  
            console.log("BLUEPRINT : ", singleBlueprint_res);
            callback(singleBlueprint_err, singleBlueprint_res);
        }
    }) 
}
exports.getBluePrintsBasedonStatus = (request, callback) => {
    
    blueprintRepository.fetchBluePrintsBasedonStatus(request, function (blueprint_err, blueprint_res) {
      if (blueprint_err) {
          console.log(blueprint_err);
          callback(blueprint_err, blueprint_res);
      } else {  
        callback(blueprint_err, blueprint_res.Items); 
      }
    }) 
}
exports.addNewBluePrint = (request, callback) => {
    
    blueprintRepository.fetchBluePrintByName(request, function (fetch_blueprint_err, fetch_blueprint_res) {
      if (fetch_blueprint_err) {
          console.log(fetch_blueprint_err);
          callback(fetch_blueprint_err, fetch_blueprint_res);
      } else {  

        if(fetch_blueprint_res.Items.length === 0){

          blueprintRepository.insertBluePrint(request, function (add_blueprint_err, add_blueprint_res) {
            if (add_blueprint_err) {
                console.log(add_blueprint_err);
                callback(add_blueprint_err, add_blueprint_res);
            } else {  
              callback(add_blueprint_err, add_blueprint_res); 
            }
          }) 
        }else{
          callback(400, constant.messages.BLUEPRINT_EXISTS); 
        }
      }
    }) 
}
exports.changeBluePrintStatus = (request, callback) => {
if(request === undefined || request.data === undefined || request.data.blueprint_id === undefined || request.data.blueprint_id === "" || request.data.blueprint_status === undefined || request.data.blueprint_status === "" ){
  callback(400, constant.messages.INVALID_REQUEST_FORMAT); 
}else{
  if(request.data.blueprint_status === "Active" || request.data.blueprint_status === "Archived"){
    if (request.data.blueprint_status === "Archived") {

      // Fetch Blue Prints : 
      request.data.question_paper_status = "Active";
  
      testQuestionPaperRepository.getTestQuestionPapersBasedonBluePrint(request, async function (test_question_paper_err, test_question_paper_res) {
        if (test_question_paper_err) {
          console.log(test_question_paper_err);
          callback(test_question_paper_err, test_question_paper_res);
        } else {
          if(test_question_paper_res.Items.length === 0){
  
            blueprintRepository.changeBluePrintStatus(request, function (blueprint_err, blueprint_res) {
              if (blueprint_err) {
                console.log(blueprint_err);
                callback(blueprint_err, blueprint_res);
              } else {
                callback(blueprint_err, blueprint_res.Items);
              }
            })
  
          }else{
            let linked_paper_names = ""; 
  
            await test_question_paper_res.Items.forEach((e, i) => {
              
              ( i === test_question_paper_res.Items.length - 1 ) ? ( linked_paper_names += e.question_paper_name ) : ( linked_paper_names += e.question_paper_name + ", " ) 
  
            }) 
  
            console.log(constant.messages.UNABLE_TO_DELETE_THE_BLUEPRINT.replace("**REPLACE**", linked_paper_names));
            callback(400, constant.messages.UNABLE_TO_DELETE_THE_BLUEPRINT.replace("**REPLACE**", linked_paper_names));
          }
        }
      })
    } else {
      blueprintRepository.changeBluePrintStatus(request, function (blueprint_err, blueprint_res) {
        if (blueprint_err) {
          console.log(blueprint_err);
          callback(blueprint_err, blueprint_res);
        } else {
          callback(blueprint_err, blueprint_res.Items);
        }
      })
    }
  }else{
    callback(400, constant.messages.INVALID_REQUEST_FORMAT); 
  }
}
 
}
exports.fetchIndividualBluePrint = (request, callback) => {
    
  if(request === undefined || request.data === undefined || request.data.blueprint_id === undefined || request.data.blueprint_id === ""){
    callback(400, constant.messages.INVALID_REQUEST_FORMAT); 
  }else{
    blueprintRepository.fetchBlueprintById(request, function (fetch_blueprint_err, fetch_blueprint_res) {
      if (fetch_blueprint_err) {
          console.log(fetch_blueprint_err);
          callback(fetch_blueprint_err, fetch_blueprint_res);
      } else {  
        callback(fetch_blueprint_err, fetch_blueprint_res.Items); 
      }
    }) 
  }
}
