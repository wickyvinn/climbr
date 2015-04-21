// Functions used for any permanent info pages

exports.formatInfo = function(perminfo) {
	return {
		firstName: perminfo.first_name.charAt(0).toUpperCase() + perminfo.first_name.slice(1),
		gender: perminfo.gender,
		weight: perminfo.weight,
		top: perminfo.top_cert !== undefined,
		lead: perminfo.lead_cert !== undefined,
		ropeLow: perminfo.rope_low,
		ropeHigh: perminfo.rope_high,
		boulderLow: perminfo.boulder_low,
		boulderHigh: perminfo.boulder_high
	}
};	
