
 function loadConfig()
 {
    var href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+workdayID%2CprojectPhaseName+FROM+projectPhase";
    phases = REST_WCP('GET',href, sessionStorage.getItem('accessToken'),""); // make the ajax WS call - see jsfuncs.js
    buildPhaseList(phases,"kanbanSelect");

    $('#defaultTask').val(localStorage.getItem("defaultTask"));
 }

 function updateConfig()
 {
    localStorage.setItem("kanban", $('#kanbanSelect').val());
    localStorage.setItem("defaultTask", $('#defaultTask').val());
    localStorage.setItem("maxWIP", $('#maxWIP').val());
    document.getElementById("usermsg").innerText = "Values have been saved."
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
                    var selection = purpose == "kanban" ? localStorage.getItem("kanban") : localStorage.getItem("currentSprint");
                    var destination = purpose == "kanbanSelect" ? "kanban" : "currentSprint";
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

