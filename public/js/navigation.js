function nextSection() {

	var currentSection = $('[id^=section]:visible');
	var currentSectionId = currentSection.attr("id");

	if (validateSection(currentSection)) {
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
	if (nextSectionNum === (numOfSections-2)) {
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

	// if forms are empty, prevent moving forward
	if ((emptyInputs.length + emptySelects.length) != 0) { 
		$("#preventNext").html("You've left some answers empty.");
		event.preventDefault(); // for the submit option
		return false
	} else return true
};