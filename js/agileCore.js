// javascript functions used by Agile Board

const drag = (event) => {
       event.dataTransfer.setData("text/plain", event.target.id);
     }

     const allowDrop = (ev) => {
       ev.preventDefault();
       if (hasClass(ev.target,"dropzone")) {
         addClass(ev.target,"droppable");
       }
     }

     const clearDrop = (ev) => {
         removeClass(ev.target,"droppable");
     }

     const drop = (event) => {
       event.preventDefault();
       const data = event.dataTransfer.getData("text/plain");
       const element = document.querySelector(`#${data}`);
       //var originID = $(`#${data}`)[0].innerHTML.split("SPLIT")[1];
       var originID = jQuery.parseJSON($(`#${data}`)[0].getElementsByClassName('data')[0].innerText).projectPlanTask.id;
       var destinationVal =  event.target.id;
       var newOrderID = newOrder(event.target);
       console.warn("Dragged item: " + originID + " / Destination: " + destinationVal + " / New Order: " + newOrderID);
       saveWDTask(originID,destinationVal,newOrderID);
       try {
         // remove the spacer content from dropzone
         event.target.removeChild(event.target.firstChild);
         // add the draggable content
         event.target.appendChild(element);
         // remove the dropzone parent
         unwrap(event.target);
       } catch (error) {
         console.warn("can't move the item to the same place")
       }
       updateDropzones();
       updateEffortTotals();
       //loadKanban($('#projectID').val());
     }

     const updateDropzones = () => {
         /* after dropping, refresh the drop target areas
           so there is a dropzone after each item
           using jQuery here for simplicity */

         var dz = $('<div class="dropzone rounded" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="clearDrop(event)"> &nbsp; </div>');

         // delete old dropzones
         $('.dropzone').remove();

         // insert new dropdzone after each item
         dz.insertAfter('.card.draggable');

        //insert dropzone as first item for each column
         //$("#columnToDo")[0].firstChild.firstChild.prepend(dz);
         //$('#columnInProg').children().children().prepend(dz);
         //$('#columnReview').children().children().prepend(dz);
         //$('#columnComplete').children().children().prepend(dz);

         // insert new dropzone in any empty swimlanes
         $(".items:not(:has(.card.draggable))").append(dz);

         //set the appropriate id for the percent% value for drop zones
         $("#columnToDo").children().children('.dropzone').prop('id','0');
         $('#columnInProg').children().children('.dropzone').prop('id','0.25');
         $('#columnReview').children().children('.dropzone').prop('id','0.75');
         $('#columnComplete').children().children('.dropzone').prop('id','1');

     };

     // helpers
     function hasClass(target, className) {
         return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
     }

     function addClass(ele,cls) {
       if (!hasClass(ele,cls)) ele.className += " "+cls;
     }

     function removeClass(ele,cls) {
       if (hasClass(ele,cls)) {
         var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
         ele.className=ele.className.replace(reg,' ');
       }
     }

     function unwrap(node) {
         node.replaceWith(...node.childNodes);
     }


    function loadResource(projectID)
    {
             //loads the resources associated with the resource plan line

             var href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+workdayID%2CresourcePlanDetail%2Cworkers+FROM+resourcePlanDetails%28dataSourceFilter%3DresourcePlanDetailsForProjectFilter%2Cprojects%3D%22"+projectID+"%22%29";
             resource = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call

             var content = "<div class='form-group'><div class='input-group mb-1'><select class='custom-select' id='resourceSelect'>"

                                          if(resource.status != 200)
                                                    {
                                                        document.getElementById("pageData").innerHTML = "Request: " + href + "<br/>Error Fetching Projects:<br/>Status: " + resource.status + " (" + resource.statusText + ")<br/>" + resource.responseText;
                                                    }

                                                    else if (resource.responseJSON.total ==0)
                                                    {
                                                    content += "<p>No resources assigned to project</p></div></div>"
                                                    document.getElementById("allResources").innerHTML = content
                                                    }

                                                    else
                                                    {
                                                    var jdata = jQuery.parseJSON(resource.responseText);

                                                    sessionStorage.setItem('resources','');
                                                    $.each(jdata.data, function(key, value)
                                                    {
                                                         var txnName = jdata.data[key].workers != null ? jdata.data[key].workers[0].descriptor : "unknown";
                                                         var txnID = jdata.data[key].workers != null ? jdata.data[key].workers[0].id : 0;
                                                         var txnPlanID = jdata.data[key].workdayID != null ? jdata.data[key].workdayID : 0;
                                                         var txnPlanName = jdata.data[key].resourcePlanDetail.descriptor != null ? jdata.data[key].resourcePlanDetail.descriptor : "unknown";

                                                         content +=  "<option value='"+txnID +":"+txnPlanID+"'>" +txnName+" ("+txnPlanName+")</option>";
                                                         loadWorkerDetails(txnID);

                                                    });

                                                     content += "</select><button class='btn btn-dark btn-sm' onClick='addResource();'><img src='img/wd-icon-cart.svg' height='24' width='24'> Add</button></div></div>";

                                                    document.getElementById("allResources").innerHTML = content
                                                  }
                                                  return false;

    }

    function loadWorkerDetails(workerID)
    {
      //var workerDetails ={};
      var href = sessionStorage.getItem('WDTenant') + "/common/v1/workers/me?view=workerPublicEmailView";
      response = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call

      sessionStorage.setItem('resources',JSON.stringify(response.responseText));

    }

     function addTask()
        {
            // adds a new Task with template hardcoded

            //get the top level phase
            var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planPhases?project=" + $("#projectID").val();
            var phaseID = REST_GET_Phases(href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
            //create a new task
            href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planTasks";
            var payload = { "task":{"id":"f2bebd8ab75c49cdbccf2d73ae07f1c8"},"phase":{"id": phaseID }};
            REST_POST_Task(href, sessionStorage.getItem('accessToken'),payload); // make the ajax WS call - see jsfuncs.js
        }

    function addResource()
        {
             // adds a new Task resource to a project plan task

             //create a new taskResource
             href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/taskResources";
             var payload = { "projectPlanTask": { "id" : $('#taskID').val()}, "projectPlanLine": { "id" : $("#resourceSelect").val().split(":")[1]}, "projectResources": [{ "id" : $("#resourceSelect").val().split(":")[0]}]};
             REST_WCP('POST',href, sessionStorage.getItem('accessToken'),payload); // make the ajax WS call - see jsfuncs.js
             buildResourceTags($('#taskID').val());

        }

    function editTask(element)
        {
            //opens up the modal window for task editing (description & story points = memo, task resources)

            card = element.parentNode.parentNode;
            task = jQuery.parseJSON(card.getElementsByClassName('data')[0].innerText);
            $('#taskID').val(task.projectPlanTask.id);
            $('#modalTitle').text("Edit Task: " + JSON.parse(task.memo).name)
            $('#taskMemo').val(JSON.parse(task.memo).name);
            $('#taskDescription').val(JSON.parse(task.memo).description);
            $('#taskEffort').val(JSON.parse(task.memo).effort);
            var dates = task.startDate != null ? "started on " + task.startDate : "";
            dates += task.endDate != null ? " & completed on " + task.endDate : "";
            $('#taskDates').text(dates);
            buildResourceTags(task.projectPlanTask.id);
            loadResource(task.project.id);
            removeAssignedResource();
            $('#modalTask').modal('show');
        }


    function parseMemoSave(name,description,effort)
        {
            // parses 2 fields into a single JSON for memo

            var parseJSON = { "name": name, "description" : description , "effort": effort}
            return JSON.stringify(parseJSON);
        }

    function updateEffortTotals()
        {
            // calculates and updates the total counter on the top of Kanban lists

            var ul, li, title;
            var progress = [];

            ul = document.getElementById("ToDo");
            li = ul.getElementsByClassName('card draggable');
            title = ul.getElementsByClassName('card-title text-uppercase');
            title[0].innerHTML = "ToDo <span class='badge badge-secondary'>" + li.length + " stories</span> <span class='badge badge-secondary'>" + sumEffort(li) + " pts</span>";
            progress[0] = li.length;
            progress[1] = li.length;

            ul = document.getElementById("InProg");
            li = ul.getElementsByClassName('card draggable');
            title = ul.getElementsByClassName('card-title text-uppercase');
            title[0].innerHTML = ("In-progress <span id='WIPCount'' class='badge badge-secondary'>" + li.length + " stories</span> <span class='badge badge-secondary'>" + sumEffort(li) + " pts</span>");
            progress[0] += li.length;
            progress[2] = li.length;

            ul = document.getElementById("Review");
            li = ul.getElementsByClassName('card draggable');
            title = ul.getElementsByClassName('card-title text-uppercase');
            title[0].innerHTML = ("Review <span class='badge badge-secondary'>" + li.length + " stories</span> <span class='badge badge-secondary'>" + sumEffort(li) + " pts</span>");
            progress[0] += li.length;
            progress[3] = li.length;

            ul = document.getElementById("Comp");
            li = ul.getElementsByClassName('card draggable');
            title = ul.getElementsByClassName('card-title text-uppercase');
            title[0].innerHTML = ("Complete <span class='badge badge-secondary'>" + li.length + " stories</span> <span class='badge badge-secondary'>" + sumEffort(li) + " pts</span>");
            progress[0] += li.length;
            progress[4] = li.length;

            updateWIPLimit();

            updateProgressBar(progress);

        }

     function updateWIPLimit()
        {
             var WIP = Number(document.getElementById("WIPCount").innerText.split(' ')[0])
             if ( WIP > localStorage.getItem('maxWIP'))
                 {
                    $("#WIPCount").removeClass("badge-success");
                    $("#WIPCount").removeClass("badge-warning");
                    $("#WIPCount").addClass("badge-danger");
                 }
             else if (  WIP == localStorage.getItem('maxWIP'))
                 {
                     $("#WIPCount").removeClass("badge-success");
                     $("#WIPCount").removeClass("badge-danger");
                     $("#WIPCount").addClass("badge-warning");
                  }
             else
                 {
                   $("#WIPCount").removeClass("badge-danger");
                   $("#WIPCount").removeClass("badge-warning");
                   $("#WIPCount").addClass("badge-success");
                 };
        }

    function updateProgressBar(progress)
    {
        document.getElementById('progressToDo').setAttribute("style", "width: "+progress[1]/progress[0]*100+"%");
        document.getElementById('progressToDo').setAttribute("aria-valuenow", progress[1]/progress[0]*100);
        document.getElementById('progressInProg').setAttribute("style", "width: "+progress[2]/progress[0]*100+"%");
        document.getElementById('progressInProg').setAttribute("aria-valuenow", progress[2]/progress[0]*100);
        document.getElementById('progressReview').setAttribute("style", "width: "+progress[3]/progress[0]*100+"%");
        document.getElementById('progressReview').setAttribute("aria-valuenow", progress[3]/progress[0]*100);
    }

    function sumEffort(obj)
    {
        // calculates the sum of the effort values for all objects passed into this function

        var sum = 0;
        for (i = 0; i < obj.length; i++) {
                          a = obj[i].getElementsByClassName("effort");
                          sum = sum + Number(a[0].innerText.split(" ")[0]);
                         }
        return sum;
    }


    function buildResourceTags(taskID)
    {
                //creates the resource buttons representing already assigned resources on the edit task modal

                var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/taskResources?projectPlanTask="+ taskID;
                resource = REST_WCP('GET',href,sessionStorage.getItem('accessToken'),'')

                var ret = "<div class='md-form mb-2'>"

                             if(resource.status != 200)
                                       {
                                           document.getElementById("pageData").innerHTML = "Request: " + href + "<br/>Error Fetching Projects:<br/>Status: " + resource.status + " (" + resource.statusText + ")<br/>" + resource.responseText;
                                       }

                                       else if (resource.responseJSON.total ==0)
                                       {
                                       ret += "<p>No resources assigned</p></div>"
                                       document.getElementById("taskResources").innerHTML = ret
                                       }

                                       else
                                       {
                                       var jdata = jQuery.parseJSON(resource.responseText);

                                       $.each(jdata.data, function(key, value)
                                       {
                                           $.each(value.projectResources, function(key1, value1)
                                           {
                                                var txnName = value.projectResources[key1] != null ? value.projectResources[key1].descriptor : "unknown";
                                                var txnID = value.projectResources[key1] != null ? value.projectResources[key1].id : 0;

                                                ret += "<button type='button' class='btn btn-outline-primary' id='"+txnID+"'>"+txnName+ "</button>"

                                           });
                                       });

                                        ret += "</div>";

                                       document.getElementById("taskResources").innerHTML = ret
                                     }

    return false;
    }

    function removeAssignedResource()
    {
         var assignedResources = document.getElementById("taskResources").getElementsByTagName("button");
         var allRes = document.getElementById("allResources")
         var selections = allRes.getElementsByTagName("option")
         for (i = 0; i < assignedResources.length; i++) {
            for (j = 0; j < selections.length; j++)
            {
                    if (selections[j].text.includes(assignedResources[i].innerText))
                    {
                         selections[j].parentNode.removeChild(selections[j]);
                    }
            }
         };
    }

    function removeAssignedSprint()
        {
             var assignedSprint = document.getElementById("sprintSelect1").value;
             var allSprints = document.getElementById("newSprint");
             var selections = allSprints.getElementsByTagName("option");

                for (j = 0; j < selections.length; j++)
                {
                        if (selections[j].value == assignedSprint)
                        {
                             selections[j].parentNode.removeChild(selections[j]);
                        }
                };
        }

    function updateProjectInfo(resObject, req)
       {
            //build the project information "panel"

            if(resObject.status != 200)
              {
                  document.getElementById("pageData").innerHTML = "Request: " + req + "<br/>Error Fetching Project Tasks:<br/>Status: " + resObject.status + " (" + resObject.statusText + ")<br/>" + resObject.responseText;
              }
              else
              {
                var jdata = jQuery.parseJSON(resObject.responseText);
                var owner = jdata.owner != null ? jdata.owner.descriptor : "None";
                $("#projectName").text(jdata.name);
                $("#projectOwner").text("Owner: "+ owner);
                $("#addTask").show();
                $('#progressbar').show();
                $("#refresh").show();
                $('#burnup').show();
              }
              return false;
       }

    function updateKanbanBoard(resObject, req)
        {
           //adds Task data to div
           if(resObject.status != 200)
           {
               document.getElementById("pageData").innerHTML = "Request: " + req + "<br/>Error Fetching Project Tasks:<br/>Status: " + resObject.status + " (" + resObject.statusText + ")<br/>" + resObject.responseText;
           }
           else
           {
           var sprint = $("#sprintSelect1").val();
           var dz = '<div class="dropzone rounded" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="clearDrop(event)"> &nbsp; </div>';
           var jdata = jQuery.parseJSON(resObject.responseText);
           var ret_tasks_todo = "<div class='items border border-light'>" + dz;
           var ret_tasks_inprog = "<div class='items border border-light'>" + dz;
           var ret_tasks_review = "<div class='items border border-light'>" + dz;
           var ret_tasks_comp = "<div class='items border border-light'>" + dz

           $.each(jdata.data, function(key, value)
           {
                var txnpercent = jdata.data[key].percentComplete != null ? jdata.data[key].percentComplete : 0;
                //var txnphase = jdata.data[key].projectPlanPhase.id == sprint ? true : false;

                if (txnpercent>0 && txnpercent<0.75 )
                {
                   ret_tasks_inprog += addCard(key,jdata.data[key],0.25) + dz
                }
                 else if (txnpercent >0.74 && txnpercent<1)
                {
                   ret_tasks_review += addCard(key,jdata.data[key],0.75) + dz
                }
                 else if (txnpercent ==1)
                {
                   ret_tasks_comp += addCard(key,jdata.data[key],1) + dz
                }
                  else
                {
                   ret_tasks_todo += addCard(key,jdata.data[key],0) + dz
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

   function addCard(id,task,stage)
       {
           //builds a single story card

           var resourceCount = task.taskResources != null ? task.taskResources.length : 0;
           var answer = "<div class='card draggable shadow-sm' id='card"+id+"' draggable='true' ondragstart='drag(event)'><div class='card-body p-2'><div class='card-title'><img src='img/wd-icon-check-circle.svg' height='24' width='24' class='rounded-circle float-right'><a href='' class='lead font-weight-light'>"+ task.projectTask.descriptor +"</a></div>" + parseMemoLoad(task.memo) + "<p class='small font-weight-light'>Assigned: "+ resourceCount +"</p><p id='order' style='display: none;'>"+task.order1+"</p><p id='WID' style='display: none;'>SPLIT" + task.projectPlanTask.id + "SPLIT</p><p style='display: none;' id='sprint'>" + task.projectPlanPhase.id + "</p><button class='btn btn-secondary btn-sm' onclick='editTask(this,\""+task.projectPlanTask.id+"\");'>Edit</button> <button class='btn btn-secondary btn-sm' onclick='moveBacklog(this,\""+task.projectPlanTask.id+"\");'>Sprint</button></div></div>"
           return answer
       }

    function newOrder(element)
    {
        card = element.parentNode.parentNode;
        task = jQuery.parseJSON(card.getElementsByClassName('data')[0].innerText);
        currentOrder = task.order1 != null ? task.order1 : "";
        var priorOrder = element.previousSibling != null ? jQuery.parseJSON(element.previousSibling.getElementsByClassName('data')[0].innerText).order1: "NA";
        var nextOrder = element.nextSibling != null ? jQuery.parseJSON(element.nextSibling.getElementsByClassName('data')[0].innerText).order1: "NA";
        var newOrder = nextChar(priorOrder)

        //Exceptions
        if (priorOrder == "NA")
        {
            if (nextOrder == "NA")
            {
                newOrder = currentOrder;
            }
            else
            {
                newOrder = prevChar(nextOrder);
            }
        }
        else if (newOrder == nextOrder)
        {
            newOrder = priorOrder + "a";
        }

        return newOrder;
    }

    function nextChar(c) {
        var i = (parseInt(c, 36) + 1 ) % 36;
        return (!i * 10 + i).toString(36);
    }

    function prevChar(c) {
            var i = (parseInt(c, 36) - 1 ) % 36;
            return (!i * 10 + i).toString(36);
        }

   function searchTasks()
        {
           // filters the card displayed to just the ones that match the description with the search term

           // Declare variables
             var input, filter, ul, li, a, i, txtValue;
             input = document.getElementById('searchBar');
             filter = input.value.toUpperCase();
             ul = document.getElementById("board");
             li = ul.getElementsByClassName('card draggable');

             // Loop through all list items, and hide those who don't match the search query
             for (i = 0; i < li.length; i++) {
               //a = li[i].getElementsByTagName("a")[0];
              a = li[i].getElementsByTagName("p")[0];
               txtValue = a.textContent || a.innerText;
               if (txtValue.toUpperCase().indexOf(filter) > -1) {
                 li[i].style.display = "";
               } else {
                 li[i].style.display = "none";
               }
             }
           }

   function saveWDTask(taskID,value,order)
       {
            // updates the task after dragging to a new column

            var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/planTasks/" + taskID;
            var payload = { "percentComplete" : value ,"order" : order};
            var d = new Date();
            var n = d.toISOString();
            if (value == 0)
                         {
                         payload.startDate = ''
                         payload.endDate = ''
                         };
            if (value == 0.25)
                         {
                         payload.startDate = n
                         payload.endDate = ''
                         };
             if (value == 1)
                        {
                        payload.endDate = n
                        };
            REST_WCP('PATCH', href, sessionStorage.getItem('accessToken') , payload);
       }


   function postResults(resObject, req)
       {
             //update after save

             if(resObject.status != 201)
             {
                 document.getElementById("pageData").innerHTML = "Request: " + req + "<br/>Error Fetching Project Tasks:<br/>Status: " + resObject.status + " (" + resObject.statusText + ")<br/>" + resObject.responseText;
             }
             else
             {
                //refresh project task load
                loadProject($("#projectID").val());
             }
             return false;
       }

    function qtyUp()
    {
        var position = fibonacciReverse($('#taskEffort').val());
        var newNumber = fibonacci(position + 1);
        document.getElementById("taskEffort").value = newNumber;
        return false;
    }

    function qtyDown()
    {
        var position = fibonacciReverse($('#taskEffort').val());
        $('#taskEffort').val(fibonacci(position - 1));
        return false;
    }

   function fibonacci(number)
   {

       var sequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
       var numberZeroBased = number - 1;

       if (numberZeroBased > sequence.length)
           throw new Error('The number you provided is outside of the range');

       return sequence[numberZeroBased];
   };

   function fibonacciReverse(number) {

          var index;
          var sequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
          for (index = 1; index < sequence.length; ++index) {
                      if (number <=sequence[index])
                      {
                        position = index;
                        break;
                      }
            }
          return position;
      };

    function collapse()
    {
        $('#sidebar').toggleClass('active');
        //$('#collapseButton').toggleClass('collapse');
        if($('#collapseButton').attr('src') == 'img/wd-icon-close.svg')
           $('#collapseButton').attr('src', 'img/wd-icon-fullscreen.svg');
        else
           $('#collapseButton').attr('src', 'img/wd-icon-close.svg');
    }

    function REST_GET_Tasks(req_url, sec_token)
        {
                $.ajax(
                {
                    'type': 'GET',
                    'url': req_url,
                   'dataType':'json',
                    headers: {
                    'Authorization': 'Bearer ' + sec_token,
                    'X-Tenant' : 'super',
                    'Content-Type' : 'text/xml; charset=UTF-8' },
                    complete: function(xhr,data)
                    {
                        updateKanbanBoard(xhr, req_url);
                    }
                });
                return false;

            }

    function REST_GET_PROJECT(req_url, sec_token)
        {
            $.ajax(
            {
                'type': 'GET',
                'url': req_url,
               'dataType':'json',
                headers: {
                'Authorization': 'Bearer ' + sec_token,
                'X-Tenant' : 'super',
                'Content-Type' : 'text/xml; charset=UTF-8' },
                complete: function(xhr,data)
                {
                    makeProjectDropdown(xhr, req_url);
                }
            });
            return false;

        }


        function REST_POST_Task(req_url, sec_token,payload)
            	{
            	    $.ajax(
            		{
            	        'type': 'POST',
            	        'url': req_url,
            		   'dataType':'json',
            		    data: JSON.stringify(payload),
            	        headers: {
            			'Authorization': 'Bearer ' + sec_token,
            			'X-Tenant' : 'super',
            			'Content-Type' : 'text/xml; charset=UTF-8' },
            	        complete: function(xhr,data)
            		  	{
            	  			postResults(xhr, req_url);
            	        }
            		});
            		return false;

            	}

        function REST_GET_Phases(req_url, sec_token)
                        {
                             var phaseID;
                             $.ajax(
                            {
                                'type': 'GET',
                                'url': req_url,
                               'dataType':'json',
                               'async': false,
                                headers: {
                                'Authorization': 'Bearer ' + sec_token,
                                'X-Tenant' : 'super',
                                'Content-Type' : 'text/xml; charset=UTF-8' },
                                complete: function(xhr,data)
                                {
                                 phaseID = jQuery.parseJSON(xhr.responseText).data[0].id;
                                }
                            });
                            return phaseID;

                        }
