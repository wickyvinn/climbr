// Functions used for any permanent info pages

exports.formatInfo = function(perminfo) {
  return {
    firstName: perminfo.firstName.charAt(0).toUpperCase() + perminfo.firstName.slice(1),
    gender: perminfo.gender,
    weight: perminfo.weight,
    top: perminfo.topCert === true,
    lead: perminfo.leadCert === true,
    ropeLow: perminfo.ropeLow,
    ropeHigh: perminfo.ropeHigh,
    boulderLow: perminfo.boulderLow,
    boulderHigh: perminfo.boulderHigh
  }
};  
