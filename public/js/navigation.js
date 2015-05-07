function nextSection() {

  var currentSection = $('[id^=section]:visible');
  var currentSectionId = currentSection.attr("id");

  if (validateSection(currentSection) || currentSectionId === "section-4") {
    var nextSectionNum = parseInt(currentSectionId.split('-')[1]) + 1;  
    var numOfSections = $('[id^=section]').length

    if (nextSectionNum === numOfSections) {
      $("#next").hide();
      $("#submission").show();
    }

    if (nextSectionNum != 1) $("#back").show();

    var nextSectionId = "section" + "-" + nextSectionNum.toString();
    currentSection.hide();
    $('#'+nextSectionId).show();
    $("#preventNext").html("");
  }
};

function backSection() {

  // lots of duplicit code here from next()
  
  var currentSection = $('[id^=section]:visible');
  var currentSectionId = currentSection.attr("id");
  
  var nextSectionNum = parseInt(currentSectionId.split('-')[1]) - 1;  
  var numOfSections = $('[id^=section]').length

  if (nextSectionNum === 1) $("#back").hide();
  if (nextSectionNum === (numOfSections-1)) {
    $("#submission").hide();
    $("#next").show();
  } 

  var nextSectionId = "section" + "-" + nextSectionNum.toString();
  currentSection.hide();
  $('#'+nextSectionId).show();

};

function validateSection(section) {
  var emptyInputs = section.find("input").filter(function() {
    return this.value === ""; 
  });
  
  var emptySelects = section.find("select").filter(function() {
    var defaultValue = "default";
    var selectedValue = $(this).val()
    return (defaultValue === selectedValue);
  });

  var checkBoxes = section.find("input:checkbox").length;
  var checkedBoxes = section.find("input:checkbox:checked").length;

  // if forms are empty, prevent moving forward
  if ((emptyInputs.length + emptySelects.length) != 0 || (checkBoxes > 0 && checkedBoxes < 1)) { 
    $("#preventNext").html("You've left some answers empty.");
    event.preventDefault(); // for the submit option
    return false
  } else return true
};

function setupInputs(optionalObject) {  //optionalObject for perminfo-edit population of set values

  if (optionalObject) var defaultText = '---'; // perminfo-edit prefers this for space reasons
  else var defaultText = 'Select a level';


  $('#weight').blur(function() {
    $(this).attr("type", "text");
    if ($(this).val().length > 0) {
      $(this).val(parseInt($(this).val()).toString() + " lbs");
    }
  }); 

  $('#weight').focus(function() {
    if ($(this).val().length > 0) {
      $(this).val($(this).val().replace(" lbs", ""));
    }
    $(this).attr("type", "number");
  });

  $(function(){
    var $select = $(".ropeLevel");
    var levels = ["5.5", "5.6", "5.7", "5.8", "5.9", "5.10a", "5.10b", "5.10c", "5.10d", "5.11a", "5.11b", "5.11c", "5.11d", "5.12a", "5.12b", "5.12c", "5.12d", "5.13a", "5.13b", "5.13c", "5.13d", "5.14a", "5.14b", "5.14c", "5.14d"];

    $select.append($('<option></option>').html(defaultText).attr("value","default"));
    
    for (i=0;i<levels.length;i++) {
      $select.append($('<option></option>').val(levels[i]).html(levels[i]))
    }

    if (optionalObject) { // perminfo-edit will have values to be populated
      
      var ropeHigh = optionalObject.ropeHigh;
      var ropeLow = optionalObject.ropeLow;

      $("#ropeLow").val(ropeLow);
      $("#ropeHigh").val(ropeHigh);
    
    }


  });

  $(function(){
    var $select = $(".boulderLevel");
    var levels = ["VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17"];
    $select.append($('<option></option>').html(defaultText).attr("value","default"));
    
    for (i=0;i<levels.length;i++) {
      $select.append($('<option></option>').val(levels[i]).html(levels[i]))
    }

    if (optionalObject) { // perminfo-edit will have values to be populated
      
      var boulderHigh = optionalObject.boulderHigh;
      var boulderLow = optionalObject.boulderLow;

      $("#boulderLow").val(boulderLow);
      $("#boulderHigh").val(boulderHigh);
    
    }
  });

}



