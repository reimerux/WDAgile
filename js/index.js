// javascript functions used by index.html

    function Initialize()
        {
            var href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+workdayID,projectName+FROM+projects%28dataSourceFilter%3DprojectsByProjectsProjectHierarchiesFilter%2CprojectsAndProjectHierarchies%3D%2273270251dc424e14a0e4d91b9667f841%22%29";
            projects = REST_WCP('GET',href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
            //href = sessionStorage.getItem('WDTenant') + "/wql/v1/data?query=SELECT+projectPlanTask%2CpercentComplete%2Corder1%2CprojectTask%2Cmemo%2CtaskResources%2CprojectPlanPhase+FROM+projectPlanTasks%28dataSourceFilter%3DprojectPlanTasksForProjectsProjectHierarchies%2CprojectsAndProjectHierarchies%3D%22"+projectID+"%22%29+ORDER BY order1";
            $('#kanbanCount').text(countProjects(projects.responseJSON,'Kanban') + " projects")
            $('#scrumCount').text(countProjects(projects.responseJSON,'Scrum') + " projects");

            return false;

        }

    function countProjects(projects,searchterm)
    {
     var count = 0
     for (i = 0; i < projects.total; i++) {
     var txnName = projects.data[i].projectName
         if (txnName.includes(searchterm))
         {
            count ++
         }
     }
     return count;
    }