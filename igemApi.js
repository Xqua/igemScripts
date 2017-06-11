function changeYear() {
  year = $("#yearSelector :selected").text(); // The text content of the selected option
  teamurl = $("#yearSelector").val();
  getTeams();
}

function getTeams() {
  changeStatus("Our eleves are retrieving data! Please wait...");
  $.ajax({
    type: "GET",
    url: teamurl,
    dataType: "text",
    success: function(data) {parseTeams(data);}
 });
}

function parseTeams(data) {
  teamlist = [];
  var record_num = 9;  // or however many elements there are in each row
  var dataLines = data.split(/\r\n|\n/);
  var entries = [];
  var headings = dataLines[0].split(',');
  for (var i=1; i<dataLines.length; i++) {
    var elements = dataLines[i].split(',');
    entries.push(elements)
    teamlist.push(elements[1])
  }
  awesominput.list = teamlist;
  changeStatus("Loaded");
  setTimeout(function () {changeStatus("")}, 3000);
}

function changeStatus(msg) {
  document.getElementById("status_msg").innerHTML = "<h2>"+msg+"</h2>";
}

function load() {
  if (loading) {
    return;
  }
  var team = document.getElementById("teamname").value
  getPages(team)
}

function getPages(team) {
  // var apiurl = "http://"+year+".igem.org/wiki/api.php?action=query&list=allpages&apprefix=Team:"+teamname+"&aplimit=max&format=json";
  changeStatus("Our elves are working please wait ...")
  // document.getElementById("response").innerHTML = "<h2>Loading the data...</h2>";
  // var apiurl = "http://2016.igem.org/wiki/api.php?action=query&list=allpages&apprefix=Team:Imperial_College&aplimit=max&format=json";
  var apiurl = "http://"+year+".igem.org/wiki/api.php?action=query&list=allpages&apprefix=Team:"+team+"&aplimit=max&format=json";
  $.getJSON(apiurl, null, parsePages)
}

function parsePages(data) {
  // console.log(data);
  var pages = [];
  var allpages = data.query.allpages;
  var requests = [];
  for (var i = 0; i < allpages.length; i++) {
    pages.push(allpages[i].title);
    // var pageid = allpages[i].pageid;
    var apiurl = "http://"+year+".igem.org/wiki/api.php?action=query&prop=revisions&titles="+allpages[i].title+"&rvprop=size%7Ctimestamp%7Cuser%7Ccomment&rvlimit=500&format=json&continue=||";
    requests.push($.ajax({
      url:apiurl,
      pageid:allpages[i].pageid,
      page:allpages[i].title,
      success: function(data) {parseEdits(this.pageid, this.page, data)}
    }))
  }
  $.when.apply(undefined, requests).then(function() {
    changeStatus("")
    console.log(results);
    monadicView(results);
    heatmapChart(results);
  }
  )
}


function parseEdits(pageid, page, data) {
  if (data.query) {
    var edits = data.query.pages[pageid].revisions;
    for (var i =0; i < edits.length; i++) {
      var t = new Date(edits[i].timestamp)
      var dataobj = {
        'date': Date(edits[i].timestamp),
        'day': t.getDay(),
        'hour': t.getHours(),
        'userid': edits[i].user,
        'userid_simple': edits[i].user.toLowerCase().replace(' ','_'),
        'comment':edits[i].comment,
        'bytesize':edits[i].size,
        'pageid':pageid,
        'page':page
      }
      results.push(dataobj)
    }
  }

}

// Define variable to be used accross (global)

var results = [];
var teamlist = [];
var year = "2017"
var teamurl = "http://igem.org/Team_List.cgi?jamboree=90&team_list_download=1"
var awesominput;
var loading = false;
// Main Exectution
$( document ).ready(function() {

  console.log( "ready!" );
  var input = document.getElementById("teamname");
  awesominput = new Awesomplete(input, {
    list: []
  });

  //Exectute functions


  getTeams();

});
