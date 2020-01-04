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
                var href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+workdayID%2CprojectPhaseName+FROM+projectPhase";
                response = REST_WCP('GET',href, sessionStorage.getItem('accessToken'),""); // make the ajax WS call - see jsfuncs.js
                sprints = filterSprints(response.responseJSON.data);
                buildSprintList(sprints);

                //load project details - for each Project
                var content = '<div class="btn-group" id="projectsSelect">';
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

    function filterSprints(response)
    {
        var sprints =[];
        $.each(response , function (key,value)
        {

        if (response[key].projectPhaseName.includes("Scrum"))
        {
            sprints.push(response[key])
        }
        });
        return sprints;
    }


    function selectProject(element)
    {
        //toggle selected buttons (and associated checkbox)
        if (element.children[0].checked)
        {
            element.children[0].checked = false;
            $(element).removeClass('btn-success');
            $(element).addClass('btn-light');
        }
        else
        {
            element.children[0].checked = true;
            $(element).addClass('btn-success');
            $(element).removeClass('btn-light');
        };
        loadScrumBoard();
    }

    function loadScrumBoard()
        {
            //loads the Scrum Board for the team & sprint

            //var sprintID = document.getElementById("sprintSelect1").value;
            projects = document.getElementById('projectsSelect').children;

            var href;
            var tasks = [];
            var projectsSelect = [];
            $.each(projects, function(key, value)
                            {

                                if (projects[key].children[0].checked)
                                {
                                    projectID = projects[key].children[0].value;
                                    projectsSelect.push(projects[key].innerText);
                                    href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+project%2CprojectPlanTask%2CprojectPhase%2CpercentComplete%2Corder1%2CprojectTask%2Cmemo%2CtaskResources%2CprojectPlanPhase+FROM+projectPlanTasks%28dataSourceFilter%3DprojectPlanTasksForProjectsProjectHierarchies%2CprojectsAndProjectHierarchies%3D%22"+projectID+"%22%29 ORDER BY order1" //+WHERE+projectPlanPhase%3D%22"+sprintID+"%22 ORDER BY order1";
                                    response = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
                                    var jdata = jQuery.parseJSON(response.responseText)
                                    $.each(jdata.data, function(key, value)
                                        {
                                            tasks.push(jdata.data[key]);
                                        });
                                }
                            });
            //document.getElementById("projectButtonsTest").innerText = JSON.stringify(projectsSelect);
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
                    response = "<button class='btn btn-success' type='button' onClick='selectProject(this);'><input type='checkbox' class='checkbox' value="+jdata.id+" hidden=true checked>"+jdata.name+"</button>"
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


    function buildSprintList(resObject)
        {

            //creates the drop down for the sprints based on project plan phases

           var jdata = resObject;
           var content = "<div class='form-group'><select class='form-control' onchange='loadScrumBoard();' id='sprintSelect1'>"

           $.each(jdata, function(key, value)
           {
                var txnName = jdata[key].projectPhaseName != null ? jdata[key].projectPhaseName : "N/A";
                var txnID = jdata[key].workdayID != null ? jdata[key].workdayID : 0;
                var defaultSprint = jdata[key].workdayID == localStorage.getItem('currentSprint') ? "selected='selected'" : "";
                var txnName = jdata[key].workdayID == localStorage.getItem('currentSprint') ? txnName + " (Current)" : txnName;

                content +=  "<option value='"+txnID +"' "+defaultSprint+">" +txnName+"</option>"
           });


                content += "</select></div>"

             document.getElementById("sprints").innerHTML = content;

        }

    function buildScrumBoard(jdata)
                {

                   var dz = '<div class="dropzone rounded" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="clearDrop(event)"> &nbsp; </div>';
                   var ret_tasks_todo = "<div class='items border border-light'>" + dz;
                   var ret_tasks_inprog = "<div class='items border border-light'>" + dz;
                   var ret_tasks_review = "<div class='items border border-light'>" + dz;
                   var ret_tasks_comp = "<div class='items border border-light'>" + dz

                   $.each(jdata, function(key, value)
                   {
                        //filter out the non-selected-sprint tasks
                        if (jdata[key].projectPhase.id == document.getElementById("sprintSelect1").value){
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
                REST_WCP('PATCH',href, sessionStorage.getItem('accessToken'),payload); // make the ajax WS call - see jsfuncs.js
                $('#modalTask').modal('hide');
                loadScrumBoard();
           }

     function moveSprint(element)
            {
                //opens up the modal window for switching sprints

                var card = element.parentNode.parentNode;
                var task = jQuery.parseJSON(card.getElementsByClassName('data')[0].innerText);
                var sprint = task.projectPhase.id;
                $('#taskID2').val(task.projectPlanTask.id)
                $('#projectID2').val(task.project.id)
                $('#currSprint').html(document.getElementById("sprints").innerHTML);
                $('#currSprint').children().children().val(sprint);
                $('#currSprint').children().children().prop( "disabled", true );
                $('#newSprint').html(document.getElementById("sprints").innerHTML);
                removeAssignedSprint();
                $('#modalSprint').modal('show');
            }

       function saveSprint(element)
            {
                // saves data after story has been assigned a new sprint

                href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planTasks/" + $('#taskID2').val();
                var payload = { "phase": { "id" : convertProjectPhaseToPlanPhase($('#newSprint').children().children().val(),$('#projectID2').val())}};
                REST_WCP('PATCH',href, sessionStorage.getItem('accessToken'),payload); // make the ajax WS call - see jsfuncs.js
                $('#modalSprint').modal('hide');
                loadScrumBoard();
            }

        function convertProjectPhaseToPlanPhase(phase,projectID)
        {
            //load sprint list
            var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planPhases?project=" + projectID;
            var sprints = REST_WCP('GET',href, sessionStorage.getItem('accessToken'),'').responseJSON; // make the ajax WS call - see jsfuncs.js
            var response;

            $.each(sprints.data, function(key,value)
            {
                if (sprints.data[key].phase.id == phase)
                {
                    response=sprints.data[key].id;
                }
            })
            return response
        }

     function addScrumCard(id,task,stage)
           {
               //builds a single story card

               var resourceCount = task.taskResources != null ? task.taskResources.length : 0;
               var memo = task.memo  != null ? JSON.parse(task.memo) : {"name":"","description":"","effort":0};
               var answer = "<div class='card draggable shadow-sm' id='card"+id+"' draggable='true' ondragstart='drag(event)'><div class='card-header'><span class='small font-weight-light'>"+ task.project.descriptor + "</span><span class='float-right'>"+ resourceCount +"</span><img src='img/wd-icon-user.svg' height='24' width='24' class='rounded-circle float-right'></div><div class='card-body p-2'><div class='card-title'><p class='lead font-weight-bold'>"+ memo.name +"</p></div><p id='type' class='font-weight-light'>" + task.projectTask.descriptor + "</p><p style='display: none;' id='description'>" + memo.description + "</p><p class='data' style='display: none;' id='taskData'>" + JSON.stringify(task) + "</p></div><div class='card-footer'><span class='font-weight-light effort' id='effort'>"+ memo.effort + " pts.</span><button class='btn btn-secondary btn-sm float-right' onclick='editTask(this);'>Edit</button><button class='btn btn-secondary btn-sm float-right' onclick='moveSprint(this);'>Sprint</button></div></div>"
               return answer
           }

