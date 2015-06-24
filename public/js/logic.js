// Functions used in routes

function formatInfo(perminfo) {
  return {
    firstName: perminfo.firstName.charAt(0).toUpperCase() + perminfo.firstName.slice(1),
    gender: perminfo.gender,
    weight: perminfo.weight,
    top: perminfo.topCert === true,
    lead: perminfo.leadCert === true,
    ropeLow: perminfo.ropeLow,
    ropeHigh: perminfo.ropeHigh,
    boulderLow: perminfo.boulderLow,
    boulderHigh: perminfo.boulderHigh,
    photoAddress: perminfo.photoAddress
  }
};  

// take in two arrays of objects, join in single array. 
function joinClimbers(seshinfos, perminfos) {

  var climbers = [];

  for (var i=0; i < seshinfos.length; i++) {
    var seshinfo = seshinfos[i]
    var userId = seshinfo.userId;
    var perminfo = perminfos.filter(function(perminfo) { return perminfo.userId === userId } );
    climbers.push({ userId: userId, perminfo: perminfo[0], seshinfo: seshinfo })
  }

  return climbers

}

// iterate through matches array, and return an array of userIds

function getUserIds(matchArray) {
  var userIds = [];
  for (var i=0; i < matchArray.length; i++) {
    userIds.push(matchArray[i].userId);
  }
  return userIds;
}

// export da shiz 

exports.formatInfo   = formatInfo;
exports.joinClimbers = joinClimbers;
exports.getUserIds   = getUserIds;