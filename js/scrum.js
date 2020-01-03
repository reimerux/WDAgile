// javascript functions used by scrum.html

    function loadTeams()
        {
            //after selecting the team on the navbar, this function loads the relevant information in the main div
            // for now load projects

             //loads the left navbar with projects that start with "Kanban"

             teams = localStorage.getItem('scrumTeams')


            //var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/projects?limit=100";
           //projects = REST_WCP('GET', href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
           buildSidebarNav(teams, '');
            $("#addTask").hide();
            $("#progressbar").hide();
            $("#refresh").hide();
        }

    function loadTeam(teamID)
    	    {
    	        //after selecting the project on the navbar, this function loads the relevant information in the main div


    	         //load resource Plan Details to find the projects
    	         //hardcoded to top level hierarchy "GMS projects"
    	         var projectRoleID = teamID.split(':')[0]
    	         var projectSubRoleID = teamID.split(':')[1]
    	         var teamName = teamID.split(':')[2]

    	         var href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+project+FROM+resourcePlanDetails%28dataSourceFilter%3DresourcePlanDetailsForProjectsProjectHierarchies%2CprojectsAndProjectHierarchies%3D%2273270251dc424e14a0e4d91b9667f841%22%2CincludeSubordinateProjectHierarchies%3Dtrue%29+WHERE+projectRole%3D%22"+projectRoleID+"%22+AND+projectRoleCategory%3D%22"+projectSubRoleID+"%22";
                 projects = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js

                 $('teamName').text(teamName);

    	        //load sprint list
    	        //var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planPhases?project=" + projectID;
    	        //var sprints = REST_WCP('GET',href, sessionStorage.getItem('accessToken'),''); // make the ajax WS call - see jsfuncs.js
                //buildSprintList(sprints);

                //load project details - for each Project
                var content = '<div class="mr-2" id="projectsSelect">';
                //var content = '<ul class="list-group list-group-flush" id="projectsSelect"><li class="list-group-item">';
                $.each(projects.responseJSON.data, function(key, value)
                {
                    projectID = projects.responseJSON.data[key].project[0].id
                    href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/projects/"+ projectID
                    projectDetail = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
                    content += updateScrumProjectInfo(projectDetail, href);

                });
                document.getElementById('projectButtons').innerHTML = content + "</div>";

                //initial load of Kanban (based on default sprint) per project
                loadScrumBoard();
                $("#addTask").show();
                $('#progressbar').show();
                $("#refresh").show();

                return false;
            }


    function selectSprint(element)
    {
        $(element).button('toggle');
        loadScrumBoard();
    }

    function loadScrumBoard()
        {
            //loads the Scrum Board for the team & sprint

            //var sprintID = document.getElementById("sprintSelect1").value;
            projects = document.getElementById('projectsSelect').children;

            var href;
            var tasks = [];
            $.each(projects, function(key, value)
                            {

                                if (projects[key].classList.contains('focus'))
                                {
                                    projectID = projects[key].id;
                                    href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+project%2CprojectPlanTask%2CpercentComplete%2Corder1%2CprojectTask%2Cmemo%2CtaskResources%2CprojectPlanPhase+FROM+projectPlanTasks%28dataSourceFilter%3DprojectPlanTasksForProjectsProjectHierarchies%2CprojectsAndProjectHierarchies%3D%22"+projectID+"%22%29 ORDER BY order1" //+WHERE+projectPlanPhase%3D%22"+sprintID+"%22 ORDER BY order1";
                                    response = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
                                    var jdata = jQuery.parseJSON(response.responseText)
                                    $.each(jdata.data, function(key, value)
                                        {
                                            tasks.push(jdata.data[key]);
                                        });
                                }
                            });
            buildScrumBoard(tasks,href);

            return false;
        }

    function updateScrumProjectInfo(resObject, req)
           {
                //build the project information "panel"

               var response;
                if(resObject.status != 200)
                  {
                      document.getElementById("pageData").innerHTML = "Request: " + req + "<br/>Error Fetching Project Tasks:<br/>Status: " + resObject.status + " (" + resObject.statusText + ")<br/>" + resObject.responseText;
                  }
                  else
                  {
                    var jdata = jQuery.parseJSON(resObject.responseText);
                    response  = "<button data-toggle='button' class='btn btn-primary active' onClick='selectSprint(this);' id='"+jdata.id+"' checked>"+jdata.name+"</button>"
                    //response = "<div class='checkbox-inline' onChange='loadScrumBoard();'><label><input type='checkbox' class='checkbox' value="+jdata.id+" checked>"+jdata.name+"</label></div>"
                  }
                  return response;
           }

    function buildSidebarNav(resObject, req)
        {
            //creates the navbar for the side with projects and a refresh button

            var nav = "<div class='sidebar-sticky'><ul class='nav flex-column'>"

           var jdata = jQuery.parseJSON(resObject);

           $.each(jdata, function(key, value)
           {
                var txnName = jdata[key].name != null ? jdata[key].name : "";
                    nav += "<li class='nav-item'><a href='#' onClick='loadTeam(\""+ jdata[key].role + ":"+ jdata[key].sub + ":" + txnName+ "\"); return false;' class='nav-link'' id='loadTeams''><img src='img/wd-icon-suborg.svg' width='24' height='24' ></img>";
                    nav +=    txnName + "</a></li>";
           });

            nav += "<div class='border-top my-3'></div><li class='nav-item'><a class='nav-link text-secondary' href='#' onClick='loadTeams(); return false;'><img src='img/wd-icon-receipts.svg' width='24' height='24' ></img>Refresh Team list</a><a class='nav-link text-secondary' href='config.html'><img src='img/wd-icon-tools.svg' width='24' height='24' viewBox='0 0 24 24' fill='none' ></img>Configure</a></li><a class='nav-link text-secondary' href='index.html'><img src='img/wd-icon-home.svg' width='24' height='24' viewBox='0 0 24 24' fill='none' ></img>Back</a></li></div>";

           document.getElementById("dynSide").innerHTML = nav

           return false;

        }


    function buildSprintList(resObject, req)
        {

            //creates the drop down for the sprints based on project plan phases

            if(resObject.status != 200)
                       {
                           document.getElementById("pageData").innerHTML = "Request: " + req + "<br/>Error Fetching Project Tasks:<br/>Status: " + resObject.status + " (" + resObject.statusText + ")<br/>" + resObject.responseText;
                       }
                       else
                       {
                       var jdata = jQuery.parseJSON(resObject.responseText);
                       var content = "<div class='form-group'><select class='form-control' onchange='loadScrumBoard(\""+ $("#projectID").val() +"\");' id='sprintSelect1'>"

                       $.each(jdata.data, function(key, value)
                       {
                            var txnName = jdata.data[key].descriptor != null ? jdata.data[key].descriptor : "N/A";
                            var txnID = jdata.data[key].id != null ? jdata.data[key].id : 0;
                            var txnPhase = jdata.data[key].phase.id != null ? jdata.data[key].phase.id : 0;
                            var defaultSprint = jdata.data[key].phase.id == localStorage.getItem('currentSprint') ? "selected='selected'" : "";
                            var txnName = jdata.data[key].phase.id == localStorage.getItem('currentSprint') ? txnName + " (Current)" : txnName;

                            content +=  "<option value='"+txnID +"' "+defaultSprint+">" +txnName+"</option>"
                       });


                            content += "</select></div>"

                         document.getElementById("sprints").innerHTML = content;
                         }
                         return false;
        }

    function buildScrumBoard(resObject, req)
                {

                   var dz = '<div class="dropzone rounded" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="clearDrop(event)"> &nbsp; </div>';
                   var jdata = resObject
                   var ret_tasks_todo = "<div class='items border border-light'>" + dz;
                   var ret_tasks_inprog = "<div class='items border border-light'>" + dz;
                   var ret_tasks_review = "<div class='items border border-light'>" + dz;
                   var ret_tasks_comp = "<div class='items border border-light'>" + dz

                   $.each(jdata, function(key, value)
                   {
                        var txnpercent = jdata[key].percentComplete != null ? jdata[key].percentComplete : 0;

                        if (txnpercent>0 && txnpercent<0.75 )
                        {
                           ret_tasks_inprog += addScrumCard(key,jdata[key],0.25) + dz
                        }
                         else if (txnpercent >0.74 && txnpercent<1)
                        {
                           ret_tasks_review += addScrumCard(key,jdata[key],0.75) + dz
                        }
                         else if (txnpercent ==1)
                        {
                           ret_tasks_comp += addScrumCard(key,jdata[key],1) + dz
                        }
                          else
                        {
                           ret_tasks_todo += addScrumCard(key,jdata[key],0) + dz
                        }
                   });

                   ret_tasks_todo += "</div>";
                   ret_tasks_inprog += "</div>";
                   ret_tasks_review += "</div>";
                   ret_tasks_comp += "</div>";

                   document.getElementById("columnToDo").innerHTML = ret_tasks_todo;
                   document.getElementById("columnInProg").innerHTML = ret_tasks_inprog;
                   document.getElementById("columnReview").innerHTML = ret_tasks_review;
                   document.getElementById("columnComplete").innerHTML = ret_tasks_comp;

                    //set the appropriate id for the percent% value for drop zones
                    $("#columnToDo").children().children('.dropzone').prop('id','0');
                    $('#columnInProg').children().children('.dropzone').prop('id','0.25');
                    $('#columnReview').children().children('.dropzone').prop('id','0.75');
                    $('#columnComplete').children().children('.dropzone').prop('id','1');

                   updateEffortTotals();

                   return false;

               }

    function saveTask()
           {
                //saves the task after changes were made in edit modal

                //create a new task
                href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planTasks/" + $('#taskID').val();
                var payload = { "memo": parseMemoSave( $('#taskMemo').val(), $('#taskDescription').val(), $('#taskEffort').val())};
                REST_PATCH(href, sessionStorage.getItem('accessToken'),payload); // make the ajax WS call - see jsfuncs.js
                $('#modalTask').modal('hide');
                loadScrumBoard($('#projectID').val());
           }

     function addScrumCard(id,task,stage)
           {
               //builds a single story card

               var resourceCount = task.taskResources != null ? task.taskResources.length : 0;
               var memo = task.memo  != null ? JSON.parse(task.memo) : {"name":"","description":"","effort":0};
               var answer = "<div class='card draggable shadow-sm' id='card"+id+"' draggable='true' ondragstart='drag(event)'><div class='card-body p-2'><div class='card-title'><span class='float-right'>"+ resourceCount +"</span><img src='img/wd-icon-user.svg' height='24' width='24' class='rounded-circle float-right'><p class='lead font-weight-bold'>"+ task.project.descriptor + " : "+ memo.name +"</p></div><p id='type' class='font-weight-light'>" + task.projectTask.descriptor + "</p><p style='display: none;' id='description'>" + memo.description + "</p><p class='small font-weight-light' id='effort'>Effort: "+ memo.effort + " pts.</p><p id='order' style='display: none;'>"+task.order1+"</p><p id='WID' style='display: none;'>SPLIT" + task.projectPlanTask.id + "SPLIT</p><p style='display: none;' id='sprint'>" + task.projectPlanPhase.id + "</p><p style='display: none;' id='startDate'>" + task.startDate + "</p><p style='display: none;' id='endDate'>" + task.endDate + "</p><button class='btn btn-secondary btn-sm' onclick='editTask(this,\""+task.projectPlanTask.id+"\");'>Edit</button> <button class='btn btn-secondary btn-sm' onclick='moveBacklog(this,\""+task.projectPlanTask.id+"\");'>Sprint</button></div></div>"
               return answer
           }

