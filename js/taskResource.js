// javascript functions used by login.html


	function loadResources()
        {
            var projectID = $("#projectID").val();
            var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/taskResources?projectPlanTask=cc6e3f3fe96601b7a81a550f140014e5";
            //REST_GET_TaskResources(href, sessionStorage.getItem('accessToken')); // make the ajax WS call - see jsfuncs.js
            resource = REST_WCP('GET',href,sessionStorage.getItem('accessToken'),'')
            showResources(resource, href);
            return false;
        }

	function postResources()
	{
	            var href = sessionStorage.getItem('WDTenant') + "/projects/v2Beta/taskResources?projectPlanTask=" + $('#projectPlanID').val();

                 var payload = { "projectPlanLine": {"id": $("#resourcePlanLineID").val()},"projectResources": { "id" : $("#resourceID").val()}};
                 //var payload = { "projectPlanTask": { "id" : $('#projectPlanID').val()}, "projectResources": { "id" : $("#resourcePlanLineID").val()}};
                 response = REST_WCP('POST',href, sessionStorage.getItem('accessToken'),payload); // make the ajax WS call - see jsfuncs.js
                document.getElementById("pageResponse").innerHTML = JSON.stringify(response);
	}

	function showResources(resObject, req)
	    {
            var ret = "<div class='container'>"

             if(resObject.status != 200)
                       {
                           document.getElementById("pageData").innerHTML = "Request: " + req + "<br/>Error Fetching Projects:<br/>Status: " + resObject.status + " (" + resObject.statusText + ")<br/>" + resObject.responseText;
                       }
                       else
                       {
                       var jdata = jQuery.parseJSON(resObject.responseText);

                       $.each(jdata.data, function(key, value)
                       {
                            var txnName = jdata.data[key].name != null ? jdata.data[key].name : "";

                       });

                        ret += JSON.stringify(jdata.data);
                        ret += "</div>";

                       document.getElementById("pageData").innerHTML = ret

                       return false;
                     }
                }

    function toHome()
    {
        window.location.href = "index.html";
    }

