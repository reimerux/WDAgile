
 function loadPage()
 {
  $("#usermsg").hide();
  $("#usermsg2").hide();
  $("#createPhase").hide();
  $('#projectID').hide();
 }

 function createProject()
 {
     var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/projects";
     var date = new Date();
     var startDate = date.toISOString();
     var payload = {"name": "Kanban - " + $('#projectName').val(),"primaryHierarchy":{"id":$('#projectHierarchy').val()},"startDate":startDate}
     response = REST_WCP('POST',href, sessionStorage.getItem('accessToken'),payload); // make the ajax WS call - see jsfuncs.js
     if (response.status != 201)
     {
        $("#usermsg").show();
        $("#usermsg").text(response.statusText + " : " + response.status + " : " + response.responseText +" / URL: " + href + " / Payload: " + JSON.stringify(payload));
        $("#usermsg").addClass('alert-danger');
     }
     else
     {
        $("#usermsg").text("Project has been successfully created. Please wait a moment to create the Phase.");
        $("#usermsg").removeClass('alert-danger');
        $('#projectID').val(response.responseJSON.id);
        $('#projectID').show();
        $("#createPhase").show();
        $("#createProject").hide();
        $("#usermsg").show();
     }

 }

 function createPhase()
  {
       var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planPhases";
       var payload = {"project": {"id":$('#projectID').val()},"phase":{"id": localStorage.getItem('kanban')}}
       response = REST_WCP('POST',href, sessionStorage.getItem('accessToken'),payload); // make the ajax WS call - see jsfuncs.js

       if (response.status != 201)
           {
              $("#usermsg2").show();
              $("#usermsg2").text(response.statusText + " : " + response.status + " : " + response.responseText +" / URL: " + href + " / Payload: " + JSON.stringify(payload));
              $("#usermsg2").addClass('alert-danger');
           }
           else
           {
              $("#usermsg2").show();
           }

  }

 function buildProjectHierarchyList(resObject,purpose)
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