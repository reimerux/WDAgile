
 function loadConfig()
 {
    var href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+workdayID%2CprojectPhaseName+FROM+projectPhase";
    phases = REST_WCP('GET',href, sessionStorage.getItem('accessToken'),""); // make the ajax WS call - see jsfuncs.js
    buildPhaseList(phases,"backlogSelect");
    $('#defaultTask').val(localStorage.getItem("defaultTask"));
    buildPhaseList(phases,"currentSprintSelect");

    href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+workdayID%2CprojectRoleName+FROM+projectRoles";
    roles = REST_WCP('GET',href, sessionStorage.getItem('accessToken'),""); // make the ajax WS call - see jsfuncs.js
    teams = localStorage.getItem('scrumTeams');

    document.getElementById('scrumTeam').innerHTML = buildScrumTeamTable(jQuery.parseJSON(teams),roles)
 }

 function updateConfig()
 {
    localStorage.setItem("backlog", $('#backlogSelect').val());
    localStorage.setItem("defaultTask", $('#defaultTask').val());
    localStorage.setItem("currentSprint", $('#currentSprintSelect').val());
    var teams,tableData;
    teams = [];
    tableData = $("table tbody")
    $.each(tableData[0].rows, function(key, value)
        {
            element = {};
            element.name = tableData[0].rows[key].children[0].children[0].value;
            element.role = tableData[0].rows[key].children[1].children[0].children[0].value;
            element.sub = tableData[0].rows[key].children[2].children[0].children[0].value;
            teams[key] = element;
        })

    localStorage.setItem("scrumTeams", JSON.stringify(teams));
    document.getElementById("usermsg").innerText = "Values have been saved."
 }

 function buildScrumTeamTable (teams,roles)
 {
    var content =  "<button onclick='addRow()'>Add Row</button><table id='scrumTable' class='table'><thead><tr><th scope='col'>Team Name</th><th scope='col'>Project Role</th><th scope='col'>Sub cat</th></tr></thead><tbody>";
    $.each(teams, function(key, value)
    {
        content +=  "<tr><td><input value='"+teams[key].name+"'></input></td><td>"+buildRoleList(roles, teams[key].role)+"</td><td>"+buildSubRoleList(teams[key].sub)+"</td></tr>";
    })

    content += "</tbody></table>"

    return content;
 }

 function addRow()
 {
    $("table tbody").append("<tr><td><input></input></td><td>"+buildRoleList(roles,'')+"</td><td>"+buildSubRoleList()+"</td></tr>")
 }

 function buildPhaseList(resObject,purpose)
           {

               //creates the drop down for the sprints based on project plan phases

               if(resObject.status != 200)
                          {
                              document.getElementById("usermsg").innerHTML = "Request: " + req + "<br/>Error Fetching Project Tasks:<br/>Status: " + resObject.status + " (" + resObject.statusText + ")<br/>" + resObject.responseText;
                          }
                          else
                          {
                          var jdata = jQuery.parseJSON(resObject.responseText);
                          var content = "<div class='form-group'><select class='form-control' id='"+purpose+"'>"
                          var selection = purpose == "backlogSelect" ? localStorage.getItem("backlog") : localStorage.getItem("currentSprint");
                          var destination = purpose == "backlogSelect" ? "backlog" : "currentSprint";
                          //var backlog = localStorage.getItem("backlog")

                          $.each(jdata.data, function(key, value)
                          {
                               var txnName = jdata.data[key].projectPhaseName != null ? jdata.data[key].projectPhaseName : "N/A";
                               var txnID = jdata.data[key].workdayID != null ? jdata.data[key].workdayID : 0;
                               var Selected = txnID == selection ? "selected='selected'" : "";

                               content +=  "<option value='"+txnID +"' "+Selected+">" +txnName+"</option>"
                          });

                               content += "</select></div>"

                            document.getElementById(destination).innerHTML = content;
                            }
                            return false;
           }

   function buildRoleList(resObject, selectedRole)
        {

            //creates the drop down for the sprints based on project plan phases

            if(resObject.status != 200)
                       {
                           document.getElementById("usermsg").innerHTML = "Request: " + req + "<br/>Error Fetching Project Tasks:<br/>Status: " + resObject.status + " (" + resObject.statusText + ")<br/>" + resObject.responseText;
                       }
                       else
                       {
                       var jdata = jQuery.parseJSON(resObject.responseText);
                       var content = "<div class='form-group'><select class='form-control' id='roleSelect'>"


                       $.each(jdata.data, function(key, value)
                       {
                            var txnName = jdata.data[key].projectRoleName != null ? jdata.data[key].projectRoleName : "N/A";
                            var txnID = jdata.data[key].workdayID != null ? jdata.data[key].workdayID : 0;
                            var Selected = txnID == selectedRole ? "selected='selected'" : "";

                            content +=  "<option value='"+txnID +"' "+Selected+">" +txnName+"</option>"
                       });

                            content += "</select></div>"

                         }
                         return content;
        }

      function buildSubRoleList(selectedSub)
              {
              var subCat = [{"name":"FIN", "id":"f33a488aac7a101510c7e000b5fd01a7"},{"name":"HCM", "id":"f33a488aac7a101510c7e0fca0e201a8"}];
              var content = "<div class='form-group'><select class='form-control' id='roleSelect'>"
                      $.each(subCat, function(key, value)
                      {
                        var Selected = subCat[key].id == selectedSub ? "selected='selected'" : "";
                        content += "<option value='"+subCat[key].id+"' "+Selected+" >"+subCat[key].name+"</option>"
                      });


                      content +="</select></div>"
              return content
              }