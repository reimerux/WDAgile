// javascript functions used by kanban.html

	function loadProject(projectID)
	    {
	        //after selecting the project on the navbar, this function loads the relevant information in the main div

	        sessionStorage.setItem('projectID',projectID) ;

            //load project details
            href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/projects/"+ projectID
            projectDetail = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
            updateProjectInfo(projectDetail, href);

            //initial load of Kanban (based on default sprint
            loadKanbanBoard(projectID);
            return false;
        }


    function loadProjects()
            {
                //loads the left navbar with projects that start with "Kanban"

                var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/projects?limit=100";
                projects = REST_WCP('GET', href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
                buildSidebarNav(projects, href);
                $("#addTask").hide();
                $("#progressbar").hide();
                $("#refresh").hide();
                $("#burnup").hide();

                if (sessionStorage.getItem('projectID') != null)
                {
                loadProject(sessionStorage.getItem('projectID'));
                }
            }


     function loadKanbanBoard(projectID)
        {
            //loads the Kanban board for the project & sprint

            var href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+projectPlanTask%2Cproject%2CpercentComplete%2Corder1%2CstartDate%2CendDate%2CprojectTask%2Cmemo%2CtaskResources%2CprojectPlanPhase+FROM+projectPlanTasks%28dataSourceFilter%3DprojectPlanTasksForProjectsProjectHierarchies%2CprojectsAndProjectHierarchies%3D%22"+projectID+"%22%29+ORDER BY order1";
            tasks = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
            buildKanbanBoard(tasks,href)

            return false;
        }

    function addKanbanTask()
            {
                // adds a new Task with template hardcoded

                //get the top level phase
                var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planPhases?project=" + sessionStorage.getItem('projectID');
                var phaseID = jQuery.parseJSON(REST_WCP('GET',href, sessionStorage.getItem('accessToken')).responseText).data[0].id; // make the ajax WS call - see jsfuncs.js

                //create a new task
                href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planTasks";
                var payload = { "task":{"id":localStorage.getItem('defaultTask')},"phase":{"id": phaseID }, "memo": parseMemoSave( 'New Task', '', 1)};
                REST_WCP('POST',href, sessionStorage.getItem('accessToken'),payload); // make the ajax WS call - see jsfuncs.js
            }


    function saveTask()
        {
             //saves the task after changes were made in edit modal

             href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planTasks/" + $('#taskID').val();
              var payload = { "memo": parseMemoSave( $('#taskMemo').val(), $('#taskDescription').val(), $('#taskEffort').val())};
             REST_WCP('PATCH', href, sessionStorage.getItem('accessToken'),payload); // make the ajax WS call - see jsfuncs.js
             $('#modalTask').modal('hide');
             loadKanbanBoard(sessionStorage.getItem('projectID'));
        }

    function buildKanbanBoard(resObject, req)
            {
               //adds Task data to div
               if(resObject.status != 200)
               {
                   document.getElementById("pageData").innerHTML = "Request: " + req + "<br/>Error Fetching Project Tasks:<br/>Status: " + resObject.status + " (" + resObject.statusText + ")<br/>" + resObject.responseText;
               }
               else
               {
               var dz = '<div class="dropzone rounded" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="clearDrop(event)"> &nbsp; </div>';
               var jdata = jQuery.parseJSON(resObject.responseText);
               var ret_tasks_todo = "<div class='items border border-light'>" + dz;
               var ret_tasks_inprog = "<div class='items border border-light'>" + dz;
               var ret_tasks_review = "<div class='items border border-light'>" + dz;
               var ret_tasks_comp = "<div class='items border border-light'>" + dz

               $.each(jdata.data, function(key, value)
               {
                    var txnpercent = jdata.data[key].percentComplete != null ? jdata.data[key].percentComplete : 0;

                    if (txnpercent>0 && txnpercent<0.75 )
                    {
                       ret_tasks_inprog += addKanbanCard(key,jdata.data[key],0.25) + dz
                    }
                     else if (txnpercent >0.74 && txnpercent<1)
                    {
                       ret_tasks_review += addKanbanCard(key,jdata.data[key],0.75) + dz
                    }
                     else if (txnpercent ==1)
                    {
                       ret_tasks_comp += addKanbanCard(key,jdata.data[key],1) + dz
                    }
                      else
                    {
                       ret_tasks_todo += addKanbanCard(key,jdata.data[key],0) + dz
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

           }

    function addKanbanCard(id,task,stage)
          {
              //builds a single story card

              var resourceCount = task.taskResources != null ? task.taskResources.length : 0;
              var memo = task.memo != null ? JSON.parse(task.memo) : {"name":"","description":"","effort":0};
              var answer = "<div class='card draggable shadow-sm' id='card"+id+"' draggable='true' ondragstart='drag(event)'><div class='card-body p-2'><div class='card-title'><span class='float-right'>"+ resourceCount +"</span><img src='img/wd-icon-user.svg' height='24' width='24' class='rounded-circle float-right'><p class='lead font-weight-bold'>"+ memo.name +"</p></div><p id='type' class='font-weight-light'>" + task.projectTask.descriptor + "</p><p style='display: none;' id='description'>" + memo.description + "</p><p class='small font-weight-light effort' id='effort'>"+ memo.effort + " pts.</p><p class='data' style='display: none;' id='taskData'>" + JSON.stringify(task) + "</p><button class='btn btn-secondary btn-sm' onclick='editTask(this,\""+task.projectPlanTask.id+"\");'>Edit</button></div></div>"
              return answer
          }



    function refreshProjects()
    {
        loadProjects();

        //clear Kanban Board
        $('.dropzone').remove();
        $('.card.draggable').remove();
        updateEffortTotals();

    }

function SortByName(a, b){
  var aName = a.name.toLowerCase();
  var bName = b.name.toLowerCase();
  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}


function buildSidebarNav(resObject, req)
            {
                //creates the navbar for the side with projects and a refresh button

                var nav = "<div class='sidebar-sticky'><ul class='nav flex-column'>"


                 if(resObject.status != 200)
                           {
                               document.getElementById("pageData").innerHTML = "Request: " + req + "<br/>Error Fetching Projects:<br/>Status: " + resObject.status + " (" + resObject.statusText + ")<br/>" + resObject.responseText;
                               window.location.href = "login.html";
                           }
                           else
                           {
                           var jdata = jQuery.parseJSON(resObject.responseText);
                           jdataSorted = jdata.data.sort(SortByName);

                           $.each(jdata.data, function(key, value)
                           {
                                var txnName = jdata.data[key].name != null ? jdata.data[key].name : "";

                                if (txnName.includes("Kanban"))
                                {
                                    nav += "<li class='nav-item'><a href='#' onClick='loadProject(\""+ jdata.data[key].id +"\"); return false;' class='nav-link'' id='loadProjects''><img src='img/wd-icon-folder-open.svg' width='24' height='24' ></img>";
                                    //nav += "<li class='nav-item'><a href='#' onClick='loadProject(\""+ jdata.data[key].id +"\"); return false;' class='nav-link'' id='loadProjects''><span data-feather='file'></span>";
                                    nav +=    txnName + "</a></li>";
                                }
                           });

                            nav += "<div class='border-top my-3'></div><li class='nav-item'><a class='nav-link text-secondary' href='#' onClick='refreshProjects(); return false;'><img src='img/wd-icon-receipts.svg' width='24' height='24' ></img>Refresh Project list</a><a class='nav-link text-secondary' href='newProject.html'><img src='img/wd-icon-folder-plus.svg' width='24' height='24' viewBox='0 0 24 24' fill='none' ></img>Create new Project</a></li><a class='nav-link text-secondary' href='kanbanConfig.html'><img src='img/wd-icon-tools.svg' width='24' height='24' viewBox='0 0 24 24' fill='none' ></img>Configure</a></li><a class='nav-link text-secondary' href='index.html'><img src='img/wd-icon-home.svg' width='24' height='24' viewBox='0 0 24 24' fill='none' ></img>Back</a></li></div>";

                           document.getElementById("dynSide").innerHTML = nav

                           return false;
                         }
            }

    function goToBurnup(projectID)
    {
        window.location.href = "burnup.html"
    }